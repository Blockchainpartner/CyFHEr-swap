const { ethers, run, network } = require("hardhat");

async function main() {
  console.log("Starting...");
  const accounts = await ethers.getSigners();
  const erc20Address = "0xA30267603bb3351dc9052080C78249ae53D9c0eC";
  const myErc20Contract = await hre.ethers.getContractAt("PrivateGBP", erc20Address);
  const distributorAddress = "0x04fB05886B67FDac59bc67D339f22Bea456E4622";
  const distributorContract = await hre.ethers.getContractAt("TokenDistributor", distributorAddress);

  const transfer = await myErc20Contract.transferOwnership(distributorAddress);
  await transfer.wait();

  const accept = await distributorContract.acceptOwnership(erc20Address);
  await accept.wait();

  const owner = await myErc20Contract.owner();

  console.log(`The ${erc20Address} ownership has been transferred to ${owner}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
