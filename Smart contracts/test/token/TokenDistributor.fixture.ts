import { ethers } from "hardhat";

import type { TokenDistributor } from "../../types";
import { getSigners } from "../signers";

export async function deployTokenDistributorFixture(): Promise<TokenDistributor> {
  const signers = await getSigners();

  const contractFactory = await ethers.getContractFactory("TokenDistributor");
  const contract = await contractFactory.connect(signers.alice).deploy();
  await contract.waitForDeployment();

  return contract;
}
