import * as _algorand from "@wormhole-foundation/sdk-algorand";
import * as _algorand_core from "@wormhole-foundation/sdk-algorand-core";
import * as _algorand_tokenbridge from "@wormhole-foundation/sdk-algorand-tokenbridge";

/** Platform and protocol definitions for Algorand */
export const algorand = {
  ...{
    Address: _algorand.AlgorandAddress,
    ChainContext: _algorand.AlgorandChain,
    Platform: _algorand.AlgorandPlatform,
    Signer: _algorand.AlgorandSigner,
    getSigner: _algorand.getAlgorandSigner,
  },
  protocols: {
    core: _algorand_core,
    tokenbridge: _algorand_tokenbridge,
  },
};