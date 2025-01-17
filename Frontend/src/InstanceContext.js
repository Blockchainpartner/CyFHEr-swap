// InstanceContext.js
/* import React, { createContext, useContext, useState } from "react";
import { initFhevm, createInstance } from "fhevmjs/bundle";
 */
/* const InstanceContext = createContext();

export const InstanceProvider = ({ children }) => {
    const [instance, setInstance] = useState(null);

    const getInstance = async () => {
        if (!instance) {
            try {
                await initFhevm(); // Load TFHE
                const newInstance = await createInstance({
                    kmsContractAddress: "0x9D6891A6240D6130c54ae243d8005063D05fE14b",
                    aclContractAddress: "0xFee8407e2f5e3Ee68ad77cAE98c434e637f516e5",
                    network: window.ethereum,
                    gatewayUrl: "https://gateway.sepolia.zama.ai/",
                });
                setInstance(newInstance);
                return newInstance;
            } catch (error) {
                console.error("Error initializing instance:", error);
                throw error;
            }
        }
        return instance;
    };

    return (
        <InstanceContext.Provider value={{ getInstance }}>
            {children}
        </InstanceContext.Provider>
    );
};

export const useInstance = () => useContext(InstanceContext); */