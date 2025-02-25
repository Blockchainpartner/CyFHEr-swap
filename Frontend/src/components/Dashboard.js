import React, { useState } from 'react'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import clsx from 'clsx'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { FhenixClient } from 'fhenixjs';

import { TOKEN_CONTRACT } from '../constants/contracts';
import { ERC_CONTRACT_ABI } from '../ABI/FHERC20ABI';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

function Dashboard() {
    const tokens = [
        { id: 1, name: 'pEUR' },
        { id: 2, name: 'pUSD' },
        { id: 3, name: 'pGBP' },

    ]

    const [selectedToken, setSelectedToken] = useState('pEUR'); // Default token as EUR

    const [balance, setBalance] = useState(null);

    const handleCheckBalance = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const client = new FhenixClient({ provider });
        console.log(provider)

        console.log(selectedToken)
        const contractAddress = TOKEN_CONTRACT[selectedToken];
        const contractABI = ERC_CONTRACT_ABI;
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        // TODO : to fix error handling
        try {
            const permit = await client.generatePermit(contractAddress);
            const permission = client.extractPermitPermission(permit);
            let myBalanceEncrypted = 0
            await toast.promise(
                (async () => {
                    myBalanceEncrypted = await contract.balanceOf(signer.address, permission);
                    const myBalance = client.unseal(contractAddress, myBalanceEncrypted);
                    const decimals = await contract.decimals()

                    setBalance(Number(myBalance) / (10 ** Number(decimals)))

                })(),
                {
                    loading: 'Decrypting balance...',
                    success: 'Decryption successful! ',
                    error: 'An error occurred while decrypting 😢',
                }
            );
        }
        catch (error) { console.error(error) }
    }

    const OnChangeToken = (value) => {
        if (selectedToken !== value) {
            setBalance(null);

            setSelectedToken(value);
        }
    }
    return (
        <div className="md:w-3/5 w-full bg-black text-white  px-5 py-6 rounded-xl shadow-lg  relative border border-purple-800 
        before:absolute before:inset-0 before:rounded-xl before:blur-lg before:bg-purple-600 before:opacity-50 before:-z-10">
            <h1 className="text-2xl font-semibold text-white text-center">Token Balance</h1>
            <div className="flex  items-center space-x-4">
                {/* Stylish Token Selector */}
                <Listbox value={selectedToken} onChange={OnChangeToken}>
                    <ListboxButton
                        className={clsx(
                            'relative block w-2/5 rounded-lg bg-black border border-purple-800 mt-6 py-2 pr-8 pl-4 text-left text-sm/6 text-white',
                            'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-black'
                        )}
                    >
                        {selectedToken}
                        <ChevronDownIcon
                            className="group pointer-events-none absolute top-2.5 right-2.5 size-4 fill-white/60"
                            aria-hidden="true"
                        />
                    </ListboxButton>
                    <ListboxOptions
                        anchor="bottom"
                        transition
                        className={clsx(
                            'w-[var(--button-width)] rounded-xl border border-violet-600 bg-black p-1 [--anchor-gap:var(--spacing-1)] focus:outline-none',
                            'transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0'
                        )}
                    >
                        {tokens.map((token) => (
                            <ListboxOption
                                key={token.id}
                                value={token.name}
                                className="group flex cursor-default items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-white/10"
                            >
                                <CheckIcon className="invisible size-4 fill-white group-data-[selected]:visible" />
                                <div className="text-sm/6 text-white">{token.name}</div>
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
                    <p className="font-bold text-2xl">{balance + " " + selectedToken}</p>
                </div>
            )}
        </div>



    )
}

export default Dashboard