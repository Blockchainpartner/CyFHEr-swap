const { ethers, run, network } = require("hardhat");

async function main() {
  console.log("Starting...");
  const accounts = await ethers.getSigners();
  const erc20Address = "0xA30267603bb3351dc9052080C78249ae53D9c0eC";
  const myErc20Contract = await hre.ethers.getContractAt("PrivateGBP", erc20Address);
  const distributorAddress = "0x04fB05886B67FDac59bc67D339f22Bea456E4622";
  const distributorContract = await hre.ethers.getContractAt("TokenDistributor", distributorAddress);

  const accept = await distributorContract.claim(erc20Address);
  await accept.wait();

  const balance = await myErc20Contract.balanceOf(accounts[0].address);

  console.log(`The balance of ${accounts[0].address} is ${balance}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
