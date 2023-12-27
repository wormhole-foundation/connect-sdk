import { Chain, Network, RoArray, constMap } from "@wormhole-foundation/connect-sdk";

export const CHAIN_NAME_ALGORAND = "Algorand";
export const CHAIN_ID_ALGORAND = 8;

const networkChainAlgorandGenesisHashes = [
  ["Mainnet", [["Algorand", "wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8="]]],
  ["Testnet", [["Algorand", "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI="]]], // Note: this is referred to as `devnet` on Solana
  ["Devnet", [["Algorand", ""]]], // Note: this is only for local testing with Tilt QUESTIONBW: Is there a deterministic genesis hash for the localnet Tilt creates?
] as const satisfies RoArray<readonly [Network, RoArray<readonly [Chain, string]>]>;

export const algorandGenesisHashToNetworkChainPair = constMap(networkChainAlgorandGenesisHashes, [
  2,
  [0, 1],
]);

export const algorandNetworkChainToGenesisHash = constMap(networkChainAlgorandGenesisHashes);
