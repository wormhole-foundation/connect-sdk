/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from 'ethers';
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from './common.js';

export declare namespace CircleRelayerStructs {
  export type TransferTokensWithRelayStruct = {
    payloadId: BigNumberish;
    targetRelayerFee: BigNumberish;
    toNativeTokenAmount: BigNumberish;
    targetRecipientWallet: BytesLike;
  };

  export type TransferTokensWithRelayStructOutput = [
    payloadId: bigint,
    targetRelayerFee: bigint,
    toNativeTokenAmount: bigint,
    targetRecipientWallet: string,
  ] & {
    payloadId: bigint;
    targetRelayerFee: bigint;
    toNativeTokenAmount: bigint;
    targetRecipientWallet: string;
  };
}

export declare namespace ICircleIntegration {
  export type RedeemParametersStruct = {
    encodedWormholeMessage: BytesLike;
    circleBridgeMessage: BytesLike;
    circleAttestation: BytesLike;
  };

  export type RedeemParametersStructOutput = [
    encodedWormholeMessage: string,
    circleBridgeMessage: string,
    circleAttestation: string,
  ] & {
    encodedWormholeMessage: string;
    circleBridgeMessage: string;
    circleAttestation: string;
  };
}

export interface CircleRelayerInterface extends Interface {
  getFunction(
    nameOrSignature:
      | 'VERSION'
      | 'bytes32ToAddress'
      | 'calculateMaxSwapAmountIn'
      | 'calculateNativeSwapAmountOut'
      | 'cancelOwnershipTransferRequest'
      | 'chainId'
      | 'circleIntegration'
      | 'confirmOwnershipTransferRequest'
      | 'decodeTransferTokensWithRelay'
      | 'encodeTransferTokensWithRelay'
      | 'feeRecipient'
      | 'getPaused'
      | 'getRegisteredContract'
      | 'maxNativeSwapAmount'
      | 'nativeSwapRate'
      | 'nativeSwapRatePrecision'
      | 'nativeTokenDecimals'
      | 'owner'
      | 'ownerAssistant'
      | 'pendingOwner'
      | 'redeemTokens'
      | 'registerContract'
      | 'relayerFee'
      | 'setPauseForTransfers'
      | 'submitOwnershipTransferRequest'
      | 'transferTokensWithRelay'
      | 'updateFeeRecipient'
      | 'updateMaxNativeSwapAmount'
      | 'updateNativeSwapRate'
      | 'updateNativeSwapRatePrecision'
      | 'updateOwnerAssistant'
      | 'updateRelayerFee'
      | 'wormhole',
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | 'AdminChanged'
      | 'BeaconUpgraded'
      | 'FeeRecipientUpdated'
      | 'OwnershipTransfered'
      | 'SwapExecuted'
      | 'SwapRateUpdated'
      | 'Upgraded',
  ): EventFragment;

  encodeFunctionData(functionFragment: 'VERSION', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'bytes32ToAddress',
    values: [BytesLike],
  ): string;
  encodeFunctionData(
    functionFragment: 'calculateMaxSwapAmountIn',
    values: [AddressLike],
  ): string;
  encodeFunctionData(
    functionFragment: 'calculateNativeSwapAmountOut',
    values: [AddressLike, BigNumberish],
  ): string;
  encodeFunctionData(
    functionFragment: 'cancelOwnershipTransferRequest',
    values: [BigNumberish],
  ): string;
  encodeFunctionData(functionFragment: 'chainId', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'circleIntegration',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'confirmOwnershipTransferRequest',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'decodeTransferTokensWithRelay',
    values: [BytesLike],
  ): string;
  encodeFunctionData(
    functionFragment: 'encodeTransferTokensWithRelay',
    values: [CircleRelayerStructs.TransferTokensWithRelayStruct],
  ): string;
  encodeFunctionData(
    functionFragment: 'feeRecipient',
    values?: undefined,
  ): string;
  encodeFunctionData(functionFragment: 'getPaused', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'getRegisteredContract',
    values: [BigNumberish],
  ): string;
  encodeFunctionData(
    functionFragment: 'maxNativeSwapAmount',
    values: [AddressLike],
  ): string;
  encodeFunctionData(
    functionFragment: 'nativeSwapRate',
    values: [AddressLike],
  ): string;
  encodeFunctionData(
    functionFragment: 'nativeSwapRatePrecision',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'nativeTokenDecimals',
    values?: undefined,
  ): string;
  encodeFunctionData(functionFragment: 'owner', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'ownerAssistant',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'pendingOwner',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'redeemTokens',
    values: [ICircleIntegration.RedeemParametersStruct],
  ): string;
  encodeFunctionData(
    functionFragment: 'registerContract',
    values: [BigNumberish, BytesLike],
  ): string;
  encodeFunctionData(
    functionFragment: 'relayerFee',
    values: [BigNumberish, AddressLike],
  ): string;
  encodeFunctionData(
    functionFragment: 'setPauseForTransfers',
    values: [BigNumberish, boolean],
  ): string;
  encodeFunctionData(
    functionFragment: 'submitOwnershipTransferRequest',
    values: [BigNumberish, AddressLike],
  ): string;
  encodeFunctionData(
    functionFragment: 'transferTokensWithRelay',
    values: [AddressLike, BigNumberish, BigNumberish, BigNumberish, BytesLike],
  ): string;
  encodeFunctionData(
    functionFragment: 'updateFeeRecipient',
    values: [BigNumberish, AddressLike],
  ): string;
  encodeFunctionData(
    functionFragment: 'updateMaxNativeSwapAmount',
    values: [BigNumberish, AddressLike, BigNumberish],
  ): string;
  encodeFunctionData(
    functionFragment: 'updateNativeSwapRate',
    values: [BigNumberish, AddressLike, BigNumberish],
  ): string;
  encodeFunctionData(
    functionFragment: 'updateNativeSwapRatePrecision',
    values: [BigNumberish, BigNumberish],
  ): string;
  encodeFunctionData(
    functionFragment: 'updateOwnerAssistant',
    values: [BigNumberish, AddressLike],
  ): string;
  encodeFunctionData(
    functionFragment: 'updateRelayerFee',
    values: [BigNumberish, AddressLike, BigNumberish],
  ): string;
  encodeFunctionData(functionFragment: 'wormhole', values?: undefined): string;

  decodeFunctionResult(functionFragment: 'VERSION', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'bytes32ToAddress',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'calculateMaxSwapAmountIn',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'calculateNativeSwapAmountOut',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'cancelOwnershipTransferRequest',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'chainId', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'circleIntegration',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'confirmOwnershipTransferRequest',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'decodeTransferTokensWithRelay',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'encodeTransferTokensWithRelay',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'feeRecipient',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'getPaused', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'getRegisteredContract',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'maxNativeSwapAmount',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'nativeSwapRate',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'nativeSwapRatePrecision',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'nativeTokenDecimals',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'owner', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'ownerAssistant',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'pendingOwner',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'redeemTokens',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'registerContract',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'relayerFee', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'setPauseForTransfers',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'submitOwnershipTransferRequest',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'transferTokensWithRelay',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'updateFeeRecipient',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'updateMaxNativeSwapAmount',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'updateNativeSwapRate',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'updateNativeSwapRatePrecision',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'updateOwnerAssistant',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'updateRelayerFee',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'wormhole', data: BytesLike): Result;
}

export namespace AdminChangedEvent {
  export type InputTuple = [previousAdmin: AddressLike, newAdmin: AddressLike];
  export type OutputTuple = [previousAdmin: string, newAdmin: string];
  export interface OutputObject {
    previousAdmin: string;
    newAdmin: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace BeaconUpgradedEvent {
  export type InputTuple = [beacon: AddressLike];
  export type OutputTuple = [beacon: string];
  export interface OutputObject {
    beacon: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace FeeRecipientUpdatedEvent {
  export type InputTuple = [
    oldRecipient: AddressLike,
    newRecipient: AddressLike,
  ];
  export type OutputTuple = [oldRecipient: string, newRecipient: string];
  export interface OutputObject {
    oldRecipient: string;
    newRecipient: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace OwnershipTransferedEvent {
  export type InputTuple = [oldOwner: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [oldOwner: string, newOwner: string];
  export interface OutputObject {
    oldOwner: string;
    newOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace SwapExecutedEvent {
  export type InputTuple = [
    recipient: AddressLike,
    relayer: AddressLike,
    token: AddressLike,
    tokenAmount: BigNumberish,
    nativeAmount: BigNumberish,
  ];
  export type OutputTuple = [
    recipient: string,
    relayer: string,
    token: string,
    tokenAmount: bigint,
    nativeAmount: bigint,
  ];
  export interface OutputObject {
    recipient: string;
    relayer: string;
    token: string;
    tokenAmount: bigint;
    nativeAmount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace SwapRateUpdatedEvent {
  export type InputTuple = [token: AddressLike, swapRate: BigNumberish];
  export type OutputTuple = [token: string, swapRate: bigint];
  export interface OutputObject {
    token: string;
    swapRate: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace UpgradedEvent {
  export type InputTuple = [implementation: AddressLike];
  export type OutputTuple = [implementation: string];
  export interface OutputObject {
    implementation: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface CircleRelayer extends BaseContract {
  connect(runner?: ContractRunner | null): CircleRelayer;
  waitForDeployment(): Promise<this>;

  interface: CircleRelayerInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined,
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined,
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>,
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>,
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>,
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>,
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent,
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent,
  ): Promise<this>;

  VERSION: TypedContractMethod<[], [string], 'view'>;

  bytes32ToAddress: TypedContractMethod<
    [address_: BytesLike],
    [string],
    'view'
  >;

  calculateMaxSwapAmountIn: TypedContractMethod<
    [token: AddressLike],
    [bigint],
    'view'
  >;

  calculateNativeSwapAmountOut: TypedContractMethod<
    [token: AddressLike, toNativeAmount: BigNumberish],
    [bigint],
    'view'
  >;

  cancelOwnershipTransferRequest: TypedContractMethod<
    [chainId_: BigNumberish],
    [void],
    'nonpayable'
  >;

  chainId: TypedContractMethod<[], [bigint], 'view'>;

  circleIntegration: TypedContractMethod<[], [string], 'view'>;

  confirmOwnershipTransferRequest: TypedContractMethod<
    [],
    [void],
    'nonpayable'
  >;

  decodeTransferTokensWithRelay: TypedContractMethod<
    [encoded: BytesLike],
    [CircleRelayerStructs.TransferTokensWithRelayStructOutput],
    'view'
  >;

  encodeTransferTokensWithRelay: TypedContractMethod<
    [transfer: CircleRelayerStructs.TransferTokensWithRelayStruct],
    [string],
    'view'
  >;

  feeRecipient: TypedContractMethod<[], [string], 'view'>;

  getPaused: TypedContractMethod<[], [boolean], 'view'>;

  getRegisteredContract: TypedContractMethod<
    [emitterChainId: BigNumberish],
    [string],
    'view'
  >;

  maxNativeSwapAmount: TypedContractMethod<
    [token: AddressLike],
    [bigint],
    'view'
  >;

  nativeSwapRate: TypedContractMethod<[token: AddressLike], [bigint], 'view'>;

  nativeSwapRatePrecision: TypedContractMethod<[], [bigint], 'view'>;

  nativeTokenDecimals: TypedContractMethod<[], [bigint], 'view'>;

  owner: TypedContractMethod<[], [string], 'view'>;

  ownerAssistant: TypedContractMethod<[], [string], 'view'>;

  pendingOwner: TypedContractMethod<[], [string], 'view'>;

  redeemTokens: TypedContractMethod<
    [redeemParams: ICircleIntegration.RedeemParametersStruct],
    [void],
    'payable'
  >;

  registerContract: TypedContractMethod<
    [chainId_: BigNumberish, contractAddress: BytesLike],
    [void],
    'nonpayable'
  >;

  relayerFee: TypedContractMethod<
    [chainId_: BigNumberish, token: AddressLike],
    [bigint],
    'view'
  >;

  setPauseForTransfers: TypedContractMethod<
    [chainId_: BigNumberish, paused: boolean],
    [void],
    'nonpayable'
  >;

  submitOwnershipTransferRequest: TypedContractMethod<
    [chainId_: BigNumberish, newOwner: AddressLike],
    [void],
    'nonpayable'
  >;

  transferTokensWithRelay: TypedContractMethod<
    [
      token: AddressLike,
      amount: BigNumberish,
      toNativeTokenAmount: BigNumberish,
      targetChain: BigNumberish,
      targetRecipientWallet: BytesLike,
    ],
    [bigint],
    'payable'
  >;

  updateFeeRecipient: TypedContractMethod<
    [chainId_: BigNumberish, newFeeRecipient: AddressLike],
    [void],
    'nonpayable'
  >;

  updateMaxNativeSwapAmount: TypedContractMethod<
    [chainId_: BigNumberish, token: AddressLike, maxAmount: BigNumberish],
    [void],
    'nonpayable'
  >;

  updateNativeSwapRate: TypedContractMethod<
    [chainId_: BigNumberish, token: AddressLike, swapRate: BigNumberish],
    [void],
    'nonpayable'
  >;

  updateNativeSwapRatePrecision: TypedContractMethod<
    [chainId_: BigNumberish, nativeSwapRatePrecision_: BigNumberish],
    [void],
    'nonpayable'
  >;

  updateOwnerAssistant: TypedContractMethod<
    [chainId_: BigNumberish, newAssistant: AddressLike],
    [void],
    'nonpayable'
  >;

  updateRelayerFee: TypedContractMethod<
    [chainId_: BigNumberish, token: AddressLike, amount: BigNumberish],
    [void],
    'nonpayable'
  >;

  wormhole: TypedContractMethod<[], [string], 'view'>;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment,
  ): T;

  getFunction(
    nameOrSignature: 'VERSION',
  ): TypedContractMethod<[], [string], 'view'>;
  getFunction(
    nameOrSignature: 'bytes32ToAddress',
  ): TypedContractMethod<[address_: BytesLike], [string], 'view'>;
  getFunction(
    nameOrSignature: 'calculateMaxSwapAmountIn',
  ): TypedContractMethod<[token: AddressLike], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'calculateNativeSwapAmountOut',
  ): TypedContractMethod<
    [token: AddressLike, toNativeAmount: BigNumberish],
    [bigint],
    'view'
  >;
  getFunction(
    nameOrSignature: 'cancelOwnershipTransferRequest',
  ): TypedContractMethod<[chainId_: BigNumberish], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'chainId',
  ): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'circleIntegration',
  ): TypedContractMethod<[], [string], 'view'>;
  getFunction(
    nameOrSignature: 'confirmOwnershipTransferRequest',
  ): TypedContractMethod<[], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'decodeTransferTokensWithRelay',
  ): TypedContractMethod<
    [encoded: BytesLike],
    [CircleRelayerStructs.TransferTokensWithRelayStructOutput],
    'view'
  >;
  getFunction(
    nameOrSignature: 'encodeTransferTokensWithRelay',
  ): TypedContractMethod<
    [transfer: CircleRelayerStructs.TransferTokensWithRelayStruct],
    [string],
    'view'
  >;
  getFunction(
    nameOrSignature: 'feeRecipient',
  ): TypedContractMethod<[], [string], 'view'>;
  getFunction(
    nameOrSignature: 'getPaused',
  ): TypedContractMethod<[], [boolean], 'view'>;
  getFunction(
    nameOrSignature: 'getRegisteredContract',
  ): TypedContractMethod<[emitterChainId: BigNumberish], [string], 'view'>;
  getFunction(
    nameOrSignature: 'maxNativeSwapAmount',
  ): TypedContractMethod<[token: AddressLike], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'nativeSwapRate',
  ): TypedContractMethod<[token: AddressLike], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'nativeSwapRatePrecision',
  ): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'nativeTokenDecimals',
  ): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'owner',
  ): TypedContractMethod<[], [string], 'view'>;
  getFunction(
    nameOrSignature: 'ownerAssistant',
  ): TypedContractMethod<[], [string], 'view'>;
  getFunction(
    nameOrSignature: 'pendingOwner',
  ): TypedContractMethod<[], [string], 'view'>;
  getFunction(
    nameOrSignature: 'redeemTokens',
  ): TypedContractMethod<
    [redeemParams: ICircleIntegration.RedeemParametersStruct],
    [void],
    'payable'
  >;
  getFunction(
    nameOrSignature: 'registerContract',
  ): TypedContractMethod<
    [chainId_: BigNumberish, contractAddress: BytesLike],
    [void],
    'nonpayable'
  >;
  getFunction(
    nameOrSignature: 'relayerFee',
  ): TypedContractMethod<
    [chainId_: BigNumberish, token: AddressLike],
    [bigint],
    'view'
  >;
  getFunction(
    nameOrSignature: 'setPauseForTransfers',
  ): TypedContractMethod<
    [chainId_: BigNumberish, paused: boolean],
    [void],
    'nonpayable'
  >;
  getFunction(
    nameOrSignature: 'submitOwnershipTransferRequest',
  ): TypedContractMethod<
    [chainId_: BigNumberish, newOwner: AddressLike],
    [void],
    'nonpayable'
  >;
  getFunction(
    nameOrSignature: 'transferTokensWithRelay',
  ): TypedContractMethod<
    [
      token: AddressLike,
      amount: BigNumberish,
      toNativeTokenAmount: BigNumberish,
      targetChain: BigNumberish,
      targetRecipientWallet: BytesLike,
    ],
    [bigint],
    'payable'
  >;
  getFunction(
    nameOrSignature: 'updateFeeRecipient',
  ): TypedContractMethod<
    [chainId_: BigNumberish, newFeeRecipient: AddressLike],
    [void],
    'nonpayable'
  >;
  getFunction(
    nameOrSignature: 'updateMaxNativeSwapAmount',
  ): TypedContractMethod<
    [chainId_: BigNumberish, token: AddressLike, maxAmount: BigNumberish],
    [void],
    'nonpayable'
  >;
  getFunction(
    nameOrSignature: 'updateNativeSwapRate',
  ): TypedContractMethod<
    [chainId_: BigNumberish, token: AddressLike, swapRate: BigNumberish],
    [void],
    'nonpayable'
  >;
  getFunction(
    nameOrSignature: 'updateNativeSwapRatePrecision',
  ): TypedContractMethod<
    [chainId_: BigNumberish, nativeSwapRatePrecision_: BigNumberish],
    [void],
    'nonpayable'
  >;
  getFunction(
    nameOrSignature: 'updateOwnerAssistant',
  ): TypedContractMethod<
    [chainId_: BigNumberish, newAssistant: AddressLike],
    [void],
    'nonpayable'
  >;
  getFunction(
    nameOrSignature: 'updateRelayerFee',
  ): TypedContractMethod<
    [chainId_: BigNumberish, token: AddressLike, amount: BigNumberish],
    [void],
    'nonpayable'
  >;
  getFunction(
    nameOrSignature: 'wormhole',
  ): TypedContractMethod<[], [string], 'view'>;

  getEvent(
    key: 'AdminChanged',
  ): TypedContractEvent<
    AdminChangedEvent.InputTuple,
    AdminChangedEvent.OutputTuple,
    AdminChangedEvent.OutputObject
  >;
  getEvent(
    key: 'BeaconUpgraded',
  ): TypedContractEvent<
    BeaconUpgradedEvent.InputTuple,
    BeaconUpgradedEvent.OutputTuple,
    BeaconUpgradedEvent.OutputObject
  >;
  getEvent(
    key: 'FeeRecipientUpdated',
  ): TypedContractEvent<
    FeeRecipientUpdatedEvent.InputTuple,
    FeeRecipientUpdatedEvent.OutputTuple,
    FeeRecipientUpdatedEvent.OutputObject
  >;
  getEvent(
    key: 'OwnershipTransfered',
  ): TypedContractEvent<
    OwnershipTransferedEvent.InputTuple,
    OwnershipTransferedEvent.OutputTuple,
    OwnershipTransferedEvent.OutputObject
  >;
  getEvent(
    key: 'SwapExecuted',
  ): TypedContractEvent<
    SwapExecutedEvent.InputTuple,
    SwapExecutedEvent.OutputTuple,
    SwapExecutedEvent.OutputObject
  >;
  getEvent(
    key: 'SwapRateUpdated',
  ): TypedContractEvent<
    SwapRateUpdatedEvent.InputTuple,
    SwapRateUpdatedEvent.OutputTuple,
    SwapRateUpdatedEvent.OutputObject
  >;
  getEvent(
    key: 'Upgraded',
  ): TypedContractEvent<
    UpgradedEvent.InputTuple,
    UpgradedEvent.OutputTuple,
    UpgradedEvent.OutputObject
  >;

  filters: {
    'AdminChanged(address,address)': TypedContractEvent<
      AdminChangedEvent.InputTuple,
      AdminChangedEvent.OutputTuple,
      AdminChangedEvent.OutputObject
    >;
    AdminChanged: TypedContractEvent<
      AdminChangedEvent.InputTuple,
      AdminChangedEvent.OutputTuple,
      AdminChangedEvent.OutputObject
    >;

    'BeaconUpgraded(address)': TypedContractEvent<
      BeaconUpgradedEvent.InputTuple,
      BeaconUpgradedEvent.OutputTuple,
      BeaconUpgradedEvent.OutputObject
    >;
    BeaconUpgraded: TypedContractEvent<
      BeaconUpgradedEvent.InputTuple,
      BeaconUpgradedEvent.OutputTuple,
      BeaconUpgradedEvent.OutputObject
    >;

    'FeeRecipientUpdated(address,address)': TypedContractEvent<
      FeeRecipientUpdatedEvent.InputTuple,
      FeeRecipientUpdatedEvent.OutputTuple,
      FeeRecipientUpdatedEvent.OutputObject
    >;
    FeeRecipientUpdated: TypedContractEvent<
      FeeRecipientUpdatedEvent.InputTuple,
      FeeRecipientUpdatedEvent.OutputTuple,
      FeeRecipientUpdatedEvent.OutputObject
    >;

    'OwnershipTransfered(address,address)': TypedContractEvent<
      OwnershipTransferedEvent.InputTuple,
      OwnershipTransferedEvent.OutputTuple,
      OwnershipTransferedEvent.OutputObject
    >;
    OwnershipTransfered: TypedContractEvent<
      OwnershipTransferedEvent.InputTuple,
      OwnershipTransferedEvent.OutputTuple,
      OwnershipTransferedEvent.OutputObject
    >;

    'SwapExecuted(address,address,address,uint256,uint256)': TypedContractEvent<
      SwapExecutedEvent.InputTuple,
      SwapExecutedEvent.OutputTuple,
      SwapExecutedEvent.OutputObject
    >;
    SwapExecuted: TypedContractEvent<
      SwapExecutedEvent.InputTuple,
      SwapExecutedEvent.OutputTuple,
      SwapExecutedEvent.OutputObject
    >;

    'SwapRateUpdated(address,uint256)': TypedContractEvent<
      SwapRateUpdatedEvent.InputTuple,
      SwapRateUpdatedEvent.OutputTuple,
      SwapRateUpdatedEvent.OutputObject
    >;
    SwapRateUpdated: TypedContractEvent<
      SwapRateUpdatedEvent.InputTuple,
      SwapRateUpdatedEvent.OutputTuple,
      SwapRateUpdatedEvent.OutputObject
    >;

    'Upgraded(address)': TypedContractEvent<
      UpgradedEvent.InputTuple,
      UpgradedEvent.OutputTuple,
      UpgradedEvent.OutputObject
    >;
    Upgraded: TypedContractEvent<
      UpgradedEvent.InputTuple,
      UpgradedEvent.OutputTuple,
      UpgradedEvent.OutputObject
    >;
  };
}
