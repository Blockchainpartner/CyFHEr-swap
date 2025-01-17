import { ethers } from "hardhat";

import type { PrivateEUR } from "../../types";
import { getSigners } from "../signers";

export async function deployPrivateEURFixture(): Promise<PrivateEUR> {
  const signers = await getSigners();

  const contractFactory = await ethers.getContractFactory("PrivateEUR");
  const contract = await contractFactory.connect(signers.alice).deploy();
  await contract.waitForDeployment();

  return contract;
}
