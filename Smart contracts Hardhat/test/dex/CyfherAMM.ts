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
    const  encrypted_mint = await fhenixjs.encrypt_uint32(120)
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
    const encrypted_approval = await fhenixjs.encrypt_uint32(100)
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
    const tx3 = await token1.connect(signer1).approve(routerAddress, encrypted_approval, permission1);
    await tx3.wait();
    const tx4 = await token2.connect(signer1).approve(routerAddress, encrypted_approval, permission2);
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
    const tx5 = await router.connect(signer1).addLiquidity(token1Address, token2Address, encrypted_approval, encrypted_approval, permissionA, permissionB, signer1);
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
    expect(lpBalance).to.equal(99);

    let encrypted_balanceA = await token1.connect(signer1).balanceOf(signer1, permissionA);
    let encrypted_balanceB = await token2.connect(signer1).balanceOf(signer1, permissionB);

    let balanceA =  fhenixjs.unseal(token1Address, encrypted_balanceA, signer1.address);
    let balanceB =  fhenixjs.unseal(token2Address, encrypted_balanceB, signer1.address);
    expect(balanceA).to.equal(20);
    expect(balanceB).to.equal(20);


    // second addition of liquidity and punish liquidity provider 
    let encrypted_liquidity1 = await fhenixjs.encrypt_uint32(5)
    let encrypted_liquidity2 = await fhenixjs.encrypt_uint32(10)
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
;
    const tx6 = await token1.connect(signer1).approve(routerAddress, encrypted_liquidity1, permissionA);
    await tx6.wait();
    const tx7 = await token2.connect(signer1).approve(routerAddress, encrypted_liquidity2, permissionB);
    await tx7.wait();
    const allowancSigner2Encrypted = await token1.allowance(signer1, routerAddress, permissionA);
    const allowancSigner2 = fhenixjs.unseal(
      token1Address,
      allowancSigner2Encrypted,
      signer1.address,
    );
    expect(allowancSigner2).to.equal(5);
    const allowancSigner3Encrypted = await token2.allowance(signer1, routerAddress, permissionB);
    const allowancSigner3 = fhenixjs.unseal(
      token2Address,
      allowancSigner3Encrypted,
      signer1.address,
    );
    expect(allowancSigner3).to.equal(10);
    const tx8 = await router.connect(signer1).addLiquidity(token1Address, token2Address,
    encrypted_liquidity1, encrypted_liquidity2, permissionA, permissionB, signer1);
    await tx8.wait();

    ecryptedLpBalance = await pair.connect(signer1).balanceOf(signer1, permissionPair);
    lpBalance =  fhenixjs.unseal(pairAddress, ecryptedLpBalance, signer1.address);
    expect(lpBalance).to.equal(99+5);
    encrypted_balanceA = await token1.connect(signer1).balanceOf(signer1, permissionA);
    encrypted_balanceB = await token2.connect(signer1).balanceOf(signer1, permissionB);
    balanceA =  fhenixjs.unseal(token1Address, encrypted_balanceA, signer1.address);
    balanceB =  fhenixjs.unseal(token2Address, encrypted_balanceB, signer1.address); 
    expect(balanceA).to.equal(15);
    expect(balanceB).to.equal(10); 
  });

  it("swap tokens", async function () {

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
    let encrypted_balanceA = await token1.connect(signer1).balanceOf(signer1, permissionA);
    let encrypted_balanceB = await token2.connect(signer1).balanceOf(signer1, permissionB);
    let balanceA =  fhenixjs.unseal(token1Address, encrypted_balanceA, signer1.address);
    let balanceB =  fhenixjs.unseal(token2Address, encrypted_balanceB, signer1.address);
    expect(balanceA).to.equal(120);
    expect(balanceB).to.equal(120);

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
    let encrypted_liquidity1 = await fhenixjs.encrypt_uint32(100);
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
    expect(lpBalance).to.equal(99);

    encrypted_balanceA = await token1.connect(signer1).balanceOf(signer1, permissionA);
    encrypted_balanceB = await token2.connect(signer1).balanceOf(signer1, permissionB);

    balanceA =  fhenixjs.unseal(token1Address, encrypted_balanceA, signer1.address);
    balanceB =  fhenixjs.unseal(token2Address, encrypted_balanceB, signer1.address);
    expect(balanceA).to.equal(20);
    expect(balanceB).to.equal(20);
    const  encrypted_swap_approval = await fhenixjs.encrypt_uint32(50)

    // make allowance for the router 
    const permissionswap1 = await createPermissionForContract(
      hre,
      signer1,
      token1Address,
    );
    const permissionswap2 = await createPermissionForContract(
      hre,
      signer1,
      token2Address,
    );
    const tx6 = await token1.connect(signer1).approve(routerAddress, encrypted_swap_approval, permissionswap1);
    await tx6.wait();
    const tx7 = await token2.connect(signer1).approve(routerAddress, encrypted_swap_approval, permissionswap2);
    await tx7.wait();
    const swap =30
    let encrypted_swap_in = await fhenixjs.encrypt_uint32(swap);
    
    let encrypted_swap_out_min = await router.connect(signer1).EstimategetAmountOut(encrypted_swap_in, [token1Address, token2Address]);
    let encrypted_swap_out_min_enctrypted = await fhenixjs.encrypt_uint32(Number(encrypted_swap_out_min));
    const amountOut = await router.connect(signer1).EstimategetAmountOut(encrypted_swap_in, [token1Address, token2Address]);    
    expect(amountOut).to.equal(23);
    
    const tx8 = await router.connect(signer1).swapExactTokensForTokens(encrypted_swap_in,encrypted_swap_out_min_enctrypted,permissionswap1, permissionswap2,[token1Address, token2Address], signer1);
    await tx8.wait();

    encrypted_balanceA = await token1.connect(signer1).balanceOf(signer1, permissionA);
    encrypted_balanceB = await token2.connect(signer1).balanceOf(signer1, permissionB);

    balanceA =  fhenixjs.unseal(token1Address, encrypted_balanceA, signer1.address);
    balanceB =  fhenixjs.unseal(token2Address, encrypted_balanceB, signer1.address);
    expect(balanceA).to.equal(20);
    expect(balanceB).to.equal(43);   
  });

  it("Remove Liquidity ", async function () {
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
    let encrypted_balanceA = await token1.connect(signer1).balanceOf(signer1, permissionA);
    let encrypted_balanceB = await token2.connect(signer1).balanceOf(signer1, permissionB);
    let balanceA =  fhenixjs.unseal(token1Address, encrypted_balanceA, signer1.address);
    let balanceB =  fhenixjs.unseal(token2Address, encrypted_balanceB, signer1.address);
    expect(balanceA).to.equal(120);
    expect(balanceB).to.equal(120);

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
    let encrypted_liquidity1 = await fhenixjs.encrypt_uint32(100);
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
    expect(lpBalance).to.equal(99); 

    let encrypted_lp_to_remove = await fhenixjs.encrypt_uint32(50);
//add approval for router to remove liquidity
    const permissionC = await createPermissionForContract(
      hre,
      signer1,
      pairAddress,
    );
    const tx6 = await pair.connect(signer1).approve(routerAddress, encrypted_lp_to_remove, permissionC);
    await tx6.wait();
    const tx7 = await router.connect(signer1).removeLiquidity(token1Address, 
      token2Address, encrypted_lp_to_remove,permissionPair ,signer1.address);
    await tx7.wait();
    encrypted_balanceA = await token1.connect(signer1).balanceOf(signer1, permissionA);
    encrypted_balanceB = await token2.connect(signer1).balanceOf(signer1, permissionB);
    //DECRYPT BALANCE
    balanceA =  fhenixjs.unseal(token1Address, encrypted_balanceA, signer1.address);
    balanceB =  fhenixjs.unseal(token2Address, encrypted_balanceB, signer1.address);
    expect(balanceA).to.equal(70);
    expect(balanceB).to.equal(70);
    ecryptedLpBalance = await pair.connect(signer1).balanceOf(signer1, permissionPair);
    lpBalance =  fhenixjs.unseal(pairAddress, ecryptedLpBalance, signer1.address);
    expect(lpBalance).to.equal(49); 

    
  })

})


;

   