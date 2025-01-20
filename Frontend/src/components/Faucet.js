import React from 'react';
import { useFhevm } from '../hooks/FHEhook';
import { ethers } from "ethers";
import { DISTRIBUTOR_CONTRACT_ABI } from '../ABI/ABI';
import { TOKEN_DISTRIBUTOR, PRIVATE_EUR, PRIVATE_GBP, PRIVATE_USD } from '../constants/contracts';


function Faucet() {
    const { instance, loading } = useFhevm();

    const handleTokenRequest = async (TokenAddress) => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            // Step 2: Specify the contract ABI and address
            const contractAddress = TOKEN_DISTRIBUTOR;
            const contractABI = DISTRIBUTOR_CONTRACT_ABI;
            const contract = new ethers.Contract(contractAddress, contractABI, signer);
            const tx = await contract.claim(TokenAddress);

            await tx.wait();
            console.log("claim successful")
            // handle successfull call 
        }
        catch (error) {//handle error
            console.log(error)
        }

    };

    return (
        <div className="bg-white/20 backdrop-blur-lg border border-white/20 rounded-lg p-8 w-half max-w-lg shadow-2xl space-y-6">
            <h1 className="text-3xl font-semibold text-white text-center">Request Tokens from Faucet</h1>

            <div className="flex flex-col items-center space-y-6">
                {/* Private EURO Button */}
                <button
                    onClick={() => handleTokenRequest(PRIVATE_EUR)}
                    className="w-3/4 py-4 text-lg bg-gradient-to-r from-blue-500 via-purple-500 to-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                    Request Private EURO Tokens
                </button>

                {/* Private USD Button */}
                <button
                    onClick={() => handleTokenRequest(PRIVATE_USD)}
                    className="w-3/4 py-4 text-lg bg-gradient-to-r from-green-400 via-teal-500 to-green-700 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                    Request Private USD Tokens
                </button>

                {/* Private GBP Button */}
                <button
                    onClick={() => handleTokenRequest(PRIVATE_GBP)}
                    className="w-3/4 py-4 text-lg bg-gradient-to-r from-orange-400 via-yellow-500 to-orange-700 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                    Request Private GBP Tokens
                </button>
            </div>
        </div>
    );
}

export default Faucet;
