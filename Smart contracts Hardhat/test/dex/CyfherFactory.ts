import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { PFHERC20, CyfherFactory } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import {
  getTokensFromFaucet,
} from "../../utils/instance";



describe("CyfherFactory", function () {

  let signer1: SignerWithAddress;
  let signer2: SignerWithAddress;
  let signer3: SignerWithAddress;


  let factory: CyfherFactory;
  let factoryAddress: string;

  let token1: PFHERC20;
  let token1Address: string;
  let token2: PFHERC20;
  let token2Address: string;


  before(async () => {
    signer1 = (await ethers.getSigners())[0];
    signer2 = (await ethers.getSigners())[1];
    signer3 = (await ethers.getSigners())[2];


    await getTokensFromFaucet(hre, signer1.address);
    await getTokensFromFaucet(hre, signer2.address);
    await getTokensFromFaucet(hre, signer3.address);


  });

  beforeEach(async () => {
    //Deploy FHERC20
    const FHERC20Factory = await ethers.getContractFactory("PFHERC20");
    const CyfherFactory = await ethers.getContractFactory("CyfherFactory");
    factory = await CyfherFactory.deploy(signer1);
    await factory.waitForDeployment();
    token1 = await FHERC20Factory.deploy("token1", "TKN1", 3);
    await token1.waitForDeployment();
    token2 = await FHERC20Factory.deploy("token2", "TKN2", 3);
    await token2.waitForDeployment();

    factoryAddress = await factory.getAddress();
    token1Address = await token1.getAddress();
    token2Address = await token2.getAddress();

  });

  it("should create Pair", async function () {
    await expect(factory.createPair(token1Address, token1Address)).to.be.revertedWith(
      "CyfherSwap: IDENTICAL_ADDRESSES",
    );
    await expect(factory.createPair(ethers.ZeroAddress, token1Address)).to.be.revertedWith(
      "CyfherSwap: ZERO_ADDRESS",
    );
    const pair = await factory.createPair(token1Address, token2Address);
    const pairs = await factory.allPairsLength();
    expect(pairs).to.equal(1);
  });

  it("should not create existing Pair", async function () {
    await factory.createPair(token1Address, token2Address);
    await expect(factory.createPair(token1Address, token2Address)).to.be.revertedWith(
      "CyfherSwap: PAIR_EXISTS",
    );
  });

  it("Should emit PairCreated event with the correct values", async function () {
    const tx = await factory.createPair(token1Address, token2Address);
    [token1Address, token2Address] = [token1Address, token2Address].sort();
    const receipt = await tx.wait();
    if (receipt != null) {
      const pairAddress = receipt.logs[0].address;
      // Check event emission
      await expect(tx)
        .to.emit(factory, "PairCreated")

        .withArgs(token1Address,token2Address, pairAddress, 1);
    }
  });

  it("setFeeTo", async function () {
    await expect(factory.connect(signer2).setFeeTo(signer1)).to.be.revertedWith(
      "CyfherSwap: FORBIDDEN",
    );
    await factory.setFeeTo(signer2);
    expect(await factory.feeTo()).to.eq(signer2);
  });

  it("setFeeToSetter", async function () {
    await expect(factory.connect(signer2).setFeeToSetter(signer1)).to.be.revertedWith(
      "CyfherSwap: FORBIDDEN",
    );
    await factory.setFeeToSetter(signer2);
    expect(await factory.feeToSetter()).to.eq(signer2);
    await expect(factory.setFeeToSetter(signer3)).to.be.revertedWith("CyfherSwap: FORBIDDEN");
  });
});
