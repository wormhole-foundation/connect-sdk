import { Network, PlatformDefinition } from ".";
import * as _evm from "@wormhole-foundation/sdk-evm";
/** Platform and protocol definitions for Evm */
export const evm: PlatformDefinition<Network, "Evm"> = {
  Address: _evm.EvmAddress,
  ChainContext: _evm.EvmChain,
  Platform: _evm.EvmPlatform,
  Signer: _evm.EvmNativeSigner,
  getSigner: _evm.getEvmSignerForKey,
  protocols: {
    core: () => import("@wormhole-foundation/sdk-evm-core"),
    tokenbridge: () => import("@wormhole-foundation/sdk-evm-tokenbridge"),
    portico: () => import("@wormhole-foundation/sdk-evm-portico"),
    cctp: () => import("@wormhole-foundation/sdk-evm-cctp"),
  },
  // @ts-ignore
  getSignerForSigner: _evm.getEvmSignerForSigner,
};
