import React, {
  useState, useEffect
} from "react";
import clsx from "clsx";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { FhenixClient } from "fhenixjs";
import { FACTORY, ROUTER, TOKEN_CONTRACT } from "../constants/contracts";
import { ROUTER_CONTRACT_ABI } from "../ABI/RouterABI";
import { FACTORY_CONTRACT_ABI } from "../ABI/FactoryABI";
import { ERC_CONTRACT_ABI } from "../ABI/FHERC20ABI";

import { ethers } from "ethers";
import toast from "react-hot-toast";

import privateEuroLogo from "../assets/private euro.png";
import privateUsdLogo from "../assets/private usd.png";
import privateGbpLogo from "../assets/private gbp.png";

function Swap() {
  const [sellValue, setSellValue] = useState("");
  const [buyValue, setBuyValue] = useState("");
  const [selectedSellToken, setSelectedSellToken] = useState("pEUR");
  const [selectedBuyToken, setSelectedBuyToken] = useState("pUSD");
  const [isSellDropdownOpen, setSellDropdownOpen] = useState(false);
  const [isBuyDropdownOpen, setBuyDropdownOpen] = useState(false);
  const decimals = 2;
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
  useEffect(() => {
    const fetchData = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const client = new FhenixClient({ provider });

        const routerContract = new ethers.Contract(
          ROUTER,
          ROUTER_CONTRACT_ABI,
          signer
        );

        const EncryptedAmountA = await client.encrypt_uint32(
          Number(sellValue) * 10 ** decimals
        );

        const amount = await routerContract.EstimategetAmountOut(EncryptedAmountA, [
          TOKEN_CONTRACT[selectedSellToken],
          TOKEN_CONTRACT[selectedBuyToken],
        ]);

        setBuyValue(amount / 10 ** decimals);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [sellValue]);

  const handleSwapApproval = async () => {

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const client = new FhenixClient({ provider });
    const permitA = await client.generatePermit(TOKEN_CONTRACT[selectedSellToken]);
    const permissionA = client.extractPermitPermission(permitA);
    const encsellValue = await client.encrypt_uint32(
      Number(sellValue) * 10 ** decimals
    );
    try {
      await toast.promise(
        (async () => {

          const tokenAContract = new ethers.Contract(
            TOKEN_CONTRACT[selectedSellToken],
            ERC_CONTRACT_ABI,
            signer
          );

          const tx1 = await tokenAContract.approve(ROUTER, encsellValue, permissionA);
          await tx1.wait();

        })(),
        {
          loading: "Excuting transactions",
          success: "Approval successful! ",
          error: "An error occurred while approving 😢",
        }
      );
    }
    catch (error) {
      console.log(error);
    }
  }







  const handleSwapTx = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const client = new FhenixClient({ provider });
      const permitA = await client.generatePermit(TOKEN_CONTRACT[selectedSellToken]);
      const permissionA = client.extractPermitPermission(permitA);
      const permitB = await client.generatePermit(TOKEN_CONTRACT[selectedBuyToken]);
      const permissionB = client.extractPermitPermission(permitB);
      const routerContract = new ethers.Contract(
        ROUTER,
        ROUTER_CONTRACT_ABI,
        signer
      );

      const EncryptedAmountA = await client.encrypt_uint32(
        Number(sellValue) * 10 ** decimals
      );
      const EncryptedAmountAMin = await client.encrypt_uint32(
        (Number(sellValue) / 10) * 10 ** decimals
      );

      const tx = await routerContract.swapExactTokensForTokens(EncryptedAmountA, EncryptedAmountAMin, permissionA, permissionB, [
        TOKEN_CONTRACT[selectedSellToken],
        TOKEN_CONTRACT[selectedBuyToken],

      ], signer.address,);

      await toast.promise(
        (async () => {
          await tx.wait();
        })(),
        {
          loading: "Swapping tokens...",
          success: "Swap successful! 🎉",
          error: "An error occurred while swapping tokens 😢",
        }
      );
    } catch (error) {
      console.error("Error swapping tokens:", error);
    }
  }

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
      <div className="flex justify-center items-center my-4 relative">
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
      <div className="flex items-center justify-between mb-4">
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
      <button
        onClick={handleSwapApproval

        }
        className="w-full text-center text-white mt-6 py-2 px-5 bg-gradient-to-r from-violet-500 to-violet-700 text-white font-semibold rounded-lg shadow-md hover:from-violet-400 hover:to-violet-600 transition-colors duration-200 focus:ring-2 focus:ring-violet-400"
      >
        Approve
      </button>
      <button
        onClick={handleSwapTx
        }
        className="w-full text-center text-white mt-6 py-2 px-5 bg-gradient-to-r from-violet-500 to-violet-700 text-white font-semibold rounded-lg shadow-md hover:from-violet-400 hover:to-violet-600 transition-colors duration-200 focus:ring-2 focus:ring-violet-400"
      >
        Swap
      </button>
    </div>
  );
}

export default Swap;
