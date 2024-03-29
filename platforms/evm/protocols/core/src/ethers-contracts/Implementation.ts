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

export declare namespace Structs {
  export type GuardianSetStruct = {
    keys: AddressLike[];
    expirationTime: BigNumberish;
  };

  export type GuardianSetStructOutput = [
    keys: string[],
    expirationTime: bigint,
  ] & { keys: string[]; expirationTime: bigint };

  export type SignatureStruct = {
    r: BytesLike;
    s: BytesLike;
    v: BigNumberish;
    guardianIndex: BigNumberish;
  };

  export type SignatureStructOutput = [
    r: string,
    s: string,
    v: bigint,
    guardianIndex: bigint,
  ] & { r: string; s: string; v: bigint; guardianIndex: bigint };

  export type VMStruct = {
    version: BigNumberish;
    timestamp: BigNumberish;
    nonce: BigNumberish;
    emitterChainId: BigNumberish;
    emitterAddress: BytesLike;
    sequence: BigNumberish;
    consistencyLevel: BigNumberish;
    payload: BytesLike;
    guardianSetIndex: BigNumberish;
    signatures: Structs.SignatureStruct[];
    hash: BytesLike;
  };

  export type VMStructOutput = [
    version: bigint,
    timestamp: bigint,
    nonce: bigint,
    emitterChainId: bigint,
    emitterAddress: string,
    sequence: bigint,
    consistencyLevel: bigint,
    payload: string,
    guardianSetIndex: bigint,
    signatures: Structs.SignatureStructOutput[],
    hash: string,
  ] & {
    version: bigint;
    timestamp: bigint;
    nonce: bigint;
    emitterChainId: bigint;
    emitterAddress: string;
    sequence: bigint;
    consistencyLevel: bigint;
    payload: string;
    guardianSetIndex: bigint;
    signatures: Structs.SignatureStructOutput[];
    hash: string;
  };
}

export declare namespace GovernanceStructs {
  export type ContractUpgradeStruct = {
    module: BytesLike;
    action: BigNumberish;
    chain: BigNumberish;
    newContract: AddressLike;
  };

  export type ContractUpgradeStructOutput = [
    module: string,
    action: bigint,
    chain: bigint,
    newContract: string,
  ] & { module: string; action: bigint; chain: bigint; newContract: string };

  export type GuardianSetUpgradeStruct = {
    module: BytesLike;
    action: BigNumberish;
    chain: BigNumberish;
    newGuardianSet: Structs.GuardianSetStruct;
    newGuardianSetIndex: BigNumberish;
  };

  export type GuardianSetUpgradeStructOutput = [
    module: string,
    action: bigint,
    chain: bigint,
    newGuardianSet: Structs.GuardianSetStructOutput,
    newGuardianSetIndex: bigint,
  ] & {
    module: string;
    action: bigint;
    chain: bigint;
    newGuardianSet: Structs.GuardianSetStructOutput;
    newGuardianSetIndex: bigint;
  };

  export type RecoverChainIdStruct = {
    module: BytesLike;
    action: BigNumberish;
    evmChainId: BigNumberish;
    newChainId: BigNumberish;
  };

  export type RecoverChainIdStructOutput = [
    module: string,
    action: bigint,
    evmChainId: bigint,
    newChainId: bigint,
  ] & {
    module: string;
    action: bigint;
    evmChainId: bigint;
    newChainId: bigint;
  };

  export type SetMessageFeeStruct = {
    module: BytesLike;
    action: BigNumberish;
    chain: BigNumberish;
    messageFee: BigNumberish;
  };

  export type SetMessageFeeStructOutput = [
    module: string,
    action: bigint,
    chain: bigint,
    messageFee: bigint,
  ] & { module: string; action: bigint; chain: bigint; messageFee: bigint };

  export type TransferFeesStruct = {
    module: BytesLike;
    action: BigNumberish;
    chain: BigNumberish;
    amount: BigNumberish;
    recipient: BytesLike;
  };

  export type TransferFeesStructOutput = [
    module: string,
    action: bigint,
    chain: bigint,
    amount: bigint,
    recipient: string,
  ] & {
    module: string;
    action: bigint;
    chain: bigint;
    amount: bigint;
    recipient: string;
  };
}

export interface ImplementationInterface extends Interface {
  getFunction(
    nameOrSignature:
      | 'chainId'
      | 'evmChainId'
      | 'getCurrentGuardianSetIndex'
      | 'getGuardianSet'
      | 'getGuardianSetExpiry'
      | 'governanceActionIsConsumed'
      | 'governanceChainId'
      | 'governanceContract'
      | 'initialize'
      | 'isFork'
      | 'isInitialized'
      | 'messageFee'
      | 'nextSequence'
      | 'parseAndVerifyVM'
      | 'parseContractUpgrade'
      | 'parseGuardianSetUpgrade'
      | 'parseRecoverChainId'
      | 'parseSetMessageFee'
      | 'parseTransferFees'
      | 'parseVM'
      | 'publishMessage'
      | 'quorum'
      | 'submitContractUpgrade'
      | 'submitNewGuardianSet'
      | 'submitRecoverChainId'
      | 'submitSetMessageFee'
      | 'submitTransferFees'
      | 'verifySignatures'
      | 'verifyVM',
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | 'AdminChanged'
      | 'BeaconUpgraded'
      | 'ContractUpgraded'
      | 'GuardianSetAdded'
      | 'LogMessagePublished'
      | 'Upgraded',
  ): EventFragment;

  encodeFunctionData(functionFragment: 'chainId', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'evmChainId',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'getCurrentGuardianSetIndex',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'getGuardianSet',
    values: [BigNumberish],
  ): string;
  encodeFunctionData(
    functionFragment: 'getGuardianSetExpiry',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'governanceActionIsConsumed',
    values: [BytesLike],
  ): string;
  encodeFunctionData(
    functionFragment: 'governanceChainId',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'governanceContract',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'initialize',
    values?: undefined,
  ): string;
  encodeFunctionData(functionFragment: 'isFork', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'isInitialized',
    values: [AddressLike],
  ): string;
  encodeFunctionData(
    functionFragment: 'messageFee',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'nextSequence',
    values: [AddressLike],
  ): string;
  encodeFunctionData(
    functionFragment: 'parseAndVerifyVM',
    values: [BytesLike],
  ): string;
  encodeFunctionData(
    functionFragment: 'parseContractUpgrade',
    values: [BytesLike],
  ): string;
  encodeFunctionData(
    functionFragment: 'parseGuardianSetUpgrade',
    values: [BytesLike],
  ): string;
  encodeFunctionData(
    functionFragment: 'parseRecoverChainId',
    values: [BytesLike],
  ): string;
  encodeFunctionData(
    functionFragment: 'parseSetMessageFee',
    values: [BytesLike],
  ): string;
  encodeFunctionData(
    functionFragment: 'parseTransferFees',
    values: [BytesLike],
  ): string;
  encodeFunctionData(functionFragment: 'parseVM', values: [BytesLike]): string;
  encodeFunctionData(
    functionFragment: 'publishMessage',
    values: [BigNumberish, BytesLike, BigNumberish],
  ): string;
  encodeFunctionData(
    functionFragment: 'quorum',
    values: [BigNumberish],
  ): string;
  encodeFunctionData(
    functionFragment: 'submitContractUpgrade',
    values: [BytesLike],
  ): string;
  encodeFunctionData(
    functionFragment: 'submitNewGuardianSet',
    values: [BytesLike],
  ): string;
  encodeFunctionData(
    functionFragment: 'submitRecoverChainId',
    values: [BytesLike],
  ): string;
  encodeFunctionData(
    functionFragment: 'submitSetMessageFee',
    values: [BytesLike],
  ): string;
  encodeFunctionData(
    functionFragment: 'submitTransferFees',
    values: [BytesLike],
  ): string;
  encodeFunctionData(
    functionFragment: 'verifySignatures',
    values: [BytesLike, Structs.SignatureStruct[], Structs.GuardianSetStruct],
  ): string;
  encodeFunctionData(
    functionFragment: 'verifyVM',
    values: [Structs.VMStruct],
  ): string;

  decodeFunctionResult(functionFragment: 'chainId', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'evmChainId', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'getCurrentGuardianSetIndex',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'getGuardianSet',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'getGuardianSetExpiry',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'governanceActionIsConsumed',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'governanceChainId',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'governanceContract',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'initialize', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'isFork', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'isInitialized',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'messageFee', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'nextSequence',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'parseAndVerifyVM',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'parseContractUpgrade',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'parseGuardianSetUpgrade',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'parseRecoverChainId',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'parseSetMessageFee',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'parseTransferFees',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'parseVM', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'publishMessage',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'quorum', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'submitContractUpgrade',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'submitNewGuardianSet',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'submitRecoverChainId',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'submitSetMessageFee',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'submitTransferFees',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'verifySignatures',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'verifyVM', data: BytesLike): Result;
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

export namespace ContractUpgradedEvent {
  export type InputTuple = [oldContract: AddressLike, newContract: AddressLike];
  export type OutputTuple = [oldContract: string, newContract: string];
  export interface OutputObject {
    oldContract: string;
    newContract: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace GuardianSetAddedEvent {
  export type InputTuple = [index: BigNumberish];
  export type OutputTuple = [index: bigint];
  export interface OutputObject {
    index: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace LogMessagePublishedEvent {
  export type InputTuple = [
    sender: AddressLike,
    sequence: BigNumberish,
    nonce: BigNumberish,
    payload: BytesLike,
    consistencyLevel: BigNumberish,
  ];
  export type OutputTuple = [
    sender: string,
    sequence: bigint,
    nonce: bigint,
    payload: string,
    consistencyLevel: bigint,
  ];
  export interface OutputObject {
    sender: string;
    sequence: bigint;
    nonce: bigint;
    payload: string;
    consistencyLevel: bigint;
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

export interface Implementation extends BaseContract {
  connect(runner?: ContractRunner | null): Implementation;
  waitForDeployment(): Promise<this>;

  interface: ImplementationInterface;

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

  chainId: TypedContractMethod<[], [bigint], 'view'>;

  evmChainId: TypedContractMethod<[], [bigint], 'view'>;

  getCurrentGuardianSetIndex: TypedContractMethod<[], [bigint], 'view'>;

  getGuardianSet: TypedContractMethod<
    [index: BigNumberish],
    [Structs.GuardianSetStructOutput],
    'view'
  >;

  getGuardianSetExpiry: TypedContractMethod<[], [bigint], 'view'>;

  governanceActionIsConsumed: TypedContractMethod<
    [hash: BytesLike],
    [boolean],
    'view'
  >;

  governanceChainId: TypedContractMethod<[], [bigint], 'view'>;

  governanceContract: TypedContractMethod<[], [string], 'view'>;

  initialize: TypedContractMethod<[], [void], 'nonpayable'>;

  isFork: TypedContractMethod<[], [boolean], 'view'>;

  isInitialized: TypedContractMethod<[impl: AddressLike], [boolean], 'view'>;

  messageFee: TypedContractMethod<[], [bigint], 'view'>;

  nextSequence: TypedContractMethod<[emitter: AddressLike], [bigint], 'view'>;

  parseAndVerifyVM: TypedContractMethod<
    [encodedVM: BytesLike],
    [
      [Structs.VMStructOutput, boolean, string] & {
        vm: Structs.VMStructOutput;
        valid: boolean;
        reason: string;
      },
    ],
    'view'
  >;

  parseContractUpgrade: TypedContractMethod<
    [encodedUpgrade: BytesLike],
    [GovernanceStructs.ContractUpgradeStructOutput],
    'view'
  >;

  parseGuardianSetUpgrade: TypedContractMethod<
    [encodedUpgrade: BytesLike],
    [GovernanceStructs.GuardianSetUpgradeStructOutput],
    'view'
  >;

  parseRecoverChainId: TypedContractMethod<
    [encodedRecoverChainId: BytesLike],
    [GovernanceStructs.RecoverChainIdStructOutput],
    'view'
  >;

  parseSetMessageFee: TypedContractMethod<
    [encodedSetMessageFee: BytesLike],
    [GovernanceStructs.SetMessageFeeStructOutput],
    'view'
  >;

  parseTransferFees: TypedContractMethod<
    [encodedTransferFees: BytesLike],
    [GovernanceStructs.TransferFeesStructOutput],
    'view'
  >;

  parseVM: TypedContractMethod<
    [encodedVM: BytesLike],
    [Structs.VMStructOutput],
    'view'
  >;

  publishMessage: TypedContractMethod<
    [nonce: BigNumberish, payload: BytesLike, consistencyLevel: BigNumberish],
    [bigint],
    'payable'
  >;

  quorum: TypedContractMethod<[numGuardians: BigNumberish], [bigint], 'view'>;

  submitContractUpgrade: TypedContractMethod<
    [_vm: BytesLike],
    [void],
    'nonpayable'
  >;

  submitNewGuardianSet: TypedContractMethod<
    [_vm: BytesLike],
    [void],
    'nonpayable'
  >;

  submitRecoverChainId: TypedContractMethod<
    [_vm: BytesLike],
    [void],
    'nonpayable'
  >;

  submitSetMessageFee: TypedContractMethod<
    [_vm: BytesLike],
    [void],
    'nonpayable'
  >;

  submitTransferFees: TypedContractMethod<
    [_vm: BytesLike],
    [void],
    'nonpayable'
  >;

  verifySignatures: TypedContractMethod<
    [
      hash: BytesLike,
      signatures: Structs.SignatureStruct[],
      guardianSet: Structs.GuardianSetStruct,
    ],
    [[boolean, string] & { valid: boolean; reason: string }],
    'view'
  >;

  verifyVM: TypedContractMethod<
    [vm: Structs.VMStruct],
    [[boolean, string] & { valid: boolean; reason: string }],
    'view'
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment,
  ): T;

  getFunction(
    nameOrSignature: 'chainId',
  ): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'evmChainId',
  ): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'getCurrentGuardianSetIndex',
  ): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'getGuardianSet',
  ): TypedContractMethod<
    [index: BigNumberish],
    [Structs.GuardianSetStructOutput],
    'view'
  >;
  getFunction(
    nameOrSignature: 'getGuardianSetExpiry',
  ): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'governanceActionIsConsumed',
  ): TypedContractMethod<[hash: BytesLike], [boolean], 'view'>;
  getFunction(
    nameOrSignature: 'governanceChainId',
  ): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'governanceContract',
  ): TypedContractMethod<[], [string], 'view'>;
  getFunction(
    nameOrSignature: 'initialize',
  ): TypedContractMethod<[], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'isFork',
  ): TypedContractMethod<[], [boolean], 'view'>;
  getFunction(
    nameOrSignature: 'isInitialized',
  ): TypedContractMethod<[impl: AddressLike], [boolean], 'view'>;
  getFunction(
    nameOrSignature: 'messageFee',
  ): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'nextSequence',
  ): TypedContractMethod<[emitter: AddressLike], [bigint], 'view'>;
  getFunction(nameOrSignature: 'parseAndVerifyVM'): TypedContractMethod<
    [encodedVM: BytesLike],
    [
      [Structs.VMStructOutput, boolean, string] & {
        vm: Structs.VMStructOutput;
        valid: boolean;
        reason: string;
      },
    ],
    'view'
  >;
  getFunction(
    nameOrSignature: 'parseContractUpgrade',
  ): TypedContractMethod<
    [encodedUpgrade: BytesLike],
    [GovernanceStructs.ContractUpgradeStructOutput],
    'view'
  >;
  getFunction(
    nameOrSignature: 'parseGuardianSetUpgrade',
  ): TypedContractMethod<
    [encodedUpgrade: BytesLike],
    [GovernanceStructs.GuardianSetUpgradeStructOutput],
    'view'
  >;
  getFunction(
    nameOrSignature: 'parseRecoverChainId',
  ): TypedContractMethod<
    [encodedRecoverChainId: BytesLike],
    [GovernanceStructs.RecoverChainIdStructOutput],
    'view'
  >;
  getFunction(
    nameOrSignature: 'parseSetMessageFee',
  ): TypedContractMethod<
    [encodedSetMessageFee: BytesLike],
    [GovernanceStructs.SetMessageFeeStructOutput],
    'view'
  >;
  getFunction(
    nameOrSignature: 'parseTransferFees',
  ): TypedContractMethod<
    [encodedTransferFees: BytesLike],
    [GovernanceStructs.TransferFeesStructOutput],
    'view'
  >;
  getFunction(
    nameOrSignature: 'parseVM',
  ): TypedContractMethod<
    [encodedVM: BytesLike],
    [Structs.VMStructOutput],
    'view'
  >;
  getFunction(
    nameOrSignature: 'publishMessage',
  ): TypedContractMethod<
    [nonce: BigNumberish, payload: BytesLike, consistencyLevel: BigNumberish],
    [bigint],
    'payable'
  >;
  getFunction(
    nameOrSignature: 'quorum',
  ): TypedContractMethod<[numGuardians: BigNumberish], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'submitContractUpgrade',
  ): TypedContractMethod<[_vm: BytesLike], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'submitNewGuardianSet',
  ): TypedContractMethod<[_vm: BytesLike], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'submitRecoverChainId',
  ): TypedContractMethod<[_vm: BytesLike], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'submitSetMessageFee',
  ): TypedContractMethod<[_vm: BytesLike], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'submitTransferFees',
  ): TypedContractMethod<[_vm: BytesLike], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'verifySignatures',
  ): TypedContractMethod<
    [
      hash: BytesLike,
      signatures: Structs.SignatureStruct[],
      guardianSet: Structs.GuardianSetStruct,
    ],
    [[boolean, string] & { valid: boolean; reason: string }],
    'view'
  >;
  getFunction(
    nameOrSignature: 'verifyVM',
  ): TypedContractMethod<
    [vm: Structs.VMStruct],
    [[boolean, string] & { valid: boolean; reason: string }],
    'view'
  >;

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
    key: 'ContractUpgraded',
  ): TypedContractEvent<
    ContractUpgradedEvent.InputTuple,
    ContractUpgradedEvent.OutputTuple,
    ContractUpgradedEvent.OutputObject
  >;
  getEvent(
    key: 'GuardianSetAdded',
  ): TypedContractEvent<
    GuardianSetAddedEvent.InputTuple,
    GuardianSetAddedEvent.OutputTuple,
    GuardianSetAddedEvent.OutputObject
  >;
  getEvent(
    key: 'LogMessagePublished',
  ): TypedContractEvent<
    LogMessagePublishedEvent.InputTuple,
    LogMessagePublishedEvent.OutputTuple,
    LogMessagePublishedEvent.OutputObject
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

    'ContractUpgraded(address,address)': TypedContractEvent<
      ContractUpgradedEvent.InputTuple,
      ContractUpgradedEvent.OutputTuple,
      ContractUpgradedEvent.OutputObject
    >;
    ContractUpgraded: TypedContractEvent<
      ContractUpgradedEvent.InputTuple,
      ContractUpgradedEvent.OutputTuple,
      ContractUpgradedEvent.OutputObject
    >;

    'GuardianSetAdded(uint32)': TypedContractEvent<
      GuardianSetAddedEvent.InputTuple,
      GuardianSetAddedEvent.OutputTuple,
      GuardianSetAddedEvent.OutputObject
    >;
    GuardianSetAdded: TypedContractEvent<
      GuardianSetAddedEvent.InputTuple,
      GuardianSetAddedEvent.OutputTuple,
      GuardianSetAddedEvent.OutputObject
    >;

    'LogMessagePublished(address,uint64,uint32,bytes,uint8)': TypedContractEvent<
      LogMessagePublishedEvent.InputTuple,
      LogMessagePublishedEvent.OutputTuple,
      LogMessagePublishedEvent.OutputObject
    >;
    LogMessagePublished: TypedContractEvent<
      LogMessagePublishedEvent.InputTuple,
      LogMessagePublishedEvent.OutputTuple,
      LogMessagePublishedEvent.OutputObject
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
