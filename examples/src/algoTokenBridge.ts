import {
  Chain,
  Network,
  Platform,
  TokenId,
  TokenTransfer,
  TransferState,
  Wormhole,
  isTokenId,
  normalizeAmount,
} from "@wormhole-foundation/connect-sdk";
import { TransferStuff, getStuff } from "./helpers";

// Import the platform specific packages
import { AlgorandPlatform } from "@wormhole-foundation/connect-sdk-algorand";
import { EvmPlatform } from "@wormhole-foundation/connect-sdk-evm";

// Register the protocols
import "@wormhole-foundation/connect-sdk-algorand-tokenbridge";
import "@wormhole-foundation/connect-sdk-evm-tokenbridge";

/*
1. Algorand native to other chain
2. Return wrapped ALGO from other chain to Algorand native
3. Algorand ASA to other chain
4. Return wrapped ASA from other chain to Algorand ASA
5. Other chain native to Algorand wrapped token
6. Return Algorand wrapped token to other chain native
7. Other chain token to Algorand wrapped token
8. Return Algorand wrapped token to other chain token
*/

(async function () {
  // Init Wormhole object, passing config for which network
  // to use (e.g. Mainnet/Testnet) and what Platforms to support
  const wh = new Wormhole("Testnet", [AlgorandPlatform, EvmPlatform]);

  // Grab chain Contexts -- these hold a reference to a cached rpc client
  const sendChain = wh.getChain("Algorand");
  const rcvChain = wh.getChain("Avalanche");

  // Shortcut to allow transferring native gas token
  //const token: TokenId | "native" = "native";

  const token = Wormhole.chainAddress("Algorand", "86783266");

  // Normalized given token decimals later but can just pass bigints as base units
  // Note: The Token bridge will dedust past 8 decimals
  // this means any amount specified past that point will be returned
  // to the caller
  const amount = "0.0001";

  // With automatic set to true, perform an automatic transfer. This will invoke a relayer
  // contract intermediary that knows to pick up the transfers
  // With automatic set to false, perform a manual transfer from source to destination
  // of the token
  // On the destination side, a wrapped version of the token will be minted
  // to the address specified in the transfer VAA
  const automatic = false;

  // The automatic relayer has the ability to deliver some native gas funds to the destination account
  // The amount specified for native gas will be swapped for the native gas token according
  // to the swap rate provided by the contract, denominated in native gas tokens
  const nativeGas = automatic ? "0.01" : undefined;

  // Get signer from local key but anything that implements
  // Signer interface (e.g. wrapper around web wallet) should work
  const source = await getStuff(sendChain);
  const destination = await getStuff(rcvChain);

  // Used to normalize the amount to account for the tokens decimals
  // Used to normalize the amount to account for the tokens decimals
  const decimals = isTokenId(token)
    ? await wh.getDecimals(token.chain, token.address)
    : BigInt(sendChain.config.nativeTokenDecimals);

  // Set this to the transfer txid of the initiating transaction to recover a token transfer
  // and attempt to fetch details about its progress.
  let recoverTxid = undefined;

  // Finally create and perform the transfer given the parameters set above
  const xfer = !recoverTxid
    ? // Perform the token transfer
      await tokenTransfer(wh, {
        token,
        amount: normalizeAmount(amount, decimals),
        source,
        destination,
        delivery: {
          automatic,
          nativeGas: nativeGas ? normalizeAmount(nativeGas, decimals) : undefined,
        },
      })
    : // Recover the transfer from the originating txid
      await TokenTransfer.from(wh, {
        chain: source.chain.chain,
        txid: recoverTxid,
      });

  console.log("xfer: ", xfer);
  // Log out the results
  if (xfer.getTransferState() < TransferState.DestinationInitiated) {
    console.log(await xfer.completeTransfer(destination.signer));
  }
})();

async function tokenTransfer<N extends Network>(
  wh: Wormhole<N>,
  route: {
    token: TokenId | "native";
    amount: bigint;
    source: TransferStuff<N, Platform, Chain>;
    destination: TransferStuff<N, Platform, Chain>;
    delivery?: {
      automatic: boolean;
      nativeGas?: bigint;
    };
    payload?: Uint8Array;
  },
): Promise<TokenTransfer<N>> {
  // Create a TokenTransfer object to track the state of
  // the transfer over time
  const xfer = await wh.tokenTransfer(
    route.token,
    route.amount,
    route.source.address,
    route.destination.address,
    route.delivery?.automatic ?? false,
    route.payload,
    route.delivery?.nativeGas,
  );

  if (xfer.transfer.automatic) {
    const quote = await TokenTransfer.quoteTransfer(
      route.source.chain,
      route.destination.chain,
      xfer.transfer,
    );
    console.log(quote);

    if (quote.destinationToken.amount < 0)
      throw "The amount requested is too low to cover the fee and any native gas requested.";
  }

  // 1) Submit the transactions to the source chain, passing a signer to sign any txns
  console.log("Starting transfer");
  const srcTxids = await xfer.initiateTransfer(route.source.signer);
  console.log(`Started transfer: `, srcTxids);

  // If automatic, we're done
  if (route.delivery?.automatic) return xfer;

  // 2) wait for the VAA to be signed and ready (not required for auto transfer)
  console.log("Getting Attestation");
  const attestIds = await xfer.fetchAttestation(60_000);
  console.log(`Got Attestation: `, attestIds);

  // 3) redeem the VAA on the dest chain
  console.log("Completing Transfer");
  const destTxids = await xfer.completeTransfer(route.destination.signer);
  console.log(`Completed Transfer: `, destTxids);

  return xfer;
}
