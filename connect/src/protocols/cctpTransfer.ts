import {
  ChainName,
  PlatformName,
  hexByteStringToUint8Array,
  toCircleChainName,
} from "@wormhole-foundation/sdk-base";
import {
  CircleAttestation,
  CircleMessageId,
  NativeAddress,
  Signer,
  TransactionId,
  TxHash,
  UniversalAddress,
  UnsignedTransaction,
  VAA,
  WormholeMessageId,
  deserialize,
  deserializeCircleMessage,
  isCircleMessageId,
  isTransactionIdentifier,
  isWormholeMessageId,
  nativeChainAddress,
  toNative,
} from "@wormhole-foundation/sdk-definitions";

import { CCTPTransferDetails, isCCTPTransferDetails } from "../types";
import { Wormhole } from "../wormhole";
import {
  AttestationId,
  TransferState,
  WormholeTransfer,
} from "../wormholeTransfer";
import { retry } from "./retry";

export class CCTPTransfer implements WormholeTransfer {
  private readonly wh: Wormhole;

  // state machine tracker
  private state: TransferState;

  // transfer details
  transfer: CCTPTransferDetails;

  // Populated after Initialized
  txids?: TxHash[];

  // Populated if !automatic and after initialized
  circleAttestations?: {
    id: CircleMessageId;
    attestation?: CircleAttestation;
  }[];

  // Populated if automatic and after initialized
  vaas?: {
    id: WormholeMessageId;
    vaa?: VAA<"CircleTransferRelay">;
  }[];

  private constructor(wh: Wormhole, transfer: CCTPTransferDetails) {
    this.state = TransferState.Created;
    this.wh = wh;
    this.transfer = transfer;
  }

  async getTransferState(): Promise<TransferState> {
    return this.state;
  }

  // Static initializers for in flight transfers that have not been completed
  static async from(
    wh: Wormhole,
    from: CCTPTransferDetails,
  ): Promise<CCTPTransfer>;
  static async from(
    wh: Wormhole,
    from: WormholeMessageId,
  ): Promise<CCTPTransfer>;
  static async from(wh: Wormhole, from: CircleMessageId): Promise<CCTPTransfer>;
  static async from(wh: Wormhole, from: TransactionId): Promise<CCTPTransfer>;
  static async from(
    wh: Wormhole,
    from:
      | CCTPTransferDetails
      | WormholeMessageId
      | CircleMessageId
      | TransactionId,
  ): Promise<CCTPTransfer> {
    // This is a new transfer, just return the object
    if (isCCTPTransferDetails(from)) {
      return new CCTPTransfer(wh, from);
    }

    // This is an existing transfer, fetch the details
    let tt: CCTPTransfer | undefined;
    if (isWormholeMessageId(from)) {
      tt = await CCTPTransfer.fromWormholeMessageId(wh, from);
    } else if (isTransactionIdentifier(from)) {
      tt = await CCTPTransfer.fromTransaction(wh, from);
    } else if (isCircleMessageId(from)) {
      tt = await CCTPTransfer.fromCircleMessageId(wh, from);
    } else {
      throw new Error("Invalid `from` parameter for CCTPTransfer");
    }
    await tt.fetchAttestation();

    return tt;
  }

  // init from the seq id
  private static async fromWormholeMessageId(
    wh: Wormhole,
    from: WormholeMessageId,
  ): Promise<CCTPTransfer> {
    const { chain, emitter, sequence } = from;
    const vaa = await CCTPTransfer.getTransferVaa(wh, chain, emitter, sequence);

    const rcvAddress = vaa.payload.mintRecipient;
    const rcvChain = toCircleChainName(vaa.payload.targetDomain);
    // Check if its a payload 3 targeted at a relayer on the destination chain
    const { wormholeRelayer } = wh.conf.chains[rcvChain]!.contracts.cctp!;

    let automatic = false;
    if (wormholeRelayer) {
      const relayerAddress = toNative(
        chain,
        wormholeRelayer,
        //@ts-ignore
      ).toUniversalAddress();
      automatic =
        vaa.payloadLiteral === "CircleTransferRelay" &&
        rcvAddress.equals(relayerAddress);
    }

    const details: CCTPTransferDetails = {
      from: nativeChainAddress([from.chain, vaa.payload.caller]),
      to: nativeChainAddress([rcvChain, rcvAddress]),
      token: nativeChainAddress([chain, vaa.payload.token.address]),
      amount: vaa.payload.token.amount,
      automatic,
    };

    const tt = new CCTPTransfer(wh, details);
    tt.vaas = [{ id: { emitter, sequence: vaa.sequence, chain: chain }, vaa }];
    tt.state = TransferState.Initiated;

    return tt;
  }

  // TODO: should be allowed to be partial msg,
  // we can recover from either the msg or msghash
  private static async fromCircleMessageId(
    wh: Wormhole,
    messageId: CircleMessageId,
  ): Promise<CCTPTransfer> {
    const [message, hash] = deserializeCircleMessage(
      hexByteStringToUint8Array(messageId.message),
    );
    // If no hash is passed, set to the one we just computed
    if (messageId.hash === "") messageId.hash = hash;

    const { payload: burnMessage } = message;
    const xferSender = burnMessage.messageSender;
    const xferReceiver = burnMessage.mintRecipient;

    const sendChain = toCircleChainName(message.sourceDomain);
    const rcvChain = toCircleChainName(message.destinationDomain);

    const token = nativeChainAddress([sendChain, burnMessage.burnToken]);

    const details: CCTPTransferDetails = {
      from: nativeChainAddress([sendChain, xferSender]),
      to: nativeChainAddress([rcvChain, xferReceiver]),
      token,
      amount: burnMessage.amount,
      automatic: false,
    };

    const xfer = new CCTPTransfer(wh, details);
    xfer.circleAttestations = [{ id: messageId }];
    xfer.state = TransferState.Initiated;

    return xfer;
  }

  // init from source tx hash
  private static async fromTransaction(
    wh: Wormhole,
    from: TransactionId,
  ): Promise<CCTPTransfer> {
    const { chain, txid } = from;
    const originChain = wh.getChain(chain);

    // First try to parse out a WormholeMessage
    // If we get one or more, we assume its a Wormhole attested
    // transfer
    const msgIds: WormholeMessageId[] = await originChain.parseTransaction(
      txid,
    );

    // If we found a VAA message, use it
    let ct: CCTPTransfer;
    if (msgIds.length > 0) {
      ct = await CCTPTransfer.fromWormholeMessageId(wh, msgIds[0]);
    } else {
      // Otherwise try to parse out a circle message
      const cb = await originChain.getCircleBridge();
      const circleMessage = await cb.parseTransactionDetails(txid);
      const details: CCTPTransferDetails = {
        ...circleMessage,
        // Note: assuming automatic is false since we didn't find a VAA
        automatic: false,
      };

      ct = new CCTPTransfer(wh, details);
      ct.circleAttestations = [{ id: circleMessage.messageId }];
    }

    ct.state = TransferState.Initiated;
    ct.txids = [from.txid];
    return ct;
  }

  // start the WormholeTransfer by submitting transactions to the source chain
  // returns a transaction hash
  async initiateTransfer(signer: Signer): Promise<TxHash[]> {
    /*
        0) check that the current `state` is valid to call this (eg: state == Created)
        1) get a token transfer transaction for the token bridge given the context  
        2) sign it given the signer
        3) submit it to chain
        4) return transaction id
    */

    if (this.state !== TransferState.Created)
      throw new Error("Invalid state transition in `start`");

    const fromChain = this.wh.getChain(this.transfer.from.chain);

    let xfer: AsyncGenerator<UnsignedTransaction>;
    if (this.transfer.automatic) {
      const cr = await fromChain.getAutomaticCircleBridge();
      xfer = cr.transfer(
        this.transfer.token,
        this.transfer.from.address,
        { chain: this.transfer.to.chain, address: this.transfer.to.address },
        this.transfer.amount,
        this.transfer.nativeGas,
      );
    } else {
      const cb = await fromChain.getCircleBridge();
      xfer = cb.transfer(
        this.transfer.token,
        this.transfer.from.address,
        { chain: this.transfer.to.chain, address: this.transfer.to.address },
        this.transfer.amount,
      );
    }

    let unsigned: UnsignedTransaction[] = [];
    const txHashes: TxHash[] = [];
    for await (const tx of xfer) {
      unsigned.push(tx);
      if (!tx.parallelizable) {
        const signed = await signer.sign(unsigned);
        txHashes.push(...(await fromChain.sendWait(signed)));
        unsigned = [];
      }
    }
    if (unsigned.length > 0) {
      const signed = await signer.sign(unsigned);
      txHashes.push(...(await fromChain.sendWait(signed)));
    }

    this.txids = txHashes;
    this.state = TransferState.Initiated;

    return txHashes;
  }

  private async fetchWormholeAttestation(
    timeout?: number,
  ): Promise<WormholeMessageId[]> {
    if (!this.vaas || this.vaas.length == 0)
      throw new Error("No VAA details available");

    // Check if we already have the VAA
    for (const idx in this.vaas) {
      // already got it
      if (this.vaas[idx].vaa) continue;

      this.vaas[idx].vaa = await CCTPTransfer.getTransferVaa(
        this.wh,
        this.transfer.from.chain,
        this.vaas[idx].id.emitter,
        this.vaas[idx].id.sequence,
      );
    }

    return this.vaas.map((v) => v.id);
  }

  private async fetchCircleAttestation(
    timeout?: number,
  ): Promise<CircleMessageId[]> {
    if (!this.circleAttestations || this.circleAttestations.length == 0) {
      // If we dont have any circle attestations yet, we need to start by
      // fetching the transaction details from the source chain
      if (!this.txids)
        throw new Error("No circle attestations or transactions to fetch");

      // The last tx should be the circle transfer, its possible there was
      // a contract spend approval transaction
      const txid = this.txids[this.txids?.length - 1];
      const fromChain = this.wh.getChain(this.transfer.from.chain);

      const cb = await fromChain.getCircleBridge();
      const circleMessage = await cb.parseTransactionDetails(txid);
      this.circleAttestations = [{ id: circleMessage.messageId }];
    }

    // TODO: add conf for interval per service ?
    const retryInterval = 5000;
    for (const idx in this.circleAttestations) {
      const ca = this.circleAttestations[idx];
      if (ca.attestation) continue; // already got it

      const task = () => this.wh.getCircleAttestation(ca.id.hash);
      const attestation = await retry<string>(task, retryInterval, timeout);
      if (attestation === null)
        throw new Error("No attestation available after timeout exhausted");

      this.circleAttestations[idx].attestation = attestation;
    }

    return this.circleAttestations.map((v) => v.id);
  }

  // wait for the VAA to be ready
  // returns the sequence number
  async fetchAttestation(timeout?: number): Promise<AttestationId[]> {
    /*
        0) check that the current `state` is valid to call this  (eg: state == Started)
        1) poll the api on an interval to check if the VAA is available
        2) Once available, pull the VAA and parse it
        3) return seq
    */
    if (
      this.state < TransferState.Initiated ||
      this.state > TransferState.Attested
    )
      throw new Error("Invalid state transition in `fetchAttestation`");

    const ids: AttestationId[] = this.transfer.automatic
      ? await this.fetchWormholeAttestation(timeout)
      : await this.fetchCircleAttestation(timeout);

    this.state = TransferState.Attested;

    return ids;
  }

  // finish the WormholeTransfer by submitting transactions to the destination chain
  // returns a transaction hash
  async completeTransfer(signer: Signer): Promise<TxHash[]> {
    /*
        0) check that the current `state` is valid to call this  (eg: state == Ready)
        1) prepare the transactions and sign them given the signer
        2) submit the VAA and transactions on chain
        3) return txid of submission
    */
    if (this.state < TransferState.Attested)
      throw new Error("Invalid state transition in `finish`");

    if (this.transfer.automatic) {
      if (!this.vaas) throw new Error("No VAA details available");

      const toChain = this.wh.getChain(this.transfer.to.chain);

      const txHashes: TxHash[] = [];
      for (const cachedVaa of this.vaas) {
        const { vaa } = cachedVaa;
        if (!vaa) throw new Error("No Vaa found");
        const tb = await toChain.getAutomaticCircleBridge();
        //TODO: tb.redeem()
        throw new Error("No method to redeem auto circle bridge tx (yet)");
      }
      return txHashes;
    } else {
      // If no circle attestations, fetch 'em
      if (!this.circleAttestations) await this.fetchAttestation();

      const toChain = this.wh.getChain(this.transfer.to.chain);

      const txHashes: TxHash[] = [];
      for (const cachedAttestation of this.circleAttestations!) {
        const { id, attestation } = cachedAttestation;

        if (!attestation)
          throw new Error(`No Circle Attestation for ${id.hash}`);

        const tb = await toChain.getCircleBridge();
        const xfer = tb.redeem(
          this.transfer.to.address,
          id.message,
          attestation,
        );

        let unsigned: UnsignedTransaction[] = [];
        for await (const tx of xfer) {
          unsigned.push(tx);
          // If we get a non-parallelizable tx, sign and send the transactions
          // we've gotten so far
          if (!tx.parallelizable) {
            const signed = await signer.sign(unsigned);
            txHashes.push(...(await toChain.sendWait(signed)));
            // reset unsigned
            unsigned = [];
          }
        }

        if (unsigned.length > 0) {
          const signed = await signer.sign(unsigned);
          txHashes.push(...(await toChain.sendWait(signed)));
        }
      }
      return txHashes;
    }
  }

  static async getTransferVaa(
    wh: Wormhole,
    chain: ChainName,
    emitter: UniversalAddress | NativeAddress<PlatformName>,
    sequence: bigint,
    retries: number = 5,
  ): Promise<VAA<"CircleTransferRelay">> {
    const vaaBytes = await wh.getVAABytes(chain, emitter, sequence, retries);
    if (!vaaBytes) throw new Error(`No VAA available after ${retries} retries`);

    const partial = deserialize("Uint8Array", vaaBytes);
    switch (partial.payload[0]) {
      case 1:
        return deserialize("CircleTransferRelay", vaaBytes);
    }
    throw new Error(`No serde defined for type: ${partial.payload[0]}`);
  }
}
