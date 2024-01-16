import { Network, ProtocolName } from "@wormhole-foundation/sdk-base";
import { Signer, TransactionId } from "@wormhole-foundation/sdk-definitions";
import { Wormhole } from "../wormhole";
import { TransferQuote, TransferReceipt } from "../wormholeTransfer";
import { RouteTransferRequest } from "./request";

export interface TransferParams<OP> {
  amount: string;
  options?: OP;
}

export type ValidationResult<OP> =
  | { params: TransferParams<OP>; valid: true }
  | { params: TransferParams<OP>; valid: false; error: Error };

export type RouteConstructor<N extends Network, OP> = {
  new (wh: Wormhole<N>, request: RouteTransferRequest<N>): Route<N, OP>;
  // Get the default options for this route, useful to prepopulate a form
  getDefaultOptions(): OP;
};

export type UnknownRouteConstructor<N extends Network> = RouteConstructor<N, unknown>;
export type UnknownRoute<N extends Network> = Route<N, unknown>;

// OP - Options passed to the route
export abstract class Route<N extends Network, OP> {
  wh: Wormhole<N>;
  request: RouteTransferRequest<N>;

  // true means this route supports native gas dropoff
  abstract readonly NATIVE_GAS_DROPOFF_SUPPORTED: boolean;
  // true means this is a one-transaction route (using a relayer)
  abstract readonly IS_AUTOMATIC: boolean;

  public constructor(wh: Wormhole<N>, request: RouteTransferRequest<N>) {
    this.wh = wh;
    this.request = request;
  }

  // Check if this route is supported for the given transfer request
  // e.g. check if the protocols on the specific chains are supported
  // check if the tokens are supported, etc
  public abstract isSupported(): Promise<boolean>;

  // Validte the transfer request after applying any options
  // return a quote and suggested options
  public abstract validate(params: TransferParams<OP>): Promise<ValidationResult<OP>>;
  // Initiate the transfer with the transfer request and passed options
  public abstract initiate(
    sender: Signer,
    params: TransferParams<OP>,
  ): Promise<TransferReceipt<ProtocolName>>;

  // Get a quote for the transfer with the given options
  public abstract quote(params: TransferParams<OP>): Promise<TransferQuote>;

  // Track the progress of the transfer over time
  public abstract track(
    receipt: TransferReceipt<ProtocolName>,
    timeout?: number,
  ): AsyncGenerator<TransferReceipt<ProtocolName>, unknown, unknown>;
}

export abstract class AutomaticRoute<N extends Network, OP> extends Route<N, OP> {
  IS_AUTOMATIC = true;
  public abstract isAvailable(): Promise<boolean>;
}

export function isAutomatic<N extends Network>(
  route: UnknownRoute<N>,
): route is AutomaticRoute<N, unknown> {
  return (route as AutomaticRoute<N, unknown>).isAvailable !== undefined && route.IS_AUTOMATIC;
}

export abstract class ManualRoute<N extends Network, OP> extends Route<N, OP> {
  NATIVE_GAS_DROPOFF_SUPPORTED = false;
  IS_AUTOMATIC = false;
  public abstract complete(
    sender: Signer,
    receipt: TransferReceipt<ProtocolName>,
  ): Promise<TransactionId[]>;
}

export function isManual<N extends Network>(
  route: UnknownRoute<N>,
): route is ManualRoute<N, unknown> {
  return (route as ManualRoute<N, unknown>).complete !== undefined;
}
