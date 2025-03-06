export const ROUTER_CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_factory",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenA",
        type: "address",
      },
      {
        internalType: "address",
        name: "tokenB",
        type: "address",
      },
      {
        components: [
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
          {
            internalType: "int32",
            name: "securityZone",
            type: "int32",
          },
        ],
        internalType: "struct inEuint32",
        name: "encryptedAmountADesired",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
          {
            internalType: "int32",
            name: "securityZone",
            type: "int32",
          },
        ],
        internalType: "struct inEuint32",
        name: "encryptedAmountBDesired",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "publicKey",
            type: "bytes32",
          },
          {
            internalType: "bytes",
            name: "signature",
            type: "bytes",
          },
        ],
        internalType: "struct Permission",
        name: "permissionA",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "publicKey",
            type: "bytes32",
          },
          {
            internalType: "bytes",
            name: "signature",
            type: "bytes",
          },
        ],
        internalType: "struct Permission",
        name: "permissionB",
        type: "tuple",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "addLiquidity",
    outputs: [
      {
        internalType: "euint32",
        name: "amountA",
        type: "uint256",
      },
      {
        internalType: "euint32",
        name: "amountB",
        type: "uint256",
      },
      {
        internalType: "euint32",
        name: "liquidity",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "factory",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenA",
        type: "address",
      },
      {
        internalType: "address",
        name: "tokenB",
        type: "address",
      },
      {
        components: [
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
          {
            internalType: "int32",
            name: "securityZone",
            type: "int32",
          },
        ],
        internalType: "struct inEuint32",
        name: "encLiquidity",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "publicKey",
            type: "bytes32",
          },
          {
            internalType: "bytes",
            name: "signature",
            type: "bytes",
          },
        ],
        internalType: "struct Permission",
        name: "permissionA",
        type: "tuple",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "removeLiquidity",
    outputs: [
      {
        internalType: "euint32",
        name: "amountA",
        type: "uint256",
      },
      {
        internalType: "euint32",
        name: "amountB",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
          {
            internalType: "int32",
            name: "securityZone",
            type: "int32",
          },
        ],
        internalType: "struct inEuint32",
        name: "amountInInput",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
          {
            internalType: "int32",
            name: "securityZone",
            type: "int32",
          },
        ],
        internalType: "struct inEuint32",
        name: "amountOutMinInput",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "publicKey",
            type: "bytes32",
          },
          {
            internalType: "bytes",
            name: "signature",
            type: "bytes",
          },
        ],
        internalType: "struct Permission",
        name: "permissionA",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "bytes32",
            name: "publicKey",
            type: "bytes32",
          },
          {
            internalType: "bytes",
            name: "signature",
            type: "bytes",
          },
        ],
        internalType: "struct Permission",
        name: "permissionB",
        type: "tuple",
      },
      {
        internalType: "address[]",
        name: "path",
        type: "address[]",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "swapExactTokensForTokens",
    outputs: [
      {
        internalType: "uint256[]",
        name: "amounts",
        type: "uint256[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];
