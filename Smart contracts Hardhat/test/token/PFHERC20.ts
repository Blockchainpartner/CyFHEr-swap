import { expect } from "chai";
import hre, { ethers, fhenixjs } from "hardhat";
import { PFHERC20 } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import {
  createPermissionForContract,
  getTokensFromFaucet,
} from "../../utils/instance";


describe("PFHERC20", function () {

  let signer1: SignerWithAddress;
  let signer2: SignerWithAddress;


  let PFHERC20: PFHERC20;
  let PFHERC20Address: string;

  before(async () => {
    signer1 = (await ethers.getSigners())[0];
    signer2 = (await ethers.getSigners())[1];

    await getTokensFromFaucet(hre, signer1.address);
    await getTokensFromFaucet(hre, signer2.address);

  });

  beforeEach(async () => {
    //Deploy FHERC20
    const FHERC20Factory = await ethers.getContractFactory("PFHERC20");
    PFHERC20 = await FHERC20Factory.deploy("Private TOKEN", "PT", 3);
    await PFHERC20.waitForDeployment();
    PFHERC20Address = await PFHERC20.getAddress();
  });

  it("should mint token", async function () {
    // create permission for signer 
    const permission = await createPermissionForContract(
      hre,
      signer1,
      PFHERC20Address,
    );
    const balanceEncryptedBefore = await PFHERC20.connect(signer1).balanceOf(signer1, permission);
    const balanceBefore = fhenixjs.unseal(
      PFHERC20Address,
      balanceEncryptedBefore,
      signer1.address,
    );
    let encrypted_mint = await fhenixjs.encrypt_uint32(100)
    const transaction = await PFHERC20.mint(signer1, encrypted_mint);
    await transaction.wait();

    const balanceEncryptedAfter = await PFHERC20.connect(signer1).balanceOf(signer1, permission);
    const balanceAfter = fhenixjs.unseal(
      PFHERC20Address,
      balanceEncryptedAfter,
      signer1.address,
    );

    expect(balanceBefore).to.equal(0);
    expect(balanceAfter).to.equal(100);
  });



  it("should transfer tokens", async function () {
    //mint token 
    let encrypted_mint = await fhenixjs.encrypt_uint32(100)
    const tx1 = await PFHERC20.mint(signer1, encrypted_mint);
    const t1 = await tx1.wait();
    expect(t1?.status).to.eq(1);
    //transfer token
    let encrypted_transfer = await fhenixjs.encrypt_uint32(40)

    const permission1 = await createPermissionForContract(
      hre,
      signer1,
      PFHERC20Address,
    );

    const tx2 = await PFHERC20.transfer(
      signer2,
      encrypted_transfer,
      permission1,
    );
    const t2 = await tx2.wait();
    expect(t2?.status).to.eq(1);

    const balanceSigner1Encrypted = await PFHERC20.balanceOf(signer1, permission1);
    const balanceSigner1 = fhenixjs.unseal(
      PFHERC20Address,
      balanceSigner1Encrypted,
      signer1.address,
    );
    expect(balanceSigner1).to.equal(100 - 40);

    const permission2 = await createPermissionForContract(
      hre,
      signer2,
      PFHERC20Address,
    );
    const balanceSigner2Encrypted = await PFHERC20.balanceOf(signer2, permission2);
    const balanceSigner2 = fhenixjs.unseal(
      PFHERC20Address,
      balanceSigner2Encrypted,
      signer2.address,
    );
    expect(balanceSigner2).to.equal(40);

  });

  it("should not transfer tokens", async function () {
    //mint token 
    let encrypted_mint = await fhenixjs.encrypt_uint32(100)
    const tx1 = await PFHERC20.mint(signer1, encrypted_mint);
    const t1 = await tx1.wait();
    expect(t1?.status).to.eq(1);
    //transfer token
    let encrypted_transfer = await fhenixjs.encrypt_uint32(120)

    const permission1 = await createPermissionForContract(
      hre,
      signer1,
      PFHERC20Address,
    );

    const tx2 = await PFHERC20.transfer(
      signer2,
      encrypted_transfer,
      permission1,
    );
    const t2 = await tx2.wait();
    expect(t2?.status).to.eq(1);

    const balanceSigner1Encrypted = await PFHERC20.balanceOf(signer1, permission1);
    const balanceSigner1 = fhenixjs.unseal(
      PFHERC20Address,
      balanceSigner1Encrypted,
      signer1.address,
    );
    expect(balanceSigner1).to.equal(100);

    const permission2 = await createPermissionForContract(
      hre,
      signer2,
      PFHERC20Address,
    );
    const balanceSigner2Encrypted = await PFHERC20.balanceOf(signer2, permission2);
    const balanceSigner2 = fhenixjs.unseal(
      PFHERC20Address,
      balanceSigner2Encrypted,
      signer2.address,
    );
    expect(balanceSigner2).to.equal(0);

  });


  it("should not  be able to transferFrom only if allowance is sufficient", async function () {
    const permission1 = await createPermissionForContract(
      hre,
      signer1,
      PFHERC20Address,
    );
    const permission2 = await createPermissionForContract(
      hre,
      signer2,
      PFHERC20Address,
    );
    let encrypted_mint = await fhenixjs.encrypt_uint32(100)

    const transaction = await PFHERC20.mint(signer1, encrypted_mint);
    await transaction.wait();

    let encrypted_approve = await fhenixjs.encrypt_uint32(50)
    const tx = await PFHERC20.connect(signer1).approve(signer2, encrypted_approve, permission1)
    await tx.wait();

    const allowancSigner2Encrypted = await PFHERC20.allowance(signer1, signer2, permission2);
    const allowanceSigner2 = fhenixjs.unseal(
      PFHERC20Address,
      allowancSigner2Encrypted,
      signer2.address,
    );
    expect(allowanceSigner2).to.equal(50);


    let encrypted_transferfrom = await fhenixjs.encrypt_uint32(70)
    let tx10 = await PFHERC20.connect(signer2).transferFrom(signer1, signer2, encrypted_transferfrom, permission2);
    await tx10.wait();

    const permission1balance = await createPermissionForContract(
      hre,
      signer1,
      PFHERC20Address,
    );
    const balanceSigner1Encrypted = await PFHERC20.balanceOf(signer1, permission1balance);
    const balanceSigner1 = fhenixjs.unseal(
      PFHERC20Address,
      balanceSigner1Encrypted,
      signer1.address,
    );


    expect(balanceSigner1).to.equal(100);

    const permission2balance = await createPermissionForContract(
      hre,
      signer2,
      PFHERC20Address,
    );
    const balanceSigner2Encrypted = await PFHERC20.balanceOf(signer2, permission2balance);
    const balanceSigner2 = fhenixjs.unseal(
      PFHERC20Address,
      balanceSigner2Encrypted,
      signer2.address,
    );
    expect(balanceSigner2).to.equal(0);



    let encrypted_transferfromPass = await fhenixjs.encrypt_uint32(30)
    const encryptedTransferAmountPass = await PFHERC20.connect(signer2).transferFrom(signer1, signer2, encrypted_transferfromPass, permission2);
    encryptedTransferAmountPass.wait()
    const permission2Allowance = await createPermissionForContract(
      hre,
      signer2,
      PFHERC20Address,
    );
    const allowancSigner2EncryptedPass = await PFHERC20.allowance(signer1, signer2, permission2Allowance);


    const allowanceSigner2Pass = fhenixjs.unseal(
      PFHERC20Address,
      allowancSigner2EncryptedPass,
      signer2.address,
    );
    expect(allowanceSigner2Pass).to.equal(0);



    const permission2NewBalance = await createPermissionForContract(
      hre,
      signer2,
      PFHERC20Address,
    );
    const balanceSigner2EncryptedPass = await PFHERC20.balanceOf(signer2, permission2NewBalance);
    const balanceSigner2Pass = fhenixjs.unseal(
      PFHERC20Address,
      balanceSigner2EncryptedPass,
      signer2.address,
    );
    expect(balanceSigner2Pass).to.equal(50);


    const permission1NewBalance = await createPermissionForContract(
      hre,
      signer1,
      PFHERC20Address,
    );
    const balanceSigner1EncryptedPass = await PFHERC20.balanceOf(signer1, permission1NewBalance);
    const balanceSigner1Pass = fhenixjs.unseal(
      PFHERC20Address,
      balanceSigner1EncryptedPass,
      signer1.address,
    );
    expect(balanceSigner1Pass).to.equal(100 - 50);


  });
})
