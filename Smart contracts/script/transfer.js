const { ethers, run, network } = require("hardhat");

async function main() {
  console.log("Starting...");
  const accounts = await ethers.getSigners();
  const contractAddress = "0x1828A67A7b51D1272D2E2860077E48f27Dacd94c";
  const myContract = await hre.ethers.getContractAt("PrivateEUR", contractAddress);

  const balance = await myContract.balanceOf("0x8ad04FfB7E71BD3F06c87A3C12310A5FDA27ADD9");

  const to = "0x04fB05886B67FDac59bc67D339f22Bea456E4622";
  await myContract.transfer(to, balance);

  console.log(`Balance: ${balance}, has been transfered to: ${to}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
