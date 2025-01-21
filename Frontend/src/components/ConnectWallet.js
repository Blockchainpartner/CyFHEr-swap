import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

function ConnectWallet({ isConnected }) {
    const [account, setAccount] = useState(null);
    const [error, setError] = useState(null);

    const connectWallet = async () => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            setAccount(accounts[0]);
            isConnected(true);
            setError(null);
        } catch (error) {
            isConnected(false);
            setError("You need to install a wallet extension ");
            console.error(error);
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setError(null);
        isConnected(false);
    };

    useEffect(() => {
        if (window.ethereum) {
            // Listen for account changes
            const handleAccountsChanged = (accounts) => {
                if (accounts.length === 0) {
                    console.log("Account disconnected");
                    isConnected(false);
                    setAccount(null); // Handle disconnection
                } else {
                    console.log("Account changed:", accounts[0]);
                    setAccount(accounts[0]); // Handle account change
                }
            };

            // Listen for disconnection
            const handleDisconnect = (error) => {
                console.log("Disconnected from the wallet:", error);
                setAccount(null);
                setError(null); // Handle disconnection
            };

            window.ethereum.on("accountsChanged", handleAccountsChanged);
            window.ethereum.on("disconnect", handleDisconnect);

            // Cleanup event listeners on component unmount
            return () => {
                window.ethereum.removeListener(
                    "accountsChanged",
                    handleAccountsChanged
                );
                window.ethereum.removeListener("disconnect", handleDisconnect);
            };
        }
    }, [isConnected]); // The empty array ensures this effect runs only once on mount

    return (
        <div className=" text-white rounded-lg transition-colors duration-300">

            {account ? (
                <div className="flex items-center space-x-4">
                    <span className="text-white font-bold text-sm">
                        {account.slice(0, 6)}...{account.slice(-4)}
                    </span>
                    <button
                        onClick={disconnectWallet}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-500 focus:outline-none font-semibold"
                    >
                        Disconnect
                    </button>

                </div>
            ) : (
                <div className="flex items-center space-x-4">
                    {error && <p className="text-purple-600 font-medium mt-2">{error}</p>}
                    <button
                        onClick={connectWallet}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-500 focus:outline-none font-semibold"
                    >
                        Connect Wallet
                    </button>
                </div>
            )}
        </div>
    );
}

export default ConnectWallet;
