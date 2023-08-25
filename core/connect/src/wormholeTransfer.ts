import { Signer, TxHash, SequenceId } from './types';

// Transfer state machine states
export enum TransferState {
  Created = 1, // Will be set after the TokenTransfer object is created
  Started, // Will be set after source chain transactions are submitted
  Ready, // Will be set after VAA is available
  Redeemed, // Will be set after VAA is submitted to destination chain
  Complete, // Will be set after the transaction is finalized on the destination chain
}

// WormholeTransfer abstracts the process and state transitions
// for things like TokenTransfers, NFTTransfers, CCTP (with VAA), etc...
export interface WormholeTransfer {
  // the current state of this transfer
  transferState(): TransferState;

  // start the WormholeTransfer by submitting transactions to the source chain
  // returns a transaction hash
  start(signer: Signer): Promise<TxHash[]>;

  // how many blocks until source is final
  // sourceFinalized(): Promise<bigint>;

  // wait for the VAA to be ready
  // returns the sequence number
  ready(): Promise<SequenceId[]>;

  // finish the WormholeTransfer by submitting transactions to the destination chain
  // returns a transaction hash
  finish(signer: Signer): Promise<TxHash[]>;

  // how many blocks until destination is final
  // destinationFinalized(): Promise<bigint>;
}

export type CircleMessageHash = {
  message: string;
  attestation: string;
};
// CircleTransfer abstracts the process and state transitions
// for Circle USDC transfers over CCTP that do _not_ have an associated VAA
export interface CircleTransfer {
  // the current state of this transfer
  transferState(): TransferState;

  // start the WormholeTransfer by submitting transactions to the source chain
  // returns a transaction hash
  start(signer: Signer): Promise<TxHash[]>;

  // wait for the VAA to be ready
  // returns the sequence number
  ready(): Promise<CircleMessageHash[]>;

  // finish the WormholeTransfer by submitting transactions to the destination chain
  // returns a transaction hash
  finish(signer: Signer): Promise<TxHash[]>;

  // how many blocks until destination is final
  // destinationFinalized(): Promise<bigint>;
}
