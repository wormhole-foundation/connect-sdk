import "../src/payloads/connect";
import { connectPayloads } from "../src/payloads/connect";
import { VAA, deserialize, deserializePayload } from "../src/vaa";

const cases = [
  "AQAAAAABANyb1oS4sD9gIp0m+dKOYmrEaxx3OeWWtUbim+6oL7VnX/zUXa/di9lA0SSDRZ3DCWoqgDC4pjPoMNUNLn1P3EcAZJjzeAAAAAAAAgAAAAAAAAAAAAAAAAppFGcWs6IWIih++hYHQkxmMGmkAAAAAAAAAHDIAQAAAAAAAAAAAAAAAAeGXG6HufcCVTd+AkrOZjDB6qN/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB6EgAAAAAAAAAAAwAAAAAAA5CKAAAAAAAAAAAAAAAAF9of9ThtBExj8AdHtbitHjgGRI0AAAAAAAAAAAAAAAC/aD1UHhEyBBjKeOwTMJk45sWSLwBhAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYagAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAInU4Tn/aAHroyfjAatH6hXg4Srg==",
];

describe("Circle Transfer VAA tests", function () {
  it("should correctly deserialize and reserialize a Circle Transfer Relay VAA", function () {
    for (const testCase of cases) {
      const vaaBytes = Buffer.from(testCase, "base64");

      const parsed = deserialize("Uint8Array", new Uint8Array(vaaBytes));
      console.log(parsed);

      console.log(Buffer.from(parsed.payload).toString("hex"));

      const x = deserializePayload("CircleTransferRelay", parsed.payload);
      console.log(x);

      //let parsed: VAA<"ConnectTransferLayout"> | undefined;
      //for (const maybeType of connectPayloads) {
      //  try {
      //    parsed = deserialize(maybeType[0], new Uint8Array(vaaBytes));
      //  } catch (e) {
      //    console.log(e);
      //  }
      //}
      //if (parsed === undefined) {
      //  throw new Error(`Couldn't deserialize VAA: ${testCase}`);
      //}
    }
  });
});
