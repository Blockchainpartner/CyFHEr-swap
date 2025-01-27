import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, NavLink, Route, Routes } from "react-router-dom";
import { ethers } from "ethers";
import ConnectWallet from "./components/ConnectWallet";
import Presentation from "./components/Presentation";
import Dashboard from "./components/Dashboard";
import Swap from "./components/Swap";
import Faucet from "./components/Faucet";
import ProvideLiquidity from "./components/ProvideLiquidity";
import { FhevmProvider } from "./context/FhevmProvider";
import logo from "./assets/logo.png";
import { Toaster } from 'react-hot-toast';
import walletGif from "./assets/wallet.gif";

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
      <div className="absolute inset-0 -z-10 h-full w-full items-center px-5  [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]  ">
        <nav className="relative px-6 py-9 bg-grey text-white shadow-lg">
          {/* Logo - fixed to the top-left */}
          <div className="absolute left-0 top-0 flex items-center">
            <img
              src={logo}
              alt="Logo"
              className="h-20 w-full mr-2 filter contrast-1 brightness-100"
            />
          </div>

          {/* Fixed Navigation Links Container - centered */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 flex space-x-6 text-lg pt-5">
            <NavLink
              to="/swap"
              className={({ isActive }) =>
                isActive
                  ? "text-white bg-violet-500 font-bold transition-all duration-500 cursor-pointer rounded-full px-4 py-1"
                  : "hover:text-violet-400 font-bold transition-colors duration-300 cursor-pointer"
              }
            >
              Swap
            </NavLink>
            <NavLink
              to="/provide-liquidity"
              className={({ isActive }) =>
                isActive
                  ? "text-white bg-violet-500 font-bold transition-all duration-300 cursor-pointer rounded-full px-4 py-1"
                  : "hover:text-violet-400 font-bold transition-colors duration-300 cursor-pointer"
              }
            >
              Provide Liquidity
            </NavLink>
            <NavLink
              to="/faucet"
              className={({ isActive }) =>
                isActive
                  ? "text-white bg-violet-500 font-bold transition-all duration-300 cursor-pointer rounded-full px-4 py-1"
                  : "hover:text-violet-400 font-bold transition-colors duration-300 cursor-pointer"
              }
            >
              Faucet
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive
                  ? "text-white bg-violet-500 font-bold transition-all duration-300 cursor-pointer rounded-full px-4 py-1"
                  : "hover:text-violet-400 font-bold transition-colors duration-300 cursor-pointer"
              }
            >
              Dashboard
            </NavLink>
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
                    <img src={walletGif} alt="Wallet Animation" className="w-1/5 h-auto" />

                  </div>
                </>
              )}
            </div>
          </FhevmProvider>
        </div>
        <Toaster position="bottom-center"
          reverseOrder={false} />
      </div>
    </Router>

  );
}

export default App;
