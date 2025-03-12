import React, { useEffect, useState } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import clsx from "clsx";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { FhenixClient } from "fhenixjs";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { FACTORY, TOKEN_CONTRACT } from "../constants/contracts";
import { ERC_CONTRACT_ABI } from "../ABI/FHERC20ABI";
import { FACTORY_CONTRACT_ABI } from "../ABI/FactoryABI";
import { CYFHERPAIR_CONTRACT_ABI } from "../ABI/CyfherPairABI";


import privateEuroLogo from "../assets/private euro.png";
import privateUsdLogo from "../assets/private usd.png";
import privateGbpLogo from "../assets/private gbp.png";

function Dashboard() {

  const logos = { "pEUR": privateEuroLogo, "pUSD": privateUsdLogo, "pGBP": privateGbpLogo };

  const tokens = [

    { id: 1, name: "pEUR", logo: privateEuroLogo },
    { id: 2, name: "pUSD", logo: privateUsdLogo },
    { id: 3, name: "pGBP", logo: privateGbpLogo },
  ];

  const [selectedToken, setSelectedToken] = useState(tokens[0]); // Default token as EUR
  const [balance, setBalance] = useState(null);
  const [LPbalance, setLPBalance] = useState(null);
  const [tokenPairs, setTokenPairs] = useState([]);
  const [tokenPair, setTokenPair] = useState([]);


  useEffect(() => {
    const fetchPairs = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const FactoryContract = new ethers.Contract(
        FACTORY,
        FACTORY_CONTRACT_ABI,
        signer
      );

      const pair = await FactoryContract.allPairsLength();
      const pairs = [];
      for (let i = 0; i < pair; i++) {
        const pairAddress = await FactoryContract.allPairs(i);
        const PairContract = new ethers.Contract(pairAddress, CYFHERPAIR_CONTRACT_ABI, signer);
        const token0 = await PairContract.token0();
        const token1 = await PairContract.token1();

        // Fetch token names
        const Token0Contract = new ethers.Contract(token0, ERC_CONTRACT_ABI, signer);
        const Token1Contract = new ethers.Contract(token1, ERC_CONTRACT_ABI, signer);

        const token0Name = await Token0Contract.symbol();
        const token1Name = await Token1Contract.symbol();
        let newPair = {
          id: i,
          name1: token0Name,
          name2: token1Name,
          logo1: logos[token0Name],
          logo2: logos[token1Name],
          pairAddress: pairAddress
        }
        pairs.push(newPair);
      }
      setTokenPair(pairs[0]);
      setTokenPairs(pairs);
    }
    fetchPairs();
  }, []
  )
  const handleCheckBalance = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const client = new FhenixClient({ provider });
    const contractAddress = TOKEN_CONTRACT[selectedToken.name];
    const contractABI = ERC_CONTRACT_ABI;
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    // TODO : to fix error handling
    try {
      const permit = await client.generatePermit(contractAddress);
      const permission = client.extractPermitPermission(permit);
      let myBalanceEncrypted = 0;
      await toast.promise(
        (async () => {
          myBalanceEncrypted = await contract.balanceOf(
            signer.address,
            permission
          );
          const myBalance = client.unseal(contractAddress, myBalanceEncrypted);
          const decimals = await contract.decimals();

          setBalance(Number(myBalance) / 10 ** Number(decimals));
        })(),
        {
          loading: "Decrypting balance...",
          success: "Decryption successful! ",
          error: "An error occurred while decrypting 😢",
        }
      );
    } catch (error) {
      console.error(error);
    }
  };
  const handleCheckLPBalance = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();  // Get signer from provider
    const client = new FhenixClient({ provider });  // Create Fhenix client
    const tokenLPContract = new ethers.Contract(
      tokenPair.pairAddress,
      ERC_CONTRACT_ABI,
      signer
    );
    const permit = await client.generatePermit(tokenPair.pairAddress);
    const permission = client.extractPermitPermission(permit);
    const myBalanceEncrypted = await tokenLPContract.balanceOf(
      signer.address,
      permission
    );
    const myBalance = client.unseal(tokenPair.pairAddress, myBalanceEncrypted);
    const decimals = await tokenLPContract.decimals();

    setLPBalance(Number(myBalance) / 10 ** Number(decimals));
  }
  const OnChangeToken = (value) => {
    if (selectedToken !== value) {
      setBalance(null);
      setSelectedToken(value);
    }
  }
  const OnChangePair = (value) => {
    setTokenPair(value);
  };

  return (
    <>
      <div className="md:w-3/5 w-full bg-black text-white px-5 py-6 rounded-xl shadow-lg relative border border-purple-800 before:absolute before:inset-0 before:rounded-xl before:blur-lg before:bg-purple-600 before:opacity-50 before:-z-10">
        <h1 className="text-2xl font-semibold text-white text-center">
          Token Balance
        </h1>
        <div className="flex items-center space-x-4">
          {/* Token Selector with Logo */}
          <Listbox value={selectedToken} onChange={OnChangeToken}>
            <ListboxButton
              className={clsx(
                "relative flex items-center space-x-2 w-2/5 rounded-lg bg-black border border-purple-800 mt-6 py-2 pr-8 pl-4 text-left text-sm/6 text-white",
                "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-black"
              )}
            >
              <img
                src={selectedToken.logo}
                alt={selectedToken.name}
                className="w-6 h-6"
              />
              <span>{selectedToken.name}</span>
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
              {tokens.map((token) => (
                <ListboxOption
                  key={token.id}
                  value={token}
                  className="group flex items-center gap-2 cursor-default rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/10"
                >
                  <img src={token.logo} alt={token.name} className="w-6 h-6" />
                  <span className="text-sm/6 text-white">{token.name}</span>
                  <CheckIcon className="invisible size-4 fill-white group-data-[selected]:visible" />
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Listbox>

          {/* Check Balance Button */}
          <button
            onClick={handleCheckBalance}
            className="w-3/5 mt-6 py-2 px-5 bg-gradient-to-r from-violet-500 to-violet-700 text-white text-small font-semibold rounded-lg shadow-md hover:from-violet-400 hover:to-violet-600 transition-colors duration-200 focus:ring-2 focus:ring-violet-400"
          >
            Decrypt Balance
          </button>
        </div>

        {/* Display Balance */}
        {balance !== null && (
          <div className="text-center text-white text-lg mt-4">
            <p>Your balance is:</p>
            <p className="font-bold text-2xl">
              {balance + " " + selectedToken.name}
            </p>
          </div>
        )}
      </div>
      {/* TODO : Fetch available pair contracts  and show them */}
      {tokenPairs.length && <div className="md:w-3/5 w-full bg-black text-white px-5 py-6 rounded-xl shadow-lg relative border border-purple-800 before:absolute before:inset-0 before:rounded-xl before:blur-lg before:bg-purple-600 before:opacity-50 before:-z-10">
        <h1 className="text-2xl font-semibold text-white text-center">
          LP token balance
        </h1>
        <div className="flex items-center space-x-4">
          {/* Token Selector with Logo */}
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
              {tokenPairs

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

          {/* Check Balance Button */}
          <button
            onClick={handleCheckLPBalance}
            className="w-3/5 mt-6 py-2 px-5 bg-gradient-to-r from-violet-500 to-violet-700 text-white text-small font-semibold rounded-lg shadow-md hover:from-violet-400 hover:to-violet-600 transition-colors duration-200 focus:ring-2 focus:ring-violet-400"
          >
            Decrypt LP Balance
          </button>
        </div>

        {/* Display Balance */}
        {LPbalance !== null && (
          <div className="text-center text-white text-lg mt-4">
            <p>Your balance is:</p>
            <p className="font-bold text-2xl">
              {LPbalance + " " + "Cyfher LP"}
            </p>
          </div>
        )}
      </div>}
    </>
  );
}

export default Dashboard;
