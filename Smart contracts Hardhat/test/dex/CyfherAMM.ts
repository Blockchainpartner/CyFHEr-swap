import { expect } from "chai";
import hre, { ethers, fhenixjs } from "hardhat";
import { PFHERC20, CyfherFactory, CyfherRouter } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import {
  getTokensFromFaucet,
  createPermissionForContract,
} from "../../utils/instance";


describe("CyfherAMM", function () {

  let signer1: SignerWithAddress;
  let signer2: SignerWithAddress;
  let signer3: SignerWithAddress;

  let factory: CyfherFactory;
  let factoryAddress: string;
  let router: CyfherRouter;
  let routerAddress: string;

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
    //Contracts factories
    const FHERC20Factory = await ethers.getContractFactory("PFHERC20");
    const CyfherFactory = await ethers.getContractFactory("CyfherFactory");
    const routerFactory = await ethers.getContractFactory("CyfherRouter");
    // deploy factory
    factory = await CyfherFactory.deploy(signer1);
    await factory.waitForDeployment();
    factoryAddress = await factory.getAddress();

    // deploy router
    router = await routerFactory.deploy(factoryAddress);
    await router.waitForDeployment()

    // deploy tokens
    token1 = await FHERC20Factory.deploy("token1", "TKN1", 3);
    await token1.waitForDeployment();
    token2 = await FHERC20Factory.deploy("token2", "TKN2", 3);
    await token2.waitForDeployment();

    token1Address = await token1.getAddress();
    token2Address = await token2.getAddress();
    routerAddress = await router.getAddress();
    // mint tokens for signer1
    const  encrypted_mint = await fhenixjs.encrypt_uint32(100)
    const tx1 = await token1.connect(signer1).mint(signer1, encrypted_mint);
    await tx1.wait();
    const tx2 = await token2.connect(signer1).mint(signer1, encrypted_mint);
    await tx2.wait();
    const tx3 = await token1.connect(signer1).mint(signer2, encrypted_mint);
    await tx3.wait();
    const tx4 = await token2.connect(signer1).mint(signer2, encrypted_mint);
    await tx4.wait();
  });


  it("Liquidity providing ", async function () {
    const  encrypted_mint = await fhenixjs.encrypt_uint32(100)

    // make allowance for the router 
    const permission1 = await createPermissionForContract(
      hre,
      signer1,
      token1Address,
    );
    const permission2 = await createPermissionForContract(
      hre,
      signer1,
      token2Address,
    );
    const tx3 = await token1.connect(signer1).approve(routerAddress, encrypted_mint, permission1);
    await tx3.wait();
    const tx4 = await token2.connect(signer1).approve(routerAddress, encrypted_mint, permission2);
    await tx4.wait();
    // add liquidity 
    let permissionA = await createPermissionForContract(
      hre,
      signer1,
      token1Address,
    );
    let permissionB = await createPermissionForContract(
      hre,
      signer1,
      token2Address,
    );
    let encrypted_liquidity1 = await fhenixjs.encrypt_uint32(10);

    let encrypted_balanceA = await token1.connect(signer1).balanceOf(signer1, permissionA);
    let encrypted_balanceB = await token2.connect(signer1).balanceOf(signer1, permissionB);
    let balanceA =  fhenixjs.unseal(token1Address, encrypted_balanceA, signer1.address);
    let balanceB =  fhenixjs.unseal(token2Address, encrypted_balanceB, signer1.address);
    expect(balanceA).to.equal(100);
    expect(balanceB).to.equal(100);

    permissionA = await createPermissionForContract(
      hre,
      signer1,
      token1Address,
    );
    permissionB = await createPermissionForContract(
      hre,
      signer1,
      token2Address,
    );
// first addition of liquidity
    const tx5 = await router.connect(signer1).addLiquidity(token1Address, token2Address, encrypted_liquidity1, encrypted_liquidity1, permissionA, permissionB, signer1);
    await tx5.wait();
    const pairAddress = await factory.connect(signer1).getPair(token1Address, token2Address);
    const pair = await ethers.getContractAt("CyfherPair", pairAddress, signer1);
    const permissionPair = await createPermissionForContract(
      hre,
      signer1,
      pairAddress,
    );
    let ecryptedLpBalance = await pair.connect(signer1).balanceOf(signer1, permissionPair);
    let lpBalance =  fhenixjs.unseal(pairAddress, ecryptedLpBalance, signer1.address);
    expect(lpBalance).to.equal(9);

    encrypted_balanceA = await token1.connect(signer1).balanceOf(signer1, permissionA);
    encrypted_balanceB = await token2.connect(signer1).balanceOf(signer1, permissionB);

    balanceA =  fhenixjs.unseal(token1Address, encrypted_balanceA, signer1.address);
    balanceB =  fhenixjs.unseal(token2Address, encrypted_balanceB, signer1.address);
    expect(balanceA).to.equal(90);
    expect(balanceB).to.equal(90);

    // second addition of liquidity and punish liquidity provider 
    let encrypted_liquidity2 = await fhenixjs.encrypt_uint32(5)
    const tx6 = await router.connect(signer1).addLiquidity(token1Address, token2Address, encrypted_liquidity1, encrypted_liquidity2, permissionA, permissionB, signer1);
    await tx6.wait();
    ecryptedLpBalance = await pair.connect(signer1).balanceOf(signer1, permissionPair);
    lpBalance =  fhenixjs.unseal(pairAddress, ecryptedLpBalance, signer1.address);
    expect(lpBalance).to.equal(14);
    encrypted_balanceA = await token1.connect(signer1).balanceOf(signer1, permissionA);
    encrypted_balanceB = await token2.connect(signer1).balanceOf(signer1, permissionB);
    balanceA =  fhenixjs.unseal(token1Address, encrypted_balanceA, signer1.address);
    balanceB =  fhenixjs.unseal(token2Address, encrypted_balanceB, signer1.address);

  });

  it("swap tokens", async function () {


  });

  it("Remove Liquidity ", async function () {


  });



})


;

   