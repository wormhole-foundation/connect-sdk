import {
  ChainName,
  chainToChainId,
  evmChainIdToNetworkChainPair,
  evmNetworkChainToEvmChainId,
} from '@wormhole-foundation/sdk-base';
import {
  ChainAddress,
  CCTPInfo,
  CircleBridge,
  UnsignedTransaction,
  keccak256,
} from '@wormhole-foundation/sdk-definitions';

import {
  addFrom,
  addChainId,
  toEvmAddrString,
  EvmChainName,
  UniversalOrEvm,
} from '../types';
import { EvmUnsignedTransaction } from '../unsignedTransaction';
import { MessageTransmitter, TokenMessenger } from '../ethers-contracts';
import { LogDescription, Provider, TransactionRequest } from 'ethers';
import { EvmContracts } from '../contracts';
import { TokenId } from '@wormhole-foundation/connect-sdk';

//https://github.com/circlefin/evm-cctp-contracts

export class EvmCircleBridge implements CircleBridge<'Evm'> {
  readonly contracts: EvmContracts;
  readonly chainId: bigint;
  readonly msgTransmitter: MessageTransmitter.MessageTransmitter;
  readonly tokenMessenger: TokenMessenger.TokenMessenger;

  // TODO: config for cctpDomain
  // https://developers.circle.com/stablecoin/docs/cctp-technical-reference#domain-list
  readonly chainNameToCircleId = {
    Ethereum: 0,
    Avalanche: 1,
    Arbitrum: 3,
  };

  readonly circleIdToChainName = Object.fromEntries(
    Object.entries(this.chainNameToCircleId).map(([k, v]) => {
      return [v, k];
    }),
  );

  private constructor(
    readonly network: 'Mainnet' | 'Testnet',
    readonly chain: EvmChainName,
    readonly provider: Provider,
  ) {
    this.contracts = new EvmContracts(network);

    this.chainId = evmNetworkChainToEvmChainId(network, chain);

    this.msgTransmitter = this.contracts.mustGetCircleMessageTransmitter(
      chain,
      provider,
    );
    this.tokenMessenger = this.contracts.mustGetCircleTokenMessenger(
      chain,
      provider,
    );
  }

  static async fromProvider(provider: Provider): Promise<EvmCircleBridge> {
    const { chainId } = await provider.getNetwork();
    const networkChainPair = evmChainIdToNetworkChainPair.get(chainId);
    if (networkChainPair === undefined)
      throw new Error(`Unknown EVM chainId ${chainId}`);

    const [network, chain] = networkChainPair;
    return new EvmCircleBridge(network, chain, provider);
  }

  async *redeem(
    sender: UniversalOrEvm,
    message: string,
    attestation: string,
  ): AsyncGenerator<UnsignedTransaction> {
    const senderAddr = toEvmAddrString(sender);

    const txReq = await this.msgTransmitter.receiveMessage.populateTransaction(
      message,
      attestation,
    );

    yield this.createUnsignedTx(
      addFrom(txReq, senderAddr),
      'CircleBridge.redeem',
    );
  }
  //alternative naming: initiateTransfer
  async *transfer(
    token: TokenId,
    sender: UniversalOrEvm,
    recipient: ChainAddress,
    amount: bigint,
  ): AsyncGenerator<EvmUnsignedTransaction> {
    const senderAddr = toEvmAddrString(sender);
    const recipientAddress = recipient.address.toString();
    const tokenAddr = toEvmAddrString(token.address);

    const tokenContract = this.contracts.mustGetTokenImplementation(
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

    // TODO: config for cctpDomain
    // https://developers.circle.com/stablecoin/docs/cctp-technical-reference#domain-list
    const chainNameToCircleId = {
      Ethereum: 0n,
      Avalanche: 1n,
      Arbitrum: 3n,
    };
    const txReq = await this.tokenMessenger.depositForBurn.populateTransaction(
      amount,
      // @ts-ignore
      chainNameToCircleId[recipient.chain],
      recipientAddress,
      tokenAddr,
    );

    yield this.createUnsignedTx(
      addFrom(txReq, senderAddr),
      'CircleBridge.transfer',
    );
  }

  // https://goerli.etherscan.io/tx/0xe4984775c76b8fe7c2b09cd56fb26830f6e5c5c6b540eb97d37d41f47f33faca#eventlog
  async parseTransactionDetails(txid: string): Promise<CCTPInfo> {
    const receipt = await this.provider.getTransactionReceipt(txid);
    if (!receipt) throw new Error(`No receipt for ${txid} on ${this.chain}`);

    // TODO: Can we get this event topic from somewhere else?
    const tokenLogs = receipt.logs
      .filter(
        (log) =>
          log.topics[0] ===
          '0x2fa9ca894982930190727e75500a97d8dc500233a5065e0f3126c48fbe0343c0',
      )
      .map((tokenLog) => {
        const { topics, data } = tokenLog;
        return this.tokenMessenger.interface.parseLog({
          topics: topics.slice(),
          data: data,
        });
      })
      .filter((l): l is LogDescription => !!l);

    if (tokenLogs.length === 0)
      throw new Error(`No log message for token transfer found in ${txid}`);
    const [tokenLog] = tokenLogs;

    const messageLogs = receipt.logs
      .filter(
        (log) =>
          log.topics[0] ===
          '0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036',
      )
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

    const [messageLog] = messageLogs;

    const messageHash = keccak256(messageLog.args.message);

    return {
      fromChain: this.chain,
      txid: receipt.hash,
      block: BigInt(receipt.blockNumber),
      gasUsed: receipt.gasUsed.toString(),
      depositor: receipt.from,
      amount: tokenLog.args.amount,
      destination: {
        recipient: tokenLog.args.mintRecipient,
        domain: tokenLog.args.destinationDomain,
        tokenMessenger: tokenLog.args.destinationTokenMessenger,
        caller: tokenLog.args.destinationCaller,
      },
      message: messageLog.args.message,
      messageHash,
    };
  }

  private createUnsignedTx(
    txReq: TransactionRequest,
    description: string,
    stackable: boolean = false,
  ): EvmUnsignedTransaction {
    return new EvmUnsignedTransaction(
      addChainId(txReq, this.chainId),
      this.network,
      this.chain,
      description,
      stackable,
    );
  }
}
