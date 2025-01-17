import React, { useState } from 'react';

function Swap() {
    const [amountFrom, setAmountFrom] = useState('');
    const [amountTo, setAmountTo] = useState('');
    const [selectedTokenFrom, setSelectedTokenFrom] = useState('ETH');
    const [selectedTokenTo, setSelectedTokenTo] = useState('USDT');

    const handleAmountChange = (e) => {
        setAmountFrom(e.target.value);
        // Just for demo purposes, we simulate token conversion
        setAmountTo((e.target.value * 2000).toFixed(2)); // Assume 1 ETH = 2000 USDT
    };

    const handleSwap = () => {
        alert(`Swapping ${amountFrom} ${selectedTokenFrom} to ${amountTo} ${selectedTokenTo}`);
    };

    return (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-8 w-full max-w-2xl shadow-2xl space-y-6">
            <h1 className="text-3xl font-semibold text-white text-center">Swap Tokens</h1>

            <div className="flex flex-col space-y-4">
                {/* From Token */}
                <div className="flex items-center justify-between">
                    <input
                        type="number"
                        value={amountFrom}
                        onChange={handleAmountChange}
                        placeholder="0.0"
                        className="w-3/4 px-4 py-2 rounded-lg bg-transparent border-2 border-white/40 text-white text-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <div className="flex items-center space-x-2">
                        <select
                            value={selectedTokenFrom}
                            onChange={(e) => setSelectedTokenFrom(e.target.value)}
                            className="bg-transparent text-white border-b-2 border-white/40 focus:outline-none"
                        >
                            <option value="ETH">ETH</option>
                            <option value="USDT">USDT</option>
                            <option value="BTC">BTC</option>
                        </select>
                    </div>
                </div>

                {/* To Token */}
                <div className="flex items-center justify-between">
                    <input
                        type="number"
                        value={amountTo}
                        disabled
                        placeholder="0.0"
                        className="w-3/4 px-4 py-2 rounded-lg bg-transparent border-2 border-white/40 text-white text-xl focus:outline-none"
                    />
                    <div className="flex items-center space-x-2">
                        <select
                            value={selectedTokenTo}
                            onChange={(e) => setSelectedTokenTo(e.target.value)}
                            className="bg-transparent text-white border-b-2 border-white/40 focus:outline-none"
                        >
                            <option value="USDT">USDT</option>
                            <option value="ETH">ETH</option>
                            <option value="BTC">BTC</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Swap Button */}
            <button
                onClick={handleSwap}
                className="w-full py-3 bg-sky-500 text-white rounded-lg shadow-md hover:bg-sky-600 transition-colors duration-300"
            >
                Swap Now
            </button>
        </div>
    );
}

export default Swap;
