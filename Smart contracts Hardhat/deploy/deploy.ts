import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

/**
 * Deploys a contract named "Counter" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployCounter: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment,
) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  if (hre.network.name === "hardhat" && process.argv.includes("deploy")) {
    console.warn("Warning: you are deploying to the in-process Hardhat network, but this network gets destroyed right after the deployment task ends.");
  }
  // Fund the account before deploying.
  if (hre.network.name === "localfhenix") {
    if ((await hre.ethers.provider.getBalance(deployer)) === 0n) {
      await hre.fhenixjs.getFunds(deployer);
      console.log("Received tokens from the local faucet. Ready to deploy...");
    }
  }

  const pEUR = await deploy("PFHERC20", {
    from: deployer,
    // Contract constructor arguments
    args: ["PrivateEUR", "pEUR", 3],
    log: true,
    autoMine: true,
  });
  console.log("pEUR deployed with address : ", pEUR.address)
  const pUSD = await deploy("PFHERC20", {
    from: deployer,
    args: ["PrivateUSD", "pUSD", 3],
    log: true,
    autoMine: true,
  });
  console.log("pUSD deployed with address : ", pUSD.address)

  const pGPB = await deploy("PFHERC20", {
    from: deployer,
    args: ["PrivateGPB", "pGPB", 3],
    log: true,
    autoMine: true,
  });
  console.log("pGPB deployed with address : ", pGPB.address)
  const Distributer = await deploy("TokenDistributor", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log("Distributer deployed with address : ", Distributer.address)

};

export default deployCounter;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags Counter
deployCounter.tags = ["Deployer"];
