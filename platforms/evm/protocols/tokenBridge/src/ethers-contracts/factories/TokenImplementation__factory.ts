/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from 'ethers';
import type { Signer, ContractDeployTransaction, ContractRunner } from 'ethers';
import type { NonPayableOverrides } from '../common';
import type {
  TokenImplementation,
  TokenImplementationInterface,
} from '../TokenImplementation';

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
  {
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
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
        name: 'owner_',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'spender_',
        type: 'address',
      },
    ],
    name: 'allowance',
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
        internalType: 'address',
        name: 'spender_',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount_',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account_',
        type: 'address',
      },
    ],
    name: 'balanceOf',
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
        internalType: 'address',
        name: 'account_',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount_',
        type: 'uint256',
      },
    ],
    name: 'burn',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
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
    name: 'decimals',
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
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender_',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'subtractedValue_',
        type: 'uint256',
      },
    ],
    name: 'decreaseAllowance',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'eip712Domain',
    outputs: [
      {
        internalType: 'bytes1',
        name: 'domainFields',
        type: 'bytes1',
      },
      {
        internalType: 'string',
        name: 'domainName',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'domainVersion',
        type: 'string',
      },
      {
        internalType: 'uint256',
        name: 'domainChainId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'domainVerifyingContract',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'domainSalt',
        type: 'bytes32',
      },
      {
        internalType: 'uint256[]',
        name: 'domainExtensions',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'spender_',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'addedValue_',
        type: 'uint256',
      },
    ],
    name: 'increaseAllowance',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'name_',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'symbol_',
        type: 'string',
      },
      {
        internalType: 'uint8',
        name: 'decimals_',
        type: 'uint8',
      },
      {
        internalType: 'uint64',
        name: 'sequence_',
        type: 'uint64',
      },
      {
        internalType: 'address',
        name: 'owner_',
        type: 'address',
      },
      {
        internalType: 'uint16',
        name: 'chainId_',
        type: 'uint16',
      },
      {
        internalType: 'bytes32',
        name: 'nativeContract_',
        type: 'bytes32',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account_',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount_',
        type: 'uint256',
      },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nativeContract',
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
        name: 'owner_',
        type: 'address',
      },
    ],
    name: 'nonces',
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
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
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
        internalType: 'address',
        name: 'owner_',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'spender_',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'value_',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'deadline_',
        type: 'uint256',
      },
      {
        internalType: 'uint8',
        name: 'v_',
        type: 'uint8',
      },
      {
        internalType: 'bytes32',
        name: 'r_',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 's_',
        type: 'bytes32',
      },
    ],
    name: 'permit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
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
        internalType: 'address',
        name: 'recipient_',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount_',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender_',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'recipient_',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount_',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'name_',
        type: 'string',
      },
      {
        internalType: 'string',
        name: 'symbol_',
        type: 'string',
      },
      {
        internalType: 'uint64',
        name: 'sequence_',
        type: 'uint64',
      },
    ],
    name: 'updateDetails',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const _bytecode =
  '0x6080806040523461001657611af2908161001c8239f35b600080fdfe6040608081526004908136101561001557600080fd5b600091823560e01c90816306fdde0314611136578163095ea7b31461110c57816318160ddd146110ed57816323b872dd14611026578163313ce567146110055781633644e51514610fe15781633950935114610f985781633d6c043b14610f7957816340c10f1914610ea157816370a0823114610e695781637ecebe0014610e3157816384b0196e14610d575781638da5cb5b14610d2e57816395d89b4114610c595781639a8a059214610c335781639dc29fac14610af1578163a18cd7c6146107bf578163a457c2d71461070f578163a9059cbb146106de578163c71f461514610335578163d505accf14610160575063dd62ed3e1461011557600080fd5b3461015c578060031936011261015c57806020926101316111af565b6101396111ca565b6001600160a01b0391821683526006865283832091168252845220549051908152f35b5080fd5b8391503461015c5760e036600319011261015c5761017c6111af565b6101846111ca565b906044359260643560843560ff81168103610331576101a16112e1565b8142116102ee5760018060a01b039081851692838952600e602052898920908154916001830190558a519060208201927f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c98452868d840152858a1660608401528a608084015260a083015260c082015260c0815261021e81611212565b519020610229611798565b918a5191602083019361190160f01b855260228401526042830152604282526080820182811067ffffffffffffffff8211176102db5791610283939161027b938d5260c4359260a435925190206119c7565b919091611855565b160361029857506102959394506115e0565b80f35b606490602087519162461bcd60e51b8352820152601e60248201527f45524332305065726d69743a20696e76616c6964207369676e617475726500006044820152fd5b634e487b7160e01b8b526041875260248bfd5b875162461bcd60e51b8152602081850152601d60248201527f45524332305065726d69743a206578706972656420646561646c696e650000006044820152606490fd5b8680fd5b9050346106da5760e03660031901126106da5767ffffffffffffffff81358181116106d6576103679036908401611250565b916024358281116106d25761037f9036908301611250565b6044359060ff821680920361033157606435938085168095036106ce576084356001600160a01b03811696908790036106ca5760a4359761ffff891689036106c6576007549060ff8260a01c1661068e575060ff60a01b1916600160a01b17600755805182811161067b57806103f58b546112a7565b92601f93848111610622575b506020908483116001146105b3578c926105a8575b50508160011b916000199060031b1c19161789555b825191821161059557819060019361044385546112a7565b828111610538575b5060209183116001146104cd578a926104c2575b5050600019600383901b1c191690821b1790555b60ff1982541617905567ffffffffffffffff1960025416176002556007549161ffff60a81b9060a81b16916bffffffffffffffffff0000ff60a01b16171760075560c4356008556102956112e1565b01519050388061045f565b848b52849350600080516020611a9d8339815191529190601f1984168c5b81811061052057508411610507575b505050811b019055610473565b015160001960f88460031b161c191690553880806104fa565b828401518555879690940193602093840193016104eb565b90919250848b52600080516020611a9d8339815191528380860160051c8201926020871061058c575b91869588929594930160051c01915b82811061057e57505061044b565b8d8155869550879101610570565b92508192610561565b634e487b7160e01b895260418552602489fd5b015190503880610416565b8c8052600080516020611a7d8339815191529250601f1984168d5b81811061060a57509084600195949392106105f1575b505050811b01895561042b565b015160001960f88460031b161c191690553880806105e4565b929360206001819287860151815501950193016105ce565b9091508b8052600080516020611a7d8339815191528480850160051c82019260208610610672575b9085949392910160051c01905b8181106106645750610401565b8d8155849350600101610657565b9250819261064a565b634e487b7160e01b8a526041865260248afd5b5162461bcd60e51b81526020818801526013602482015272105b1c9958591e481a5b9a5d1a585b1a5e9959606a1b6044820152606490fd5b8980fd5b8880fd5b8780fd5b8580fd5b8480fd5b8280fd5b50503461015c578060031936011261015c576020906107086106fe6111af565b6024359033611416565b5160018152f35b905082346107bc57826003193601126107bc5761072a6111af565b918360243592338152600660205281812060018060a01b038616825260205220549082821061076b576020856107088661076487876113e6565b90336115e0565b608490602086519162461bcd60e51b8352820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f77604482015264207a65726f60d81b6064820152fd5b80fd5b83833461015c57606036600319011261015c5767ffffffffffffffff928035848111610aed576107f29036908301611250565b936024358181116106d65761080a9036908401611250565b91604435938285168095036106d25761082e60018060a01b03600754163314611594565b8483600254161015610aaa57508551828111610a97578061084f87546112a7565b97601f98898111610a3e575b506020908983116001146109cf5788926109c4575b50508160011b916000199060031b1c19161785555b82519182116109b1575060019161089c83546112a7565b868111610961575b5060209582116001146108f75794849582939495926108ec575b5050600019600383901b1c191690821b1790555b67ffffffffffffffff1960025416176002556102956112e1565b0151905085806108be565b828552601f19821695600080516020611a9d83398151915291865b88811061094b5750838596979810610932575b505050811b0190556108d2565b015160001960f88460031b161c19169055858080610925565b8183015184559285019260209283019201610912565b838652600080516020611a9d8339815191528780850160051c820192602086106109a8575b0160051c019084905b82811061099d5750506108a4565b87815501849061098f565b92508192610986565b634e487b7160e01b855260419052602484fd5b015190508880610870565b888052600080516020611a7d8339815191529250601f198416895b818110610a265750908460019594939210610a0d575b505050811b018555610885565b015160001960f88460031b161c19169055888080610a00565b929360206001819287860151815501950193016109ea565b909150878052600080516020611a7d8339815191528980850160051c82019260208610610a8e575b9085949392910160051c01905b818110610a80575061085b565b898155849350600101610a73565b92508192610a66565b634e487b7160e01b865260418252602486fd5b906020606492519162461bcd60e51b8352820152601e60248201527f63757272656e74206d6574616461746120697320757020746f206461746500006044820152fd5b8380fd5b8391503461015c578260031936011261015c57610b0c6111af565b600754602435916001600160a01b0391610b299083163314611594565b16918215610be65782845260056020528484205490828210610b985750818495610b767fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef946020946113e6565b8587526005845281872055610b8d826003546113e6565b60035551908152a380f35b608490602087519162461bcd60e51b8352820152602260248201527f45524332303a206275726e20616d6f756e7420657863656564732062616c616e604482015261636560f01b6064820152fd5b608490602086519162461bcd60e51b8352820152602160248201527f45524332303a206275726e2066726f6d20746865207a65726f206164647265736044820152607360f81b6064820152fd5b50503461015c578160031936011261015c5760209061ffff60075460a81c169051908152f35b50503461015c578160031936011261015c57805190826001805491610c7d836112a7565b80865292828116908115610d065750600114610cbc575b505050610ca682610cb894038361122e565b5191829160208352602083019061118a565b0390f35b9450808552600080516020611a9d8339815191525b828610610cee57505050610ca6826020610cb89582010194610c94565b80546020878701810191909152909501948101610cd1565b610cb8975086935060209250610ca694915060ff191682840152151560051b82010194610c94565b50503461015c578160031936011261015c5760075490516001600160a01b039091168152602090f35b9050346106da57826003193601126106da57610d7161133d565b918051610d7d816111e0565b600194858252602091603160f81b83820152610d97611810565b938051918483019683881067ffffffffffffffff8911176109b1575093879592610dee838b978a859652878452610de182519a601f60f81b8c5260e0878d015260e08c019061118a565b918a8303908b015261118a565b9346606089015230608089015260a088015286840360c088015251928381520195925b828110610e1e5785870386f35b8351875295810195928101928401610e11565b50503461015c57602036600319011261015c5760209181906001600160a01b03610e596111af565b168152600e845220549051908152f35b50503461015c57602036600319011261015c5760209181906001600160a01b03610e916111af565b1681526005845220549051908152f35b919050346106da57806003193601126106da57610ebc6111af565b60075460243592916001600160a01b0391610eda9083163314611594565b16928315610f3757506020827fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef92610f158795600354611409565b60035585855260058352808520610f2d838254611409565b905551908152a380f35b6020606492519162461bcd60e51b8352820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f2061646472657373006044820152fd5b50503461015c578160031936011261015c576020906008549051908152f35b50503461015c578060031936011261015c57610708602092610764610fbb6111af565b338352600686528483206001600160a01b03821684528652918490205460243590611409565b50503461015c578160031936011261015c57602090610ffe611798565b9051908152f35b8284346107bc57806003193601126107bc575060ff60209254169051908152f35b905082346107bc5760603660031901126107bc576110426111af565b918361104c6111ca565b9261105b604435809587611416565b6001600160a01b0385168152600660209081528282203383529052205490828210611099576020856107088661109187876113e6565b9033906115e0565b608490602086519162461bcd60e51b8352820152602860248201527f45524332303a207472616e7366657220616d6f756e74206578636565647320616044820152676c6c6f77616e636560c01b6064820152fd5b50503461015c578160031936011261015c576020906003549051908152f35b50503461015c578060031936011261015c5760209061070861112c6111af565b60243590336115e0565b50503461015c578160031936011261015c57610cb89061115461133d565b905191829160208352602083019061118a565b60005b83811061117a5750506000910152565b818101518382015260200161116a565b906020916111a381518092818552858086019101611167565b601f01601f1916010190565b600435906001600160a01b03821682036111c557565b600080fd5b602435906001600160a01b03821682036111c557565b6040810190811067ffffffffffffffff8211176111fc57604052565b634e487b7160e01b600052604160045260246000fd5b60e0810190811067ffffffffffffffff8211176111fc57604052565b90601f8019910116810190811067ffffffffffffffff8211176111fc57604052565b81601f820112156111c55780359067ffffffffffffffff82116111fc5760405192611285601f8401601f19166020018561122e565b828452602083830101116111c557816000926020809301838601378301015290565b90600182811c921680156112d7575b60208310146112c157565b634e487b7160e01b600052602260045260246000fd5b91607f16916112b6565b6112e96117de565b6112f1611810565b81600d5414801590611331575b611306575050565b46600a55600b80546001600160a01b0319163017905561132681836116e2565b600955600c55600d55565b5080600c5414156112fe565b60405190600082815491611350836112a7565b808352926001908181169081156113c45750600114611379575b506113779250038361122e565b565b60008080529150600080516020611a7d8339815191525b8483106113a9575061137793505081016020013861136a565b81935090816020925483858a01015201910190918592611390565b90506020925061137794915060ff191682840152151560051b8201013861136a565b919082039182116113f357565b634e487b7160e01b600052601160045260246000fd5b919082018092116113f357565b6001600160a01b0390811691821561154157169182156114f0576000828152600560205260408120549180831061149c576040602092611477837fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef966113e6565b868252600585528282205586815220611491828254611409565b9055604051908152a3565b60405162461bcd60e51b815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e7420657863656564732062604482015265616c616e636560d01b6064820152608490fd5b60405162461bcd60e51b815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201526265737360e81b6064820152608490fd5b60405162461bcd60e51b815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f206164604482015264647265737360d81b6064820152608490fd5b1561159b57565b60405162461bcd60e51b815260206004820152601760248201527f63616c6c6572206973206e6f7420746865206f776e65720000000000000000006044820152606490fd5b6001600160a01b0390811691821561169157169182156116415760207f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925918360005260068252604060002085600052825280604060002055604051908152a3565b60405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604482015261737360f01b6064820152608490fd5b60405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646044820152637265737360e01b6064820152608490fd5b90604051906116f0826111e0565b600191828152602092603160f81b84830152604051918460005b83811061178457505050600060218301528152611726816111e0565b828151910120604051928301937fd87cd6ef79d4e2b95e15ce8abf732db51ec771f1ca2edccf22a46c729ac564728552604084015260608301524660808301523060a083015260c082015260c0815261177e81611212565b51902090565b81818401015182828701015201859061170a565b600b546001600160a01b03163014806117d3575b156117b75760095490565b6117d06117c26117de565b6117ca611810565b906116e2565b90565b50600a5446146117ac565b6117e661133d565b60405161177e602082816118038183019687815193849201611167565b810103808452018261122e565b60075460085460405190602082019261ffff60f01b9060481b1683526022820152602281526060810181811067ffffffffffffffff8211176111fc5760405251902090565b60058110156119b157806118665750565b600181036118b35760405162461bcd60e51b815260206004820152601860248201527f45434453413a20696e76616c6964207369676e617475726500000000000000006044820152606490fd5b600281036119005760405162461bcd60e51b815260206004820152601f60248201527f45434453413a20696e76616c6964207369676e6174757265206c656e677468006044820152606490fd5b600381036119585760405162461bcd60e51b815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202773272076616c604482015261756560f01b6064820152608490fd5b60041461196157565b60405162461bcd60e51b815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202776272076616c604482015261756560f01b6064820152608490fd5b634e487b7160e01b600052602160045260246000fd5b9291907f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a08311611a705760ff16601b81141580611a65575b611a59579160809493916020936040519384528484015260408301526060820152600093849182805260015afa15611a4c5781516001600160a01b03811615611a46579190565b50600190565b50604051903d90823e3d90fd5b50505050600090600490565b50601c8114156119ff565b5050505060009060039056fe290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563b10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6a26469706673582212209c2a6ab851b98b79f450a0f6c6580132088da5913ef53a145eab9f7b320248f664736f6c63430008130033';

type TokenImplementationConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: TokenImplementationConstructorParams,
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class TokenImplementation__factory extends ContractFactory {
  constructor(...args: TokenImplementationConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string },
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      TokenImplementation & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(
    runner: ContractRunner | null,
  ): TokenImplementation__factory {
    return super.connect(runner) as TokenImplementation__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TokenImplementationInterface {
    return new Interface(_abi) as TokenImplementationInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null,
  ): TokenImplementation {
    return new Contract(
      address,
      _abi,
      runner,
    ) as unknown as TokenImplementation;
  }
}
