import { Network } from "@wormhole-foundation/sdk-base";
import { Signer } from "@wormhole-foundation/sdk-definitions";
import { Receipt } from "./types";
import { Route, isManual } from "./route";
import { TransferState, isAttested, isCompleted } from "../types";

/**
 * track the transfer until the destination is initiated
 *
 * @param route The route that can be used to track the receipt
 * @param receipt The receipt to track
 * @param destinationSigner The signer for the destination chain if
 */
export async function checkAndCompleteTransfer<N extends Network>(
  route: Route<N>,
  receipt: Receipt,
  destinationSigner?: Signer<N>,
  timeout: number = 120 * 1000,
  // byo logger but im dumping to console rn 🙃
  log: typeof console.log = console.log,
) {
  const start = Date.now();
  log("Checking transfer state...");

  // overwrite receipt var as we receive updates, will return when it's complete
  // but can be called again if the destination is not finalized
  // this construct is to drain an async generator and return the last value
  for await (receipt of route.track(receipt, 120 * 1000)) {
    log("Current Transfer State: ", TransferState[receipt.state]);
  }

  // gucci
  if (isCompleted(receipt)) return receipt;

  // if the route is one we need to complete, do it
  if (isManual(route) && isAttested(receipt) && destinationSigner) {
    const completedTxids = await route.complete(destinationSigner, receipt);
    log("Completed transfer with txids: ", completedTxids);
    // Note: do not return receipt yet, there may be further steps to track, this only completes the bridge transfer
  }

  const leftover = timeout - (Date.now() - start);
  // do we still have time?
  if (leftover > 0) {
    // give it a second, computers need to rest sometimes
    const wait = 2 * 1000;
    log(`Transfer not complete, trying again in a ${wait}ms...`);
    await Promise.resolve(setTimeout(() => {}, wait));
    return checkAndCompleteTransfer(route, receipt, destinationSigner, leftover);
  }

  return receipt;
}
