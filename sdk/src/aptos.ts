/// <reference path="../../platforms/aptos/src/index.ts" />
import type { Network, PlatformDefinition } from "./index.js";
/** Platform and protocol definitions for Aptos */
const aptos = async (): Promise<PlatformDefinition<Network, "Aptos">> => {
  const _aptos = await import("@wormhole-foundation/sdk-aptos");
  return {
    Address: _aptos.AptosAddress,
    ChainContext: _aptos.AptosChain,
    Platform: _aptos.AptosPlatform,
    Signer: _aptos.AptosSigner,
    getSigner: _aptos.getAptosSigner,
    protocols: {
      core: () => import("@wormhole-foundation/sdk-aptos-core"),
      tokenbridge: () => import("@wormhole-foundation/sdk-aptos-tokenbridge"),
    },
  };
};
export default aptos;
