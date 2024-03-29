/// <reference path="../../platforms/sui/src/index.ts" />
import type { Network, PlatformDefinition } from "./index.js";
/** Platform and protocol definitions for Sui */
const sui = async (): Promise<PlatformDefinition<Network, "Sui">> => {
  const _sui = await import("@wormhole-foundation/sdk-sui");
  return {
    Address: _sui.SuiAddress,
    ChainContext: _sui.SuiChain,
    Platform: _sui.SuiPlatform,
    Signer: _sui.SuiSigner,
    getSigner: _sui.getSuiSigner,
    protocols: {
      core: () => import("@wormhole-foundation/sdk-sui-core"),
      tokenbridge: () => import("@wormhole-foundation/sdk-sui-tokenbridge"),
    },
  };
};
export default sui;
