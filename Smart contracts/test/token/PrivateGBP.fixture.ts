import { ethers } from "hardhat";

import type { PrivateGBP } from "../../types";
import { getSigners } from "../signers";

export async function deployPrivateGBPFixture(): Promise<PrivateGBP> {
  const signers = await getSigners();

  const contractFactory = await ethers.getContractFactory("PrivateGBP");
  const contract = await contractFactory.connect(signers.alice).deploy();
  await contract.waitForDeployment();

  return contract;
}
