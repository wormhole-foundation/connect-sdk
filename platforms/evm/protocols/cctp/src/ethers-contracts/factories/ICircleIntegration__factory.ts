/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from 'ethers';
import type {
  ICircleIntegration,
  ICircleIntegrationInterface,
} from '../ICircleIntegration';

const _abi = [
  {
    inputs: [],
    name: 'chainId',
    outputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'circleBridge',
    outputs: [
      {
        internalType: 'contract ICircleBridge',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'circleTransmitter',
    outputs: [
      {
        internalType: 'contract IMessageTransmitter',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'encoded',
        type: 'bytes',
      },
    ],
    name: 'decodeDepositWithPayload',
    outputs: [
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'token',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'uint32',
            name: 'sourceDomain',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'targetDomain',
            type: 'uint32',
          },
          {
            internalType: 'uint64',
            name: 'nonce',
            type: 'uint64',
          },
          {
            internalType: 'bytes32',
            name: 'fromAddress',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'mintRecipient',
            type: 'bytes32',
          },
          {
            internalType: 'bytes',
            name: 'payload',
            type: 'bytes',
          },
        ],
        internalType: 'struct ICircleIntegration.DepositWithPayload',
        name: 'message',
        type: 'tuple',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'token',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'uint32',
            name: 'sourceDomain',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'targetDomain',
            type: 'uint32',
          },
          {
            internalType: 'uint64',
            name: 'nonce',
            type: 'uint64',
          },
          {
            internalType: 'bytes32',
            name: 'fromAddress',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'mintRecipient',
            type: 'bytes32',
          },
          {
            internalType: 'bytes',
            name: 'payload',
            type: 'bytes',
          },
        ],
        internalType: 'struct ICircleIntegration.DepositWithPayload',
        name: 'message',
        type: 'tuple',
      },
    ],
    name: 'encodeDepositWithPayload',
    outputs: [
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'evmChain',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint32',
        name: 'sourceDomain',
        type: 'uint32',
      },
      {
        internalType: 'bytes32',
        name: 'sourceToken',
        type: 'bytes32',
      },
    ],
    name: 'fetchLocalTokenAddress',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint32',
        name: 'domain',
        type: 'uint32',
      },
    ],
    name: 'getChainIdFromDomain',
    outputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: 'chainId_',
        type: 'uint16',
      },
    ],
    name: 'getDomainFromChainId',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: 'emitterChainId',
        type: 'uint16',
      },
    ],
    name: 'getRegisteredEmitter',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
    ],
    name: 'isAcceptedToken',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'impl',
        type: 'address',
      },
    ],
    name: 'isInitialized',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'hash',
        type: 'bytes32',
      },
    ],
    name: 'isMessageConsumed',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'localDomain',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'bytes',
            name: 'encodedWormholeMessage',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'circleBridgeMessage',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'circleAttestation',
            type: 'bytes',
          },
        ],
        internalType: 'struct ICircleIntegration.RedeemParameters',
        name: 'params',
        type: 'tuple',
      },
    ],
    name: 'redeemTokensWithPayload',
    outputs: [
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'token',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'uint32',
            name: 'sourceDomain',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'targetDomain',
            type: 'uint32',
          },
          {
            internalType: 'uint64',
            name: 'nonce',
            type: 'uint64',
          },
          {
            internalType: 'bytes32',
            name: 'fromAddress',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'mintRecipient',
            type: 'bytes32',
          },
          {
            internalType: 'bytes',
            name: 'payload',
            type: 'bytes',
          },
        ],
        internalType: 'struct ICircleIntegration.DepositWithPayload',
        name: 'depositWithPayload',
        type: 'tuple',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'encodedMessage',
        type: 'bytes',
      },
    ],
    name: 'registerAcceptedToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'encodedMessage',
        type: 'bytes',
      },
    ],
    name: 'registerEmitterAndDomain',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'encodedMessage',
        type: 'bytes',
      },
    ],
    name: 'registerTargetChainToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sourceToken',
        type: 'address',
      },
      {
        internalType: 'uint16',
        name: 'chainId_',
        type: 'uint16',
      },
    ],
    name: 'targetAcceptedToken',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'token',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'uint16',
            name: 'targetChain',
            type: 'uint16',
          },
          {
            internalType: 'bytes32',
            name: 'mintRecipient',
            type: 'bytes32',
          },
        ],
        internalType: 'struct ICircleIntegration.TransferParameters',
        name: 'transferParams',
        type: 'tuple',
      },
      {
        internalType: 'uint32',
        name: 'batchId',
        type: 'uint32',
      },
      {
        internalType: 'bytes',
        name: 'payload',
        type: 'bytes',
      },
    ],
    name: 'transferTokensWithPayload',
    outputs: [
      {
        internalType: 'uint64',
        name: 'messageSequence',
        type: 'uint64',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'encodedMessage',
        type: 'bytes',
      },
    ],
    name: 'updateWormholeFinality',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'encodedMessage',
        type: 'bytes',
      },
    ],
    name: 'upgradeContract',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'encodedMessage',
        type: 'bytes',
      },
      {
        internalType: 'uint8',
        name: 'action',
        type: 'uint8',
      },
    ],
    name: 'verifyGovernanceMessage',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'messageHash',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: 'payload',
        type: 'bytes',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'wormhole',
    outputs: [
      {
        internalType: 'contract IWormhole',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'wormholeFinality',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export class ICircleIntegration__factory {
  static readonly abi = _abi;
  static createInterface(): ICircleIntegrationInterface {
    return new Interface(_abi) as ICircleIntegrationInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null,
  ): ICircleIntegration {
    return new Contract(address, _abi, runner) as unknown as ICircleIntegration;
  }
}
