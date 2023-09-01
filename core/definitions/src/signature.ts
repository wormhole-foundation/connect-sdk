//TODO this should get properly wrapped and get its own interface so we don't expose implementation
//  internals and can swap out the implementation if we choose to later. Maybe also rename
//  recovery to v then (this seems to be the convention at least in EVM land)

import { Signature as SignatureOptionalRecovery } from "@noble/secp256k1";

export class Signature extends SignatureOptionalRecovery {
  constructor(
    readonly r: bigint,
    readonly s: bigint,
    readonly recovery: number
  ) {
    super(r, s, recovery);
  }

  toUint8Array(): Uint8Array {
    const buff = new Uint8Array(65);
    buff.set(this.toCompactRawBytes());
    buff.set([this.recovery], 64);
    return buff;
  }

  toBuffer(): Buffer {
    return Buffer.from(this.toUint8Array());
  }
}
