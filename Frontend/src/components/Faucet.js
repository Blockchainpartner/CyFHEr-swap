import React from 'react';
import { ethers } from "ethers";
import toast from 'react-hot-toast';
import { DISTRIBUTOR_CONTRACT_ABI } from '../ABI/DistributorABI';
import { TOKEN_DISTRIBUTOR, PRIVATE_EUR, PRIVATE_GBP, PRIVATE_USD } from '../constants/contracts';



function Faucet() {
    const handleTokenRequest = async (TokenAddress) => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            // Specify the contract ABI and address
            const contractAddress = TOKEN_DISTRIBUTOR;
            const contractABI = DISTRIBUTOR_CONTRACT_ABI;
            const contract = new ethers.Contract(contractAddress, contractABI, signer);
            const tx = await contract.claim(TokenAddress);
            // Use toast.promise for better feedback
            await toast.promise(
                (async () => {
                    await tx.wait(); // Wait for transaction to complete
                })(),
                {
                    loading: 'Claiming tokens...',
                    success: 'Claim successful! 🎉',
                    error: 'An error occurred while claiming tokens 😢',
                }
            );
        } catch (error) {
            console.error(error);

        }

    };

    return (
        <div className="bg-black text-white w-[400px]  px-auto py-6 rounded-xl shadow-lg mx-auto relative border border-purple-800 
        before:absolute before:inset-0 before:rounded-xl before:blur-lg before:bg-purple-600 before:opacity-50 before:-z-10">
            <h1 className="text-2xl  mb-9 font-semibold text-white text-center">Request Tokens from Faucet</h1>

            <div className="flex flex-col items-center space-y-6">
                {/* Private EURO Button */}
                <button
                    onClick={() => handleTokenRequest(PRIVATE_EUR)}
                    className="w-3/4 py-2 text-lg bg-gradient-to-r from-blue-500 via-purple-500 to-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                    Request Private EURO Tokens
                </button>

                {/* Private USD Button */}
                <button
                    onClick={() => handleTokenRequest(PRIVATE_USD)}
                    className="w-3/4 py-2 text-lg bg-gradient-to-r from-green-400 via-teal-500 to-green-700 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                    Request Private USD Tokens
                </button>

                {/* Private GBP Button */}
                <button
                    onClick={() => handleTokenRequest(PRIVATE_GBP)}
                    className="w-3/4 py-2 text-lg bg-gradient-to-r from-orange-400 via-yellow-500 to-orange-700 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                    Request Private GBP Tokens
                </button>

            </div>


        </div>
    );
}

export default Faucet;
