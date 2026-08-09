const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy MockERC20
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  const mockUSDC = await MockERC20.deploy();
  await mockUSDC.waitForDeployment();
  const usdcAddress = await mockUSDC.getAddress();
  console.log("MockERC20 (USDC) deployed to:", usdcAddress);

  // 2. Deploy MockAavePool
  const MockAavePool = await hre.ethers.getContractFactory("MockAavePool");
  const mockAave = await MockAavePool.deploy();
  await mockAave.waitForDeployment();
  const aaveAddress = await mockAave.getAddress();
  console.log("MockAavePool deployed to:", aaveAddress);

  // 3. Deploy ReputationSBT
  const ReputationSBT = await hre.ethers.getContractFactory("ReputationSBT");
  const reputationSBT = await ReputationSBT.deploy();
  await reputationSBT.waitForDeployment();
  const sbtAddress = await reputationSBT.getAddress();
  console.log("ReputationSBT deployed to:", sbtAddress);

  // 4. Deploy YieldEscrow
  const oracleAddress = deployer.address; // Use deployer as the oracle for testing
  const aTokenAddress = hre.ethers.ZeroAddress; // Mock
  
  const YieldEscrow = await hre.ethers.getContractFactory("YieldEscrow");
  const escrow = await YieldEscrow.deploy(
    usdcAddress,
    aaveAddress,
    aTokenAddress,
    oracleAddress,
    sbtAddress
  );
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("YieldEscrow deployed to:", escrowAddress);

  // 5. Setup Contracts
  await reputationSBT.setEscrowContract(escrowAddress);
  console.log("ReputationSBT linked to Escrow contract");

  // Output config for frontend and backend
  console.log("\n--- Frontend / Backend Environment Variables ---");
  console.log(`NEXT_PUBLIC_ESCROW_ADDRESS=${escrowAddress}`);
  console.log(`NEXT_PUBLIC_TOKEN_ADDRESS=${usdcAddress}`);
  console.log(`NEXT_PUBLIC_REPUTATION_SBT_ADDRESS=${sbtAddress}`);
  console.log(`CONTRACT_ADDRESS=${escrowAddress}`);
  console.log(`ORACLE_PRIVATE_KEY=<your-deployer-private-key>`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
