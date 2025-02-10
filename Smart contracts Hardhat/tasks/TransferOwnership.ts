import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("task:transferOwnership")
    .addPositionalParam("distributoraddress")
    .addPositionalParam("token")
    .setAction(async function (taskArguments: TaskArguments, hre) {
        console.log("Starting Ownership transfer");
        try {
            const distributorContract = await hre.ethers.getContractAt("TokenDistributor", taskArguments.distributoraddress);
            const token = await hre.ethers.getContractAt("PFHERC20", taskArguments.token);
            const transfer = await token.transferOwnership(taskArguments.distributoraddress);
            await transfer.wait();
            const accept = await distributorContract.acceptOwnership(taskArguments.token);
            await accept.wait();
            const owner = await token.owner();
            console.log("transfer successful to ", owner)
        } catch (e) {
            console.log(`Failed to transfer ownership: ${e}`);
            return;
        }
    })
