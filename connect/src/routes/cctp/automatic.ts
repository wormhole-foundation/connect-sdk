import { Network, circle } from "@wormhole-foundation/sdk-base";
import { CircleTransferDetails, Signer } from "@wormhole-foundation/sdk-definitions";
import { CircleAttestationReceipt, CircleTransfer } from "../../protocols/cctpTransfer";
import { TransferQuote, TransferState } from "../../types";
import { AutomaticRoute } from "../route";
import { Receipt, TransferParams, ValidatedTransferParams, ValidationResult } from "../types";

export namespace AutomaticCCTPRoute {
  export type Options = {
    // 0.0 - 1.0 percentage
    nativeGas?: number;
  };

  export type NormalizedParams = {
    amount: bigint;
    fee: bigint;
    nativeGasAmount: bigint;
  };

  export interface ValidatedParams extends ValidatedTransferParams<Options> {
    normalizedParams: NormalizedParams;
  }
}

type Op = AutomaticCCTPRoute.Options;
type Vp = AutomaticCCTPRoute.ValidatedParams;

type Tp = TransferParams<Op>;
type Vr = ValidationResult<Op>;

type Q = TransferQuote;
type R = Receipt<CircleAttestationReceipt>;

export class AutomaticCCTPRoute<N extends Network> extends AutomaticRoute<N, Op, R, Q> {
  NATIVE_GAS_DROPOFF_SUPPORTED = true;

  getDefaultOptions(): Op {
    return {
      nativeGas: 0.0,
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

  async isAvailable(): Promise<boolean> {
    return false;
  }

  async validate(params: Tp): Promise<Vr> {
    try {
      const options = params.options ?? this.getDefaultOptions();
      const normalizedParams = await this.normalizeTransferParams(params);

      if (normalizedParams.amount <= 0n) {
        return {
          valid: false,
          params,
          error: new Error("Amount must be positive"),
        };
      }

      const validatedParams: Vp = {
        normalizedParams,
        options,
        ...params,
      };

      return { valid: true, params: validatedParams };
    } catch (e) {
      return {
        valid: false,
        params,
        error: e as Error,
      };
    }
  }

  async quote(params: Vp) {
    return await CircleTransfer.quoteTransfer(
      this.request.fromChain,
      this.request.toChain,
      this.toTransferDetails(params),
    );
  }

  private async normalizeTransferParams(params: Tp) {
    const amount = this.request.normalizeAmount(params.amount);

    const ctb = await this.request.fromChain.getAutomaticCircleBridge();
    const fee = await ctb.getRelayerFee(this.request.to.chain);

    const minAmount = (fee * 105n) / 100n;
    if (amount < minAmount) {
      throw new Error(`Minimum amount is ${this.request.displayAmount(minAmount)}`);
    }

    const transferableAmount = amount - fee;

    const options = params.options ?? this.getDefaultOptions();

    const nativeGasPerc = options.nativeGas ?? 0.0;
    if (nativeGasPerc > 1.0 || nativeGasPerc < 0.0)
      throw new Error("Native gas must be between 0.0 and 1.0 (0% and 100%)");

    let nativeGasAmount = 0n;

    if (nativeGasPerc > 0.0) {
      const scale = 10000;
      const scaledGas = BigInt(nativeGasPerc * scale);
      nativeGasAmount = (transferableAmount * scaledGas) / BigInt(scale);
    }

    return { fee, amount, nativeGasAmount };
  }

  private toTransferDetails(params: Vp): CircleTransferDetails {
    return {
      from: this.request.from,
      to: this.request.to,
      amount: params.normalizedParams.amount,
      automatic: true,
      nativeGas: params.normalizedParams.nativeGasAmount,
    };
  }

  async initiate(signer: Signer, params: Vp): Promise<R> {
    let transfer = this.toTransferDetails(params);
    let txids = await CircleTransfer.transfer<N>(this.request.fromChain, transfer, signer);

    // const msg = await CircleTransfer.getTransferMessage(
    //   this.request.fromChain,
    //   txids[txids.length - 1]!.txid,
    // );

    const [msgid] = await this.request.fromChain.parseTransaction(txids[txids.length - 1]!.txid);

    return {
      from: transfer.from.chain,
      to: transfer.to.chain,
      state: TransferState.SourceFinalized,
      originTxs: txids,
      attestation: { id: msgid! },
    };
  }

  public override async *track(receipt: R, timeout?: number) {
    yield* CircleTransfer.track(
      this.wh,
      receipt,
      timeout,
      this.request.fromChain,
      this.request.toChain,
    );
  }
}