import React, { useState } from 'react'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import clsx from 'clsx'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import { useFhevm } from '../hooks/FHEhook';
import { TOKEN_CONTRACT } from '../constants/contracts';
import { ERC_CONTRACT_ABI } from '../ABI/ERC20ABI';
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
    const { instance, loading } = useFhevm();

    const handleCheckBalance = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        console.log(selectedToken)
        const contractAddress = TOKEN_CONTRACT[selectedToken];
        const contractABI = ERC_CONTRACT_ABI;
        // these should be generated only once and stored in the app 
        const { publicKey, privateKey } = instance.generateKeypair();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const eip712 = instance.createEIP712(publicKey, contractAddress);
        const params = [signer.address, JSON.stringify(eip712)];
        // TODO : to fix error handling
        try {
            const signature = await window.ethereum.request({ method: "eth_signTypedData_v4", params });
            const handle = await contract.balanceOf(signer.address); // returns the handle of hte ciphertext as a uint256 (bigint)
            let myBalance = 0
            await toast.promise(
                (async () => {
                    myBalance = await instance.reencrypt(handle, privateKey, publicKey, signature, contractAddress, signer.address);
                    setBalance(Number(myBalance))

                })(),
                {
                    loading: 'Decrypting balance...',
                    success: 'Decryption successful! ',
                    error: 'An error occurred while decrypting 😢',
                }
            );
        }
        catch (error) { console.error(error) }
    };

    const OnChangeToken = (value) => {
        if (selectedToken != value) {
            setBalance(null);

            setSelectedToken(value);
        }
    }
    return (
        <div className="bg-black text-white w-1/2  px-10 py-6 rounded-xl shadow-lg mx-auto relative border border-purple-800 
        before:absolute before:inset-0 before:rounded-xl before:blur-lg before:bg-purple-600 before:opacity-50 before:-z-10">
            <h1 className="text-2xl font-semibold text-white text-center">Token Balance</h1>
            <div className="flex items-center space-x-4">
                {/* Stylish Token Selector */}
                <Listbox value={selectedToken} onChange={OnChangeToken}>
                    <ListboxButton
                        className={clsx(
                            'relative block w-3/4 rounded-lg bg-black border border-purple-800 mt-6 py-2 pr-8 pl-4 text-left text-sm/6 text-white',
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
                    className="flex-none mt-6 py-2 px-5 bg-gradient-to-r from-violet-500 to-violet-700 text-white font-semibold rounded-lg shadow-md hover:from-violet-400 hover:to-violet-600 transition-colors duration-200 focus:ring-2 focus:ring-violet-400"
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