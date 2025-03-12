import { expect } from "chai";
import hre, { ethers, fhenixjs } from "hardhat";
import { TokenDistributor, PFHERC20 } from "../../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import {
  createPermissionForContract,
  getTokensFromFaucet,
} from "../../utils/instance";


describe("TokenDistributor", function () {

  let signer: SignerWithAddress;

  let TokenDistributor: TokenDistributor;
  let TokenDistributorAddress: string;
  let PFHERC20: PFHERC20;
  let PFHERC20Address: string;

  before(async () => {
    signer = (await ethers.getSigners())[0];
    await getTokensFromFaucet(hre, signer.address);
  });

  beforeEach(async () => {
    // deploy Distributor
    const TokenDistributorFactory = await ethers.getContractFactory("TokenDistributor");
    TokenDistributor = await TokenDistributorFactory.deploy();
    await TokenDistributor.waitForDeployment();
    TokenDistributorAddress = await TokenDistributor.getAddress();
    //Deploy FHERC20
    const FHERC20Factory = await ethers.getContractFactory("PFHERC20");
    PFHERC20 = await FHERC20Factory.deploy("Private TOKEN", "PT", 3); // ✅ Correct usage
    await PFHERC20.waitForDeployment();
    PFHERC20Address = await PFHERC20.getAddress();
  });

  it("should transfer ownership", async function () {
    const ownerBefore = await PFHERC20.owner();
    expect(ownerBefore).to.equal(signer.address);

    const transfer = await PFHERC20.connect(signer).transferOwnership(TokenDistributorAddress);
    await transfer.wait();

    const accept = await TokenDistributor.connect(signer).acceptOwnership(PFHERC20Address);
    await accept.wait();

    const ownerAfter = await PFHERC20.owner();
    expect(ownerAfter).to.equal(TokenDistributorAddress);
  });

  it("should not claim token without ownership", async function () {
    await expect(TokenDistributor.connect(signer).claim(PFHERC20Address)).to.be.revertedWithCustomError(PFHERC20, "OwnableUnauthorizedAccount")
      .withArgs(TokenDistributorAddress);
  });


  it("should claim", async function () {
    // create permission for signer 
    const permission = await createPermissionForContract(
      hre,
      signer,
      PFHERC20Address,
    );
    const balanceEncryptedBefore = await PFHERC20.connect(signer).balanceOf(signer, permission);
    const balanceBefore = fhenixjs.unseal(
      PFHERC20Address,
      balanceEncryptedBefore,
      signer.address,
    );



    const transfer = await PFHERC20.connect(signer).transferOwnership(TokenDistributorAddress);
    await transfer.wait();
    const accept = await TokenDistributor.connect(signer).acceptOwnership(PFHERC20Address);
    await accept.wait();

    const claim = await TokenDistributor.connect(signer).claim(PFHERC20Address);
    await claim.wait();
    const balanceEncryptedAfter = await PFHERC20.connect(signer).balanceOf(signer, permission);
    const balanceAfter = fhenixjs.unseal(
      PFHERC20Address,
      balanceEncryptedAfter,
      signer.address,
    );
    expect(balanceBefore).to.equal(0);
    expect(balanceAfter).to.equal(100000); 
  });
});





