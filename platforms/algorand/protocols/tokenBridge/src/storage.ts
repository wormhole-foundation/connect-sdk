import {
  Chain,
  TokenId,
  WormholeMessageId,
  encoding,
  toChainId,
} from "@wormhole-foundation/connect-sdk";
import { LogicSigAccount, decodeAddress, getApplicationAddress } from "algosdk";
import { varint } from "./bigVarint";
import { MAX_BITS } from "./utilities";

export interface PopulateData {
  appId: bigint; // App ID we're storing data for
  appAddress: Uint8Array; // Address for the emitter, contract or Guardian
  address: Uint8Array;
  idx: bigint;
}

export class StorageLogicSig {
  // Used only to cache the compiled bytecode
  constructor(private bytecode: Uint8Array) {}

  lsig() {
    return new LogicSigAccount(this.bytecode);
  }

  // Get the storage lsig for a Wormhole message ID
  static forMessageId(appId: bigint, whm: WormholeMessageId): StorageLogicSig {
    const appAddress = decodeAddress(getApplicationAddress(appId)).publicKey;
    const emitterAddr = whm.emitter.toUniversalAddress().toUint8Array();
    const chainIdBytes = encoding.bignum.toBytes(BigInt(toChainId(whm.chain)), 2);
    const address = encoding.bytes.concat(chainIdBytes, emitterAddr);

    return StorageLogicSig.fromData({
      appId,
      appAddress,
      idx: whm.sequence / BigInt(MAX_BITS),
      address,
    });
  }

  // Get the storage lsig for a wrapped asset
  static forWrappedAsset(appId: bigint, token: TokenId<Chain>): StorageLogicSig {
    const appAddress = decodeAddress(getApplicationAddress(appId)).publicKey;
    return StorageLogicSig.fromData({
      appId,
      appAddress,
      idx: BigInt(toChainId(token.chain)),
      address: token.address.toUniversalAddress().toUint8Array(),
    });
  }

  // Get the storage lsig for a native asset
  static forNativeAsset(appId: bigint, tokenId: bigint): StorageLogicSig {
    const appAddress = decodeAddress(getApplicationAddress(appId)).publicKey;
    return StorageLogicSig.fromData({
      appId,
      appAddress,
      idx: tokenId,
      address: encoding.bytes.encode("native"),
    });
  }

  // Get the storage lsig for the guardian set
  static forGuardianSet(appId: bigint, idx: bigint | number): StorageLogicSig {
    const appAddress = decodeAddress(getApplicationAddress(appId)).publicKey;
    return StorageLogicSig.fromData({
      appId,
      appAddress,
      idx: BigInt(idx),
      address: encoding.bytes.encode("guardian"),
    });
  }

  static fromData(data: PopulateData): StorageLogicSig {
    // This patches the binary of the TEAL program used to store data
    // to produce a logic sig that can be used to sign transactions
    // to store data in the its account local state for a given app
    const byteStrings = [
      "0620010181",
      varint.encodeHex(data.idx),
      "4880",
      varint.encodeHex(data.address.length),
      encoding.hex.encode(data.address),
      "483110810612443119221244311881",
      varint.encodeHex(data.appId),
      "1244312080",
      varint.encodeHex(data.appAddress.length),
      encoding.hex.encode(data.appAddress),
      "124431018100124431093203124431153203124422",
    ];
    return new StorageLogicSig(encoding.hex.decode(byteStrings.join("")));
  }
}
