import { Chain } from "@wormhole-foundation/sdk-base";
import {
  CircleMessageId,
  IbcMessageId,
  PayloadLiteral,
  Signer,
  TokenId,
  TransactionId,
  TxHash,
  WormholeMessageId,
} from "@wormhole-foundation/sdk-definitions";

export type AttestationId = WormholeMessageId | CircleMessageId | IbcMessageId;

//
export type Receipt<PL extends PayloadLiteral> = {
  state: TransferState;
  from: Chain;
  to: Chain;
  originTxs: TransactionId[];
  destinationTxs: TransactionId[];
  attestation?: WormholeMessageId<PL>;
};

// Transfer state machine states
export enum TransferState {
  Failed = -1,
  Created = 1, // Will be set after the TokenTransfer object is created
  SourceInitiated, // Will be set after source chain transactions are submitted
  SourceFinalized, // Will be set after source chain transactions are finalized
  Attested, // Will be set after VAA  or Circle Attestation is available
  DestinationInitiated, // Will be set after Attestation is submitted to destination chain
  DestinationFinalized, // Will be set after the transaction is finalized on the destination chain
}

// Quote with optional relayer fees if the transfer
// is requested to be automatic
export type TransferQuote = {
  // How much of what token will be deducted from sender
  // Note: This will include fees charged for a full
  // estimate of the amount taken from the sender
  sourceToken: {
    token: TokenId;
    amount: bigint;
  };
  // How much of what token will be minted to the receiver
  // Note: This will _not_ include native gas if requested
  destinationToken: {
    token: TokenId;
    amount: bigint;
  };
  // If the transfer being quoted is automatic
  // a relayer fee may apply
  relayFee?: {
    token: TokenId;
    amount: bigint;
  };
  // If the transfer being quoted asked for native gas dropoff
  // this will contain the amount of native gas that is to be minted
  // on the destination chain given the current swap rates
  destinationNativeGas?: bigint;
};

// WormholeTransfer abstracts the process and state transitions
// for things like TokenTransfers, NFTTransfers, Circle (with VAA), etc...
export interface WormholeTransfer {
  // Return the current transfer state
  getTransferState(): TransferState;

  // Initiate the WormholeTransfer by submitting transactions to the source chain
  // returns an array transaction hashes
  initiateTransfer(signer: Signer): Promise<TxHash[]>;

  // wait for the Attestation to be ready, timeout in ms
  // returns the sequence number
  fetchAttestation(timeout?: number): Promise<AttestationId[]>;

  // finish the WormholeTransfer by submitting transactions to the destination chain
  // returns a transaction hashes
  completeTransfer(signer: Signer): Promise<TxHash[]>;
}
