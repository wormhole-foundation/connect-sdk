import {
  AccountAddress,
  AutomaticTokenBridge,
  ChainAddress,
  ChainsConfig,
  Contracts,
  Network,
  TokenAddress,
  TokenBridge,
  serialize,
} from '@wormhole-foundation/connect-sdk';
import {
  EvmAddress,
  EvmChains,
  EvmPlatform,
  EvmPlatformType,
  EvmUnsignedTransaction,
  addChainId,
  addFrom,
} from '@wormhole-foundation/connect-sdk-evm';
import { Provider, TransactionRequest } from 'ethers';

import { nativeChainIds, toChainId } from '@wormhole-foundation/sdk-base';
import { ethers_contracts } from '.';

import '@wormhole-foundation/connect-sdk-evm-core';

export class EvmAutomaticTokenBridge<N extends Network, C extends EvmChains>
  implements AutomaticTokenBridge<N, 'Evm', C>
{
  readonly tokenBridgeRelayer: ethers_contracts.TokenBridgeRelayer;
  readonly tokenBridge: ethers_contracts.TokenBridgeContract;
  readonly chainId: bigint;

  private constructor(
    readonly network: N,
    readonly chain: C,
    readonly provider: Provider,
    readonly contracts: Contracts,
  ) {
    if (network === 'Devnet')
      throw new Error('AutomaticTokenBridge not supported on Devnet');

    this.chainId = nativeChainIds.networkChainToNativeChainId.get(
      network,
      chain,
    ) as bigint;

    const tokenBridgeAddress = this.contracts.tokenBridge!;
    if (!tokenBridgeAddress)
      throw new Error(
        `Wormhole Token Bridge contract for domain ${chain} not found`,
      );

    this.tokenBridge = ethers_contracts.Bridge__factory.connect(
      tokenBridgeAddress,
      provider,
    );

    const relayerAddress = this.contracts.tokenBridgeRelayer;
    if (!relayerAddress)
      throw new Error(
        `Wormhole Token Bridge Relayer contract for domain ${chain} not found`,
      );

    this.tokenBridgeRelayer =
      ethers_contracts.TokenBridgeRelayer__factory.connect(
        relayerAddress,
        provider,
      );
  }
  async *redeem(
    sender: AccountAddress<C>,
    vaa: TokenBridge.VAA<'TransferWithPayload'>,
  ): AsyncGenerator<EvmUnsignedTransaction<N, C>> {
    const senderAddr = sender.toNative(this.chain).toString();
    const txReq =
      await this.tokenBridgeRelayer.completeTransferWithRelay.populateTransaction(
        serialize(vaa),
      );

    return this.createUnsignedTx(
      addFrom(txReq, senderAddr),
      'TokenBridgeRelayer.completeTransferWithRelay',
    );
  }

  static async fromRpc<N extends Network>(
    provider: Provider,
    config: ChainsConfig<N, EvmPlatformType>,
  ): Promise<EvmAutomaticTokenBridge<N, EvmChains>> {
    const [network, chain] = await EvmPlatform.chainFromRpc(provider);

    const conf = config[chain]!;
    if (conf.network !== network)
      throw new Error(`Network mismatch: ${conf.network} != ${network}`);

    return new EvmAutomaticTokenBridge<N, EvmChains>(
      network as N,
      chain,
      provider,
      conf.contracts,
    );
  }

  //alternative naming: initiateTransfer
  async *transfer(
    sender: AccountAddress<C>,
    recipient: ChainAddress,
    token: TokenAddress<C>,
    amount: bigint,
    nativeGas?: bigint,
  ): AsyncGenerator<EvmUnsignedTransaction<N, C>> {
    const senderAddr = sender.toNative(this.chain).toString();
    const recipientChainId = toChainId(recipient.chain);

    const recipientAddress = recipient.address
      .toUniversalAddress()
      .toUint8Array();

    const nativeTokenGas = nativeGas ? nativeGas : 0n;

    const fee = await this.getRelayerFee(sender, recipient, token);
    const sendAmount = amount + fee + nativeTokenGas;

    if (token === 'native') {
      const txReq =
        await this.tokenBridgeRelayer.wrapAndTransferEthWithRelay.populateTransaction(
          nativeTokenGas,
          recipientChainId,
          recipientAddress,
          0, // skip batching
          { value: sendAmount },
        );

      yield this.createUnsignedTx(
        addFrom(txReq, senderAddr),
        'TokenBridgeRelayer.wrapAndTransferETHWithRelay',
      );
    } else {
      //TODO check for ERC-2612 (permit) support on token?
      const tokenAddr = token.toNative(this.chain).toString();

      const tokenContract = EvmPlatform.getTokenImplementation(
        this.provider,
        tokenAddr,
      );
      const allowance = await tokenContract.allowance(
        senderAddr,
        this.tokenBridgeRelayer.target,
      );

      if (allowance < sendAmount) {
        const txReq = await tokenContract.approve.populateTransaction(
          this.tokenBridgeRelayer.target,
          sendAmount,
        );
        yield this.createUnsignedTx(
          addFrom(txReq, senderAddr),
          'AutomaticTokenBridge.Approve',
        );
      }

      const txReq =
        await this.tokenBridgeRelayer.transferTokensWithRelay.populateTransaction(
          tokenAddr,
          sendAmount,
          nativeTokenGas,
          recipientChainId,
          recipientAddress,
          0,
        );

      yield this.createUnsignedTx(
        addFrom(txReq, senderAddr),
        'TokenBridgeRelayer.TransferTokensWithRelay',
      );
    }
  }

  async getRelayerFee(
    sender: AccountAddress<C>,
    recipient: ChainAddress,
    token: TokenAddress<C>,
  ): Promise<bigint> {
    const destChainId = toChainId(recipient.chain);
    const srcTokenAddress =
      token === 'native'
        ? await this.tokenBridge.WETH()
        : new EvmAddress(token).toString();

    const tokenContract = EvmPlatform.getTokenImplementation(
      this.provider,
      srcTokenAddress,
    );

    const decimals = await tokenContract.decimals();
    return await this.tokenBridgeRelayer.calculateRelayerFee(
      destChainId,
      srcTokenAddress,
      decimals,
    );
  }

  private createUnsignedTx(
    txReq: TransactionRequest,
    description: string,
    parallelizable: boolean = false,
  ): EvmUnsignedTransaction<N, C> {
    return new EvmUnsignedTransaction(
      addChainId(txReq, this.chainId),
      this.network,
      this.chain,
      description,
      parallelizable,
    );
  }
}
