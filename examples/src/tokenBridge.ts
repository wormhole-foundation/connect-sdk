import {
  Wormhole,
  TokenId,
  TokenTransfer,
  ChainName,
  Signer,
  normalizeAmount,
  UniversalAddress,
} from "@wormhole-foundation/connect-sdk";
// Import the platform specific packages
import { AlgorandAddress, AlgorandPlatform } from "@wormhole-foundation/connect-sdk-algorand";
import { EvmPlatform } from "@wormhole-foundation/connect-sdk-evm";
import { SolanaPlatform } from "@wormhole-foundation/connect-sdk-solana";
//

import "@wormhole-foundation/connect-sdk-algorand-core";
import "@wormhole-foundation/connect-sdk-algorand-tokenbridge";
import "@wormhole-foundation/connect-sdk-evm-core";
import "@wormhole-foundation/connect-sdk-evm-tokenbridge";
import "@wormhole-foundation/connect-sdk-solana-core";
import "@wormhole-foundation/connect-sdk-solana-tokenbridge";

import { TransferStuff, getStuff, waitLog } from "./helpers";
import { bigIntToBytes } from "algosdk";

(async function () {
  // init Wormhole object, passing config for which network
  // to use (e.g. Mainnet/Testnet) and what Platforms to support
  const wh = new Wormhole("Testnet", [AlgorandPlatform, EvmPlatform, SolanaPlatform]);

  // Grab chain Contexts
  const sendChain = wh.getChain("Avalanche");
  const rcvChain = wh.getChain("Algorand");

  // Get signer from local key but anything that implements
  // Signer interface (e.g. wrapper around web wallet) should work
  const source = await getStuff(sendChain);
  const destination = await getStuff(rcvChain);
  console.log("Destination stuff address: ", destination.address.address.toString());

  // Choose your adventure

  // Test native Algo outbound
  // const amt = normalizeAmount("0.01", sendChain.config.nativeTokenDecimals);
  // await manualTokenTransfer(wh, "native", amt, source, destination);

  //Test Algorand ASA outbound
  // const asa: TokenId = {
  //   chain: "Algorand",
  //   address: new AlgorandAddress(bigIntToBytes(BigInt(10458941), 32)), // Testnet USDC
  // };
  // const amt = normalizeAmount("0.01", BigInt(6));
  // await manualTokenTransfer(wh, asa, amt, source, destination);

  // Test native inbound to Algorand
  const amt = normalizeAmount("0.001", BigInt(8));
  await manualTokenTransfer(wh, "native", amt, source, destination);

  // Test token inbound to Algorand
  // const asa: TokenId = {
  //   chain: "Avalanche",
  //   address: new UniversalAddress("0x12EB0d635FD4C5692d779755Ba82b33F6439fc73", "hex"), // Testnet Wrapped USDC from Algorand
  // };
  // const amt = normalizeAmount("0.001", BigInt(6));
  // await manualTokenTransfer(wh, asa, amt, source, destination);

  // await automaticTokenTransfer(wh, "native", 100_000_000n, source, destination);
  // await automaticTokenTransferWithGasDropoff(
  //   wh,
  //   "native",
  //   100_000_000n,
  //   source,
  //   destination,
  //   2_000_000_000_000n
  // );

  // const payload = encoding.toUint8Array("hai")
  // await manualTokenTransferWithPayload(wh, "native", 100_000_000n, source, destination, payload);
  // await automaticTokenTransferWithPayload(wh, "native", 100_000_000n, source, destination, payload);
  // await automaticTokenTransferWithPayloadAndGasDropoff(
  //   wh,
  //   "native",
  //   100_000_000n,
  //   source,
  //   destination,
  //   2_000_000_000_000n,
  //   payload
  // );

  // Or pick up where you left off given the source transaction
  // await finishTransfer(
  //   wh,
  //   sendChain.chain,
  //   "0x667f7cb46bc5c76c19d196118cda79319b22748d42379e9f6f60448c29f25b6e",
  //   destination.signer,
  // );
})();

async function tokenTransfer(
  wh: Wormhole,
  token: TokenId | "native",
  amount: bigint,
  src: TransferStuff,
  dst: TransferStuff,
  automatic: boolean,
  nativeGas?: bigint,
  payload?: Uint8Array,
) {
  const xfer = await wh.tokenTransfer(
    token,
    amount,
    src.address,
    dst.address,
    automatic,
    payload,
    nativeGas,
  );
  console.log(xfer);

  // 1) Submit the transactions to the source chain, passing a signer to sign any txns
  console.log("Starting transfer");
  const srcTxids = await xfer.initiateTransfer(src.signer);
  console.log(`Started transfer: `, srcTxids);

  // If automatic, we're done
  if (automatic) return waitLog(xfer);

  // 2) wait for the VAA to be signed and ready (not required for auto transfer)
  console.log("Getting Attestation");
  const attestIds = await xfer.fetchAttestation(100_000);
  console.log(`Got Attestation: `, attestIds);

  // 3) redeem the VAA on the dest chain
  console.log("Completing Transfer");
  const destTxids = await xfer.completeTransfer(dst.signer);
  console.log(`Completed Transfer: `, destTxids);
}

async function manualTokenTransfer(
  wh: Wormhole,
  token: TokenId | "native",
  amount: bigint,
  src: TransferStuff,
  dst: TransferStuff,
) {
  return tokenTransfer(wh, token, amount, src, dst, false);
}

// If you've started a transfer but not completed it
// this method will complete the transfer given the source
// chain and transaction id
async function finishTransfer(
  wh: Wormhole,
  chain: ChainName,
  txid: string,
  signer: Signer,
): Promise<void> {
  const xfer = await TokenTransfer.from(wh, { chain, txid });
  console.log(xfer);
  await xfer.completeTransfer(signer);
}

async function automaticTokenTransfer(
  wh: Wormhole,
  token: TokenId | "native",
  amount: bigint,
  src: TransferStuff,
  dst: TransferStuff,
) {
  return tokenTransfer(wh, token, amount, src, dst, true);
}

async function automaticTokenTransferWithGasDropoff(
  wh: Wormhole,
  token: TokenId | "native",
  amount: bigint,
  src: TransferStuff,
  dst: TransferStuff,
  nativeGas: bigint,
) {
  return tokenTransfer(wh, token, amount, src, dst, true, nativeGas);
}

async function manualTokenTransferWithPayload(
  wh: Wormhole,
  token: TokenId | "native",
  amount: bigint,
  src: TransferStuff,
  dst: TransferStuff,
  payload: Uint8Array,
) {
  return tokenTransfer(wh, token, amount, src, dst, false, undefined, payload);
}

async function automaticTokenTransferWithPayload(
  wh: Wormhole,
  token: TokenId | "native",
  amount: bigint,
  src: TransferStuff,
  dst: TransferStuff,
  payload: Uint8Array,
) {
  return tokenTransfer(wh, token, amount, src, dst, true, undefined, payload);
}

async function automaticTokenTransferWithPayloadAndGasDropoff(
  wh: Wormhole,
  token: TokenId | "native",
  amount: bigint,
  src: TransferStuff,
  dst: TransferStuff,
  nativeGas: bigint,
  payload: Uint8Array,
) {
  return tokenTransfer(wh, token, amount, src, dst, true, nativeGas, payload);
}
