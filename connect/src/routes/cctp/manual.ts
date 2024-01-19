import { Signer, CircleTransferDetails, TransactionId } from "@wormhole-foundation/sdk-definitions";
import { ManualRoute, TransferParams, ValidatedTransferParams, ValidationResult } from "../route";
import { CircleTransfer, CircleTransferProtocol } from "../../protocols/cctpTransfer";
import { signSendWait } from "../../common";
import { Network, circle, normalizeAmount, Chain } from "@wormhole-foundation/sdk-base";
import {
  TransferReceipt,
  TransferState,
  isAttested,
  TransferQuote,
} from "../../protocols/wormholeTransfer";

export namespace CCTPRoute {
  export type Options = {
    payload?: Uint8Array;
  };

  export type NormalizedParams = {
    amount: bigint;
  };

  export interface ValidatedParams extends ValidatedTransferParams<Options> {
    normalizedParams: NormalizedParams;
  }
}

type Op = CCTPRoute.Options;
type Vp = CCTPRoute.ValidatedParams;
type Tp = TransferParams<Op>;
type Vr = ValidationResult<Op>;

type Q = TransferQuote;
type R = TransferReceipt<"CircleBridge">;

export class CCTPRoute<N extends Network> extends ManualRoute<N, Op, R, Q> {
  static getDefaultOptions(): Op {
    return {
      payload: undefined,
    };
  }

  async isSupported(): Promise<boolean> {
    if (
      !this.request.toChain.supportsCircleBridge() ||
      !this.request.fromChain.supportsCircleBridge()
    ) {
      return false;
    }

    if (!circle.usdcContract.get(this.wh.network, this.request.from.chain)) {
      return false;
    }
    if (!circle.usdcContract.get(this.wh.network, this.request.to.chain)) {
      return false;
    }

    return true;
  }

  async validate(params: Tp): Promise<Vr> {
    const amount = normalizeAmount(params.amount, this.request.source.decimals);

    if (amount < 0n) {
      return {
        valid: false,
        params,
        error: new Error("Amount must be positive"),
      };
    }

    const validatedParams: Vp = {
      normalizedParams: {
        amount,
      },
      options: params.options ?? CCTPRoute.getDefaultOptions(),
      ...params,
    };

    return { valid: true, params: validatedParams };
  }

  async quote(params: Vp) {
    return await CircleTransfer.quoteTransfer(
      this.request.fromChain,
      this.request.toChain,
      this.toTransferDetails(params),
    );
  }

  private toTransferDetails(params: Vp): CircleTransferDetails {
    return {
      from: this.request.from,
      to: this.request.to,
      amount: params.normalizedParams.amount,
      automatic: false,
    };
  }

  async initiate(signer: Signer, params: Vp): Promise<TransferReceipt<CircleTransferProtocol>> {
    let transfer = this.toTransferDetails(params);
    let txids = await CircleTransfer.transfer(this.request.fromChain, transfer, signer);
    const msg = await CircleTransfer.getTransferMessage(
      this.request.fromChain,
      txids[txids.length - 1]!.txid,
    );

    return {
      from: transfer.from.chain,
      to: transfer.to.chain,
      state: TransferState.SourceFinalized,
      request: transfer,
      originTxs: txids,
      attestation: { id: msg },
    };
  }

  async complete(
    signer: Signer,
    receipt: TransferReceipt<"CircleBridge">,
  ): Promise<TransactionId[]> {
    if (!isAttested(receipt))
      throw new Error("The source must be finalized in order to complete the transfer");

    const { id } = receipt.attestation;
    const { message, attestation: signatures } = receipt.attestation.attestation;

    if (!signatures) throw new Error(`No Circle attestation for ${id.hash}`);

    let cb = await this.request.toChain.getCircleBridge();
    let xfer = cb.redeem(this.request.to.address, message, signatures);

    return await signSendWait<N, Chain>(this.request.toChain, xfer, signer);
  }

  public async *track(receipt: TransferReceipt<"CircleBridge">, timeout?: number) {
    yield* CircleTransfer.track(
      this.wh,
      receipt,
      timeout,
      this.request.fromChain,
      this.request.toChain,
    );
  }
}