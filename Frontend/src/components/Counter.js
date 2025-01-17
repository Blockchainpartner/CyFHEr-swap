import React, { useState, useEffect } from "react";
import { ethers, BrowserProvider } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../ABI/ABI";
//import { useInstance } from "../InstanceContext";

function RetrieveTokens() {
    const [counter, setCounter] = useState("");
    const [inputCounter, setInputCounter] = useState("");
    const [error, setError] = useState("");
    const [success, SetSuccess] = useState("");
    //const { getInstance } = useInstance();


    const RetrieveHandle = async (e) => {
        try {
            // Get the user's MetaMask provider
            const provider = new BrowserProvider(window.ethereum);
            // const client = new FhenixClient({ provider });
            const signer = await provider.getSigner();

            // smart contract address , to change later
            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                CONTRACT_ABI,
                signer
            );
            /*         const tx = await contract.recieve(encrypted_redeem_code);
                    const result = await tx.wait(); // Wait for the transaction to be mined
                    console.log(tx);
                    console.log(result); */

            SetSuccess("Eth recieved successfully ");
        } catch (error) {
            setError("error");
            console.log(error.message);
        }
    };
    const getNumber = (e) => {
        setInputCounter(e.target.value)
    }

    const SubmitNumber = async (e) => {

        /*     try {
                const instance = await getInstance();
                if (instance) {
                    const { publicKey, privateKey } = instance.generateKeypair();
                    console.log("Public Key:", publicKey);
                    console.log("Private Key:", privateKey);
                }
            } catch (error) {
                console.error("Failed to initialize instance:", error);
            } */
    }

    return (
        <div className="flex flex-col items-center justify-center w-7/12 bg-white text-gray-800 p-6 rounded-lg shadow-black shadow-lg">
            <h2 className="text-xl font-semibold mb-4"> Increment counter</h2>
            <div className="flex w-full flex-row mb-2">
                <div className="w-3/4  relative">
                    <input
                        id="wallet-address-input"
                        type="text"
                        className="col-span-6 border border-gray-300  text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={counter}
                        disabled={true}
                        onChange={(e) => {
                            setCounter(e.target.value);
                        }}
                    />
                </div>
                <button
                    className={`flex items-center justify-center ml-10 py-2 px-10 rounded-lg shadow-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 ${false
                        ? "bg-blue-300 cursor-not-allowed opacity-50"
                        : "bg-blue-600 hover:bg-blue-500"
                        }`}
                    onClick={(e) => {
                        RetrieveHandle(e);
                    }}
                >
                    Retrieve
                </button>
            </div>
            <div className="flex w-full flex-row mb-2">
                <div className="w-3/4  relative">
                    <input
                        id="-input"
                        type="text"
                        className="col-span-6 border border-gray-300  text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        value={inputCounter}
                        placeholder="input counter to encrypt"
                        onChange={(e) => {
                            getNumber(e)
                        }}
                    />
                </div>
                <button
                    className={`flex items-center justify-center ml-10 py-2 px-10 rounded-lg shadow-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 ${false
                        ? "bg-blue-300 cursor-not-allowed opacity-50"
                        : "bg-blue-600 hover:bg-blue-500"
                        }`}
                    onClick={
                        SubmitNumber
                    }
                >
                    Set
                </button>
            </div>
            {error && (
                <div className="text-red-500 text-shadow-8 font-bold ">{error}</div>
            )}
            {success && (
                <div className="text-green-500 text-shadow-8 font-bold ">{success}</div>
            )}
        </div>
    );
}

export default RetrieveTokens;