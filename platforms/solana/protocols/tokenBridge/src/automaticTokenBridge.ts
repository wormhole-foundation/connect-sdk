import {
  AccountAddress,
  AutomaticTokenBridge,
  Chain,
  ChainAddress,
  ChainId,
  ChainsConfig,
  Contracts,
  Network,
  TokenAddress,
  VAA,
  toChainId,
} from '@wormhole-foundation/connect-sdk';
import {
  SolanaAddress,
  SolanaChains,
  SolanaPlatform,
  SolanaPlatformType,
  SolanaUnsignedTransaction,
} from '@wormhole-foundation/connect-sdk-solana';

import { BN, Program } from '@project-serum/anchor';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';

import { Platform } from '@wormhole-foundation/sdk-base/src';
import { TokenBridgeRelayer as TokenBridgeRelayerContract } from './automaticTokenBridgeType';
import {
  ForeignContract,
  RedeemerConfig,
  RegisteredToken,
  createTokenBridgeRelayerProgramInterface,
  deriveForeignContractAddress,
  deriveRedeemerConfigAddress,
  deriveRegisteredTokenAddress,
} from './utils/automaticTokenBridge';

import '@wormhole-foundation/connect-sdk-solana-core';
import { NATIVE_MINT } from '@solana/spl-token';
import { SolanaTokenBridge } from './tokenBridge';

const SOL_DECIMALS = 9;
const TEN = new BN(10);
const SWAP_RATE_PRECISION = new BN(100_000_000);

export class SolanaAutomaticTokenBridge<
  N extends Network,
  C extends SolanaChains,
> implements AutomaticTokenBridge<N, SolanaPlatformType, C>
{
  readonly chainId: ChainId;

  readonly tokenBridge: SolanaTokenBridge<N, C>;
  readonly tokenBridgeRelayer: Program<TokenBridgeRelayerContract>;

  private constructor(
    readonly network: N,
    readonly chain: C,
    readonly connection: Connection,
    readonly contracts: Contracts,
  ) {
    this.chainId = toChainId(chain);

    const tokenBridgeRelayerAddress = contracts.tokenBridgeRelayer;
    if (!tokenBridgeRelayerAddress)
      throw new Error(
        `TokenBridge contract Address for chain ${chain} not found`,
      );

    this.tokenBridgeRelayer = createTokenBridgeRelayerProgramInterface(
      tokenBridgeRelayerAddress,
      connection,
    );

    this.tokenBridge = new SolanaTokenBridge(
      network,
      chain,
      connection,
      contracts,
    );
  }
  static async fromRpc<N extends Network>(
    connection: Connection,
    config: ChainsConfig<N, Platform>,
  ): Promise<SolanaAutomaticTokenBridge<N, SolanaChains>> {
    const [network, chain] = await SolanaPlatform.chainFromRpc(connection);
    const conf = config[chain]!;
    if (conf.network !== network)
      throw new Error(
        `Network mismatch for chain ${chain}: ${conf.network} != ${network}`,
      );

    return new SolanaAutomaticTokenBridge(
      network as N,
      chain,
      connection,
      conf.contracts,
    );
  }

  async *transfer(
    sender: AccountAddress<C>,
    recipient: ChainAddress,
    token: TokenAddress<C>,
    amount: bigint,
    nativeGas?: bigint | undefined,
  ) {
    throw new Error('Method not implemented.');
  }
  async *redeem(
    sender: AccountAddress<C>,
    vaa: VAA<'TokenBridge:TransferWithPayload'>,
  ) {
    const redeemTx = new Transaction();
    yield this.createUnsignedTx(redeemTx, 'AutomaticTokenBridge.Redeem');
    throw new Error('Method not implemented.');
  }
  async getRelayerFee(
    sender: AccountAddress<C>,
    recipient: ChainAddress,
    token: TokenAddress<C>,
  ): Promise<bigint> {
    const tokenAddress = new SolanaAddress(token).unwrap();

    const [{ fee }, { swapRate }, { relayerFeePrecision }] = await Promise.all([
      this.getForeignContract(recipient.chain),
      this.getRegisteredToken(tokenAddress),
      this.getRedeemerConfig(),
    ]);

    const decimals = Number(
      await SolanaPlatform.getDecimals(this.chain, this.connection, token),
    );

    const relayerFee = TEN.pow(new BN(decimals))
      .mul(fee)
      .mul(SWAP_RATE_PRECISION)
      .div(new BN(relayerFeePrecision).mul(swapRate));

    return BigInt(relayerFee.toString());
  }

  async isAcceptedToken(mint: string): Promise<boolean> {
    try {
      await this.getRegisteredToken(new PublicKey(mint));
      return true;
    } catch (e: any) {
      if (e.message?.includes('Account does not exist')) {
        // the token is not registered
        return false;
      }
      throw e;
    }
  }

  async calculateRelayerFee(
    targetChain: Chain,
    mint: PublicKey,
    decimals: number,
  ): Promise<bigint> {
    const [{ fee }, { swapRate }, { relayerFeePrecision }] = await Promise.all([
      this.getForeignContract(targetChain),
      this.getRegisteredToken(mint),
      this.getRedeemerConfig(),
    ]);
    const relayerFee = TEN.pow(new BN(decimals))
      .mul(fee)
      .mul(SWAP_RATE_PRECISION)
      .div(new BN(relayerFeePrecision).mul(swapRate));

    return BigInt(relayerFee.toString());
  }

  async calculateMaxSwapAmountIn(
    mint: PublicKey,
    decimals: number,
  ): Promise<bigint> {
    const [{ swapRate, maxNativeSwapAmount }, { swapRate: solSwapRate }] =
      await Promise.all([
        this.getRegisteredToken(mint),
        this.getRegisteredToken(NATIVE_MINT),
      ]);
    const nativeSwapRate = this.calculateNativeSwapRate(solSwapRate, swapRate);
    const maxSwapAmountIn =
      decimals > SOL_DECIMALS
        ? maxNativeSwapAmount
            .mul(nativeSwapRate)
            .mul(TEN.pow(new BN(decimals - SOL_DECIMALS)))
            .div(SWAP_RATE_PRECISION)
        : maxNativeSwapAmount
            .mul(nativeSwapRate)
            .div(
              TEN.pow(new BN(SOL_DECIMALS - decimals)).mul(SWAP_RATE_PRECISION),
            );

    return BigInt(maxSwapAmountIn.toString());
  }

  async calculateNativeSwapAmountOut(
    mint: PublicKey,
    toNativeAmount: bigint,
    decimals: number,
  ): Promise<bigint> {
    if (toNativeAmount === 0n) {
      return 0n;
    }
    const [{ swapRate }, { swapRate: solSwapRate }] = await Promise.all([
      this.getRegisteredToken(mint),
      this.getRegisteredToken(NATIVE_MINT),
    ]);
    const nativeSwapRate = this.calculateNativeSwapRate(solSwapRate, swapRate);
    const swapAmountOut =
      decimals > SOL_DECIMALS
        ? SWAP_RATE_PRECISION.mul(new BN(toNativeAmount.toString())).div(
            nativeSwapRate.mul(TEN.pow(new BN(decimals - SOL_DECIMALS))),
          )
        : SWAP_RATE_PRECISION.mul(new BN(toNativeAmount.toString()))
            .mul(TEN.pow(new BN(SOL_DECIMALS - decimals)))
            .div(nativeSwapRate);

    return BigInt(swapAmountOut.toString());
  }

  private calculateNativeSwapRate(solSwapRate: BN, swapRate: BN): BN {
    return SWAP_RATE_PRECISION.mul(solSwapRate).div(swapRate);
  }

  private async getForeignContract(chain: Chain): Promise<ForeignContract> {
    return await this.tokenBridgeRelayer.account.foreignContract.fetch(
      deriveForeignContractAddress(this.tokenBridgeRelayer.programId, chain),
    );
  }

  private async getRegisteredToken(mint: PublicKey): Promise<RegisteredToken> {
    return await this.tokenBridgeRelayer.account.registeredToken.fetch(
      deriveRegisteredTokenAddress(this.tokenBridgeRelayer.programId, mint),
    );
  }

  private async getRedeemerConfig(): Promise<RedeemerConfig> {
    return await this.tokenBridgeRelayer.account.redeemerConfig.fetch(
      deriveRedeemerConfigAddress(this.tokenBridgeRelayer.programId),
    );
  }

  private createUnsignedTx(
    txReq: Transaction,
    description: string,
    parallelizable: boolean = false,
  ): SolanaUnsignedTransaction<N, C> {
    return new SolanaUnsignedTransaction(
      txReq,
      this.network,
      this.chain,
      description,
      parallelizable,
    );
  }
}
