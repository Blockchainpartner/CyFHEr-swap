import { ethers } from "hardhat";

import type { CyfherFactory } from "../../types";
import { getSigners } from "../signers";

export async function deployCyfherFactoryFixture(): Promise<CyfherFactory> {
  const signers = await getSigners();

  const contractFactory = await ethers.getContractFactory("CyfherFactory");
  const contract = await contractFactory.connect(signers.alice).deploy(signers.alice);
  await contract.waitForDeployment();

  return contract;
}
