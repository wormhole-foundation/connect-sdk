import {
  Network,
  ChainName,
  ChainId,
} from '@wormhole-foundation/sdk-base';
import { ChainConfig } from './constants';
import { UnsignedTransaction } from '../unsignedTransaction';
import { ChainAddress } from '../address';
import { UniversalAddress } from '../universalAddress';

export type TxHash = string;
export type SequenceId = bigint;

// TODO: Genericize
export type SignedTxn = any;
export interface Signer {
  chain(): ChainName;
  address(): string;
  sign(tx: UnsignedTransaction[]): Promise<SignedTxn[]>;
}

export type OmitChain<Fn> = Fn extends (chain: ChainName, ...args: infer P) => infer R
  ? (...args: P) => R
  : Fn;

export type ChainsConfig = {
  [K in ChainName]?: ChainConfig;
};
export type WormholeConfig = {
  network: Network;
  api: string;
  chains: ChainsConfig;
};

export type TokenId = ChainAddress;
export type MessageIdentifier = {
  chain: ChainId;
  emitterAddress: UniversalAddress;
  sequence: SequenceId;
};
export type TransactionIdentifier = { chain: ChainName; txid: TxHash };

export type TokenTransferDetails = {
  token: TokenId | 'native';
  amount: bigint;
  payload?: Uint8Array;
  from: ChainAddress;
  to: ChainAddress;
};

export type WormholeMessage = {
  tx: TransactionIdentifier;
  msgId: MessageIdentifier;
  payloadId: bigint;
};

// Details for a source chain Token Transfer transaction
export type TokenTransferTransaction = {
  message: WormholeMessage;

  details: TokenTransferDetails;
  block: bigint;
  gasFee: bigint;
};

export function isMessageIdentifier(
  thing: MessageIdentifier | any,
): thing is MessageIdentifier {
  return (<MessageIdentifier>thing).sequence !== undefined;
}

export function isTransactionIdentifier(
  thing: TransactionIdentifier | any,
): thing is TransactionIdentifier {
  return (
    (<TransactionIdentifier>thing).chain !== undefined &&
    (<TransactionIdentifier>thing).txid !== undefined
  );
}

export function isTokenTransferDetails(
  thing: TokenTransferDetails | any,
): thing is TokenTransferDetails {
  return (
    (<TokenTransferDetails>thing).token !== undefined &&
    (<TokenTransferDetails>thing).amount !== undefined &&
    (<TokenTransferDetails>thing).from !== undefined &&
    (<TokenTransferDetails>thing).to !== undefined
  );
}
