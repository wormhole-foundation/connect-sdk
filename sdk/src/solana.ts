/// <reference path="../../platforms/solana/dist/esm/address.d.ts" />
import type { Network, PlatformDefinition } from "./index.js";
/** Platform and protocol definitons for Solana */
export const solana = async (): Promise<PlatformDefinition<Network, "Solana">> => {
  const _solana = await import("@wormhole-foundation/sdk-solana");
  return {
    Address: _solana.SolanaAddress,
    ChainContext: _solana.SolanaChain,
    Platform: _solana.SolanaPlatform,
    Signer: _solana.SolanaSigner,
    getSigner: _solana.getSolanaSignAndSendSigner,
    protocols: {
      core: () => import("@wormhole-foundation/sdk-solana-core"),
      tokenbridge: () => import("@wormhole-foundation/sdk-solana-tokenbridge"),
      cctp: () => import("@wormhole-foundation/sdk-solana-cctp"),
    },
  };
};
