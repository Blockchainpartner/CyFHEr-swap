import React, { useState } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import clsx from "clsx";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { FhenixClient } from "fhenixjs";

import { TOKEN_CONTRACT } from "../constants/contracts";
import { ERC_CONTRACT_ABI } from "../ABI/FHERC20ABI";
import { ethers } from "ethers";
import toast from "react-hot-toast";

import privateEuroLogo from "../assets/private euro.png";
import privateUsdLogo from "../assets/private usd.png";
import privateGbpLogo from "../assets/private gbp.png";

function Liquidity() {
  const logos = [privateEuroLogo, privateUsdLogo, privateGbpLogo];
  const tokens = [
    { id: 0, name: "pEUR" },
    { id: 1, name: "pUSD" },
    { id: 2, name: "pGBP" },
  ];
  const pairs = [
    {
      id: 0,
      name1: "pEUR",
      name2: "pUSD",
      logo1: privateEuroLogo,
      logo2: privateUsdLogo,
    },
    {
      id: 1,
      name1: "pEUR",
      name2: "pGBP",
      logo1: privateEuroLogo,
      logo2: privateGbpLogo,
    },
    {
      id: 2,
      name1: "pUSD",
      name2: "pGBP",
      logo1: privateUsdLogo,
      logo2: privateGbpLogo,
    },
  ];

  const [tokenA, setTokenA] = useState(tokens[0]);
  const [tokenB, setTokenB] = useState(tokens[1]);
  const [tokenPair, setTokenPair] = useState(pairs[0]);

  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [amountRemove, setAmountRemove] = useState("");

  const handleAddLiquidity = async () => {
    console.log(
      `Adding liquidity: ${amountA} ${tokenA.name} + ${amountB} ${tokenB.name}`
    );
  };
  const handleRemoveLiquidity = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const client = new FhenixClient({ provider });
    console.log(provider);
    console.log(
      `Adding liquidity: ${amountA} ${tokenA.name} + ${amountB} ${tokenB.name}`
    );
  };

  const OnChangeTokenA = (value) => {
    setTokenA(value);
  };
  const OnChangeTokenB = (value) => {
    setTokenB(value);
  };

  const OnChangePair = (value) => {
    setTokenPair(value);
  };
  return (
    <>
      <div
        className="md:w-3/5 w-full bg-black text-white px-5 py-6 rounded-xl shadow-lg relative border border-purple-800 
        before:absolute before:inset-0 before:rounded-xl before:blur-lg before:bg-purple-600 before:opacity-50 before:-z-10"
      >
        <h1 className="text-2xl font-semibold text-white text-center">
          Add Liquidity
        </h1>

        {/* Token A Selector */}
        <div className="flex items-center space-x-4">
          <Listbox value={tokenA} onChange={OnChangeTokenA}>
            <ListboxButton
              className={clsx(
                "relative flex items-center space-x-2 w-2/5 rounded-lg bg-black border border-purple-800 mt-6 py-2 pr-8 pl-4 text-left text-sm/6 text-white",
                "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-black"
              )}
            >
              <img
                src={logos[tokenA.id]}
                alt={tokenA.name}
                className="w-6 h-6"
              />
              <span>{tokenA.name}</span>
              <ChevronDownIcon
                className="absolute top-2.5 right-2.5 size-4 fill-white/60"
                aria-hidden="true"
              />
            </ListboxButton>
            <ListboxOptions
              anchor="bottom"
              transition
              className={clsx(
                "w-[var(--button-width)] rounded-xl border border-violet-600 bg-black p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none",
                "transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0"
              )}
            >
              {tokens
                .filter((token) => token.name !== tokenB.name)
                .map((token) => (
                  <ListboxOption
                    key={token.id}
                    value={token}
                    className="group flex items-center gap-2 cursor-default rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/10"
                  >
                    <img
                      src={logos[token.id]}
                      alt={token.name}
                      className="w-6 h-6"
                    />
                    <span className="text-sm/6 text-white">{token.name}</span>
                    <CheckIcon className="invisible size-4 fill-white group-data-[selected]:visible" />
                  </ListboxOption>
                ))}
            </ListboxOptions>
          </Listbox>
          <input
            type="number"
            value={amountA}
            onChange={(e) => setAmountA(e.target.value)}
            className="w-3/5 py-2 px-4 mt-6  bg-black border border-purple-800 text-white rounded-lg"
            placeholder="Amount"
          />
        </div>

        {/* Token B Selector */}
        <div className="flex items-center space-x-4">
          <Listbox value={tokenB} onChange={OnChangeTokenB}>
            <ListboxButton
              className={clsx(
                "relative flex items-center space-x-2 w-2/5 rounded-lg bg-black border border-purple-800 mt-6 py-2 pr-8 pl-4 text-left text-sm/6 text-white",
                "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-black"
              )}
            >
              <img
                src={logos[tokenB.id]}
                alt={tokenB.name}
                className="w-6 h-6"
              />
              <span>{tokenB.name}</span>
              <ChevronDownIcon
                className="absolute top-2.5 right-2.5 size-4 fill-white/60"
                aria-hidden="true"
              />
            </ListboxButton>
            <ListboxOptions
              anchor="bottom"
              transition
              className={clsx(
                "w-[var(--button-width)] rounded-xl border border-violet-600 bg-black p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none",
                "transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0"
              )}
            >
              {tokens
                .filter((token) => token.name !== tokenA.name)
                .map((token) => (
                  <ListboxOption
                    key={token.id}
                    value={token}
                    className="group flex items-center gap-2 cursor-default rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/10"
                  >
                    <img
                      src={logos[token.id]}
                      alt={token.name}
                      className="w-6 h-6"
                    />
                    <span className="text-sm/6 text-white">{token.name}</span>
                    <CheckIcon className="invisible size-4 fill-white group-data-[selected]:visible" />
                  </ListboxOption>
                ))}
            </ListboxOptions>
          </Listbox>
          <input
            type="number"
            value={amountB}
            onChange={(e) => setAmountB(e.target.value)}
            className="w-3/5 py-2 mt-6 px-4 bg-black border border-purple-800 text-white rounded-lg"
            placeholder="Amount"
          />
        </div>

        {/* Add Liquidity Button */}
        <button
          onClick={handleAddLiquidity}
          className="w-full mt-4 py-2 px-5 bg-gradient-to-r from-violet-500 to-violet-700 text-white text-small font-semibold rounded-lg shadow-md hover:from-violet-400 hover:to-violet-600 transition-colors duration-200 focus:ring-2 focus:ring-violet-400"
        >
          Add liquidity
        </button>
      </div>
      <div
        className="md:w-3/5 w-full bg-black text-white  px-5 py-6 rounded-xl shadow-lg  relative border border-purple-800 
        before:absolute before:inset-0 before:rounded-xl before:blur-lg before:bg-purple-600 before:opacity-50 before:-z-10"
      >
        <h1 className="text-2xl font-semibold text-white text-center">
          Remove liquidity{" "}
        </h1>
        <div className="flex  items-center space-x-4 ">
          <Listbox value={tokenPair} onChange={OnChangePair}>
            <ListboxButton
              className={clsx(
                "relative flex items-center space-x-2 w-2/5 rounded-lg bg-black border border-purple-800 mt-6 py-2 pr-8 pl-4 text-left text-sm/6 text-white",
                "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-black"
              )}
            >
              <img
                src={tokenPair.logo1}
                alt={tokenPair.name1}
                className="w-6 h-6"
              />
              <span className="text-sm/6 text-white ml-1">
                {tokenPair.name1}
              </span>
              <span className="text-sm/6 text-white mx-2">/</span>
              <img
                src={tokenPair.logo2}
                alt={tokenPair.name2}
                className="w-6 h-6"
              />
              <span className="text-sm/6 text-white ml-1">
                {tokenPair.name2}
              </span>

              <ChevronDownIcon
                className="absolute top-2.5 right-2.5 size-4 fill-white/60"
                aria-hidden="true"
              />
            </ListboxButton>
            <ListboxOptions
              anchor="bottom"
              transition
              className={clsx(
                "w-[var(--button-width)] rounded-xl border border-violet-600 bg-black p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none",
                "transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0"
              )}
            >
              {pairs
                .filter((token) => token.id !== tokenPair.id)
                .map((token) => (
                  <ListboxOption
                    key={token.id}
                    value={token}
                    className="group flex items-center gap-2 cursor-default rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/10"
                  >
                    <img
                      src={token.logo1}
                      alt={token.name1}
                      className="w-6 h-6"
                    />
                    <span className="text-sm/6 text-white ml-1">
                      {token.name1}
                    </span>
                    <span className="text-sm/6 text-white mx-2">/</span>
                    <img
                      src={token.logo2}
                      alt={token.name2}
                      className="w-6 h-6"
                    />
                    <span className="text-sm/6 text-white ml-1">
                      {token.name2}
                    </span>
                    <CheckIcon className="invisible size-4 fill-white group-data-[selected]:visible" />
                  </ListboxOption>
                ))}
            </ListboxOptions>
          </Listbox>
          <input
            type="number"
            value={amountRemove}
            onChange={(e) => setAmountRemove(e.target.value)}
            className="w-3/5 py-2 mt-6 px-4 bg-black border border-purple-800 text-white rounded-lg"
            placeholder="Amount"
          />
        </div>
        <button
          onClick={handleRemoveLiquidity}
          className="w-full py-2 mt-4 px-5 bg-gradient-to-r from-violet-500 to-violet-700 text-white text-small font-semibold rounded-lg shadow-md hover:from-violet-400 hover:to-violet-600 transition-colors duration-200 focus:ring-2 focus:ring-violet-400"
        >
          Remove liquidity
        </button>
      </div>
    </>
  );
}

export default Liquidity;
