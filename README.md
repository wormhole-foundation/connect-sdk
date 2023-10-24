# Connect SDK

The primary component here is the Wormhole class, which serves as a wrapper for all the sdk methods.  It ensures that each chain implements certain methods with the same function signature and provides an interface for calling those methods easily.

## Usage

A developer would use the core connect-sdk package in conjunction with 1 or more of the chain context packages. Most developers don't use every single chain and may only use a couple, this allows developers to import only the dependencies they actually need.

Getting started is simple, just import and pass in the contexts to the Wormhole class.

```ts
import { Wormhole, Signer } from '@wormhole-foundation/connect-sdk';
import { EvmContext } from '@wormhole-foundation/connect-sdk-evm';
import { SolanaContext } from '@wormhole-foundation/connect-sdk-solana';

const network = "Mainnet";
const wh = new Wormhole(network, [EvmContext, SolanaContext]);
```

### Signers

In order to sign transactions, an object that fulfils the `Signer` interface is required.  This is a simple interface that can be implemented by wrapping a web wallet or other signing mechanism.  

The `Signer` interface is defined as follows:

```ts
// A Signer is an interface that must be provided to certain methods
// in the SDK to sign transactions. It can be either a SignOnlySigner
// or a SignAndSendSigner depending on circumstances. 
// A Signer can be implemented by wrapping an existing offline wallet
// or a web wallet 
export type Signer = SignOnlySigner | SignAndSendSigner;

// A SignOnlySender is for situations where the signer is not
// connected to the network or does not wish to broadcast the
// transactions themselves 
export interface SignOnlySigner {
    chain(): ChainName;
    address(): string;
    // Accept an array of unsigned transactions and return
    // an array of signed and serialized transactions.
    // The transactions may be inspected or altered before
    // signing.
    // Note: The serialization is chain specific, if in doubt,
    // see the example implementations linked below
    sign(tx: UnsignedTransaction[]): Promise<SignedTx[]>;
}

// A SignAndSendSigner is for situations where the signer is
// connected to the network and wishes to broadcast the
// transactions themselves 
export interface SignAndSendSigner {
    chain(): ChainName;
    address(): string;
    // Accept an array of unsigned transactions and return
    // an array of transaction ids in the same order as the  
    // UnsignedTransactions array.
    signAndSend(tx: UnsignedTransaction[]): Promise<TxHash[]>;
}
```

See the [example signers](./examples/src/helpers/signers.ts) for examples of how to implement a signer for a specific chain.


```ts
// Create a signer for the source and destination chains
const sender: Signer =  // ...
const receiver: Signer = // ...

```

### Addresses

Within the Wormhole context, addresses are [normalized](https://docs.wormhole.com/wormhole/blockchain-environments/evm#addresses) to 32 bytes and referred to in this SDK as a `UniversalAddresses`.

Each platform comes with an address type that understands the native address formats, unsuprisingly referred to a NativeAddress. This abstraction allows the SDK to work with addresses in a consistent way regardless of the underlying chain. 

```ts
// Convert a string address to its Native address
const ethAddr: NativeAddress<'Evm'> = toNative('Ethereum', '0xbeef...');
const solAddr: NativeAddress<'Solana'> = toNative('Solana', 'Sol1111...')

// Convert a Native address to its string address
ethAddr.toString() // => '0xbeef...'

// Convert a Native address to a UniversalAddress
ethAddr.toUniversalAddresS()

// A common type in the SDK is the `ChainAddress`. 
// A helper exists to provide a ChainAddress for a signer, or [ChainName, string address]
const senderAddress: ChainAddress = nativeChainAddress(sender)     
const receiverAddress: ChainAddress = nativeChainAddress(receiver) 
```

### Chain Context

The `Wormhole` class provides a `getChain` method that returns a `ChainContext` object for a given chain.  This object provides access to the chain specific methods and utilities. 

The ChainContext object is also responsible for holding a cached rpc client and protocol clients. Much of the functionality in the `ChainContext` is provided by the `Platform` methods but the specific chain may have overriden methods. 

```ts
// Get the chain context for the source and destination chains
// This is useful to grab direct clients for the protocols 
const srcChain = wh.getChain(senderAddress.chain);
const dstChain = wh.getChain(receiverAddress.chain);


srcChain.parseAddress("0xdeadbeef...") // => NativeAddress<'Evm'>
await srcChain.getTokenBridge() // => TokenBridge<'Evm'>
srcChain.getRpcClient() // => RpcClient<'Evm'>


```

### Transfers

With the signer(s) available, we can create a new `WormholeTransfer` object (`TokenTransfer`, `CCTPTransfer`, `GatewayTransfer`, ...) and use it to transfer tokens between chains.  The `WormholeTransfer` object is responsible for tracking the transfer through the process and providing updates on its status. 

```ts

// we'll send the native gas token on source chain
const token = 'native'

// format it for base units
const amt = normalizeAmount(1, srcChain.config.nativeTokenDecimals)

// Create a TokenTransfer object, allowing us to shepard the transfer through the process and get updates on its status
const manualXfer = wh.tokenTransfer(
  token,            // TokenId of the token to transfer or 'native'
  amt,              // amount in base units
  senderAddress,    // Sender address on source chain
  recipientAddress, // Recipient address on destination chain
  false,            // No Automatic transfer
)

// 1) Submit the transactions to the source chain, passing a signer to sign any txns
const srcTxids = await manualXfer.initiateTransfer(src.signer);

// 2) Wait for the VAA to be signed and ready (not required for auto transfer)
// Note: Depending on chain finality, this timeout may need to be increased.
// See https://docs.wormhole.com/wormhole/reference/constants#consistency-levels for more info on specific chain finality.
const timeout = 60_000; 
const attestIds = await manualXfer.fetchAttestation(timeout);

// 3) Redeem the VAA on the dest chain
const destTxids = await manualXfer.completeTransfer(dst.signer);
```

We can also transfer native USDC

```ts
// OR for an native USDC transfer
const usdcXfer = wh.cctpTransfer(
  1_000_000n,       // amount in base units
  senderAddress,    // Sender address on source chain
  recipientAddress, // Recipient address on destination chain
  false,            // Automatic transfer
)

// 1) Submit the transactions to the source chain, passing a signer to sign any txns
const srcTxids = await usdcXfer.initiateTransfer(src.signer);

// 2) Wait for the Circle Attestations to be signed and ready (not required for auto transfer)
// Note: Depending on chain finality, this timeout may need to be increased.
// See https://developers.circle.com/stablecoin/docs/cctp-technical-reference#mainnet for more
const timeout = 120_000;
const attestIds = await usdcXfer.fetchAttestation(timeout);

// 3) Redeem the Circle Attestation on the dest chain
const destTxids = await usdcXfer.completeTransfer(dst.signer);
```


### Automatic Transfers

Some transfers allow for automatic relaying to the destination, in that case only the `initiateTransfer` is required. The status of the transfer can be tracked by periodically checking the status of the transfer object (TODO: event emission).

```ts

// OR for an automatic transfer
const automaticXfer = wh.tokenTransfer(
  'native',         // send native gas on source chain
  10n,              // amount in base units
  senderAddress,    // Sender address on source chain
  recipientAddress, // Recipient address on destination chain
  true,             // Automatic transfer
)

// 1) Submit the transactions to the source chain, passing a signer to sign any txns
const srcTxids = await automaticXfer.initiateTransfer(src.signer);
// 2) If automatic, we're done, just wait for the transfer to complete
if (automatic) return waitLog(automaticXfer) ;
```

### Gateway Transfers

TODO see [example](./examples/src/cosmos.ts)


### Recovering Transfers

It may be necessary to recover a transfer that was abandoned before being completed. This can be done by instantiating the Transfer class with the `from` static method and passing one of several types of identifiers.

A `TransactionId` may be used
```ts
// Note, this will attempt to recover the transfer from the source chain
// and attestation types so it may wait depending on the chain finality
// and when the transactions were issued.
const timeout = 60_000;
const xfer = await TokenTransfer.from({
  chain: 'Ethereum',
  txid: '0x1234...',
}, timeout);

const dstTxIds = await xfer.completeTransfer(dst.signer)
```

Or a `WormholeMessageId` if a `VAA` is generated 
```ts
const xfer = await TokenTransfer.from({
  chain: 'Ethereum',
  emitter: toNative('Ethereum', emitterAddress).toUniversalAddress(),
  sequence: '0x1234...',
});

const dstTxIds = await xfer.completeTransfer(dst.signer)
```





## WIP

:warning: This package is a Work in Progress so the interface may change and there are likely bugs.  Please report any issues you find.


## TODOS:

Chains: 

- [ ] Add support for Aptos chains
- [ ] Add support for Algorand chains
- [ ] Add support for Sui chains
- [ ] Add support for Near chains

Other:

- [ ] Add support for NFTBridge protocols
- [ ] Simulate prior to sending 
- [ ] Gas utilities (estimate from unsigned, get gas used from txid) 
- [ ] Better tracking of auto-redeem, use target contract?
- [ ] Estimate tx finalization
- [ ] Event emission/subscription for status changes 
- [ ] Validation of inputs (amount > dust, etc..)
