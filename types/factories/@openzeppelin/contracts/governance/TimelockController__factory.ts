/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type {
  Signer,
  BigNumberish,
  AddressLike,
  ContractDeployTransaction,
  ContractRunner,
} from "ethers";
import type { NonPayableOverrides } from "../../../../common";
import type {
  TimelockController,
  TimelockControllerInterface,
} from "../../../../@openzeppelin/contracts/governance/TimelockController";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "minDelay",
        type: "uint256",
      },
      {
        internalType: "address[]",
        name: "proposers",
        type: "address[]",
      },
      {
        internalType: "address[]",
        name: "executors",
        type: "address[]",
      },
      {
        internalType: "address",
        name: "admin",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "AccessControlBadConfirmation",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "neededRole",
        type: "bytes32",
      },
    ],
    name: "AccessControlUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [],
    name: "FailedInnerCall",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "delay",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minDelay",
        type: "uint256",
      },
    ],
    name: "TimelockInsufficientDelay",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "targets",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "payloads",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "values",
        type: "uint256",
      },
    ],
    name: "TimelockInvalidOperationLength",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "caller",
        type: "address",
      },
    ],
    name: "TimelockUnauthorizedCaller",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "predecessorId",
        type: "bytes32",
      },
    ],
    name: "TimelockUnexecutedPredecessor",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "operationId",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "expectedStates",
        type: "bytes32",
      },
    ],
    name: "TimelockUnexpectedOperationState",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "CallExecuted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "salt",
        type: "bytes32",
      },
    ],
    name: "CallSalt",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "predecessor",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "delay",
        type: "uint256",
      },
    ],
    name: "CallScheduled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
    ],
    name: "Cancelled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "oldDuration",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "newDuration",
        type: "uint256",
      },
    ],
    name: "MinDelayChange",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32",
      },
    ],
    name: "RoleAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleRevoked",
    type: "event",
  },
  {
    inputs: [],
    name: "CANCELLER_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "EXECUTOR_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PROPOSER_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
    ],
    name: "cancel",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "payload",
        type: "bytes",
      },
      {
        internalType: "bytes32",
        name: "predecessor",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "salt",
        type: "bytes32",
      },
    ],
    name: "execute",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "targets",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "values",
        type: "uint256[]",
      },
      {
        internalType: "bytes[]",
        name: "payloads",
        type: "bytes[]",
      },
      {
        internalType: "bytes32",
        name: "predecessor",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "salt",
        type: "bytes32",
      },
    ],
    name: "executeBatch",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "getMinDelay",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
    ],
    name: "getOperationState",
    outputs: [
      {
        internalType: "enum TimelockController.OperationState",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
    ],
    name: "getTimestamp",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        internalType: "bytes32",
        name: "predecessor",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "salt",
        type: "bytes32",
      },
    ],
    name: "hashOperation",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "targets",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "values",
        type: "uint256[]",
      },
      {
        internalType: "bytes[]",
        name: "payloads",
        type: "bytes[]",
      },
      {
        internalType: "bytes32",
        name: "predecessor",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "salt",
        type: "bytes32",
      },
    ],
    name: "hashOperationBatch",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
    ],
    name: "isOperation",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
    ],
    name: "isOperationDone",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
    ],
    name: "isOperationPending",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
    ],
    name: "isOperationReady",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "onERC1155BatchReceived",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "onERC1155Received",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "onERC721Received",
    outputs: [
      {
        internalType: "bytes4",
        name: "",
        type: "bytes4",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "callerConfirmation",
        type: "address",
      },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "target",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        internalType: "bytes32",
        name: "predecessor",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "salt",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "delay",
        type: "uint256",
      },
    ],
    name: "schedule",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "targets",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "values",
        type: "uint256[]",
      },
      {
        internalType: "bytes[]",
        name: "payloads",
        type: "bytes[]",
      },
      {
        internalType: "bytes32",
        name: "predecessor",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "salt",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "delay",
        type: "uint256",
      },
    ],
    name: "scheduleBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "newDelay",
        type: "uint256",
      },
    ],
    name: "updateDelay",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;

const _bytecode =
  "0x6080604052346200017c5762001acc803803806200001d8162000181565b9283398101906080818303126200017c57805160208201516001600160401b03908181116200017c578462000054918501620001d2565b9360408401519182116200017c57620000766060916200007e938601620001d2565b9301620001bd565b906200008a3062000295565b506001600160a01b039180831662000169575b5060005b8451811015620000f05780620000c984620000c1620000ea94896200026a565b511662000315565b50620000e384620000db83896200026a565b5116620003b7565b5062000244565b620000a1565b50925060005b8251811015620001245780620000e383620001166200011e94876200026a565b511662000454565b620000f6565b7f11c24f4ead16507c69ac467fbd5e4eed5fb5c699626d2cc6d66421df253886d560408580600255815190600082526020820152a16040516115ba9081620004f28239f35b620001749062000295565b50386200009d565b600080fd5b6040519190601f01601f191682016001600160401b03811183821017620001a757604052565b634e487b7160e01b600052604160045260246000fd5b51906001600160a01b03821682036200017c57565b81601f820112156200017c578051916001600160401b038311620001a7578260051b60209283806200020681850162000181565b8097815201928201019283116200017c578301905b8282106200022a575050505090565b8380916200023884620001bd565b8152019101906200021b565b6000198114620002545760010190565b634e487b7160e01b600052601160045260246000fd5b80518210156200027f5760209160051b010190565b634e487b7160e01b600052603260045260246000fd5b6001600160a01b031660008181527fad3228b676f7d3cd4284a5443f17f1962b36e491b30a40b2405849e597ba5fb5602052604081205490919060ff166200031157818052816020526040822081835260205260408220600160ff19825416179055339160008051602062001aac8339815191528180a4600190565b5090565b6001600160a01b031660008181527f3412d5605ac6cd444957cedb533e5dacad6378b4bc819ebe3652188a665066d560205260408120549091907fb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc19060ff16620003b257808352826020526040832082845260205260408320600160ff1982541617905560008051602062001aac833981519152339380a4600190565b505090565b6001600160a01b031660008181527fc3ad33e20b0c56a223ad5104fff154aa010f8715b9c981fd38fdc60a4d1a52fb60205260408120549091907ffd643c72710c63c0180259aba6b2d05451e3591a24e58b62239378085726f7839060ff16620003b257808352826020526040832082845260205260408320600160ff1982541617905560008051602062001aac833981519152339380a4600190565b6001600160a01b031660008181527fdae2aa361dfd1ca020a396615627d436107c35eff9fe7738a3512819782d706960205260408120549091907fd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e639060ff16620003b257808352826020526040832082845260205260408320600160ff1982541617905560008051602062001aac833981519152339380a460019056fe60406080815260049081361015610020575b5050361561001e57600080fd5b005b600091823560e01c90816301d5062a14610b7157816301ffc9a714610afe57816307bd026514610ac357838263134008d314610a075750816313bc9f20146109e7578163150b7a0214610991578163248a9ca3146109675781632ab0f529146109475781632f2ff15d1461091d57816331d50750146108fd57816336568abe146108b7578163584b153e1461088e57816364d62353146108225781637958004c146107df5781638065657f146107bd5781638f2a0bb0146106095781638f61f4f5146105ce57816391d1485414610589578163a217fddf1461056e578163b08e51c014610533578163b1c5f42714610507578163bc197c8114610480578163c4d252f5146103b1578163d45c443514610389578163d547741f14610344578163e38335e5146101d9578163f23a6e6114610180575063f27a0c9203610011573461017c578160031936011261017c576020906002549051908152f35b5080fd5b8284346101d65760a03660031901126101d65761019b610c50565b506101a4610c6b565b506084359067ffffffffffffffff82116101d657506020926101c891369101610d52565b505163f23a6e6160e01b8152f35b80fd5b90506101e436610dca565b9098949591939296977fd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e638b528a602052858b208b805260205260ff868c20541615610336575b83831480159061032c575b6102e8575061024d610254918a868a878b888f6111db565b98896114fc565b885b81811061026a57896102678a611562565b80f35b80808a7fc2617efa69bab66782fa219543714338489c4e9e178271560a91b82c3f612b588a8a6102db6102c38f988c6102bc828e6102b68f6102e39f6102b1918591611392565b6113b8565b97611392565b35956113cc565b906102d0828287876114a7565b8d519485948561147f565b0390a361136d565b610256565b85517fffb032110000000000000000000000000000000000000000000000000000000081529081019283526020830185905260408301849052918291506060010390fd5b5084831415610235565b61033f33610f16565b61022a565b91905034610385578060031936011261038557610381913561037c6001610369610c6b565b9383875286602052862001543390610f7b565b61102c565b5080f35b8280fd5b9050346103855760203660031901126103855760209282913581526001845220549051908152f35b91905034610385576020366003190112610385578135917ffd643c72710c63c0180259aba6b2d05451e3591a24e58b62239378085726f7838085528460205282852033865260205260ff838620541615610465575061040f836110cf565b156104495750829082825260016020528120557fbaa1eb22f2a492ba1a5fea61b8df4d27c6c8b5f3971e63bb58fa14ff72eedb708280a280f35b826044925191635ead8eb560e01b835282015260066024820152fd5b604492519163e2517d3f60e01b835233908301526024820152fd5b8284346101d65760a03660031901126101d65761049b610c50565b506104a4610c6b565b5067ffffffffffffffff9060443582811161017c576104c69036908601610e2c565b5060643582811161017c576104de9036908601610e2c565b506084359182116101d657506020926104f991369101610d52565b505163bc197c8160e01b8152f35b50503461017c5760209061052c61051d36610dca565b969590959491949392936111db565b9051908152f35b50503461017c578160031936011261017c57602090517ffd643c72710c63c0180259aba6b2d05451e3591a24e58b62239378085726f7838152f35b50503461017c578160031936011261017c5751908152602090f35b9050346103855781600319360112610385578160209360ff926105aa610c6b565b903582528186526001600160a01b0383832091168252855220541690519015158152f35b50503461017c578160031936011261017c57602090517fb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc18152f35b919050346103855760c03660031901126103855767ffffffffffffffff9082358281116107b95761063d9036908501610d99565b936024358481116107b5576106559036908301610d99565b946044359081116107b15761066d9036908401610d99565b606493919335906084359760a4359361068533610e93565b818b148015906107a7575b61076357506106a689848489858f8b908e6111db565b996106b1858c61140e565b8a8c5b8a8382106106fa578e838e83816106c9578380f35b7f20fda5fd27a1ea7bf5b9567f143ac5470bb059374a27e8f67cb44f946f6d03879160209151908152a28180808380f35b61075c927f4cf4410cc57040e44862ef0f45f3dd5a5e02db8eb8add648d4b0e236f1d07dca8b8b6102db8f8c88978f92898f8f8f61074a916107446102b186809461075199611392565b9a611392565b35986113cc565b915196879687611334565b8b906106b4565b88517fffb032110000000000000000000000000000000000000000000000000000000081529081018b81526020810184905260408101929092529081906060010390fd5b50828b1415610690565b8780fd5b8680fd5b8480fd5b50503461017c5760209061052c6107d336610caf565b94939093929192611185565b83833461017c57602036600319011261017c576107fc8335611128565b9051918382101561080f57602083838152f35b634e487b7160e01b815260218452602490fd5b919050346103855760203660031901126103855781359130330361087857507f11c24f4ead16507c69ac467fbd5e4eed5fb5c699626d2cc6d66421df253886d5906002548151908152836020820152a160025580f35b602491519063e2850c5960e01b82523390820152fd5b8284346101d65760203660031901126101d657506108ae602092356110cf565b90519015158152f35b83833461017c578060031936011261017c576108d1610c6b565b90336001600160a01b038316036108ee575061038191923561102c565b5163334bd91960e11b81528390fd5b8284346101d65760203660031901126101d657506108ae602092356110a2565b9190503461038557806003193601126103855761038191356109426001610369610c6b565b610fad565b8284346101d65760203660031901126101d657506108ae60209235611110565b90503461038557602036600319011261038557816020936001923581528085522001549051908152f35b8284346101d65760803660031901126101d6576109ac610c50565b506109b5610c6b565b506064359067ffffffffffffffff82116101d657506020926109d991369101610d52565b5051630a85bd0160e11b8152f35b8284346101d65760203660031901126101d657506108ae602092356110f8565b610267610a9782610aad7fc2617efa69bab66782fa219543714338489c4e9e178271560a91b82c3f612b58610a8e89610a3f36610caf565b7fd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e638b9a9697939598929a528a602052828b208b805260205260ff838c20541615610ab5575b8985858a8a611185565b998a98896114fc565b610aa3838388886114a7565b519485948561147f565b0390a3611562565b610abe33610f16565b610a84565b50503461017c578160031936011261017c57602090517fd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e638152f35b90503461038557602036600319011261038557359063ffffffff60e01b82168092036103855760209250630271189760e51b8214918215610b43575b50519015158152f35b909150637965db0b60e01b8114908115610b60575b509038610b3a565b6301ffc9a760e01b14905038610b58565b919050346103855760c036600319011261038557610b8d610c50565b908360243560443567ffffffffffffffff8111610385577f4cf4410cc57040e44862ef0f45f3dd5a5e02db8eb8add648d4b0e236f1d07dca95610bd291369101610c81565b95909160643595610c136084359760a43590610bed33610e93565b610bfb8a828d8a8989611185565b9a8b97610c08848a61140e565b8a5196879687611334565b0390a381610c1f578380f35b7f20fda5fd27a1ea7bf5b9567f143ac5470bb059374a27e8f67cb44f946f6d03879160209151908152a23880808380f35b600435906001600160a01b0382168203610c6657565b600080fd5b602435906001600160a01b0382168203610c6657565b9181601f84011215610c665782359167ffffffffffffffff8311610c665760208381860195010111610c6657565b60a0600319820112610c66576004356001600160a01b0381168103610c665791602435916044359067ffffffffffffffff8211610c6657610cf291600401610c81565b90916064359060843590565b90601f8019910116810190811067ffffffffffffffff821117610d2057604052565b634e487b7160e01b600052604160045260246000fd5b67ffffffffffffffff8111610d2057601f01601f191660200190565b81601f82011215610c6657803590610d6982610d36565b92610d776040519485610cfe565b82845260208383010111610c6657816000926020809301838601378301015290565b9181601f84011215610c665782359167ffffffffffffffff8311610c66576020808501948460051b010111610c6657565b9060a0600319830112610c665767ffffffffffffffff600435818111610c665783610df791600401610d99565b93909392602435838111610c665782610e1291600401610d99565b93909392604435918211610c6657610cf291600401610d99565b9080601f83011215610c665781359067ffffffffffffffff8211610d20578160051b60405193602093610e6185840187610cfe565b85528380860192820101928311610c66578301905b828210610e84575050505090565b81358152908301908301610e76565b6001600160a01b031660008181527f3412d5605ac6cd444957cedb533e5dacad6378b4bc819ebe3652188a665066d560205260409020547fb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc19060ff1615610ef8575050565b604492506040519163e2517d3f60e01b835260048301526024820152fd5b6001600160a01b031660008181527fdae2aa361dfd1ca020a396615627d436107c35eff9fe7738a3512819782d706960205260409020547fd8aa0f3194971a2a116679f7c2090f6939c8d4e01a2a8d7e41d55e5351469e639060ff1615610ef8575050565b8060005260006020526001600160a01b0360406000209216918260005260205260ff6040600020541615610ef8575050565b90600091808352826020526001600160a01b036040842092169182845260205260ff6040842054161560001461102757808352826020526040832082845260205260408320600160ff198254161790557f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d339380a4600190565b505090565b90600091808352826020526001600160a01b036040842092169182845260205260ff6040842054166000146110275780835282602052604083208284526020526040832060ff1981541690557ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b339380a4600190565b6110ab90611128565b60048110156110b957151590565b634e487b7160e01b600052602160045260246000fd5b6110d890611128565b60048110156110b957600181149081156110f0575090565b600291501490565b61110190611128565b60048110156110b95760021490565b61111990611128565b60048110156110b95760031490565b600052600160205260406000205480156000146111455750600090565b600181036111535750600390565b42101561115f57600190565b600290565b908060209392818452848401376000828201840152601f01601f1916010190565b946111bc6111d5949592936040519687956001600160a01b03602088019a168a52604087015260a0606087015260c0860191611164565b91608084015260a083015203601f198101835282610cfe565b51902090565b969294909695919560405196602091828901998060c08b0160a08d525260e08a01919060005b81811061130b57505050601f1997888a83030160408b01528082527f07ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8111610c66579089969495939897929160051b80928a830137019380888601878703606089015252604085019460408260051b82010195836000925b8484106112a1575050505050506111d59550608084015260a083015203908101835282610cfe565b9193969850919398999496603f198282030184528935601e1984360301811215610c6657830186810191903567ffffffffffffffff8111610c66578036038313610c66576112f488928392600195611164565b9b0194019401918b98969394919a9997959a611279565b9091928335906001600160a01b038216809203610c665790815285019285019190600101611201565b929093611363926001600160a01b0360809699989799168552602085015260a0604085015260a0840191611164565b9460608201520152565b600019811461137c5760010190565b634e487b7160e01b600052601160045260246000fd5b91908110156113a25760051b0190565b634e487b7160e01b600052603260045260246000fd5b356001600160a01b0381168103610c665790565b91908110156113a25760051b81013590601e1981360301821215610c6657019081359167ffffffffffffffff8311610c66576020018236038113610c66579190565b90611418826110a2565b61145f57600254808210611441575042019081421161137c576000526001602052604060002055565b6044925060405191635433660960e01b835260048301526024820152fd5b604051635ead8eb560e01b81526004810183905260016024820152604490fd5b6114a494926001600160a01b0360609316825260208201528160408201520191611164565b90565b6114f193600093928493826040519384928337810185815203925af13d156114f4573d906114d482610d36565b916114e26040519384610cfe565b82523d6000602084013e611582565b50565b606090611582565b611505816110f8565b15611543575080151580611533575b61151b5750565b6024906040519063121534c360e31b82526004820152fd5b5061153d81611110565b15611514565b60449060405190635ead8eb560e01b8252600482015260046024820152fd5b61156b816110f8565b156115435760005260016020526001604060002055565b9091906115ab575080511561159957805190602001fd5b604051630a12f52160e11b8152600490fd5b56fea164736f6c6343000814000a2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d";

type TimelockControllerConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: TimelockControllerConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class TimelockController__factory extends ContractFactory {
  constructor(...args: TimelockControllerConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    minDelay: BigNumberish,
    proposers: AddressLike[],
    executors: AddressLike[],
    admin: AddressLike,
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(
      minDelay,
      proposers,
      executors,
      admin,
      overrides || {}
    );
  }
  override deploy(
    minDelay: BigNumberish,
    proposers: AddressLike[],
    executors: AddressLike[],
    admin: AddressLike,
    overrides?: NonPayableOverrides & { from?: string }
  ) {
    return super.deploy(
      minDelay,
      proposers,
      executors,
      admin,
      overrides || {}
    ) as Promise<
      TimelockController & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): TimelockController__factory {
    return super.connect(runner) as TimelockController__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TimelockControllerInterface {
    return new Interface(_abi) as TimelockControllerInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): TimelockController {
    return new Contract(address, _abi, runner) as unknown as TimelockController;
  }
}
