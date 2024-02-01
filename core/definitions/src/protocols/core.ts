import { PlatformToChains, Network, Platform } from "@wormhole-foundation/sdk-base";
import { AccountAddress } from "../address";
import { WormholeMessageId } from "../attestation";
import { TxHash } from "../types";
import { UnsignedTransaction } from "../unsignedTransaction";
import { VAA } from "../vaa";
import { EmptyPlatformMap } from "../protocol";

declare global {
  namespace WormholeNamespace {
    export interface ProtocolToPlatformMapping {
      WormholeCore: EmptyPlatformMap<Platform, "WormholeCore">;
    }
  }
}

/**
 * WormholeCore provides a consistent interface to interact
 * with the Wormhole core messaging protocol.
 *
 */
export interface WormholeCore<
  N extends Network,
  P extends Platform,
  C extends PlatformToChains<P>,
> {
  /** Get the fee for publishing a message */
  getMessageFee(): Promise<bigint>;
  /**
   * Publish a message
   *
   * @param sender The address of the sender
   * @param message The message to send
   * @param nonce A number that may be set if needed for the application, may be 0 if unneeded
   * @param consistencyLevel The consistency level to reach before the guardians should sign the message
   *  see {@link https://docs.wormhole.com/wormhole/reference/glossary#consistency-level | the docs} for more information
   *
   * @returns a stream of unsigned transactions to be signed and submitted on chain
   */
  publishMessage(
    sender: AccountAddress<C>,
    message: string | Uint8Array,
    nonce: number,
    consistencyLevel: number,
  ): AsyncGenerator<UnsignedTransaction<N, C>>;
  /**
   * Verify a VAA against the core contract
   * @param sender the sender of the transaction
   * @param vaa the VAA to verify
   *
   * @returns a stream of unsigned transactions to be signed and submitted on chain
   */
  verifyMessage(sender: AccountAddress<C>, vaa: VAA): AsyncGenerator<UnsignedTransaction<N, C>>;
  /**
   * Parse a transaction to get its message id
   *
   * @param txid the transaction hash to parse
   *
   * @returns the message ids produced by the transaction
   */
  parseTransaction(txid: TxHash): Promise<WormholeMessageId[]>;
}
