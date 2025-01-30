import { expect } from "chai";
import { network } from "hardhat";
import { ethers } from "hardhat";

import type { CyfherERC20 } from "../../types";
import { createInstance } from "../instance";
import { reencryptEuint64 } from "../reencrypt";
import { getSigners, initSigners } from "../signers";
import { debug } from "../utils";

describe("Simple AMM testing", function () {
  before(async function () {
    await initSigners();
    this.signers = await getSigners();
  });

  beforeEach(async function () {
    const erc20Factory = await ethers.getContractFactory("CyfherERC20");
    const EURContract = await erc20Factory.connect(this.signers.alice).deploy("EUR stablecoin", "EUR");
    await EURContract.waitForDeployment();

    this.EURContractAddress = await EURContract.getAddress();
    this.EURContract = EURContract;

    const USDContract = await erc20Factory.connect(this.signers.alice).deploy("USD stablecoin", "USD");
    await USDContract.waitForDeployment();

    this.USDContractAddress = await USDContract.getAddress();
    this.USDContract = USDContract;

    this.fhevm = await createInstance();

    const UniswapV2FactoryFactory = await ethers.getContractFactory("CyfherFactory");
    const uniswapV2Factory = await UniswapV2FactoryFactory.connect(this.signers.alice).deploy(this.signers.alice);
    await uniswapV2Factory.waitForDeployment();

    this.uniswapV2Factory = uniswapV2Factory;
    this.uniswapV2FactoryAddress = await uniswapV2Factory.getAddress();

    const UniswapV2RouterFactory = await ethers.getContractFactory("CyfherRouter");
    const uniswapV2Router = await UniswapV2RouterFactory.connect(this.signers.alice).deploy(
      this.uniswapV2FactoryAddress,
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // Mainnet address of WETH, we don't care as we dont use WETH for now
    );
    await uniswapV2Router.waitForDeployment();

    this.uniswapV2Router = uniswapV2Router;
    this.uniswapV2RouterAddress = await uniswapV2Router.getAddress();
  });

  describe("Deployment testing", function () {
    it("should mint erc20 token to user", async function () {
      const transaction = await this.EURContract.mint(this.signers.alice, 1000);
      await transaction.wait();

      // Reencrypt Alice's balance
      const balanceHandleAlice = await this.EURContract.balanceOf(this.signers.alice);
      const balanceAliceEUR = await reencryptEuint64(
        this.signers.alice,
        this.fhevm,
        balanceHandleAlice,
        this.EURContractAddress,
      );

      expect(balanceAliceEUR).to.equal(1000);

      const totalSupplyEUR = await this.EURContract.totalSupply();
      expect(totalSupplyEUR).to.equal(1000);
    });

    it("should add a new pair to the factory", async function () {
      const pairsLengthBeforeCreation = await this.uniswapV2Factory.allPairsLength();
      expect(pairsLengthBeforeCreation).to.equal(0);

      const transaction = await this.uniswapV2Factory.createPair(this.EURContractAddress, this.USDContractAddress);
      await transaction.wait();

      const pairsLengthAfterCreation = await this.uniswapV2Factory.allPairsLength();
      expect(pairsLengthAfterCreation).to.equal(1);
    });

    it("should register the correct tokens within a pair", async function () {
      const transaction = await this.uniswapV2Factory.createPair(this.EURContractAddress, this.USDContractAddress);
      await transaction.wait();

      const addressPairCreated = await this.uniswapV2Factory.getPair(this.EURContractAddress, this.USDContractAddress);

      const UniswapV2PairFactory = await ethers.getContractFactory("CyfherPair");

      // Load uniswapV2PairContract just created
      const uniswapV2PairContract = new ethers.BaseContract(
        addressPairCreated,
        UniswapV2PairFactory.interface,
        this.signers.alice,
      );
      expect(await uniswapV2PairContract.getAddress()).to.equal(addressPairCreated);

      const factoryVariableFromPairContract = await uniswapV2PairContract.factory();
      expect(this.uniswapV2FactoryAddress).to.equal(factoryVariableFromPairContract);

      const token0AddressFromPairContract = await uniswapV2PairContract.token0();
      expect(this.EURContractAddress).to.equal(token0AddressFromPairContract);

      const token1AddressFromPairContract = await uniswapV2PairContract.token1();
      expect(this.USDContractAddress).to.equal(token1AddressFromPairContract);

      const totalSupplyFromPairContract = await uniswapV2PairContract.totalSupply();
      expect(totalSupplyFromPairContract).to.equal(0);
    });
  });

  describe("Liquidity providing testing", function () {
    beforeEach(async function () {
      const mintEUR = await this.EURContract.mint(this.signers.alice, 3000);
      await mintEUR.wait();

      const mintUSD = await this.USDContract.mint(this.signers.alice, 5000);
      await mintUSD.wait();

      // Give approval required for EUR
      const inputAllowanceEUR = this.fhevm.createEncryptedInput(this.EURContractAddress, this.signers.alice.address);
      inputAllowanceEUR.add64(2500);
      const encryptedInputAllowanceEUR = await inputAllowanceEUR.encrypt();
      const approvalEURTransaction = await this.EURContract["approve(address,bytes32,bytes)"](
        this.uniswapV2RouterAddress,
        encryptedInputAllowanceEUR.handles[0],
        encryptedInputAllowanceEUR.inputProof,
      );
      await approvalEURTransaction.wait();

      // Give approval required for USD
      const inputAllowanceUSD = this.fhevm.createEncryptedInput(this.USDContractAddress, this.signers.alice.address);
      inputAllowanceUSD.add64(4000);
      const encryptedInputAllowanceUSD = await inputAllowanceUSD.encrypt();
      const approvalUSDTransaction = await this.USDContract["approve(address,bytes32,bytes)"](
        this.uniswapV2RouterAddress,
        encryptedInputAllowanceUSD.handles[0],
        encryptedInputAllowanceUSD.inputProof,
      );
      await approvalUSDTransaction.wait();

      // Add first liquiidty
      const inputAddLiquidity = this.fhevm.createEncryptedInput(
        this.uniswapV2RouterAddress,
        this.signers.alice.address,
      );
      inputAddLiquidity.add64(1337).add64(2000);
      const encryptedInputAddLiquidity = await inputAddLiquidity.encrypt();

      const transactionAddLiquidity = await this.uniswapV2Router.addLiquidity(
        this.EURContractAddress,
        this.USDContractAddress,
        encryptedInputAddLiquidity.handles[0],
        encryptedInputAddLiquidity.handles[1],
        encryptedInputAddLiquidity.inputProof,
        this.signers.alice,
      );
      await transactionAddLiquidity.wait();
    });

    it("should give token allowances to provide liquidity", async function () {
      // Verify EUR allowance
      const allowanceEUR = await this.EURContract.allowance(this.signers.alice, this.uniswapV2RouterAddress);
      const decryptedAllowanceEUR = await reencryptEuint64(
        this.signers.alice,
        this.fhevm,
        allowanceEUR,
        this.EURContractAddress,
      );
      expect(decryptedAllowanceEUR).to.equal(2500 - 1337);

      // Verify USD allowance
      const allowanceUSD = await this.USDContract.allowance(this.signers.alice, this.uniswapV2RouterAddress);
      const decryptedAllowanceUSD = await reencryptEuint64(
        this.signers.alice,
        this.fhevm,
        allowanceUSD,
        this.USDContractAddress,
      );
      expect(decryptedAllowanceUSD).to.equal(4000 - 2000);
    });

    it("should create a new pair if it doesn't exist", async function () {
      const pairsLengthAfterCreation = await this.uniswapV2Factory.allPairsLength();
      expect(pairsLengthAfterCreation).to.equal(1);
    });

    it("should transfer liquidity tokens to the pool", async function () {
      // Get pair address
      const addressPairCreated = await this.uniswapV2Factory.getPair(this.EURContractAddress, this.USDContractAddress);
      const balanceLPEUR = await this.EURContract.balanceOf(addressPairCreated);
      const balanceLPEURdecrypted = await debug.decrypt64(balanceLPEUR); //would not work in testnet
      expect(balanceLPEURdecrypted).to.equal(1337);

      const balanceLPUSD = await this.USDContract.balanceOf(addressPairCreated);
      const balanceLPUSDdecrypted = await debug.decrypt64(balanceLPUSD); //would not work in testnet
      expect(balanceLPUSDdecrypted).to.equal(2000);
    });

    it("should be possible to add liquidity a second time", async function () {
      // Second add liquidity transaction
      const secondAddLiquidityInput = this.fhevm.createEncryptedInput(
        this.uniswapV2RouterAddress,
        this.signers.alice.address,
      );
      secondAddLiquidityInput.add64(10).add64(10);
      const secondAddLiquidityInputEncrypted = await secondAddLiquidityInput.encrypt();
      const secondAddLiquidityTransaction = await this.uniswapV2Router.addLiquidity(
        this.EURContractAddress,
        this.USDContractAddress,
        secondAddLiquidityInputEncrypted.handles[0],
        secondAddLiquidityInputEncrypted.handles[1],
        secondAddLiquidityInputEncrypted.inputProof,
        this.signers.alice,
      );
      await secondAddLiquidityTransaction.wait();

      const addressPairCreated = await this.uniswapV2Factory.getPair(this.EURContractAddress, this.USDContractAddress);

      const UniswapV2PairFactory = await ethers.getContractFactory("CyfherPair");

      // Load uniswapV2PairContract just created
      const uniswapV2PairContract = new ethers.BaseContract(
        addressPairCreated,
        UniswapV2PairFactory.interface,
        this.signers.alice,
      );

      const totalSupplyLP = await uniswapV2PairContract.totalSupply();
      const totalSupplyLPDecrypted = await debug.decrypt64(totalSupplyLP); //would not work in testnet
      expect(totalSupplyLPDecrypted).to.equal(1337 * 2000 + 10 * 10);
    });
  });
});
