import {
  Network,
  ChainName,
  PlatformName,
  toChainName,
} from '@wormhole-foundation/sdk-base';
import {
  RpcConnection,
  TokenId,
  TokenTransferTransaction,
  TxHash,
  Platform,
  ChainsConfig,
  MessageIdentifier,
} from '@wormhole-foundation/connect-sdk';
import {
  AutomaticTokenBridge,
  WormholeCircleRelayer,
  TokenBridge,
  UniversalAddress,
  CircleBridge,
} from '@wormhole-foundation/sdk-definitions';

import { ethers } from 'ethers';
import { EvmContracts } from './contracts';
import { EvmChain } from './chain';
import { EvmAddress } from './address';
import { BridgeStructs } from './ethers-contracts/Bridge';

import { EvmTokenBridge } from './protocols/tokenBridge';
import { EvmAutomaticTokenBridge } from './protocols/automaticTokenBridge';
import { EvmCircleRelayer } from './protocols/circleRelayer';
import { EvmCircleBridge } from './protocols/circleBridge';

/**
 * @category EVM
 */
export class EvmPlatform implements Platform {
  // lol
  static readonly _platform: 'Evm' = 'Evm';
  readonly platform: PlatformName = EvmPlatform._platform;

  readonly network: Network;
  readonly conf: ChainsConfig;
  readonly contracts: EvmContracts;

  constructor(network: Network, conf: ChainsConfig) {
    this.network = network;
    this.conf = conf;
    this.contracts = new EvmContracts(network);
  }

  getRpc(chain: ChainName): ethers.Provider {
    const rpcAddress = this.conf[chain]!.rpc;
    return new ethers.JsonRpcProvider(rpcAddress);
  }

  getChain(chain: ChainName): EvmChain {
    return new EvmChain(this, chain);
  }

  async getTokenBridge(rpc: ethers.Provider): Promise<TokenBridge<'Evm'>> {
    // TODO:
    // @ts-ignore
    return await EvmTokenBridge.fromProvider(rpc);
  }
  async getAutomaticTokenBridge(
    rpc: ethers.Provider,
  ): Promise<AutomaticTokenBridge<'Evm'>> {
    return await EvmAutomaticTokenBridge.fromProvider(rpc);
  }
  async getCircleRelayer(
    rpc: ethers.Provider,
  ): Promise<WormholeCircleRelayer<'Evm'>> {
    return await EvmCircleRelayer.fromProvider(rpc);
  }

  async getCircleBridge(rpc: ethers.Provider): Promise<CircleBridge<'Evm'>> {
    return await EvmCircleBridge.fromProvider(rpc);
  }

  async getForeignAsset(
    chain: ChainName,
    rpc: ethers.Provider,
    tokenId: TokenId,
  ): Promise<UniversalAddress | null> {
    // if the token is already native, return the token address
    if (chain === tokenId.chain) return tokenId.address.toUniversalAddress();

    const tokenBridge = await this.getTokenBridge(rpc);
    const foreignAddr = await tokenBridge.getWrappedAsset({
      chain,
      address: tokenId.address,
    });
    return foreignAddr.toUniversalAddress();
  }

  async getTokenDecimals(
    rpc: ethers.Provider,
    tokenAddr: UniversalAddress,
  ): Promise<bigint> {
    const tokenContract = this.contracts.mustGetTokenImplementation(
      rpc,
      tokenAddr.toString(),
    );
    const decimals = await tokenContract.decimals();
    return decimals;
  }

  async getNativeBalance(
    rpc: RpcConnection,
    walletAddr: string,
  ): Promise<bigint> {
    return await rpc.getBalance(walletAddr);
  }

  async getTokenBalance(
    chain: ChainName,
    rpc: ethers.Provider,
    walletAddr: string,
    tokenId: TokenId,
  ): Promise<bigint | null> {
    const address = await this.getForeignAsset(chain, rpc, tokenId);
    if (!address) return null;

    const token = this.contracts.mustGetTokenImplementation(
      rpc,
      address.toString(),
    );
    const balance = await token.balanceOf(walletAddr);
    return balance;
  }

  parseAddress(address: string): UniversalAddress {
    // 42 is 20 bytes as hex + 2 bytes for 0x
    if (address.length > 42) {
      return new UniversalAddress(address);
    }
    return new EvmAddress(address).toUniversalAddress();
  }

  async parseTransaction(
    chain: ChainName,
    rpc: ethers.Provider,
    txid: TxHash,
  ): Promise<MessageIdentifier[]> {
    const receipt = await rpc.getTransactionReceipt(txid);
    if (receipt === null)
      throw new Error(`No transaction found with txid: ${txid}`);

    const core = this.contracts.mustGetCore(chain, rpc);
    const coreAddress = await core.getAddress();
    const coreImpl = this.contracts.getImplementation();

    return receipt.logs
      .filter((l: any) => {
        return l.address === coreAddress;
      })
      .map((log) => {
        const { topics, data } = log;
        const parsed = coreImpl.parseLog({ topics: topics.slice(), data });
        // TODO: should we be nicer here?
        if (parsed === null) throw new Error(`Failed to parse logs: ${data}`);
        return {
          chain: chain,
          address: this.parseAddress(parsed.args.sender),
          sequence: parsed.args.sequence,
        } as MessageIdentifier;
      });
  }
}
