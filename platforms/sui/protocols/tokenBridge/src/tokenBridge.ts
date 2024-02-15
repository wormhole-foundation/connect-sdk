import {
  JsonRpcProvider,
  SUI_CLOCK_OBJECT_ID,
  SUI_TYPE_ARG,
  TransactionBlock,
  normalizeSuiObjectId,
} from "@mysten/sui.js";
import {
  AccountAddress,
  Chain,
  ChainAddress,
  ChainsConfig,
  Contracts,
  ErrNotWrapped,
  NativeAddress,
  Network,
  Platform,
  TokenAddress,
  TokenBridge,
  TokenId,
  UniversalAddress,
  canonicalAddress,
  isNative,
  nativeChainIds,
  serialize,
  toChain,
  toChainId,
  toNative,
} from "@wormhole-foundation/connect-sdk";

import {
  SuiBuildOutput,
  SuiChains,
  SuiPlatform,
  SuiUnsignedTransaction,
  getFieldsFromObjectResponse,
  getOldestEmitterCapObjectId,
  getOriginalPackageId,
  getPackageId,
  isSameType,
  isValidSuiType,
  publishPackage,
  trimSuiType,
  uint8ArrayToBCS,
} from "@wormhole-foundation/connect-sdk-sui";
import { getTokenCoinType, getTokenFromTokenRegistry } from "./utils";

export class SuiTokenBridge<N extends Network, C extends SuiChains> implements TokenBridge<N, C> {
  readonly coreBridgeObjectId: string;
  readonly tokenBridgeObjectId: string;
  readonly chainId: bigint;

  private constructor(
    readonly network: N,
    readonly chain: C,
    readonly provider: JsonRpcProvider,
    readonly contracts: Contracts,
  ) {
    this.chainId = nativeChainIds.networkChainToNativeChainId.get(network, chain) as bigint;

    const tokenBridgeAddress = this.contracts.tokenBridge!;
    if (!tokenBridgeAddress)
      throw new Error(`Wormhole Token Bridge contract for domain ${chain} not found`);

    const coreBridgeAddress = this.contracts.coreBridge!;
    if (!coreBridgeAddress)
      throw new Error(`Wormhole Token Bridge contract for domain ${chain} not found`);

    this.tokenBridgeObjectId = tokenBridgeAddress;
    this.coreBridgeObjectId = coreBridgeAddress;
  }

  static async fromRpc<N extends Network>(
    provider: JsonRpcProvider,
    config: ChainsConfig<N, Platform>,
  ): Promise<SuiTokenBridge<N, SuiChains>> {
    const [network, chain] = await SuiPlatform.chainFromRpc(provider);

    const conf = config[chain]!;
    if (conf.network !== network)
      throw new Error(`Network mismatch: ${conf.network} != ${network}`);

    return new SuiTokenBridge(network as N, chain, provider, conf.contracts);
  }

  async isWrappedAsset(token: TokenAddress<C>): Promise<boolean> {
    try {
      this.getOriginalAsset(token);
      return true;
    } catch (e) {
      return false;
    }
  }

  async getOriginalAsset(token: TokenAddress<C>): Promise<TokenId> {
    let coinType = token.toString();
    if (!isValidSuiType(coinType)) throw new Error(`Invalid Sui type: ${coinType}`);

    const res = await getTokenFromTokenRegistry(this.provider, this.tokenBridgeObjectId, coinType);
    const fields = getFieldsFromObjectResponse(res);
    if (!fields) throw ErrNotWrapped(coinType);

    // Normalize types
    const type = trimSuiType(fields["value"].type);
    coinType = trimSuiType(coinType);

    // Check if wrapped or native asset. We check inclusion instead of equality
    // because it saves us from making an additional RPC call to fetch the package ID.
    if (type.includes(`wrapped_asset::WrappedAsset<${coinType}>`)) {
      return {
        chain: toChain(Number(fields["value"].fields.info.fields.token_chain)),
        address: new UniversalAddress(
          fields["value"].fields.info.fields.token_address.fields.value.fields.data,
        ),
      };
    }

    throw ErrNotWrapped(coinType);
  }

  async hasWrappedAsset(token: TokenId): Promise<boolean> {
    try {
      await this.getWrappedAsset(token);
      return true;
    } catch (e) {}
    return false;
  }

  async getWrappedAsset(token: TokenId<Chain>): Promise<NativeAddress<C>> {
    if (isNative(token.address))
      throw new Error("Token Address required, 'native' literal not supported");

    const address = await getTokenCoinType(
      this.provider,
      this.tokenBridgeObjectId,
      token.address.toUint8Array(),
      toChainId(token.chain),
    );
    if (!address) throw ErrNotWrapped(canonicalAddress(token));

    return toNative(this.chain, address);
  }

  async isTransferCompleted(
    vaa: TokenBridge.VAA<"Transfer" | "TransferWithPayload">,
  ): Promise<boolean> {
    throw new Error("Not implemented");
  }

  async *createAttestation(token: TokenAddress<C>): AsyncGenerator<SuiUnsignedTransaction<N, C>> {
    const feeAmount = 0n;
    const nonce = 0n;
    const coinType = token.toString();

    const metadata = await this.provider.getCoinMetadata({ coinType });

    if (metadata === null || metadata.id === null)
      throw new Error(`Coin metadata ID for type ${coinType} not found`);

    const [coreBridgePackageId, tokenBridgePackageId] = await this.getPackageIds();

    const tx = new TransactionBlock();

    const [feeCoin] = tx.splitCoins(tx.gas, [tx.pure(feeAmount)]);

    const [messageTicket] = tx.moveCall({
      target: `${tokenBridgePackageId}::attest_token::attest_token`,
      arguments: [tx.object(this.tokenBridgeObjectId), tx.object(metadata.id), tx.pure(nonce)],
      typeArguments: [coinType],
    });

    tx.moveCall({
      target: `${coreBridgePackageId}::publish_message::publish_message`,
      arguments: [
        tx.object(this.coreBridgeObjectId),
        feeCoin!,
        messageTicket!,
        tx.object(SUI_CLOCK_OBJECT_ID),
      ],
    });

    yield this.createUnsignedTx(tx, "Sui.TokenBridge.CreateAttestation");
  }

  async *submitAttestation(
    vaa: TokenBridge.VAA<"AttestMeta">,
    sender: AccountAddress<C>,
  ): AsyncGenerator<SuiUnsignedTransaction<N, C>> {
    const [coreBridgePackageId, tokenBridgePackageId] = await this.getPackageIds();

    const decimals = Math.min(vaa.payload.decimals, 8);
    const build = await this.getCoinBuildOutput(
      this.provider,
      coreBridgePackageId,
      tokenBridgePackageId,
      this.tokenBridgeObjectId,
      decimals,
    );
    const tx = await publishPackage(build, sender.toString());
    yield this.createUnsignedTx(tx, "Sui.TokenBridge.PrepareCreateWrapped");

    // TODO:
    let coinPackageId: string = "";
    while (coinPackageId === "") {
      await new Promise((r) => setTimeout(r, 1000));
      // wait for the result of the previous tx to fetch the new coinPackageId
    }

    // const suiPrepareRegistrationTxRes = await executeTransactionBlock(
    //   suiSigner,
    //   suiPrepareRegistrationTxPayload,
    // );
    // suiPrepareRegistrationTxRes.effects?.status.status === "failure" &&
    //   console.log(JSON.stringify(suiPrepareRegistrationTxRes.effects, null, 2));

    // // Complete create wrapped on Sui
    // const wrappedAssetSetupEvent =
    //   suiPrepareRegistrationTxRes.objectChanges?.find(
    //     (oc) =>
    //       oc.type === "created" && oc.objectType.includes("WrappedAssetSetup")
    //   );
    // const wrappedAssetSetupType =
    //   (wrappedAssetSetupEvent?.type === "created" &&
    //     wrappedAssetSetupEvent.objectType) ||
    //   undefined;
    // const publishEvents = getPublishedObjectChanges(
    //   suiPrepareRegistrationTxRes
    // );
    // const coinPackageId = publishEvents[0].packageId;
    // const suiCompleteRegistrationTxPayload = await createWrappedOnSui(
    //   suiProvider,
    //   SUI_CORE_BRIDGE_STATE_OBJECT_ID,
    //   SUI_TOKEN_BRIDGE_STATE_OBJECT_ID,
    //   suiAddress,
    //   coinPackageId,
    //   wrappedAssetSetupType,
    //   slicedAttestVAA
    // );

    // // Get coin metadata
    // const coinType = getWrappedCoinType(coinPackageId);
    // const coinMetadataObjectId = (await this.provider.getCoinMetadata({ coinType }))?.id;
    // if (!coinMetadataObjectId) {
    //   throw new Error(`Coin metadata object not found for coin type ${coinType}.`);
    // }

    // // WrappedAssetSetup looks like
    // // 0x92d81f28c167d90f84638c654b412fe7fa8e55bdfac7f638bdcf70306289be86::create_wrapped::WrappedAssetSetup<0xa40e0511f7d6531dd2dfac0512c7fd4a874b76f5994985fb17ee04501a2bb050::coin::COIN, 0x4eb7c5bca3759ab3064b46044edb5668c9066be8a543b28b58375f041f876a80::version_control::V__0_1_1>
    // const wrappedAssetSetupObjectId = await getOwnedObjectId(
    //   provider,
    //   signerAddress,
    //   wrappedAssetSetupType
    // );
    // if (!wrappedAssetSetupObjectId) {
    //   throw new Error(`WrappedAssetSetup not found`);
    // }

    // // Get coin upgrade capability
    // const coinUpgradeCapObjectId = await getUpgradeCapObjectId(
    //   provider,
    //   signerAddress,
    //   coinPackageId
    // );
    // if (!coinUpgradeCapObjectId) {
    //   throw new Error(
    //     `Coin upgrade cap not found for ${coinType} under owner ${signerAddress}. You must call 'createWrappedOnSuiPrepare' first.`
    //   );
    // }

    // // Get TokenBridgeMessage
    // const tx = new TransactionBlock();
    // const [vaa] = tx.moveCall({
    //   target: `${coreBridgePackageId}::vaa::parse_and_verify`,
    //   arguments: [
    //     tx.object(coreBridgeStateObjectId),
    //     tx.pure(uint8ArrayToBCS(attestVAA)),
    //     tx.object(SUI_CLOCK_OBJECT_ID),
    //   ],
    // });
    // const [message] = tx.moveCall({
    //   target: `${tokenBridgePackageId}::vaa::verify_only_once`,
    //   arguments: [tx.object(tokenBridgeStateObjectId), vaa],
    // });

    // // Construct complete registration payload
    // const versionType = wrappedAssetSetupType.split(", ")[1].replace(">", ""); // ugh
    // tx.moveCall({
    //   target: `${tokenBridgePackageId}::create_wrapped::complete_registration`,
    //   arguments: [
    //     tx.object(tokenBridgeStateObjectId),
    //     tx.object(coinMetadataObjectId),
    //     tx.object(wrappedAssetSetupObjectId),
    //     tx.object(coinUpgradeCapObjectId),
    //     message,
    //   ],
    //   typeArguments: [coinType, versionType],
    // });
    // return tx;
  }

  async *transfer(
    sender: AccountAddress<C>,
    recipient: ChainAddress,
    token: TokenAddress<C>,
    amount: bigint,
    payload?: Uint8Array,
  ): AsyncGenerator<SuiUnsignedTransaction<N, C>> {
    // TODO:
    const feeAmount = 0n;
    const relayerFee = 0n;
    const nonce = 0;

    //   amount: bigint,
    //   payload: Uint8Array | null = null,
    //   senderAddress?: string

    const senderAddress = sender.toString();

    const coinType = isNative(token) ? "0x2::sui::SUI" : token.toString();
    const coins = (
      await this.provider.getCoins({
        owner: senderAddress,
        coinType,
      })
    ).data;

    const [primaryCoin, ...mergeCoins] = coins.filter((coin) =>
      isSameType(coin.coinType, coinType),
    );
    if (primaryCoin === undefined)
      throw new Error(`Coins array doesn't contain any coins of type ${coinType}`);

    const [coreBridgePackageId, tokenBridgePackageId] = await this.getPackageIds();

    const tx = new TransactionBlock();
    const [transferCoin] = (() => {
      if (coinType === SUI_TYPE_ARG) {
        return tx.splitCoins(tx.gas, [tx.pure(amount)]);
      } else {
        const primaryCoinInput = tx.object(primaryCoin.coinObjectId);
        if (mergeCoins.length) {
          tx.mergeCoins(
            primaryCoinInput,
            mergeCoins.map((coin) => tx.object(coin.coinObjectId)),
          );
        }
        return tx.splitCoins(primaryCoinInput, [tx.pure(amount)]);
      }
    })();

    const [feeCoin] = tx.splitCoins(tx.gas, [tx.pure(feeAmount)]);
    const [assetInfo] = tx.moveCall({
      target: `${tokenBridgePackageId}::state::verified_asset`,
      arguments: [tx.object(this.tokenBridgeObjectId)],
      typeArguments: [coinType],
    });

    if (payload === null) {
      const [transferTicket, dust] = tx.moveCall({
        target: `${tokenBridgePackageId}::transfer_tokens::prepare_transfer`,
        arguments: [
          assetInfo!,
          transferCoin!,
          tx.pure(toChainId(recipient.chain)),
          tx.pure(recipient.address.toUint8Array()),
          tx.pure(relayerFee),
          tx.pure(nonce),
        ],
        typeArguments: [coinType],
      });

      tx.moveCall({
        target: `${tokenBridgePackageId}::coin_utils::return_nonzero`,
        arguments: [dust!],
        typeArguments: [coinType],
      });

      const [messageTicket] = tx.moveCall({
        target: `${tokenBridgePackageId}::transfer_tokens::transfer_tokens`,
        arguments: [tx.object(this.tokenBridgeObjectId), transferTicket!],
        typeArguments: [coinType],
      });

      tx.moveCall({
        target: `${coreBridgePackageId}::publish_message::publish_message`,
        arguments: [
          tx.object(this.coreBridgeObjectId),
          feeCoin!,
          messageTicket!,
          tx.object(SUI_CLOCK_OBJECT_ID),
        ],
      });

      return tx;
    } else {
      if (!senderAddress) throw new Error("senderAddress is required for transfer with payload");

      // Get or create a new `EmitterCap`
      let isNewEmitterCap = false;
      const emitterCap = await (async () => {
        const objectId = await getOldestEmitterCapObjectId(
          this.provider,
          coreBridgePackageId,
          senderAddress,
        );
        if (objectId !== null) {
          return tx.object(objectId);
        } else {
          const [emitterCap] = tx.moveCall({
            target: `${coreBridgePackageId}::emitter::new`,
            arguments: [tx.object(this.coreBridgeObjectId)],
          });
          isNewEmitterCap = true;
          return emitterCap;
        }
      })();

      const [transferTicket, dust] = tx.moveCall({
        target: `${tokenBridgePackageId}::transfer_tokens_with_payload::prepare_transfer`,
        arguments: [
          emitterCap!,
          assetInfo!,
          transferCoin!,
          tx.pure(toChainId(recipient.chain)),
          tx.pure(recipient.address.toUint8Array()),
          tx.pure([...payload!]),
          tx.pure(nonce),
        ],
        typeArguments: [coinType],
      });

      tx.moveCall({
        target: `${tokenBridgePackageId}::coin_utils::return_nonzero`,
        arguments: [dust!],
        typeArguments: [coinType],
      });

      const [messageTicket] = tx.moveCall({
        target: `${tokenBridgePackageId}::transfer_tokens_with_payload::transfer_tokens_with_payload`,
        arguments: [tx.object(this.tokenBridgeObjectId), transferTicket!],
        typeArguments: [coinType],
      });

      tx.moveCall({
        target: `${coreBridgePackageId}::publish_message::publish_message`,
        arguments: [
          tx.object(this.coreBridgeObjectId),
          feeCoin!,
          messageTicket!,
          tx.object(SUI_CLOCK_OBJECT_ID),
        ],
      });

      if (isNewEmitterCap) {
        tx.transferObjects([emitterCap!], tx.pure(senderAddress));
      }

      return tx;
    }
  }

  async *redeem(
    sender: AccountAddress<C>,
    vaa: TokenBridge.VAA<"Transfer" | "TransferWithPayload">,
    unwrapNative: boolean = true,
  ): AsyncGenerator<SuiUnsignedTransaction<N, C>> {
    const coinType = await getTokenCoinType(
      this.provider,
      this.tokenBridgeObjectId,
      vaa.payload.token.address.toUint8Array(),
      toChainId(vaa.payload.token.chain),
    );
    if (!coinType) {
      throw new Error("Unable to fetch token coinType");
    }

    const [coreBridgePackageId, tokenBridgePackageId] = await this.getPackageIds();

    const tx = new TransactionBlock();
    const [verifiedVAA] = tx.moveCall({
      target: `${coreBridgePackageId}::vaa::parse_and_verify`,
      arguments: [
        tx.object(this.coreBridgeObjectId),
        tx.pure(uint8ArrayToBCS(serialize(vaa))),
        tx.object(SUI_CLOCK_OBJECT_ID),
      ],
    });

    const [tokenBridgeMessage] = tx.moveCall({
      target: `${tokenBridgePackageId}::vaa::verify_only_once`,
      arguments: [tx.object(this.tokenBridgeObjectId), verifiedVAA!],
    });
    const [relayerReceipt] = tx.moveCall({
      target: `${tokenBridgePackageId}::complete_transfer::authorize_transfer`,
      arguments: [tx.object(this.tokenBridgeObjectId), tokenBridgeMessage!],
      typeArguments: [coinType!],
    });

    const [coins] = tx.moveCall({
      target: `${tokenBridgePackageId}::complete_transfer::redeem_relayer_payout`,
      arguments: [relayerReceipt!],
      typeArguments: [coinType!],
    });

    tx.moveCall({
      target: `${tokenBridgePackageId}::coin_utils::return_nonzero`,
      arguments: [coins!],
      typeArguments: [coinType!],
    });

    yield this.createUnsignedTx(tx, "Sui.TokenBridge.Redeem");
  }

  async getWrappedNative(): Promise<NativeAddress<C>> {
    throw new Error("Not implemented");
  }

  private async getPackageIds(): Promise<[string, string]> {
    // TODO: can these be cached?
    return Promise.all([
      getPackageId(this.provider, this.coreBridgeObjectId),
      getPackageId(this.provider, this.tokenBridgeObjectId),
    ]);
  }

  private async getCoinBuildOutput(
    provider: JsonRpcProvider,
    coreBridgePackageId: string,
    tokenBridgePackageId: string,
    tokenBridgeStateObjectId: string,
    decimals: number,
  ): Promise<SuiBuildOutput> {
    if (decimals > 8) throw new Error("Decimals is capped at 8");

    // Construct bytecode, parametrized by token bridge package ID and decimals
    const strippedTokenBridgePackageId = (
      await getOriginalPackageId(provider, tokenBridgeStateObjectId)
    )?.replace("0x", "");
    if (!strippedTokenBridgePackageId) {
      throw new Error(
        `Original token bridge package ID not found for object ID ${tokenBridgeStateObjectId}`,
      );
    }

    const bytecodeHex =
      "a11ceb0b060000000901000a020a14031e1704350405392d07669f01088502600ae502050cea02160004010b010c0205020d000002000201020003030c020001000104020700000700010001090801010c020a050600030803040202000302010702080007080100020800080303090002070801010b020209000901010608010105010b0202080008030209000504434f494e095478436f6e7465787408565f5f305f325f3011577261707065644173736574536574757004636f696e0e6372656174655f777261707065640b64756d6d795f6669656c6404696e697414707265706172655f726567697374726174696f6e0f7075626c69635f7472616e736665720673656e646572087472616e736665720a74785f636f6e746578740f76657273696f6e5f636f6e74726f6c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002" +
      strippedTokenBridgePackageId +
      "00020106010000000001090b0031" +
      decimals.toString(16).padStart(2, "0") +
      "0a0138000b012e110238010200";
    const bytecode = Buffer.from(bytecodeHex, "hex").toString("base64");

    return {
      modules: [bytecode],
      dependencies: ["0x1", "0x2", tokenBridgePackageId, coreBridgePackageId].map((d) =>
        normalizeSuiObjectId(d),
      ),
    };
  }

  private createUnsignedTx(
    txReq: TransactionBlock,
    description: string,
    parallelizable: boolean = false,
  ): SuiUnsignedTransaction<N, C> {
    return new SuiUnsignedTransaction(txReq, this.network, this.chain, description, parallelizable);
  }
}
