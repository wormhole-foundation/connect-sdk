import {
  type ChainName,
  toChainId,
  coalesceChainId,
  type ChainId,
  SignedVaa,
  parseVaa,
} from '@certusone/wormhole-sdk';
import { derivePostedVaaKey, getWormholeDerivedAccounts } from '@wormhole-foundation/connect-sdk-solana-core/src/utils';}
import {
  BN,
  translateError,
  type IdlAccounts,
  type Program,
} from '@project-serum/anchor';
import { associatedAddress } from '@project-serum/anchor/dist/cjs/utils/token';
import {
  type PublicKeyInitData,
  PublicKey,
  Keypair,
  type TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
  type TransactionSignature,
} from '@solana/web3.js';
import { type ExampleNativeTokenTransfers } from './anchor-idl/example_native_token_transfers';
import { ManagerMessage } from './payloads/common';
import { NativeTokenTransfer } from './payloads/transfers';
import { WormholeEndpointMessage } from './payloads/wormhole';

export { NormalizedAmount } from './normalized_amount';
export { EndpointMessage, ManagerMessage } from './payloads/common';
export { NativeTokenTransfer } from './payloads/transfers';
export { WormholeEndpointMessage } from './payloads/wormhole';

// export * from './utils/wormhole';

export type Config = IdlAccounts<ExampleNativeTokenTransfers>['config'];
export type InboxItem = IdlAccounts<ExampleNativeTokenTransfers>['inboxItem'];

export class NTT {
  readonly program: Program<ExampleNativeTokenTransfers>;
  readonly wormholeId: PublicKey;
  // mapping from error code to error message. Used for prettifying error messages
  private readonly errors: Map<number, string>;

  constructor(args: {
    program: Program<ExampleNativeTokenTransfers>;
    wormholeId: PublicKeyInitData;
  }) {
    // TODO: initialise a new Program here with a passed in Connection
    this.program = args.program;
    this.wormholeId = new PublicKey(args.wormholeId);
    this.errors = this.processErrors();
  }

  // The `translateError` function expects this format, but the idl gives us a
  // different one, so we preprocess the idl and store the expected format.
  // NOTE: I'm sure there's a function within anchor that does this, but I
  // couldn't find it.
  private processErrors(): Map<number, string> {
    const errors = this.program.idl.errors;
    const result: Map<number, string> = new Map<number, string>();
    errors.forEach((entry) => result.set(entry.code, entry.msg));
    return result;
  }

  // Account addresses

  private derive_pda(
    seeds: Buffer | Array<Uint8Array | Buffer>,
    program = this.program.programId,
  ): PublicKey {
    const seedsArray = seeds instanceof Buffer ? [seeds] : seeds;
    const [address] = PublicKey.findProgramAddressSync(seedsArray, program);
    return address;
  }

  configAccountAddress(): PublicKey {
    return this.derive_pda(Buffer.from('config'));
  }

  sequenceTrackerAccountAddress(): PublicKey {
    return this.derive_pda(Buffer.from('sequence'));
  }

  outboxRateLimitAccountAddress(): PublicKey {
    return this.derive_pda(Buffer.from('outbox_rate_limit'));
  }

  inboxRateLimitAccountAddress(chain: ChainName | ChainId): PublicKey {
    const chainId = coalesceChainId(chain);
    return this.derive_pda([
      Buffer.from('inbox_rate_limit'),
      new BN(chainId).toBuffer('be', 2),
    ]);
  }

  inboxItemAccountAddress(chain: ChainName | ChainId, sequence: BN): PublicKey {
    const chainId = coalesceChainId(chain);
    return this.derive_pda([
      Buffer.from('inbox_item'),
      new BN(chainId).toBuffer('be', 2),
      sequence.toBuffer('be', 8),
    ]);
  }

  tokenAuthorityAddress(): PublicKey {
    return this.derive_pda([Buffer.from('token_authority')]);
  }

  emitterAccountAddress(): PublicKey {
    return this.derive_pda([Buffer.from('emitter')]);
  }

  wormholeMessageAccountAddress(outboxItem: PublicKey): PublicKey {
    return this.derive_pda([Buffer.from('message'), outboxItem.toBuffer()]);
  }

  siblingAccountAddress(chain: ChainName | ChainId): PublicKey {
    const chainId = coalesceChainId(chain);
    return this.derive_pda([
      Buffer.from('sibling'),
      new BN(chainId).toBuffer('be', 2),
    ]);
  }

  // Instructions

  async initialize(args: {
    payer: Keypair;
    owner: Keypair;
    chain: ChainName;
    mint: PublicKey;
    outboundLimit: BN;
    mode: 'burning' | 'locking';
  }): Promise<void> {
    const mode = args.mode === 'burning' ? { burning: {} } : { locking: {} };
    const chainId = toChainId(args.chain);
    const mintInfo = await this.program.provider.connection.getAccountInfo(
      args.mint,
    );
    if (mintInfo === null) {
      throw new Error(
        "Couldn't determine token program. Mint account is null.",
      );
    }
    const tokenProgram = mintInfo.owner;
    await this.program.methods
      .initialize({ chainId, limit: args.outboundLimit, mode })
      .accounts({
        payer: args.payer.publicKey,
        owner: args.owner.publicKey,
        config: this.configAccountAddress(),
        mint: args.mint,
        seq: this.sequenceTrackerAccountAddress(),
        rateLimit: this.outboxRateLimitAccountAddress(),
        tokenProgram,
        tokenAuthority: this.tokenAuthorityAddress(),
        custody: await this.custodyAccountAddress(args.mint),
      })
      .signers([args.payer, args.owner])
      .rpc();
  }

  async transfer(args: {
    payer: Keypair;
    from: PublicKey;
    fromAuthority: Keypair;
    amount: BN;
    recipientChain: ChainName;
    recipientAddress: ArrayLike<number>;
    shouldQueue: boolean;
    outboxItem?: Keypair;
    config?: Config;
  }): Promise<PublicKey> {
    const config: Config = await this.getConfig(args.config);

    const outboxItem = args.outboxItem ?? Keypair.generate();

    const txArgs = {
      ...args,
      payer: args.payer.publicKey,
      fromAuthority: args.fromAuthority.publicKey,
      outboxItem: outboxItem.publicKey,
      config,
    };

    let transferIx: TransactionInstruction;
    if (config.mode.locking != null) {
      transferIx = await this.createTransferLockInstruction(txArgs);
    } else if (config.mode.burning != null) {
      transferIx = await this.createTransferBurnInstruction(txArgs);
    } else {
      transferIx = exhaustive(config.mode);
    }

    const releaseIx: TransactionInstruction =
      await this.createReleaseOutboundInstruction({
        payer: args.payer.publicKey,
        outboxItem: outboxItem.publicKey,
        revertOnDelay: !args.shouldQueue,
      });

    const signers = [args.payer, args.fromAuthority, outboxItem];

    const tx = new Transaction();
    tx.add(transferIx);
    tx.add(releaseIx);
    await this.sendAndConfirmTransaction(tx, signers);

    return outboxItem.publicKey;
  }

  /**
   * Like `sendAndConfirmTransaction` but parses the anchor error code.
   */
  private async sendAndConfirmTransaction(
    tx: Transaction,
    signers: Keypair[],
  ): Promise<TransactionSignature> {
    try {
      return await sendAndConfirmTransaction(
        this.program.provider.connection,
        tx,
        signers,
      );
    } catch (err) {
      throw translateError(err, this.errors);
    }
  }

  /**
   * Creates a transfer_burn instruction. The `payer` and `fromAuthority`
   * arguments must sign the transaction
   */
  async createTransferBurnInstruction(args: {
    payer: PublicKey;
    from: PublicKey;
    fromAuthority: PublicKey;
    amount: BN;
    recipientChain: ChainName;
    recipientAddress: ArrayLike<number>;
    outboxItem: PublicKey;
    shouldQueue: boolean;
    config?: Config;
  }): Promise<TransactionInstruction> {
    const config = await this.getConfig(args.config);

    if (await this.isPaused(config)) {
      throw new Error('Contract is paused');
    }

    const chainId = toChainId(args.recipientChain);
    const mint = await this.mintAccountAddress(config);

    return await this.program.methods
      .transferBurn({
        amount: args.amount,
        recipientChain: { id: chainId },
        recipientAddress: Array.from(args.recipientAddress),
        shouldQueue: args.shouldQueue,
      })
      .accounts({
        common: {
          payer: args.payer,
          config: { config: this.configAccountAddress() },
          mint,
          from: args.from,
          fromAuthority: args.fromAuthority,
          seq: this.sequenceTrackerAccountAddress(),
          outboxItem: args.outboxItem,
          outboxRateLimit: this.outboxRateLimitAccountAddress(),
        },
        inboxRateLimit: this.inboxRateLimitAccountAddress(args.recipientChain),
      })
      .instruction();
  }

  /**
   * Creates a transfer_lock instruction. The `payer`, `fromAuthority`, and `outboxItem`
   * arguments must sign the transaction
   */
  async createTransferLockInstruction(args: {
    payer: PublicKey;
    from: PublicKey;
    fromAuthority: PublicKey;
    amount: BN;
    recipientChain: ChainName;
    recipientAddress: ArrayLike<number>;
    shouldQueue: boolean;
    outboxItem: PublicKey;
    config?: Config;
  }): Promise<TransactionInstruction> {
    const config = await this.getConfig(args.config);

    if (await this.isPaused(config)) {
      throw new Error('Contract is paused');
    }

    const chainId = toChainId(args.recipientChain);
    const mint = await this.mintAccountAddress(config);

    return await this.program.methods
      .transferLock({
        amount: args.amount,
        recipientChain: { id: chainId },
        recipientAddress: Array.from(args.recipientAddress),
        shouldQueue: args.shouldQueue,
      })
      .accounts({
        common: {
          payer: args.payer,
          config: { config: this.configAccountAddress() },
          mint,
          from: args.from,
          fromAuthority: args.fromAuthority,
          tokenProgram: await this.tokenProgram(config),
          seq: this.sequenceTrackerAccountAddress(),
          outboxItem: args.outboxItem,
          outboxRateLimit: this.outboxRateLimitAccountAddress(),
        },
        inboxRateLimit: this.inboxRateLimitAccountAddress(args.recipientChain),
        tokenAuthority: this.tokenAuthorityAddress(),
        custody: await this.custodyAccountAddress(config),
      })
      .instruction();
  }

  /**
   * Creates a release_outbound instruction. The `payer` needs to sign the transaction.
   */
  async createReleaseOutboundInstruction(args: {
    payer: PublicKey;
    outboxItem: PublicKey;
    revertOnDelay: boolean;
  }): Promise<TransactionInstruction> {
    const whAccs = getWormholeDerivedAccounts(
      this.program.programId,
      this.wormholeId,
    );

    return await this.program.methods
      .releaseOutbound({
        revertOnDelay: args.revertOnDelay,
      })
      .accounts({
        payer: args.payer,
        config: { config: this.configAccountAddress() },
        outboxItem: args.outboxItem,
        wormholeMessage: this.wormholeMessageAccountAddress(args.outboxItem),
        emitter: whAccs.wormholeEmitter,
        wormholeBridge: whAccs.wormholeBridge,
        wormholeFeeCollector: whAccs.wormholeFeeCollector,
        wormholeSequence: whAccs.wormholeSequence,
        wormholeProgram: this.wormholeId,
      })
      .instruction();
  }

  async releaseOutbound(args: {
    payer: Keypair;
    outboxItem: PublicKey;
    revertOnDelay: boolean;
    config?: Config;
  }): Promise<void> {
    if (await this.isPaused()) {
      throw new Error('Contract is paused');
    }

    const txArgs = {
      ...args,
      payer: args.payer.publicKey,
    };

    const tx = new Transaction();
    tx.add(await this.createReleaseOutboundInstruction(txArgs));

    const signers = [args.payer];
    await sendAndConfirmTransaction(
      this.program.provider.connection,
      tx,
      signers,
    );
  }

  // TODO: document that if recipient is provided, then the instruction can be
  // created before the inbox item is created (i.e. they can be put in the same tx)
  async createReleaseInboundMintInstruction(args: {
    payer: PublicKey;
    chain: ChainName | ChainId;
    sequence: BN;
    revertOnDelay: boolean;
    recipient?: PublicKey;
    config?: Config;
  }): Promise<TransactionInstruction> {
    const config = await this.getConfig(args.config);

    if (await this.isPaused(config)) {
      throw new Error('Contract is paused');
    }

    const recipientAddress =
      args.recipient ??
      (await this.getInboxItem(args.chain, args.sequence)).recipientAddress;

    return await this.program.methods
      .releaseInboundMint({
        revertOnDelay: args.revertOnDelay,
      })
      .accounts({
        common: {
          payer: args.payer,
          config: { config: this.configAccountAddress() },
          inboxItem: this.inboxItemAccountAddress(args.chain, args.sequence),
          recipient: recipientAddress,
          mint: await this.mintAccountAddress(config),
          tokenAuthority: this.tokenAuthorityAddress(),
        },
      })
      .instruction();
  }

  async releaseInboundMint(args: {
    payer: Keypair;
    chain: ChainName | ChainId;
    sequence: BN;
    revertOnDelay: boolean;
    config?: Config;
  }): Promise<void> {
    if (await this.isPaused()) {
      throw new Error('Contract is paused');
    }

    const txArgs = {
      ...args,
      payer: args.payer.publicKey,
    };

    const tx = new Transaction();
    tx.add(await this.createReleaseInboundMintInstruction(txArgs));

    const signers = [args.payer];
    await this.sendAndConfirmTransaction(tx, signers);
  }

  async createReleaseInboundUnlockInstruction(args: {
    payer: PublicKey;
    chain: ChainName | ChainId;
    sequence: BN;
    revertOnDelay: boolean;
    recipient?: PublicKey;
    config?: Config;
  }): Promise<TransactionInstruction> {
    const config = await this.getConfig(args.config);

    if (await this.isPaused(config)) {
      throw new Error('Contract is paused');
    }

    const recipientAddress =
      args.recipient ??
      (await this.getInboxItem(args.chain, args.sequence)).recipientAddress;

    return await this.program.methods
      .releaseInboundUnlock({
        revertOnDelay: args.revertOnDelay,
      })
      .accounts({
        common: {
          payer: args.payer,
          config: { config: this.configAccountAddress() },
          inboxItem: this.inboxItemAccountAddress(args.chain, args.sequence),
          recipient: recipientAddress,
          mint: await this.mintAccountAddress(config),
          tokenAuthority: this.tokenAuthorityAddress(),
        },
        custody: await this.custodyAccountAddress(config),
      })
      .instruction();
  }

  async releaseInboundUnlock(args: {
    payer: Keypair;
    chain: ChainName | ChainId;
    sequence: BN;
    revertOnDelay: boolean;
    config?: Config;
  }): Promise<void> {
    if (await this.isPaused()) {
      throw new Error('Contract is paused');
    }

    const txArgs = {
      ...args,
      payer: args.payer.publicKey,
    };

    const tx = new Transaction();
    tx.add(await this.createReleaseInboundUnlockInstruction(txArgs));

    const signers = [args.payer];
    await this.sendAndConfirmTransaction(tx, signers);
  }

  async setSibling(args: {
    payer: Keypair;
    owner: Keypair;
    chain: ChainName;
    address: ArrayLike<number>;
    limit: BN;
    config?: Config;
  }): Promise<void> {
    const config = await this.getConfig(args.config);

    await this.program.methods
      .setSibling({
        chainId: { id: toChainId(args.chain) },
        address: Array.from(args.address),
        limit: args.limit,
      })
      .accounts({
        payer: args.payer.publicKey,
        owner: args.owner.publicKey,
        config: this.configAccountAddress(),
        sibling: this.siblingAccountAddress(args.chain),
        inboxRateLimit: this.inboxRateLimitAccountAddress(args.chain),
        mint: config.mint,
      })
      .signers([args.payer, args.owner])
      .rpc();
  }

  async createRedeemInstruction(args: {
    payer: PublicKey;
    vaa: SignedVaa;
    config?: Config;
  }): Promise<TransactionInstruction> {
    const config = await this.getConfig(args.config);

    if (await this.isPaused(config)) {
      throw new Error('Contract is paused');
    }

    const parsedVaa = parseVaa(args.vaa);
    const managerMessage = WormholeEndpointMessage.deserialize(
      parsedVaa.payload,
      (a) => ManagerMessage.deserialize(a, (a) => a),
    ).managerPayload;
    // NOTE: we do an 'as ChainId' cast here, which is generally unsafe.
    // TODO: explain why this is fine here
    const chainId = managerMessage.chainId as ChainId;

    const sibling = this.siblingAccountAddress(chainId);
    const inboxRateLimit = this.inboxRateLimitAccountAddress(chainId);

    return await this.program.methods
      .redeem({})
      .accounts({
        payer: args.payer,
        config: { config: this.configAccountAddress() },
        sibling,
        vaa: derivePostedVaaKey(this.wormholeId, parseVaa(args.vaa).hash),
        inboxItem: this.inboxItemAccountAddress(
          chainId,
          new BN(managerMessage.sequence.toString()),
        ),
        inboxRateLimit,
        outboxRateLimit: this.outboxRateLimitAccountAddress(),
      })
      .instruction();
  }

  /**
   * Redeems a VAA.
   *
   * @returns Whether the transfer was released. If the transfer was delayed,
   *          this will be false. In that case, a subsequent call to
   *          `releaseInboundMint` or `releaseInboundUnlock` will release the
   *          transfer after the delay (24h).
   */
  async redeem(args: {
    payer: Keypair;
    vaa: SignedVaa;
    config?: Config;
  }): Promise<boolean> {
    const config = await this.getConfig(args.config);

    const redeemArgs = {
      ...args,
      payer: args.payer.publicKey,
    };

    const parsedVaa = parseVaa(args.vaa);

    const managerMessage = WormholeEndpointMessage.deserialize(
      parsedVaa.payload,
      (a) => ManagerMessage.deserialize(a, NativeTokenTransfer.deserialize),
    ).managerPayload;
    // TODO: explain why this is fine here
    const chainId = managerMessage.chainId as ChainId;

    // Here we create a transaction with two instructions:
    // 1. redeem
    // 2. releaseInboundMint or releaseInboundUnlock (depending on mode)
    //
    // The first instruction places the transfer in the inbox, then the second instruction
    // releases it.
    //
    // In case the redeemed amount exceeds the remaining inbound rate limit capacity,
    // the transaction gets delayed. If this happens, the second instruction will not actually
    // be able to release the transfer yet.
    // To make sure the transaction still succeeds, we set revertOnDelay to false, which will
    // just make the second instruction a no-op in case the transfer is delayed.

    const tx = new Transaction();
    tx.add(await this.createRedeemInstruction(redeemArgs));

    const releaseArgs = {
      ...args,
      payer: args.payer.publicKey,
      sequence: new BN(managerMessage.sequence.toString()),
      recipient: new PublicKey(managerMessage.payload.recipientAddress),
      chain: chainId,
      revertOnDelay: false,
    };

    if (config.mode.locking != null) {
      tx.add(await this.createReleaseInboundUnlockInstruction(releaseArgs));
    } else {
      tx.add(await this.createReleaseInboundMintInstruction(releaseArgs));
    }

    const signers = [args.payer];
    await this.sendAndConfirmTransaction(tx, signers);

    // Let's check if the transfer was released
    const inboxItem = await this.getInboxItem(
      chainId,
      new BN(managerMessage.sequence.toString()),
    );
    return inboxItem.released;
  }

  // Account access

  /**
   * Fetches the Config account from the contract.
   *
   * @param config If provided, the config is just returned without making a
   *               network request. This is handy in case multiple config
   *               accessor functions are used, the config can just be queried
   *               once and passed around.
   */
  async getConfig(config?: Config): Promise<Config> {
    return (
      config ??
      (await this.program.account.config.fetch(this.configAccountAddress()))
    );
  }

  async isPaused(config?: Config): Promise<boolean> {
    return (await this.getConfig(config)).paused;
  }

  async mintAccountAddress(config?: Config): Promise<PublicKey> {
    return (await this.getConfig(config)).mint;
  }

  async tokenProgram(config?: Config): Promise<PublicKey> {
    return (await this.getConfig(config)).tokenProgram;
  }

  async getInboxItem(
    chain: ChainName | ChainId,
    sequence: BN,
  ): Promise<InboxItem> {
    return await this.program.account.inboxItem.fetch(
      this.inboxItemAccountAddress(chain, sequence),
    );
  }

  /**
   * Returns the address of the custody account. If the config is available
   * (i.e. the program is initialised), the mint is derived from the config.
   * Otherwise, the mint must be provided.
   */
  async custodyAccountAddress(
    configOrMint: Config | PublicKey,
  ): Promise<PublicKey> {
    if (configOrMint instanceof PublicKey) {
      return associatedAddress({
        mint: configOrMint,
        owner: this.tokenAuthorityAddress(),
      });
    } else {
      return associatedAddress({
        mint: await this.mintAccountAddress(configOrMint),
        owner: this.tokenAuthorityAddress(),
      });
    }
  }
}

function exhaustive<A>(_: never): A {
  throw new Error('Impossible');
}
