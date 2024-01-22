import {
  AccountAddress,
  ChainAddress,
  ChainsConfig,
  Contracts,
  Network,
  Platform,
  PorticoBridge,
  TokenAddress,
  TokenId,
  canonicalAddress,
  nativeChainIds,
  resolveWrappedToken,
  serialize,
  tokens,
} from '@wormhole-foundation/connect-sdk';
import {
  EvmAddress,
  EvmChains,
  EvmPlatform,
  EvmUnsignedTransaction,
  addChainId,
  addFrom,
} from '@wormhole-foundation/connect-sdk-evm';
import { Provider, TransactionRequest, ethers } from 'ethers';
import { porticoAbi, uniswapQuoterV2Abi } from './abis';
import { PorticoApi } from './api';
import { FEE_TIER, getContracts } from './consts';

import { EvmWormholeCore } from '@wormhole-foundation/connect-sdk-evm-core';

import '@wormhole-foundation/connect-sdk-evm-tokenbridge';

export class EvmPorticoBridge<
  N extends Network,
  C extends EvmChains = EvmChains,
> implements PorticoBridge<N, 'Evm', C>
{
  chainId: bigint;
  porticoAddress: string;
  uniswapAddress: string;

  porticoContract: ethers.Contract;
  uniswapContract: ethers.Contract;

  constructor(
    readonly network: N,
    readonly chain: C,
    readonly provider: Provider,
    readonly contracts: Contracts,
    readonly core: EvmWormholeCore<N, C>,
  ) {
    const { portico, uniswapQuoterV2 } = getContracts(chain);
    this.porticoAddress = portico;
    this.uniswapAddress = uniswapQuoterV2;

    this.chainId = nativeChainIds.networkChainToNativeChainId.get(
      network,
      chain,
    ) as bigint;

    this.porticoContract = new ethers.Contract(
      this.porticoAddress,
      porticoAbi.fragments,
      this.provider,
    );

    this.uniswapContract = new ethers.Contract(
      this.uniswapAddress,
      uniswapQuoterV2Abi.fragments,
      this.provider,
    );
  }

  static async fromRpc<N extends Network>(
    provider: Provider,
    config: ChainsConfig<N, Platform>,
  ): Promise<EvmPorticoBridge<N, EvmChains>> {
    const [network, chain] = await EvmPlatform.chainFromRpc(provider);

    const core = await EvmWormholeCore.fromRpc(provider, config);

    const conf = config[chain]!;
    if (conf.network !== network)
      throw new Error(`Network mismatch: ${conf.network} != ${network}`);

    return new EvmPorticoBridge(
      network as N,
      chain,
      provider,
      conf.contracts,
      core,
    );
  }

  async *transfer(
    sender: AccountAddress<C>,
    receiver: ChainAddress,
    token: TokenAddress<C>,
    amount: bigint,
    destToken: TokenId | 'native',
    quote: PorticoBridge.Quote,
  ) {
    const { minAmountStart, minAmountFinish } = quote.swapAmounts;
    if (minAmountStart === 0n) throw new Error('Invalid min swap amount');
    if (minAmountFinish === 0n) throw new Error('Invalid min swap amount');

    const senderAddress = new EvmAddress(sender).toString();

    const [isStartTokenNative, startToken] = resolveWrappedToken(
      this.network,
      this.chain,
      token,
    );
    const startTokenAddress = canonicalAddress(startToken);

    // Create the order
    const createOrderResult = await PorticoApi.createOrder(
      this.network,
      this.chain,
      receiver,
      token,
      amount,
      destToken,
      quote,
    );

    // Approve the token if necessary
    if (!isStartTokenNative)
      yield* this.approve(
        startTokenAddress,
        senderAddress,
        amount,
        this.porticoAddress,
      );

    const messageFee = await this.core.getMessageFee();

    const tx = {
      to: this.porticoAddress,
      data: createOrderResult.transactionData,
      value: messageFee + (isStartTokenNative ? amount : 0n),
    };
    yield this.createUnsignedTransaction(
      addFrom(tx, senderAddress),
      'PorticoBridge.Transfer',
    );
  }

  async *redeem(sender: AccountAddress<C>, vaa: PorticoBridge.VAA) {
    const txReq = await this.porticoContract
      .getFunction('receiveMessageAndSwap')
      .populateTransaction(serialize(vaa));

    const address = new EvmAddress(sender).toString();

    yield this.createUnsignedTransaction(
      addFrom(txReq, address),
      'PorticoBridge.Redeem',
    );
  }

  async quoteSwap(
    input: TokenAddress<C>,
    output: TokenAddress<C>,
    amount: bigint,
  ): Promise<bigint> {
    const [, inputTokenId] = resolveWrappedToken(
      this.network,
      this.chain,
      input,
    );

    const [, outputTokenId] = resolveWrappedToken(
      this.network,
      this.chain,
      output,
    );

    const inputAddress = canonicalAddress(inputTokenId);
    const outputAddress = canonicalAddress(outputTokenId);

    if (tokens.isEqualCaseInsensitive(inputAddress, outputAddress))
      return amount;

    const result = await this.uniswapContract
      .getFunction('quoteExactInputSingle')
      .staticCall([inputAddress, outputAddress, amount, FEE_TIER, 0]);

    return result[0];
  }

  async quoteRelay(token: TokenAddress<C>, destination: TokenId) {
    const [, startToken] = resolveWrappedToken(this.network, this.chain, token);
    return await PorticoApi.quoteRelayer(startToken, destination);
  }

  private async *approve(
    token: string,
    senderAddr: string,
    amount: bigint,
    contract: string,
  ) {
    const tokenContract = EvmPlatform.getTokenImplementation(
      this.provider,
      token,
    );
    const allowance = await tokenContract.allowance(senderAddr, contract);
    if (allowance < amount) {
      const txReq = await tokenContract.approve.populateTransaction(
        contract,
        amount,
      );
      yield this.createUnsignedTransaction(
        addFrom(txReq, senderAddr),
        'PorticoBridge.Approve',
      );
    }
  }

  private createUnsignedTransaction(
    txReq: TransactionRequest,
    description: string,
  ) {
    return new EvmUnsignedTransaction(
      addChainId(txReq, this.chainId),
      this.network,
      this.chain,
      description,
      false,
    );
  }
}