import { useContext } from "react";
import { FhevmContext } from "../context/FhevmProvider";

export const useFhevm = () => {
    const context = useContext(FhevmContext);
    if (!context) {
        throw new Error("useFhevm must be used within a FhevmProvider");
    }
    return context;
};
