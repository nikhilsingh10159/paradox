import { expect } from "chai";
import hardhat from "hardhat";
const { ethers } = hardhat;

describe("YieldEscrow", function () {
  let escrow, mockUSDC, mockAave, sbt;
  let owner, client, freelancer, oracle, other;

  const STAKE_AMOUNT = ethers.parseUnits("50", 6);
  const MILESTONE_AMOUNT = ethers.parseUnits("1000", 6);

  beforeEach(async function () {
    [owner, client, freelancer, oracle, other] = await ethers.getSigners();

    // Deploy Mocks
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockUSDC = await MockERC20.deploy();

    const MockAave = await ethers.getContractFactory("MockAavePool");
    mockAave = await MockAave.deploy();

    // Deploy Escrow
    const YieldEscrow = await ethers.getContractFactory("YieldEscrow");
    escrow = await YieldEscrow.deploy(
      await mockUSDC.getAddress(),
      await mockAave.getAddress(),
      ethers.ZeroAddress, // mock aToken
      oracle.address,
      ethers.ZeroAddress  // mock reputationSBT (set properly below)
    );

    // Deploy ReputationSBT
    const ReputationSBT = await ethers.getContractFactory("ReputationSBT");
    sbt = await ReputationSBT.deploy();
    await sbt.setEscrowContract(await escrow.getAddress());
    await escrow.setReputationSBT(await sbt.getAddress());

    // Mint USDC
    await mockUSDC.mint(client.address, ethers.parseUnits("10000", 6));
    await mockUSDC.mint(freelancer.address, ethers.parseUnits("10000", 6));

    // Approve Escrow
    await mockUSDC.connect(client).approve(await escrow.getAddress(), ethers.MaxUint256);
    await mockUSDC.connect(freelancer).approve(await escrow.getAddress(), ethers.MaxUint256);
  });

  it("should create, fund, and release a milestone successfully", async function () {
    await escrow.connect(client).createMilestone(freelancer.address, MILESTONE_AMOUNT, "ipfs://reqs");
    
    // Fund
    await escrow.connect(client).fundMilestone(1);
    
    // Stake
    await escrow.connect(freelancer).stakeFreelancer(1);
    
    // Submit
    await escrow.connect(freelancer).submitDeliverable(1, "ipfs://deliverable");
    
    // Release
    await expect(escrow.connect(client).releaseFunds(1))
      .to.emit(escrow, "FundsReleased")
      .withArgs(1, freelancer.address, MILESTONE_AMOUNT + STAKE_AMOUNT);
  });

  it("should allow auto-claim if client ghosts after timeout", async function () {
    await escrow.connect(client).createMilestone(freelancer.address, MILESTONE_AMOUNT, "ipfs://reqs");
    await escrow.connect(client).fundMilestone(1);
    await escrow.connect(freelancer).stakeFreelancer(1);
    await escrow.connect(freelancer).submitDeliverable(1, "ipfs://deliverable");

    // Fast forward time
    await ethers.provider.send("evm_increaseTime", [8 * 24 * 60 * 60]); // 8 days
    await ethers.provider.send("evm_mine");

    await expect(escrow.connect(freelancer).claimTimeout(1))
      .to.emit(escrow, "TimeoutClaimed")
      .withArgs(1, freelancer.address);
  });

  it("should handle partial delivery dispute split (70/30)", async function () {
    await escrow.connect(client).createMilestone(freelancer.address, MILESTONE_AMOUNT, "ipfs://reqs");
    await escrow.connect(client).fundMilestone(1);
    await escrow.connect(freelancer).stakeFreelancer(1);
    await escrow.connect(freelancer).submitDeliverable(1, "ipfs://deliverable");

    await escrow.connect(client).raiseDispute(1);

    const initialFreelancerBal = await mockUSDC.balanceOf(freelancer.address);
    const initialClientBal = await mockUSDC.balanceOf(client.address);

    // Oracle resolves: 70% freelancer, 30% client, no scope creep
    await escrow.connect(oracle).arbitrateDispute(1, 70, 30, false);

    const finalFreelancerBal = await mockUSDC.balanceOf(freelancer.address);
    const finalClientBal = await mockUSDC.balanceOf(client.address);

    const freelancerPayout = ethers.parseUnits("700", 6) + STAKE_AMOUNT; // 70% + stake
    const clientRefund = ethers.parseUnits("300", 6) + STAKE_AMOUNT; // 30% + stake

    expect(finalFreelancerBal - initialFreelancerBal).to.equal(freelancerPayout);
    expect(finalClientBal - initialClientBal).to.equal(clientRefund);
  });

  it("should slash client on scope creep dispute", async function () {
    await escrow.connect(client).createMilestone(freelancer.address, MILESTONE_AMOUNT, "ipfs://reqs");
    await escrow.connect(client).fundMilestone(1);
    await escrow.connect(freelancer).stakeFreelancer(1);
    await escrow.connect(freelancer).submitDeliverable(1, "ipfs://deliverable");

    await escrow.connect(client).raiseDispute(1);

    const initialFreelancerBal = await mockUSDC.balanceOf(freelancer.address);
    const initialClientBal = await mockUSDC.balanceOf(client.address);

    // Oracle resolves: 100% freelancer, 0% client, scope creep = true
    await escrow.connect(oracle).arbitrateDispute(1, 100, 0, true);

    const finalFreelancerBal = await mockUSDC.balanceOf(freelancer.address);
    const finalClientBal = await mockUSDC.balanceOf(client.address);

    // Freelancer gets 100% + their stake + client's stake
    const freelancerPayout = MILESTONE_AMOUNT + STAKE_AMOUNT + STAKE_AMOUNT; 
    
    expect(finalFreelancerBal - initialFreelancerBal).to.equal(freelancerPayout);
    expect(finalClientBal - initialClientBal).to.equal(0n);
  });

  it("should revert if non-oracle tries to arbitrate", async function () {
    await escrow.connect(client).createMilestone(freelancer.address, MILESTONE_AMOUNT, "ipfs://reqs");
    await escrow.connect(client).fundMilestone(1);
    await escrow.connect(freelancer).stakeFreelancer(1);
    await escrow.connect(client).raiseDispute(1);

    await expect(escrow.connect(other).arbitrateDispute(1, 50, 50, false))
      .to.be.revertedWith("Only Oracle");
  });

  it("should revert Soulbound Reputation token transfers", async function () {
    await sbt.connect(owner).mint(freelancer.address);
    const tokenId = 1;
    await expect(sbt.connect(freelancer).transferFrom(freelancer.address, other.address, tokenId))
      .to.be.revertedWith("Err: Token is Soulbound");
  });
});
