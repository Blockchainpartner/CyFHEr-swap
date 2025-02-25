import React, { useState } from "react";

function Swap() {
    const [sellValue, setSellValue] = useState("");
    const [buyValue, setBuyValue] = useState("");
    const [selectedSellToken, setSelectedSellToken] = useState("pEUR");
    const [selectedBuyToken, setSelectedBuyToken] = useState("pUSD");
    const [isSellDropdownOpen, setSellDropdownOpen] = useState(false);
    const [isBuyDropdownOpen, setBuyDropdownOpen] = useState(false);

    // Available tokens for swapping
    const tokens = ["pEUR", "pGPD", "pUSD"];

    // Handle swapping Sell and Buy values
    const handleSwap = () => {
        const tempValue = sellValue;
        const tempToken = selectedSellToken;

        setSellValue(buyValue);
        setSelectedSellToken(selectedBuyToken);

        setBuyValue(tempValue);
        setSelectedBuyToken(tempToken);
    };

    return (
        <div
            className="bg-black md:ml-10 text-white md:w-3/4 p-6 rounded-xl shadow-lg relative border border-purple-800
            before:absolute before:inset-0 before:rounded-xl before:blur-lg before:bg-purple-600 before:opacity-50 before:-z-10"
        >
            {/* Sell Section */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <label className="text-sm text-gray-400">Sell</label>
                    <input
                        type="number"
                        placeholder="0"
                        value={sellValue}
                        onChange={(e) => setSellValue(e.target.value)}
                        className="block w-full bg-transparent text-3xl font-semibold text-white placeholder-gray-500 focus:outline-none"
                    />
                </div>
                <div className="relative">
                    <button
                        className="flex items-center bg-gray-800 px-3 py-1.5 rounded-full"
                        onClick={() => setSellDropdownOpen(!isSellDropdownOpen)}
                    >
                        <span>{selectedSellToken}</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 ml-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>
                    {/* Sell Dropdown */}
                    {isSellDropdownOpen && (
                        <ul className="absolute top-full mt-2 bg-gray-800 text-white rounded-md shadow-md z-10">
                            {tokens.map(
                                (token) =>
                                    token !== selectedBuyToken && ( // Exclude the Buy token from Sell dropdown
                                        <li
                                            key={token}
                                            className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                                            onClick={() => {
                                                setSelectedSellToken(token);
                                                setSellDropdownOpen(false);
                                            }}
                                        >
                                            {token}
                                        </li>
                                    )
                            )}
                        </ul>
                    )}
                </div>
            </div>

            {/* Divider */}
            < div className="flex justify-center items-center my-4 relative" >
                <div className="w-full h-px bg-gray-700" />
                <button
                    onClick={handleSwap}
                    className="absolute bg-gray-800 p-2 rounded-full shadow-md hover:ring-2 hover:ring-violet-500 transition-all duration-200"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-white hover:drop-shadow-[0_0_6px_rgba(139,92,246,1)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </button>
            </div>

            {/* Buy Section */}
            < div className="flex items-center justify-between mb-4" >
                <div>
                    <label className="text-sm text-gray-400">Buy</label>
                    <input
                        type="number"
                        placeholder="0"
                        value={buyValue}
                        onChange={(e) => setBuyValue(e.target.value)}
                        className="block w-full bg-transparent text-3xl font-semibold text-white placeholder-gray-500 focus:outline-none"
                    />
                </div>
                <div className="relative">
                    <button
                        className="flex items-center bg-gray-800 px-3 py-1.5 rounded-full"
                        onClick={() => setBuyDropdownOpen(!isBuyDropdownOpen)}
                    >
                        <span>{selectedBuyToken}</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4 ml-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>
                    {/* Buy Dropdown */}
                    {isBuyDropdownOpen && (
                        <ul className="absolute top-full mt-2 bg-gray-800 text-white rounded-md shadow-md z-10">
                            {tokens.map(
                                (token) =>
                                    token !== selectedSellToken && ( // Exclude the Sell token from Buy dropdown
                                        <li
                                            key={token}
                                            className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                                            onClick={() => {
                                                setSelectedBuyToken(token);
                                                setBuyDropdownOpen(false);
                                            }}
                                        >
                                            {token}
                                        </li>
                                    )
                            )}
                        </ul>
                    )}
                </div>
            </div>

            {/* Action Button */}
            < button
                onClick={() =>
                    alert(
                        `Swapping ${sellValue} ${selectedSellToken} for ${buyValue} ${selectedBuyToken}`
                    )
                }
                className="w-full text-center text-white mt-6 py-2 px-5 bg-gradient-to-r from-violet-500 to-violet-700 text-white font-semibold rounded-lg shadow-md hover:from-violet-400 hover:to-violet-600 transition-colors duration-200 focus:ring-2 focus:ring-violet-400"
            >
                Swap
            </button>
        </div>

    );
}

export default Swap;
