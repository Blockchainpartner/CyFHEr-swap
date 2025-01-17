import { expect } from "chai";
import { network } from "hardhat";

import { createInstance } from "../instance";
import { reencryptEuint64 } from "../reencrypt";
import { getSigners, initSigners } from "../signers";
import { deployTokenDistributorFixture } from "./TokenDistributor.fixture";
import { deployPrivateEURFixture } from "./PrivateEUR.fixture";
import { deployPrivateUSDFixture } from "./PrivateUSD.fixture";
import { deployPrivateGBPFixture } from "./PrivateGBP.fixture";

describe("TokenDistributor", function () {
  before(async function () {
    await initSigners();
    this.signers = await getSigners();
  });

  describe("PrivateEUR", function () {
    beforeEach(async function () {
        const contract = await deployTokenDistributorFixture();
        this.distributorAddress = await contract.getAddress();
        this.distributor = contract;

        const pEUR = await deployPrivateEURFixture();
        this.pEURContractAddress = await pEUR.getAddress();
        this.pEUR = pEUR;

        this.fhevm = await createInstance();
    });

    it("should not claim token without ownership", async function () {
        const balanceAliceBefore = await this.pEUR.balanceOf(this.signers.alice);

        await expect(this.distributor.connect(this.signers.alice).claim(this.pEURContractAddress)).to.be.rejectedWith(`VM Exception while processing transaction: reverted with custom error 'OwnableUnauthorizedAccount("${this.distributorAddress}")'`);

        const balanceAliceAfter = await this.pEUR.balanceOf(this.signers.alice);

        expect(balanceAliceBefore).to.equal(0);
        expect(balanceAliceAfter).to.equal(0);
    });

    it("should transfer ownership", async function () {
        const ownerBefore = await this.pEUR.owner();
        expect(ownerBefore).to.equal(this.signers.alice.address);

        const transfer = await this.pEUR.connect(this.signers.alice).transferOwnership(this.distributorAddress);
        await transfer.wait();

        const accept = await this.distributor.connect(this.signers.alice).acceptOwnership(this.pEURContractAddress);
        await accept.wait();

        const ownerAfter = await this.pEUR.owner();
        expect(ownerAfter).to.equal(this.distributorAddress);
    });

    it("should claim", async function () {
        const balanceAliceBefore = await this.pEUR.balanceOf(this.signers.alice);

        const transfer = await this.pEUR.connect(this.signers.alice).transferOwnership(this.distributorAddress);
        await transfer.wait();

        const accept = await this.distributor.connect(this.signers.alice).acceptOwnership(this.pEURContractAddress);
        await accept.wait();

        const claim = await this.distributor.connect(this.signers.alice).claim(this.pEURContractAddress);
        await claim.wait();

        const balanceHandleAlice = await this.pEUR.balanceOf(this.signers.alice);
        const balanceAliceAfter = await reencryptEuint64(
        this.signers.alice,
        this.fhevm,
        balanceHandleAlice,
        this.pEURContractAddress,
        );

        expect(balanceAliceBefore).to.equal(0);
        expect(balanceAliceAfter).to.equal(100);
    });
  });

  describe("PrivateUSD", function () {
    beforeEach(async function () {
        const contract = await deployTokenDistributorFixture();
        this.distributorAddress = await contract.getAddress();
        this.distributor = contract;

        const pUSD = await deployPrivateUSDFixture();
        this.pUSDContractAddress = await pUSD.getAddress();
        this.pUSD = pUSD;

        this.fhevm = await createInstance();
    });

    it("should not claim token without ownership", async function () {
        const balanceAliceBefore = await this.pUSD.balanceOf(this.signers.alice);

        await expect(this.distributor.connect(this.signers.alice).claim(this.pUSDContractAddress)).to.be.rejectedWith(`VM Exception while processing transaction: reverted with custom error 'OwnableUnauthorizedAccount("${this.distributorAddress}")'`);

        const balanceAliceAfter = await this.pUSD.balanceOf(this.signers.alice);

        expect(balanceAliceBefore).to.equal(0);
        expect(balanceAliceAfter).to.equal(0);
    });

    it("should transfer ownership", async function () {
        const ownerBefore = await this.pUSD.owner();
        expect(ownerBefore).to.equal(this.signers.alice.address);

        const transfer = await this.pUSD.connect(this.signers.alice).transferOwnership(this.distributorAddress);
        await transfer.wait();

        const accept = await this.distributor.connect(this.signers.alice).acceptOwnership(this.pUSDContractAddress);
        await accept.wait();

        const ownerAfter = await this.pUSD.owner();
        expect(ownerAfter).to.equal(this.distributorAddress);
    });

    it("should claim", async function () {
        const balanceAliceBefore = await this.pUSD.balanceOf(this.signers.alice);

        const transfer = await this.pUSD.connect(this.signers.alice).transferOwnership(this.distributorAddress);
        await transfer.wait();

        const accept = await this.distributor.connect(this.signers.alice).acceptOwnership(this.pUSDContractAddress);
        await accept.wait();

        const claim = await this.distributor.connect(this.signers.alice).claim(this.pUSDContractAddress);
        await claim.wait();

        const balanceHandleAlice = await this.pUSD.balanceOf(this.signers.alice);
        const balanceAliceAfter = await reencryptEuint64(
        this.signers.alice,
        this.fhevm,
        balanceHandleAlice,
        this.pUSDContractAddress,
        );

        expect(balanceAliceBefore).to.equal(0);
        expect(balanceAliceAfter).to.equal(100);
    });
  });

  describe("PrivateGBP", function () {
    beforeEach(async function () {
        const contract = await deployTokenDistributorFixture();
        this.distributorAddress = await contract.getAddress();
        this.distributor = contract;

        const pGBP = await deployPrivateGBPFixture();
        this.pGBPContractAddress = await pGBP.getAddress();
        this.pGBP = pGBP;

        this.fhevm = await createInstance();
    });

    it("should not claim token without ownership", async function () {
        const balanceAliceBefore = await this.pGBP.balanceOf(this.signers.alice);

        await expect(this.distributor.connect(this.signers.alice).claim(this.pGBPContractAddress)).to.be.rejectedWith(`VM Exception while processing transaction: reverted with custom error 'OwnableUnauthorizedAccount("${this.distributorAddress}")'`);

        const balanceAliceAfter = await this.pGBP.balanceOf(this.signers.alice);

        expect(balanceAliceBefore).to.equal(0);
        expect(balanceAliceAfter).to.equal(0);
    });

    it("should transfer ownership", async function () {
        const ownerBefore = await this.pGBP.owner();
        expect(ownerBefore).to.equal(this.signers.alice.address);

        const transfer = await this.pGBP.connect(this.signers.alice).transferOwnership(this.distributorAddress);
        await transfer.wait();

        const accept = await this.distributor.connect(this.signers.alice).acceptOwnership(this.pGBPContractAddress);
        await accept.wait();

        const ownerAfter = await this.pGBP.owner();
        expect(ownerAfter).to.equal(this.distributorAddress);
    });

    it("should claim", async function () {
        const balanceAliceBefore = await this.pGBP.balanceOf(this.signers.alice);

        const transfer = await this.pGBP.connect(this.signers.alice).transferOwnership(this.distributorAddress);
        await transfer.wait();

        const accept = await this.distributor.connect(this.signers.alice).acceptOwnership(this.pGBPContractAddress);
        await accept.wait();

        const claim = await this.distributor.connect(this.signers.alice).claim(this.pGBPContractAddress);
        await claim.wait();

        const balanceHandleAlice = await this.pGBP.balanceOf(this.signers.alice);
        const balanceAliceAfter = await reencryptEuint64(
        this.signers.alice,
        this.fhevm,
        balanceHandleAlice,
        this.pGBPContractAddress,
        );

        expect(balanceAliceBefore).to.equal(0);
        expect(balanceAliceAfter).to.equal(100);
    });
  });
});
