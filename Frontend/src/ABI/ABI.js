export const CONTRACT_ADDRESS = "0x5abe554762E37C6FC6E2972dE440d4383D18120f";
export const CONTRACT_ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "getCounter",
        "outputs": [
            {
                "internalType": "euint8",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "einput",
                "name": "amount",
                "type": "bytes32"
            },
            {
                "internalType": "bytes",
                "name": "inputProof",
                "type": "bytes"
            }
        ],
        "name": "incrementBy",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]