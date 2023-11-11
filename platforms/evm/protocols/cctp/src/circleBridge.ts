import {
  AccountAddress,
  ChainAddress,
  ChainsConfig,
  CircleBridge,
  CircleChain,
  CircleNetwork,
  CircleTransferMessage,
  Contracts,
  Network,
  UnsignedTransaction,
  circleChainId,
  deserializeCircleMessage,
  encoding,
  nativeChainAddress,
  toCircleChain,
  usdcContract,
} from '@wormhole-foundation/connect-sdk';

import { MessageTransmitter, TokenMessenger } from './ethers-contracts';

import {
  EvmChains,
  EvmPlatform,
  EvmUnsignedTransaction,
  addChainId,
  addFrom,
} from '@wormhole-foundation/connect-sdk-evm';
import {
  Chain,
  Platform,
  networkChainToNativeChainId,
} from '@wormhole-foundation/sdk-base';
import { LogDescription, Provider, TransactionRequest } from 'ethers';
import { ethers_contracts } from '.';
//https://github.com/circlefin/evm-cctp-contracts

export class EvmCircleBridge<
  N extends Network,
  P extends 'Evm' = 'Evm',
  C extends Chain = EvmChains,
> implements CircleBridge<P, C>
{
  readonly chainId: bigint;
  readonly msgTransmitter: MessageTransmitter.MessageTransmitter;
  readonly tokenMessenger: TokenMessenger.TokenMessenger;

  readonly tokenEventHash: string;
  readonly messageSentEventHash: string;
  readonly messageReceivedEventHash: string;

  private constructor(
    readonly network: N,
    readonly chain: C,
    readonly provider: Provider,
    readonly contracts: Contracts,
  ) {
    if (network === 'Devnet')
      throw new Error('CircleBridge not supported on Devnet');

    this.chainId = networkChainToNativeChainId.get(network, chain) as bigint;

    const msgTransmitterAddress = contracts.cctp?.messageTransmitter;
    if (!msgTransmitterAddress)
      throw new Error(
        `Circle Messenge Transmitter contract for domain ${chain} not found`,
      );

    this.msgTransmitter = ethers_contracts.MessageTransmitter__factory.connect(
      msgTransmitterAddress,
      provider,
    );

    const tokenMessengerAddress = contracts.cctp?.tokenMessenger;
    if (!tokenMessengerAddress)
      throw new Error(
        `Circle Token Messenger contract for domain ${chain} not found`,
      );

    this.tokenMessenger = ethers_contracts.TokenMessenger__factory.connect(
      tokenMessengerAddress,
      provider,
    );

    this.tokenEventHash =
      this.tokenMessenger.getEvent('DepositForBurn').fragment.topicHash;

    this.messageSentEventHash =
      this.msgTransmitter.getEvent('MessageSent').fragment.topicHash;

    this.messageReceivedEventHash =
      this.msgTransmitter.getEvent('MessageReceived').fragment.topicHash;
  }

  static async fromRpc<N extends Network>(
    provider: Provider,
    config: ChainsConfig<N, Platform>,
  ): Promise<EvmCircleBridge<N>> {
    const [network, chain] = await EvmPlatform.chainFromRpc(provider);
    const conf = config[chain];
    if (conf.network !== network)
      throw new Error(`Network mismatch: ${conf.network} != ${network}`);
    return new EvmCircleBridge<N>(
      network as N,
      chain,
      provider,
      conf.contracts,
    );
  }

  async *redeem(
    sender: AccountAddress<C>,
    message: string,
    attestation: string,
  ): AsyncGenerator<UnsignedTransaction> {
    const senderAddr = sender.toNative(this.chain).toString();

    const txReq = await this.msgTransmitter.receiveMessage.populateTransaction(
      encoding.hex.decode(message),
      encoding.hex.decode(attestation),
    );

    yield this.createUnsignedTx(
      addFrom(txReq, senderAddr),
      'CircleBridge.redeem',
    );
  }
  //alternative naming: initiateTransfer
  async *transfer(
    sender: AccountAddress<C>,
    recipient: ChainAddress,
    amount: bigint,
  ): AsyncGenerator<EvmUnsignedTransaction> {
    const senderAddr = sender.toNative(this.chain).toString();
    const recipientAddress = recipient.address
      .toUniversalAddress()
      .toUint8Array();

    const tokenAddr = usdcContract(
      this.network as CircleNetwork,
      this.chain as CircleChain,
    );

    const tokenContract = EvmPlatform.getTokenImplementation(
      this.provider,
      tokenAddr,
    );

    const allowance = await tokenContract.allowance(
      senderAddr,
      this.tokenMessenger.target,
    );

    if (allowance < amount) {
      const txReq = await tokenContract.approve.populateTransaction(
        this.tokenMessenger.target,
        amount,
      );
      yield this.createUnsignedTx(
        addFrom(txReq, senderAddr),
        'ERC20.approve of CircleBridge',
        false,
      );
    }

    const txReq = await this.tokenMessenger.depositForBurn.populateTransaction(
      amount,
      circleChainId(recipient.chain as CircleChain),
      recipientAddress,
      tokenAddr,
    );

    yield this.createUnsignedTx(
      addFrom(txReq, senderAddr),
      'CircleBridge.transfer',
    );
  }

  // Fetch the transaction logs and parse the CircleTransferMessage
  async parseTransactionDetails(txid: string): Promise<CircleTransferMessage> {
    const receipt = await this.provider.getTransactionReceipt(txid);
    if (!receipt) throw new Error(`No receipt for ${txid} on ${this.chain}`);

    const messageLogs = receipt.logs
      .filter((log) => log.topics[0] === this.messageSentEventHash)
      .map((messageLog) => {
        const { topics, data } = messageLog;
        return this.msgTransmitter.interface.parseLog({
          topics: topics.slice(),
          data: data,
        });
      })
      .filter((l): l is LogDescription => !!l);

    if (messageLogs.length === 0)
      throw new Error(
        `No log message for message transmitter found in ${txid}`,
      );

    // just taking the first one here, will there ever be >1?
    if (messageLogs.length > 1)
      console.error(
        `Expected 1 event to be found for transaction, got>${messageLogs.length}}`,
      );

    const [messageLog] = messageLogs;
    const { message } = messageLog.args;
    const [circleMsg, hash] = deserializeCircleMessage(
      encoding.hex.decode(message),
    );
    const { payload: body } = circleMsg;

    const xferSender = body.messageSender;
    const xferReceiver = body.mintRecipient;

    const sendChain = toCircleChain(circleMsg.sourceDomain);
    const rcvChain = toCircleChain(circleMsg.destinationDomain);

    const token = nativeChainAddress(sendChain, body.burnToken);

    return {
      from: nativeChainAddress(sendChain, xferSender),
      to: nativeChainAddress(rcvChain, xferReceiver),
      token: token,
      amount: body.amount,
      messageId: { message, hash },
    };
  }

  private createUnsignedTx(
    txReq: TransactionRequest,
    description: string,
    parallelizable: boolean = false,
  ): EvmUnsignedTransaction {
    return new EvmUnsignedTransaction(
      addChainId(txReq, this.chainId),
      this.network,
      this.chain,
      description,
      parallelizable,
    );
  }
}
