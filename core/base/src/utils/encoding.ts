import { base16, base64, base58 } from '@scure/base';

export { bech32 } from '@scure/base';

export const stripPrefix = (prefix: string, str: string): string =>
  str.startsWith(prefix) ? str.slice(prefix.length) : str;

const isHexRegex = /^(?:0x)?[0-9a-fA-F]+$/;
export const hex = {
  valid: (input: string) => isHexRegex.test(input),
  decode: (input: string) => base16.decode(stripPrefix("0x", input).toUpperCase()),
  encode: (input: string | Uint8Array, prefix: boolean = false) => {
    input = typeof input === "string" ? bytes.encode(input) : input;
    return (prefix ? "0x" : "") + base16.encode(input).toLowerCase()
  }
}

// regex string to check if the input could possibly be base64 encoded.
// WARNING: There are clear text strings that are NOT base64 encoded that will pass this check.
const isB64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
export const b64 = {
  valid: (input: string) => isB64Regex.test(input),
  decode: base64.decode,
  encode: (input: string | Uint8Array) =>
    base64.encode(typeof input === "string" ? bytes.encode(input) : input)
}

export const b58 = {
  decode: base58.decode,
  encode: (input: string | Uint8Array) =>
    base58.encode(typeof input === "string" ? bytes.encode(input) : input),
}

export const bignum = {
  decode: (input: string) => BigInt(input),
  encode: (input: bigint, prefix: boolean = false) => (prefix ? "0x" : "") + input.toString(16)
}

export const bytes = {
  encode: (value: string | bigint): Uint8Array =>
    typeof value === "bigint"
      ? bytes.encode(bignum.encode(value))
      : (new TextEncoder()).encode(value),
  decode: (value: Uint8Array): string =>
    (new TextDecoder()).decode(value),
  equals: (lhs: Uint8Array, rhs: Uint8Array): boolean =>
    lhs.length === rhs.length && lhs.every((v, i) => v === rhs[i]),
  zpad: (arr: Uint8Array, length: number): Uint8Array =>
    bytes.concat(new Uint8Array(length - arr.length), arr),
  concat: (...args: Uint8Array[]): Uint8Array => {
    const length = args.reduce((acc, curr) => acc + curr.length, 0);
    const result = new Uint8Array(length);
    let offset = 0;
    args.forEach((arg) => {
      result.set(arg, offset);
      offset += arg.length;
    });
    return result;
  }
}






