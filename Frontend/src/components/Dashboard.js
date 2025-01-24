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
        // these should be generated only once and stored in the app 
        const { publicKey, privateKey } = instance.generateKeypair();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const eip712 = instance.createEIP712(publicKey, contractAddress);
        const params = [signer.address, JSON.stringify(eip712)];
        // TODO : to fix error handling
        const signature = await window.ethereum.request({ method: "eth_signTypedData_v4", params });


        const handle = await contract.balanceOf(signer.address); // returns the handle of hte ciphertext as a uint256 (bigint)

        // handle decrypting
        try {

            const myBalance = await instance.reencrypt(handle, privateKey, publicKey, signature, contractAddress, signer.address);
            setBalance(Number(myBalance))

        }
        catch (error) { console.error(error) }



    };


    return (
        <div className="bg-black text-white w-1/2  px-10 py-6 rounded-xl shadow-lg mx-auto relative border border-purple-800 
        before:absolute before:inset-0 before:rounded-xl before:blur-lg before:bg-purple-600 before:opacity-50 before:-z-10">
            <h1 className="text-2xl font-semibold text-white text-center">Token Balance</h1>
            <div className="flex items-center space-x-4">
                {/* Stylish Token Selector */}
                <div className="flex-1">
                    <label
                        htmlFor="tokens"
                        className="block mb-2 text-sm font-medium text-white"
                    >
                        Select Token
                    </label>
                    <select
                        id="tokens"
                        value={selectedToken}
                        onChange={(e) => setSelectedToken(e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 shadow-sm transition duration-300"
                    >
                        <option value="pEUR">Private EURO (pEUR)</option>
                        <option value="pUSD">Private USD (pUSD)</option>
                        <option value="pGBP">Private GBP (pGBP)</option>
                    </select>
                </div>

                {/* Check Balance Button */}
                <button
                    onClick={handleCheckBalance}
                    className="flex-none mt-6 py-2 px-5 bg-gradient-to-r from-violet-500 to-violet-700 text-white font-semibold rounded-lg shadow-md hover:from-violet-400 hover:to-violet-600 transition-colors duration-200 focus:ring-2 focus:ring-violet-400"
                >
                    Decrypt Balance
                </button>
            </div>


            {/* Display Balance */}
            {balance !== null && (
                <div className="text-center text-white text-lg mt-4">
                    <p>Your balance is:</p>
                    <p className="font-bold text-2xl">{balance + " " + selectedToken}</p>
                </div>
            )}
        </div>



    )
}

export default Dashboard