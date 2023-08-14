import { BigNumber } from 'ethers';
import axios from 'axios';

import {
  ChainId,
  ChainName,
  Chain,
  Network,
  toChainId,
  toChainName,
  Platform,
  Contracts,
} from '@wormhole-foundation/sdk-base';
import { deserialize, VAA } from '@wormhole-foundation/sdk-definitions';

import {
  ContextConfig,
  MessageIdentifier,
  ParsedMessage,
  ParsedRelayerMessage,
  TokenId,
  WormholeConfig,
  AnyContext,
  RedeemResult,
  SendResult,
} from './types';

import { CONFIG } from './constants';

export class Wormhole {
  protected _contexts: Map<Platform, AnyContext>;

  readonly conf: WormholeConfig;

  constructor(
    network: Network,
    contexts: ContextConfig,
    conf?: WormholeConfig,
  ) {
    this.conf = conf ?? CONFIG[network];

    this._contexts = new Map();
    for (const platformType in contexts) {
      const context = new contexts[platformType as Platform]!(this);
      this._contexts.set(platformType as Platform, context);
    }
  }

  get network(): string {
    return this.conf.network;
  }

  /**
   * Converts to chain id
   * @param nameOrId the chain name or chain id
   * @returns the chain id
   */
  static toChainId(nameOrId: string | number): ChainId {
    return toChainId(nameOrId);
  }

  /**
   * Converts to chain name
   * @param nameOrId the chain name or chain id
   * @returns the chain name
   */
  static toChainName(nameOrId: string | number): ChainName {
    return toChainName(nameOrId);
  }

  /**
   * Gets the contract addresses for a given chain
   * @param chain the chain name or chain id
   * @returns the contract addresses
   */
  getContracts(chain: Chain): Contracts | undefined {
    const chainName = Wormhole.toChainName(chain);
    return this.conf.chains[chainName]?.contracts;
  }

  /**
   * Gets the contract addresses for a given chain
   * @param chain the chain name or chain id
   * @returns the contract addresses
   * @throws Errors if contracts are not found
   */
  mustGetContracts(chain: Chain): Contracts {
    const contracts = this.getContracts(chain);
    if (!contracts) throw new Error(`no contracts found for ${chain}`);
    return contracts;
  }

  /**
   * Returns the chain "context", i.e. the class with chain-specific logic and methods
   * @param chain the chain name or chain id
   * @returns the chain context class
   * @throws Errors if context is not found
   */
  getContext(chain: Chain): AnyContext {
    const chainName = Wormhole.toChainName(chain);
    const { context: contextType } = this.conf.chains[chainName]!;
    const context = this._contexts.get(contextType);
    if (!context) throw new Error('Not able to retrieve context');
    return context;
  }

  /**
   * Gets the address for a token representation on any chain
   *  These are the Wormhole token addresses, not necessarily the cannonical version of that token
   *
   * @param tokenId The Token ID (chain/address)
   * @param chain The chain name or id
   * @returns The Wormhole address on the given chain, null if it does not exist
   */
  async getForeignAsset(
    tokenId: TokenId,
    chain: Chain,
  ): Promise<string | null> {
    const context = this.getContext(chain);
    return await context.getForeignAsset(tokenId, chain);
  }

  /**
   * Gets the address for a token representation on any chain
   *  These are the Wormhole token addresses, not necessarily the cannonical version of that token
   *
   * @param tokenId The Token ID (chain/address)
   * @param chain The chain name or id
   * @returns The Wormhole address on the given chain
   * @throws Throws if the token does not exist
   */
  async mustGetForeignAsset(tokenId: TokenId, chain: Chain): Promise<string> {
    const address = await this.getForeignAsset(tokenId, chain);
    if (!address) throw new Error('No asset registered');
    return address;
  }

  /**
   * Gets the number of decimals for a token on a given chain
   *
   * @param tokenId The Token ID (home chain/address)
   * @param chain The chain name or id of the token/representation
   * @returns The number of decimals
   */
  async getTokenDecimals(tokenId: TokenId, chain: Chain): Promise<bigint> {
    const repr = await this.mustGetForeignAsset(tokenId, chain);
    const context = this.getContext(chain);
    return await context.fetchTokenDecimals(repr, chain);
  }

  /**
   * Fetches the native token balance for a wallet
   *
   * @param walletAddress The wallet address
   * @param chain The chain name or id
   * @returns The native balance as a BigNumber
   */
  async getNativeBalance(walletAddress: string, chain: Chain): Promise<bigint> {
    const context = this.getContext(chain);
    return await context.getNativeBalance(walletAddress, chain);
  }

  /**
   * Fetches the balance of a given token for a wallet
   *
   * @param walletAddress The wallet address
   * @param tokenId The token ID (its home chain and address on the home chain)
   * @param chain The chain name or id
   * @returns The token balance of the wormhole asset as a BigNumber
   */
  async getTokenBalance(
    walletAddress: string,
    tokenId: TokenId,
    chain: Chain,
  ): Promise<BigNumber | null> {
    const context = this.getContext(chain);
    return await context.getTokenBalance(walletAddress, tokenId, chain);
  }

  /**
   * Send a Token Bridge transfer
   *
   * @dev This _must_ be claimed on the destination chain, see {@link Wormhole#completeTransfer | completeTransfer}
   *
   * @param token The Token Identifier (chain/address) or `'native'` if sending the native token
   * @param amount The token amount to be sent, as a string
   * @param sendingChain The source chain name or id
   * @param senderAddress The address that is dispatching the transfer
   * @param recipientChain The destination chain name or id
   * @param recipientAddress The wallet address where funds will be sent (On solana, this is the associated token account)
   * @param relayerFee A fee that would go to a relayer, if any
   * @param payload Extra bytes that can be passed along with the transfer
   * @returns The transaction receipt
   * @throws If unable to get the signer or contracts, or if there is a problem executing the transaction
   */
  async startTransfer(
    token: TokenId | 'native',
    amount: bigint,
    sendingChain: Chain,
    senderAddress: string,
    recipientChain: Chain,
    recipientAddress: string,
    relayerFee?: string,
    payload?: Uint8Array,
  ): Promise<SendResult> {
    const context = this.getContext(sendingChain);
    const recipientChainName = Wormhole.toChainName(recipientChain);

    // TODO: put it back
    // if (!payload && recipientChainName === 'sei') {
    //   let seiContext: SeiAbstract;
    //   try {
    //     seiContext = this.getContext("Solana") as any;
    //   } catch (_) {
    //     throw new Error(
    //       'You attempted to send a transfer to Sei, but the Sei context is not registered. ' +
    //         'You must import SeiContext from @wormhole-foundation/connect-sdk-sei and pass it ' +
    //         'in to the Wormhole class constructor',
    //     );
    //   }
    //   const { payload: seiPayload, receiver } =
    //     await seiContext.buildSendPayload(token, recipientAddress);
    //   recipientAddress = receiver || recipientAddress;
    //   payload = seiPayload || payload;
    // }

    if (payload) {
      return context.startTransferWithPayload(
        token,
        amount,
        sendingChain,
        senderAddress,
        recipientChain,
        recipientAddress,
        payload,
      );
    }
    return context.startTransfer(
      token,
      amount,
      sendingChain,
      senderAddress,
      recipientChain,
      recipientAddress,
      relayerFee,
    );
  }

  /**
   * Check whether a chain supports automatic relaying
   * @param chain the chain name or chain id
   * @returns boolean representing if automatic relay is available
   */
  supportsSendWithRelay(chain: Chain): boolean {
    return !!(
      this.getContracts(chain)?.Relayer &&
      'startTransferWithRelay' in this.getContext(chain)
    );
  }

  /**
   * Sends transaction to the bridge using the relayer
   *
   * @param token The tokenId (chain and address) of the token being sent. Pass in 'native' to send native token
   * @param amount The amount to bridge
   * @param sendingChain The chain name or chain id of the source chain
   * @param senderAddress The address executing the transaction
   * @param recipientChain The chain name or chain id of the destination chain
   * @param recipientAddress The address which will receive funds on the destination chain
   * @param toNativeToken The amount of bridged funds that will be converted to the native gas token on the destination chain
   * @throws If unable to get the signer or contracts, or if there is a problem executing the transaction
   */
  async startTransferWithRelay(
    token: TokenId | 'native',
    amount: bigint,
    sendingChain: Chain,
    senderAddress: string,
    recipientChain: Chain,
    recipientAddress: string,
    toNativeToken: string,
    relayerFee?: string,
  ): Promise<SendResult> {
    if (!this.supportsSendWithRelay(sendingChain)) {
      throw new Error(
        `Relayer is not supported on ${Wormhole.toChainName(sendingChain)}`,
      );
    }

    const context = this.getContext(sendingChain);
    if (!('startTransferWithRelay' in context)) {
      throw new Error('startTransferWithRelay function not found');
    }

    return context.startTransferWithRelay(
      token,
      amount,
      toNativeToken,
      sendingChain,
      senderAddress,
      recipientChain,
      recipientAddress,
    );
  }

  /**
   * Redeems funds for a token bridge transfer on the destination chain
   *
   * @param destChain The destination chain name or id
   * @param signedVAA The Signed VAA bytes
   * @param overrides Optional overrides, varies between chains
   * @param payerAddr Optional. The address that pays for the redeem transaction, defaults to the sender address if not specified
   * @returns The transaction receipt
   */
  async completeTransfer(
    destChain: Chain,
    signedVAA: Uint8Array,
    overrides: any,
    receivingAddr?: string,
  ): Promise<RedeemResult> {
    const context = this.getContext(destChain);
    return await context.completeTransfer(
      destChain,
      signedVAA,
      overrides,
      receivingAddr,
    );
  }

  /**
   * Gets required fields from a ParsedMessage or ParsedRelayerMessage used to fetch a VAA
   *
   * @param txData The ParsedMessage or ParsedRelayerMessage that is the result of a transaction on a source chain
   * @returns The MessageIdentifier collection of fields to uniquely identify a VAA
   */

  getMessageIdentifier(
    txData: ParsedMessage | ParsedRelayerMessage,
  ): MessageIdentifier {
    // TODO: wh-connect checks finality first, do we need to?
    const emitterChain = Wormhole.toChainId(txData.fromChain);
    const emitterAddress = txData.emitterAddress.startsWith('0x')
      ? txData.emitterAddress.slice(2)
      : txData.emitterAddress;

    return {
      emitterChain: emitterChain,
      emitterAddress,
      sequence: txData.sequence.toString(),
    };
  }

  /**
   * Gets a VAA from the API or Guardian RPC, finality must be met before the VAA will be available.
   *  See {@link ChainConfig.finalityThreshold | finalityThreshold} on {@link CONFIG | the config}
   *
   * @param msg The MessageIdentifier used to fetch the VAA
   * @returns The ParsedVAA if available
   */
  async getVAA(msg: MessageIdentifier): Promise<VAA<'Uint8Array'> | undefined> {
    const { emitterChain, emitterAddress, sequence } = msg;
    const url = `${this.conf.api}/api/v1/vaas/${emitterChain}/${emitterAddress}/${sequence}`;
    const response = await axios.get(url);

    if (!response.data.data) return;

    const data = response.data.data;
    const vaaBytes = Buffer.from(data.vaa, 'base64');

    return deserialize('Uint8Array', new Uint8Array(vaaBytes));
  }

  /**
   * Checks if a transfer has been completed or not
   *
   * @param destChain The destination chain name or id
   * @param signedVAA The Signed VAA bytes
   * @returns True if the transfer has been completed, otherwise false
   */
  async isTransferCompleted(
    destChain: Chain,
    signedVaa: string,
  ): Promise<boolean> {
    const context = this.getContext(destChain);
    return await context.isTransferCompleted(destChain, signedVaa);
  }

  /**
   * Format an address to a 32-byte universal address, which can be utilized by the Wormhole contracts
   *
   * @param address The address as a string
   * @returns The address as a 32-byte Wormhole address
   */
  formatAddress(address: string, chain: Chain): any {
    const context = this.getContext(chain);
    return context.formatAddress(address);
  }

  /**
   * Parse an address from a 32-byte universal address to a cannonical address
   *
   * @param address The 32-byte wormhole address
   * @returns The address in the blockchain specific format
   */
  parseAddress(address: any, chain: Chain): string {
    const context = this.getContext(chain);
    return context.parseAddress(address);
  }

  /**
   * Parses all relevant information from a transaction given the sending tx hash and sending chain
   *
   * @param tx The sending transaction hash
   * @param chain The sending chain name or id
   * @returns The parsed data
   */
  async parseMessageFromTx(
    tx: string,
    chain: Chain,
  ): Promise<ParsedMessage[] | ParsedRelayerMessage[]> {
    const context = this.getContext(chain);
    return await context.parseMessageFromTx(tx, chain);
  }
}