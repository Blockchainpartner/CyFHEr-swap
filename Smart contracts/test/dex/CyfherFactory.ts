import { expect } from "chai";
import { ethers } from "ethers";

import { createInstance } from "../instance";
import { getSigners, initSigners } from "../signers";
import { deployCyfherFactoryFixture } from "./CyfherFactory.fixture";
import { deployPrivateEURFixture } from "../token/PrivateEUR.fixture";
import { deployPrivateUSDFixture } from "../token/PrivateUSD.fixture";


describe("CyfherFactory", function () {
  before(async function () {
    await initSigners();
    this.signers = await getSigners();
  });

  beforeEach(async function () {
    // deploying contracts 
    const contractFactory = await deployCyfherFactoryFixture();
    const contractFactoryToken0 = await deployPrivateEURFixture();
    const contractFactoryToken1 = await deployPrivateUSDFixture();
    this.FactoryAddress = await contractFactory.getAddress();
    this.Token0Address = await contractFactoryToken0.getAddress();
    this.Token1Address = await contractFactoryToken1.getAddress();

    this.factory = contractFactory;

    //not needed to test factory
    this.fhevm = await createInstance();
  });

  it("should create Pair", async function () {
    await expect(this.factory.createPair(this.Token0Address, this.Token0Address))
        .to.be.revertedWith("CyfherSwap: IDENTICAL_ADDRESSES");
    await expect(this.factory.createPair(ethers.ZeroAddress, this.Token0Address))
        .to.be.revertedWith("CyfherSwap: ZERO_ADDRESS");
    const pair = await this.factory.createPair(this.Token0Address, this.Token1Address)
    const pairs = await this.factory.allPairsLength()
    expect(pairs).to.equal(1)
  });

  it("should not create existing Pair", async function () {
    const pairAddess = await this.factory.createPair(this.Token0Address, this.Token1Address)
    await expect(this.factory.createPair(this.Token0Address, this.Token1Address))
        .to.be.revertedWith("CyfherSwap: PAIR_EXISTS");
  
  });

  it("Should emit PairCreated event with the correct values", async function () {
    const tx = await this.factory.createPair(this.Token0Address, this.Token1Address);
    
    const receipt = await tx.wait(); 
    const pairAddress = receipt.logs[0].address; 
    // Check event emission
    await expect(tx)
        .to.emit(this.factory, "PairCreated")
        .withArgs(this.Token0Address, this.Token1Address, pairAddress, 1); 
});

it('setFeeTo', async function () {
  await expect(this.factory.connect(this.signers.bob).setFeeTo(this.signers.alice)).to.be.revertedWith('CyfherSwap: FORBIDDEN')
  await this.factory.setFeeTo(this.signers.bob)
  expect(await this.factory.feeTo()).to.eq(this.signers.bob)
})

it('setFeeToSetter', async function () {
  await expect(this.factory.connect(this.signers.bob).setFeeToSetter(this.signers.alice)).to.be.revertedWith('CyfherSwap: FORBIDDEN')
  await this.factory.setFeeToSetter(this.signers.bob)
  expect(await this.factory.feeToSetter()).to.eq(this.signers.bob)
  await expect(this.factory.setFeeToSetter(this.signers.eve)).to.be.revertedWith('CyfherSwap: FORBIDDEN')
})

});
