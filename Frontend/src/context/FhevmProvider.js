import React, { createContext, useState, useEffect } from "react";
import { initFhevm, createInstance } from "fhevmjs/bundle";
import { KMS_CONTRACT_ADDRESS, ACL_CONTRACT_ADDRESS, GATEWAY_URL } from "../constants/contracts"
export const FhevmContext = createContext();

export const FhevmProvider = ({ children }) => {
    const [instance, setInstance] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeFhevm = async () => {
            try {
                await initFhevm();
                const newInstance = await createInstance({
                    network: window.ethereum,
                    gatewayUrl: GATEWAY_URL,
                    kmsContractAddress: KMS_CONTRACT_ADDRESS,
                    aclContractAddress: ACL_CONTRACT_ADDRESS,
                });
                setInstance(newInstance);
                console.log('INSTANCE INITIALIZED')
            } catch (error) {
                console.error("Error initializing Fhevm instance:", error);
            } finally {
                setLoading(false);
            }
        };

        initializeFhevm();
    }, []);

    return (
        <FhevmContext.Provider value={{ instance, loading }}>
            {children}
        </FhevmContext.Provider>
    );
};
