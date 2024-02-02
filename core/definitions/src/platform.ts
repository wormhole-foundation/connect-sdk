import { Chain, Network, Platform, PlatformToChains } from "@wormhole-foundation/sdk-base";
import { WormholeCore } from ".";
import { WormholeMessageId } from "./attestation";
import { ChainContext } from "./chain";
import { ProtocolName, create } from "./protocol";
import { RpcConnection } from "./rpc";
import { Balances, ChainsConfig, SignedTx, TokenId, TxHash, TokenAddress } from "./types";

/**
 * PlatformUtils represents the _static_ attributes available on
 * the PlatformContext Class
 */
export interface PlatformUtils<P extends Platform> {
  /** Value for the Platform so we can access it at runtime */
  _platform: P;

  /** Initialize a new PlatformContext object */
  new <N extends Network>(network: N, config?: ChainsConfig<N, P>): PlatformContext<N, P>;

  /**
   * Check if this chain is supported by this platform
   */
  isSupportedChain(chain: Chain): boolean;

  /** Look up a Chain from its native chain ID
   * See implementation for details
   * Note: this is _not_ the same as the Wormhole chain id
   */
  chainFromChainId(chainId: string | bigint): [Network, Chain];

  /**
   * Given an RPC connection, request the native chain id
   * then resolve it to a Wormhole Canonical network and chain name
   */
  chainFromRpc(rpc: RpcConnection<P>): Promise<[Network, Chain]>;

  /** Get the native (gas) token id for a given chain */
  nativeTokenId<N extends Network, C extends PlatformToChains<P>>(network: N, chain: C): TokenId<C>;
  /** Check if the token passed is the native token id for the argued chain and network */
  isNativeTokenId<N extends Network, C extends PlatformToChains<P>>(
    network: N,
    chain: C,
    tokenId: TokenId,
  ): boolean;

  /** Get the number of decimals for a given token */
  getDecimals<C extends PlatformToChains<P>>(
    chain: C,
    rpc: RpcConnection<P>,
    token: TokenAddress<C>,
  ): Promise<number>;

  /** Get the balance of a token for a given wallet address */
  getBalance<C extends PlatformToChains<P>>(
    chain: C,
    rpc: RpcConnection<P>,
    walletAddr: string,
    token: TokenAddress<C>,
  ): Promise<bigint | null>;

  /** Look up the balances for a list of tokens for a given wallet address */
  getBalances<C extends PlatformToChains<P>>(
    chain: C,
    rpc: RpcConnection<P>,
    walletAddress: string,
    tokens: TokenAddress<C>[],
  ): Promise<Balances>;

  /** Look up the latest block according to the RPC passed */
  getLatestBlock(rpc: RpcConnection<P>): Promise<number>;

  /** Look up the latest _finalized_ block according to the RPC passed */
  getLatestFinalizedBlock(rpc: RpcConnection<P>): Promise<number>;

  // Send a set of signed transactions over RPC and wait for
  // them to be accepted and confirmed
  // Note: this does not mean the transaction is _final_
  sendWait<C extends PlatformToChains<P>>(
    chain: C,
    rpc: RpcConnection<P>,
    stxns: SignedTx[],
  ): Promise<TxHash[]>;
}

// Use this to ensure the static methods defined in the PlatformContext
export type StaticPlatformMethods<P extends Platform, I extends PlatformUtils<P>> = InstanceType<I>;

/**
 * PlatformContext is an instance of the class that represents a specific Platform
 */
export abstract class PlatformContext<N extends Network, P extends Platform> {
  constructor(
    readonly network: N,
    readonly config: ChainsConfig<N, P>,
  ) {}

  /** provides access to the static attributes of the PlatformContext class */
  utils(): PlatformUtils<P> {
    return this.constructor as any;
  }

  /** Create a new RPC Connection */
  abstract getRpc<C extends PlatformToChains<P>>(
    chain: C,
  ): RpcConnection<P> | Promise<RpcConnection<P>>;

  /** Create a new Chain context object */
  abstract getChain<C extends PlatformToChains<P>>(
    chain: C,
    rpc?: RpcConnection<P>,
  ): ChainContext<N, C>;

  /** Create a new Protocol Client instance by protocol name */
  getProtocol<PN extends ProtocolName, T>(protocol: PN, rpc: RpcConnection<P>): Promise<T> {
    return create(this.utils()._platform, protocol, rpc, this.config);
  }

  /** Look up transaction logs and parse out Wormhole messages */
  async parseWormholeMessages<C extends PlatformToChains<P>>(
    chain: C,
    rpc: RpcConnection<P>,
    txid: TxHash,
  ): Promise<WormholeMessageId[]> {
    const wc: WormholeCore<N, P, C> = await this.getProtocol("WormholeCore", rpc);
    return wc.parseTransaction(txid);
  }
}
