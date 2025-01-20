import React from 'react';
import { useFhevm } from '../hooks/FHEhook';

function Faucet() {
    const { instance, loading } = useFhevm();

    const handleTokenRequest = (token) => {
        const { publicKey, privateKey } = instance.generateKeypair();
        console.log("Public Key:", publicKey);
    };

    return (
        <div className="bg-white/20 backdrop-blur-lg border border-white/20 rounded-lg p-8 w-full max-w-lg shadow-2xl space-y-6">
            <h1 className="text-3xl font-semibold text-white text-center">Request Tokens from Faucet</h1>

            <div className="flex flex-col items-center space-y-6">
                <button
                    onClick={() => handleTokenRequest('ETH')}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-lg shadow-md hover:bg-indigo-600 transition-colors duration-300"
                >
                    Request ETH
                </button>

                <button
                    onClick={() => handleTokenRequest('USDT')}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg shadow-md hover:bg-green-600 transition-colors duration-300"
                >
                    Request USDT
                </button>

                <button
                    onClick={() => handleTokenRequest('BTC')}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-700 text-white rounded-lg shadow-md hover:bg-orange-600 transition-colors duration-300"
                >
                    Request BTC
                </button>
            </div>
        </div>
    );
}

export default Faucet;
