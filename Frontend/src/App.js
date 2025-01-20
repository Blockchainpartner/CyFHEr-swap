import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ethers } from "ethers";
import ConnectWallet from "./components/ConnectWallet";
import Presentation from "./components/Presentation";
import Dashboard from "./components/Dashboard";
import Swap from "./components/Swap";
import Faucet from "./components/Faucet";
import ProvideLiquidity from "./components/ProvideLiquidity";
import { FhevmProvider } from "./context/FhevmProvider";
import logo from "./assets/logo.png";



function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const checkIfWalletIsConnected = async () => {
    try {
      // Check if window.ethereum is available (MetaMask)
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();

        if (accounts.length > 0) {
          setIsWalletConnected(true);
          console.log(accounts[0]);
        } else {
          setIsWalletConnected(false);
        }
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  };


  useEffect(() => {
    //TODO : fix page reload checking 
    checkIfWalletIsConnected();
  }, []);


  const handleWalletConnect = (connected) => {
    setIsWalletConnected(connected);
  };


  return (
    <Router>
      <div className="min-h-screen overflow-hidden bg-gradient-to-r from-indigo-900 to-sky-400">
        <nav className="relative px-6 py-9 bg-transparent text-white shadow-lg">
          {/* Logo - fixed to the top-left */}
          <div className="absolute left-0 top-0 flex items-center ">
            <img src={logo} alt="Logo" className="h-20 w-full mr-2  " />
          </div>

          {/* Fixed Navigation Links Container - centered */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 flex space-x-8 text-lg pt-5">
            <Link
              to="/swap"
              className="hover:text-sky-400 transition-colors duration-300 cursor-pointer"
            >
              Swap
            </Link>
            <Link
              to="/provide-liquidity"
              className="hover:text-sky-400 transition-colors duration-300 cursor-pointer"
            >
              Provide Liquidity
            </Link>
            <Link
              to="/faucet"
              className="hover:text-sky-400 transition-colors duration-300 cursor-pointer"
            >
              Faucet
            </Link>
            <Link
              to="/dashboard"
              className="hover:text-sky-400 transition-colors duration-300 cursor-pointer"
            >
              Dashboard
            </Link>
          </div>

          {/* Connect Wallet Button - fixed to the top-right */}
          <div className="absolute right-0 top-0 flex items-center px-6 py-3">
            <ConnectWallet isConnected={handleWalletConnect} />
          </div>
        </nav>
        <div className="flex flex-row h-[calc(100vh-64px)]">
          <Presentation />
          <FhevmProvider>

            <div className="flex flex-col items-center justify-center w-3/4 space-y-6">
              {isWalletConnected ? (
                <>
                  <Routes>
                    <Route path="/swap" element={<Swap />} />
                    <Route path="/provide-liquidity" element={<ProvideLiquidity />} />
                    <Route path="/faucet" element={<Faucet />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/" element={<Swap />} /> {/* Default Route */}
                  </Routes>
                </>
              ) : (
                <>
                  <div className="relative flex w-full flex-col items-center justify-center">
                    <p className="z-10 text-center text-3xl font-medium tracking-tighter text-white">
                      Connect wallet
                    </p>
                  </div>
                </>
              )}
            </div>
          </FhevmProvider>
        </div>
      </div>
    </Router>

  );
}

export default App;
