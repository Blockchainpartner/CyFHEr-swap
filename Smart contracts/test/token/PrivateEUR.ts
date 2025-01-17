import { expect } from "chai";
import { network } from "hardhat";

import { createInstance } from "../instance";
import { reencryptEuint64 } from "../reencrypt";
import { getSigners, initSigners } from "../signers";
import { deployPrivateEURFixture } from "./PrivateEUR.fixture";

describe("PrivateEUR", function () {
  before(async function () {
    await initSigners();
    this.signers = await getSigners();
  });

  beforeEach(async function () {
    const contract = await deployPrivateEURFixture();
    this.contractAddress = await contract.getAddress();
    this.erc20 = contract;
    this.fhevm = await createInstance();
  });

  it("should mint token", async function () {
    const balanceAliceBefore = await this.erc20.balanceOf(this.signers.alice);

    const transaction = await this.erc20.mint(this.signers.alice, 100);
    await transaction.wait();

    const balanceHandleAlice2 = await this.erc20.balanceOf(this.signers.alice);
    const balanceAliceAfter = await reencryptEuint64(
      this.signers.alice,
      this.fhevm,
      balanceHandleAlice2,
      this.contractAddress,
    );

    expect(balanceAliceBefore).to.equal(0);
    expect(balanceAliceAfter).to.equal(100);
  });

  it("should transfer tokens", async function () {
    const tx1 = await this.erc20.mint(this.signers.alice, 100);
    const t1 = await tx1.wait();
    expect(t1?.status).to.eq(1);

    const input = this.fhevm.createEncryptedInput(this.contractAddress, this.signers.alice.address);
    input.add64(10);
    const encryptedTransferAmount = await input.encrypt();
    const tx2 = await this.erc20["transfer(address,bytes32,bytes)"](
      this.signers.bob,
      encryptedTransferAmount.handles[0],
      encryptedTransferAmount.inputProof,
    );
    const t2 = await tx2.wait();
    expect(t2?.status).to.eq(1);

    const balanceHandleAlice = await this.erc20.balanceOf(this.signers.alice);
    const balanceAlice = await reencryptEuint64(this.signers.alice, this.fhevm, balanceHandleAlice, this.contractAddress);
    expect(balanceAlice).to.equal(100 - 10);

    const balanceHandleBob = await this.erc20.balanceOf(this.signers.bob);
    const balanceBob = await reencryptEuint64(this.signers.bob, this.fhevm, balanceHandleBob, this.contractAddress);
    expect(balanceBob).to.equal(10);
  });

  it("should not transfer tokens", async function () {
    const tx1 = await this.erc20.mint(this.signers.alice, 100);
    const t1 = await tx1.wait();
    expect(t1?.status).to.eq(1);

    const input = this.fhevm.createEncryptedInput(this.contractAddress, this.signers.alice.address);
    input.add64(120);
    const encryptedTransferAmount = await input.encrypt();
    const tx2 = await this.erc20["transfer(address,bytes32,bytes)"](
      this.signers.bob,
      encryptedTransferAmount.handles[0],
      encryptedTransferAmount.inputProof,
    );
    await tx2.wait();

    const balanceHandleAlice = await this.erc20.balanceOf(this.signers.alice);
    const balanceAlice = await reencryptEuint64(this.signers.alice, this.fhevm, balanceHandleAlice, this.contractAddress);
    expect(balanceAlice).to.equal(100);

    const balanceHandleBob = await this.erc20.balanceOf(this.signers.bob);
    const balanceBob = await reencryptEuint64(this.signers.bob, this.fhevm, balanceHandleBob, this.contractAddress);
    expect(balanceBob).to.equal(0);
  });

  it("should not be possible to read the balance of someone else", async function () {
    const tx1 = await this.erc20.mint(this.signers.alice, 100);
    const t1 = await tx1.wait();
    expect(t1?.status).to.eq(1);

    const balanceHandleAlice = await this.erc20.balanceOf(this.signers.alice);
    const balanceAlice = await reencryptEuint64(this.signers.alice, this.fhevm, balanceHandleAlice, this.contractAddress);
    expect(balanceAlice).to.equal(100);

    await expect(
      reencryptEuint64(this.signers.bob, this.fhevm, balanceHandleAlice, this.contractAddress),
    ).to.be.rejectedWith("User is not authorized to reencrypt this handle!");

    // and should be impossible to call reencrypt if contractAddress === userAddress
    await expect(
      reencryptEuint64(this.signers.alice, this.fhevm, balanceHandleAlice, this.signers.alice.address),
    ).to.be.rejectedWith("userAddress should not be equal to contractAddress when requesting reencryption!");
  });

  it("should be able to transferFrom only if allowance is sufficient", async function () {
    const transaction = await this.erc20.mint(this.signers.alice, 100);
    await transaction.wait();

    const inputAlice = this.fhevm.createEncryptedInput(this.contractAddress, this.signers.alice.address);
    inputAlice.add64(50);
    const encryptedAllowanceAmount = await inputAlice.encrypt();
    const tx = await this.erc20["approve(address,bytes32,bytes)"](
      this.signers.bob,
      encryptedAllowanceAmount.handles[0],
      encryptedAllowanceAmount.inputProof,
    );
    await tx.wait();
    
    const allowanceHandleAlice = await this.erc20.allowance(this.signers.alice, this.signers.bob);
    const allowanceAlice = await reencryptEuint64(this.signers.alice, this.fhevm, allowanceHandleAlice, this.contractAddress);
    expect(allowanceAlice).to.equal(50);

    const bobErc20 = this.erc20.connect(this.signers.bob);
    const inputBob1 = this.fhevm.createEncryptedInput(this.contractAddress, this.signers.bob.address);
    inputBob1.add64(60); // above allowance so next tx should actually not send any token
    const encryptedTransferAmount = await inputBob1.encrypt();
    const tx2 = await bobErc20["transferFrom(address,address,bytes32,bytes)"](
      this.signers.alice,
      this.signers.bob,
      encryptedTransferAmount.handles[0],
      encryptedTransferAmount.inputProof,
    );
    await tx2.wait();

    const balanceHandleAlice = await this.erc20.balanceOf(this.signers.alice);
    const balanceAlice = await reencryptEuint64(
      this.signers.alice,
      this.fhevm,
      balanceHandleAlice,
      this.contractAddress,
    );
    expect(balanceAlice).to.equal(100);

    const balanceHandleBob = await this.erc20.balanceOf(this.signers.bob);
    const balanceBob = await reencryptEuint64(this.signers.bob, this.fhevm, balanceHandleBob, this.contractAddress);
    expect(balanceBob).to.equal(0);

    const inputBob2 = this.fhevm.createEncryptedInput(this.contractAddress, this.signers.bob.address);
    inputBob2.add64(40); // below allowance so next tx should send token
    const encryptedTransferAmount2 = await inputBob2.encrypt();
    const tx3 = await bobErc20["transferFrom(address,address,bytes32,bytes)"](
      this.signers.alice,
      this.signers.bob,
      encryptedTransferAmount2.handles[0],
      encryptedTransferAmount2.inputProof,
    );
    await tx3.wait();

    const allowanceHandleAlice2 = await this.erc20.allowance(this.signers.alice, this.signers.bob);
    const allowanceAlice2 = await reencryptEuint64(this.signers.alice, this.fhevm, allowanceHandleAlice2, this.contractAddress);
    expect(allowanceAlice2).to.equal(10);

    const balanceHandleAlice2 = await this.erc20.balanceOf(this.signers.alice);
    const balanceAlice2 = await reencryptEuint64(
      this.signers.alice,
      this.fhevm,
      balanceHandleAlice2,
      this.contractAddress,
    );
    expect(balanceAlice2).to.equal(100 - 40);

    const balanceHandleBob2 = await this.erc20.balanceOf(this.signers.bob);
    const balanceBob2 = await reencryptEuint64(this.signers.bob, this.fhevm, balanceHandleBob2, this.contractAddress);
    expect(balanceBob2).to.equal(40);
  });
});
