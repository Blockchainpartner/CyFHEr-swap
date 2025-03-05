import React, { useState } from "react";
import { BrowserRouter as Router, NavLink, Route, Routes } from "react-router-dom";
import ConnectWallet from "./components/ConnectWallet";
import Presentation from "./components/Presentation";
import Dashboard from "./components/Dashboard";
import Swap from "./components/Swap";
import Faucet from "./components/Faucet";
import Liquidity from "./components/Liquidity";
import logo from "./assets/logo.png";
import { Toaster } from 'react-hot-toast';
import walletGif from "./assets/wallet.gif";
import { motion } from "motion/react"


function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(() => {
    const storedWallet = localStorage.getItem("walletAddress");
    console.log(storedWallet)
    return storedWallet ? true : false;
  });


  const handleWalletConnect = (connected) => {
    if (connected) {
      setIsWalletConnected(true);
      localStorage.setItem("walletAddress", "true"); // Store connection status
    } else {
      setIsWalletConnected(false);
      localStorage.removeItem("walletAddress"); // Remove from localStorage on disconnect
    }
  };

  return (

    <Router>
      <div className="absolute inset-0 -z-10 h-screen w-full items-center px-5  [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]  ">
        <nav className="relative px-6 py-9 bg-grey text-white shadow-lg">
          {/* Logo - fixed to the top-left */}
          <div className="absolute left-0 top-0 flex items-center">
            <img
              src={logo}
              alt="Logo"
              className="h-10 md:h-20 md:w-full md:mr-2 filter contrast-1 brightness-100"
            />
          </div>

          {/* Fixed Navigation Links Container - centered */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 flex space-x-6 text-lg pt-5">
            {["Swap", "Liquidity", "Faucet", "Dashboard"].map((route) => (
              <NavLink
                key={route}
                to={`/${route}`}
                className={({ isActive }) =>
                  isActive
                    ? "text-white bg-violet-500 font-bold transition-all duration-300 cursor-pointer rounded-full px-4 py-1"
                    : "hover:text-violet-400 font-bold transition-colors duration-300 cursor-pointer"
                }
              >
                {route.replace("-", " ")}
              </NavLink>
            ))}
          </div>
          {/* Connect Wallet Button - fixed to the top-right */}
          <div className="absolute right-0 top-0 flex items-center px-6 py-3">
            <ConnectWallet isConnected={handleWalletConnect} />
          </div>

        </nav>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}>
          <div className="flex md:flex-row md:h-[calc(90vh)] mt-20 md:mt-1 flex-col items-center">

            <Presentation />

            <div className="flex flex-col items-center justify-center md:w-3/4 space-y-6">
              {isWalletConnected ? (
                <>
                  <Routes>
                    <Route path="/swap" element={<Swap />} />
                    <Route path="/liquidity" element={<Liquidity />} />
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
          </div>
        </motion.div>

        <Toaster position="bottom-center"
          reverseOrder={false} />
      </div>
    </Router>
  );
}

export default App;
