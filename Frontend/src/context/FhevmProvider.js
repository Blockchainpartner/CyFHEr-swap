import React, { createContext, useState, useEffect } from "react";
import { initFhevm, createInstance } from "fhevmjs/bundle";

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
                    gatewayUrl: "https://gateway.sepolia.zama.ai",
                    kmsContractAddress: "0x9D6891A6240D6130c54ae243d8005063D05fE14b",
                    aclContractAddress: "0xFee8407e2f5e3Ee68ad77cAE98c434e637f516e5",
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
