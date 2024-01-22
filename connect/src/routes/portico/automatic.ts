import {
  AttestationReceipt,
  Network,
  PorticoBridge,
  Signer,
  SourceInitiatedTransferReceipt,
  TokenId,
  TransactionId,
  TransferQuote,
  TransferState,
  Wormhole,
  canonicalAddress,
  chainToPlatform,
  isAttested,
  isSourceInitiated,
  isTokenId,
  resolveWrappedToken,
  signSendWait,
} from "../..";
import { AutomaticRoute } from "../route";
import { Receipt, TransferParams, ValidatedTransferParams, ValidationResult } from "../types";
import { getTransferrableToken } from "./utils";

export const SLIPPAGE_BPS = 15n; // 0.15%
export const BPS_PER_HUNDRED_PERCENT = 10000n;

export namespace PorticoRoute {
  export type Options = {};

  export interface Quote extends TransferQuote {
    quote: PorticoBridge.Quote;
  }

  export type NormalizedParams = {
    amount: bigint;

    canonicalSourceToken: TokenId;
    canonicalDestinationToken: TokenId;

    sourceToken: TokenId;
    destinationToken: TokenId;
  };

  export interface ValidatedParams extends ValidatedTransferParams<Options> {
    normalizedParams: NormalizedParams;
    quote?: Quote;
  }
}

type Q = PorticoRoute.Quote;
type OP = PorticoRoute.Options;
type R = Receipt<AttestationReceipt<"PorticoBridge">>;
type VP = PorticoRoute.ValidatedParams;

type VR = ValidationResult<OP>;
type TP = TransferParams<OP>;

export class PorticoRoute<N extends Network> extends AutomaticRoute<N, OP, R, Q> {
  NATIVE_GAS_DROPOFF_SUPPORTED = false;

  readonly supportedTokens = ["ETH", "wstETH"];

  async isSupported(): Promise<boolean> {
    // destination asset must be specified
    if (!this.request.destination) return false;

    const srcSupported = this.supportedTokens.includes(this.request.source.symbol!);
    const dstSupported = this.supportedTokens.includes(this.request.destination!.symbol!);

    return (
      srcSupported &&
      dstSupported &&
      this.request.fromChain.supportsPorticoBridge() &&
      this.request.toChain.supportsPorticoBridge()
    );
  }

  async isAvailable(): Promise<boolean> {
    // TODO:
    return true;
  }

  getDefaultOptions(): OP {
    return {};
  }

  async validate(params: TP): Promise<VR> {
    try {
      if (
        chainToPlatform(this.request.from.chain) !== "Evm" ||
        chainToPlatform(this.request.to.chain) !== "Evm"
      ) {
        throw new Error("Only EVM chains are supported");
      }

      const { fromChain, toChain, source, destination } = this.request;
      const { network } = fromChain;

      // This may be "native" but we want the token that can actually be bridged
      const [, sourceToken] = resolveWrappedToken(network, fromChain.chain, source.id);
      const [, destinationToken] = resolveWrappedToken(network, toChain.chain, destination!.id);

      const canonicalSourceToken = getTransferrableToken(
        network,
        sourceToken.chain,
        canonicalAddress(sourceToken),
      );

      const canonicalDestinationToken = getTransferrableToken(
        network,
        destinationToken.chain,
        canonicalAddress(destinationToken),
      );

      const validatedParams: VP = {
        amount: params.amount,
        options: params.options ?? this.getDefaultOptions(),
        normalizedParams: {
          amount: this.request.normalizeAmount(params.amount),
          canonicalSourceToken,
          canonicalDestinationToken,
          sourceToken,
          destinationToken,
        },
      };

      const quote = await this.quote(validatedParams);

      if (quote.destinationToken.amount < 0) {
        throw new Error(
          "Amount too low for slippage and fee, would result in negative destination amount",
        );
      }

      validatedParams.quote = quote;

      return { valid: true, params: validatedParams };
    } catch (e) {
      return { valid: false, error: e as Error, params: params };
    }
  }

  async quote(params: VP): Promise<Q> {
    const swapAmounts = await this.quoteUniswap(params);
    const fromPorticoBridge = await this.request.fromChain.getPorticoBridge();
    const fee = await fromPorticoBridge.quoteRelay(
      params.normalizedParams.canonicalDestinationToken.address,
      params.normalizedParams.destinationToken,
    );

    const quote: PorticoBridge.Quote = {
      swapAmounts,
      relayerFee: fee,
    };

    return {
      sourceToken: {
        token: params.normalizedParams.sourceToken,
        amount: params.normalizedParams.amount,
      },
      destinationToken: {
        token: params.normalizedParams.destinationToken,
        amount: quote.swapAmounts.minAmountFinish - fee,
      },
      relayFee: {
        token: params.normalizedParams.destinationToken,
        amount: fee,
      },
      quote,
    };
  }

  async initiate(sender: Signer<N>, params: VP) {
    const sourceToken = isTokenId(this.request.source.id)
      ? this.request.source.id.address
      : this.request.source.id;

    const destToken = isTokenId(this.request.destination!.id)
      ? this.request.destination?.id
      : this.request.destination!.id;

    const fromPorticoBridge = await this.request.fromChain.getPorticoBridge();
    const xfer = fromPorticoBridge.transfer(
      this.request.from.address,
      this.request.to,
      sourceToken,
      params.normalizedParams.amount,
      destToken!,
      params.quote!.quote,
    );

    const txids = await signSendWait(this.request.fromChain, xfer, sender);
    const receipt: SourceInitiatedTransferReceipt = {
      originTxs: txids,
      state: TransferState.SourceInitiated,
      from: this.request.from.chain,
      to: this.request.to.chain,
    };
    return receipt;
  }

  async *track(receipt: R, timeout?: number) {
    if (!isSourceInitiated(receipt)) throw new Error("Source must be initiated");

    const { txid } = receipt.originTxs[receipt.originTxs.length - 1]!;
    const vaa = await this.wh.getVaaByTxHash(txid, "TokenBridge:TransferWithPayload", timeout);
    if (!vaa) throw new Error("No VAA found for transaction: " + txid);

    const parsed = PorticoBridge.deserializePayload(vaa.payload.payload);
    yield { ...receipt, vaa, parsed };
  }

  async complete(signer: Signer<N>, receipt: R): Promise<TransactionId[]> {
    if (!isAttested(receipt)) throw new Error("Source must be attested");

    const toPorticoBridge = await this.request.toChain.getPorticoBridge();
    const sender = Wormhole.chainAddress(signer.chain(), signer.address());
    const xfer = toPorticoBridge.redeem(sender.address, receipt.attestation.attestation);
    return await signSendWait(this.request.toChain, xfer, signer);
  }

  private async quoteUniswap(params: VP) {
    const fromPorticoBridge = await this.request.fromChain.getPorticoBridge();
    const startQuote = await fromPorticoBridge.quoteSwap(
      params.normalizedParams.sourceToken.address,
      params.normalizedParams.canonicalSourceToken.address,
      params.normalizedParams.amount,
    );
    const startSlippage = (startQuote * SLIPPAGE_BPS) / BPS_PER_HUNDRED_PERCENT;

    if (startSlippage >= startQuote) throw new Error("Start slippage too high");

    const toPorticoBridge = await this.request.toChain.getPorticoBridge();
    const minAmountStart = startQuote - startSlippage;
    const finishQuote = await toPorticoBridge.quoteSwap(
      params.normalizedParams.canonicalDestinationToken.address,
      params.normalizedParams.destinationToken.address,
      minAmountStart,
    );
    const finishSlippage = (finishQuote * SLIPPAGE_BPS) / BPS_PER_HUNDRED_PERCENT;

    if (finishSlippage >= finishQuote) throw new Error("Finish slippage too high");

    const minAmountFinish = finishQuote - finishSlippage;
    const amountFinishQuote = await toPorticoBridge.quoteSwap(
      params.normalizedParams.canonicalDestinationToken.address,
      params.normalizedParams.destinationToken.address,
      startQuote, // no slippage
    );
    // the expected receive amount is the amount out from the swap
    // minus 5bps slippage
    const amountFinishSlippage = (amountFinishQuote * 5n) / BPS_PER_HUNDRED_PERCENT;
    if (amountFinishSlippage >= amountFinishQuote)
      throw new Error("Amount finish slippage too high");

    const amountFinish = amountFinishQuote - amountFinishSlippage;
    if (amountFinish <= minAmountFinish) throw new Error("Amount finish too low");

    return {
      minAmountStart: minAmountStart,
      minAmountFinish: minAmountFinish,
      amountFinish: amountFinish,
    };
  }
}