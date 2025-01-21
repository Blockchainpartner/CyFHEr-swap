import React, { useState } from 'react'
import { useFhevm } from '../hooks/FHEhook';
import { TOKEN_CONTRACT } from '../constants/contracts';

import { ERC_CONTRACT_ABI } from '../ABI/ERC20ABI';
import { ethers } from 'ethers';


function Dashboard() {


    const [selectedToken, setSelectedToken] = useState('pEUR'); // Default token as EUR
    const [balance, setBalance] = useState(null);
    const { instance, loading } = useFhevm();

    const handleCheckBalance = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractAddress = TOKEN_CONTRACT[selectedToken];
        const contractABI = ERC_CONTRACT_ABI;
        const { publicKey, privateKey } = instance.generateKeypair();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const eip712 = instance.createEIP712(publicKey, contractAddress);
        const params = [signer.address, JSON.stringify(eip712)];
        const signature = await window.ethereum.request({ method: "eth_signTypedData_v4", params });
        const handle = await contract.balanceOf(signer.address); // returns the handle of hte ciphertext as a uint256 (bigint)
        console.log(handle)
        // handle decrypting
        const myBalance = await instance.reencrypt(handle, privateKey, publicKey, signature, contractAddress, signer.address);
        setBalance(Number(myBalance))


    };


    return (
        <div className="bg-white/20 backdrop-blur-lg border border-white/20 rounded-lg p-8 w-full max-w-lg shadow-2xl space-y-6">
            <h1 className="text-3xl font-semibold text-white text-center">Token Balance</h1>
            <div className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                    {/* Token Selector */}
                    <select
                        value={selectedToken}
                        onChange={(e) => setSelectedToken(e.target.value)}
                        className="w-full bg-transparent text-white border border-white/40 rounded-lg py-2 px-4"
                    >
                        <option value="pEUR">Private EURO (pEUR)</option>
                        <option value="pUSD">Private USD (pUSD)</option>
                        <option value="pGBP">Private GBP (pGBP)</option>
                    </select>

                    {/* Check Balance Button */}
                    <button
                        onClick={handleCheckBalance}
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-300"
                    >
                        Check Balance
                    </button>
                </div>

                {/* Display Balance */}
                {balance !== null && (
                    <div className="text-center text-white text-lg mt-4">
                        <p>Your balance is:</p>
                        <p className="font-bold text-2xl">{balance + "  " + selectedToken} </p>
                    </div>
                )}
            </div>
        </div>

    )
}

export default Dashboard