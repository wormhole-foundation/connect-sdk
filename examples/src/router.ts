import { Wormhole, canonicalAddress, routes } from "@wormhole-foundation/sdk";
import { evm } from "@wormhole-foundation/sdk/evm";
import { solana } from "@wormhole-foundation/sdk/solana";

import { getSigner } from "./helpers";

(async function () {
  // Setup
  const wh = new Wormhole("Mainnet", [evm.Platform, solana.Platform]);

  // Get chain contexts
  const sendChain = wh.getChain("Base");
  const destChain = wh.getChain("Arbitrum");

  // get signers from local config
  const sender = await getSigner(sendChain);
  const receiver = await getSigner(destChain);

  // we're sending the "native" (gas token of src chain)
  const sendToken = Wormhole.tokenId(sendChain.chain, "native");

  // create new resolver, passing the set of routes to consider
  const resolver = wh.resolver([
    routes.TokenBridgeRoute,
    routes.AutomaticTokenBridgeRoute,
    routes.CCTPRoute,
  ]);

  // what tokens are available on the source chain?
  const srcTokens = await resolver.supportedSourceTokens(sendChain);
  console.log(
    "Allowed source tokens: ",
    srcTokens.map((t) => canonicalAddress(t)),
  );

  // given the send token, what can we possibly get on the destination chain?
  const destTokens = await resolver.supportedDestinationTokens(sendToken, sendChain, destChain);
  console.log(
    "For the given source token and routes configured, the following tokens may be receivable: ",
    destTokens.map((t) => canonicalAddress(t)),
  );

  // creating a transfer request fetches token details
  // since all routes will need to know about the tokens
  const tr = await routes.RouteTransferRequest.create(wh, {
    from: sender.address,
    to: receiver.address,
    source: sendToken,
    destination: destTokens.pop()!,
  });

  // resolve the transfer request to a set of routes that can perform it
  const foundRoutes = await resolver.findRoutes(tr);
  console.log("For the transfer parameters, we found these routes: ", foundRoutes);

  // Sort the routes given some input (not required for mvp)
  // const bestRoute = (await resolver.sortRoutes(foundRoutes, "cost"))[0]!;
  const bestRoute = foundRoutes[0]!;
  console.log("Selected: ", bestRoute);

  console.log("This route offers the following default options", bestRoute.getDefaultOptions());
  // Specify the amount as a decimal string
  const amt = "0.5";
  // Create the transfer params for this request
  const transferParams = { amount: amt, options: { nativeGas: 0.1 } };

  // validate the transfer params passed, this returns a new type of ValidatedTransferParams
  // which (believe it or not) is a validated version of the input params
  // this new var must be passed to the next step, quote
  const validated = await bestRoute.validate(transferParams);
  if (!validated.valid) throw validated.error;
  console.log("Validated parameters: ", validated.params);

  // get a quote for the transfer, this too returns a new type that must
  // be passed to the next step, execute (if you like the quote)
  const quote = await bestRoute.quote(validated.params);
  if (!quote.success) throw quote.error;
  console.log("Best route quote: ", quote);

  // If you're sure you want to do this, set this to true
  const imSure = false;
  if (imSure) {
    // Now the transfer may be initiated
    // A receipt will be returned, guess what you gotta do with that?
    const receipt = await bestRoute.initiate(sender.signer, quote);
    console.log("Initiated transfer with receipt: ", receipt);

    // Kick off a wait log, if there is an opportunity to complete, this function will do it
    // see the implementation for how this works
    await routes.checkAndCompleteTransfer(bestRoute, receipt, receiver.signer);
  }
})();
