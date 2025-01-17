import { ethers } from "hardhat";

import type { PrivateUSD } from "../../types";
import { getSigners } from "../signers";

export async function deployPrivateUSDFixture(): Promise<PrivateUSD> {
  const signers = await getSigners();

  const contractFactory = await ethers.getContractFactory("PrivateUSD");
  const contract = await contractFactory.connect(signers.alice).deploy();
  await contract.waitForDeployment();

  return contract;
}
