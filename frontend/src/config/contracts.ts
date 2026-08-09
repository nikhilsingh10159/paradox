export const TOKEN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000001";
export const ESCROW_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_ADDRESS || "0x0000000000000000000000000000000000000002";
export const REPUTATION_SBT_ADDRESS = process.env.NEXT_PUBLIC_REPUTATION_SBT_ADDRESS || "0x0000000000000000000000000000000000000003";

export const TOKEN_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function balanceOf(address account) public view returns (uint256)",
  "function decimals() public view returns (uint8)",
  "function allowance(address owner, address spender) public view returns (uint256)",
];

export const ESCROW_ABI = [
  // Job lifecycle
  "function createJob(address freelancer, uint256[] calldata amounts, string[] calldata requirementsCIDs) external returns (uint256)",
  "function fundJob(uint256 jobId) external",
  "function stakeFreelancerJob(uint256 jobId) external",
  "function submitDeliverable(uint256 jobId, uint256 trancheIndex, string calldata deliverableCID) external",
  "function releaseTranche(uint256 jobId, uint256 trancheIndex) external",
  "function raiseDispute(uint256 jobId, uint256 trancheIndex) external",

  // Getters — for on-chain state sync
  "function jobs(uint256) public view returns (uint256 id, address client, address freelancer, uint256 totalAmount, uint256 trancheCount, uint256 completedTranches, uint256 clientStake, uint256 freelancerStake)",
  "function tranches(uint256, uint256) public view returns (uint256 id, uint256 jobId, address client, address freelancer, uint256 amount, uint256 clientStake, uint256 freelancerStake, uint256 lastUpdate, uint8 status, string requirementsCID, string deliverableCID)",
  "function getTrancheStatus(uint256 jobId, uint256 trancheIndex) external view returns (uint8)",
  "function jobCount() public view returns (uint256)",
  "function STAKE_AMOUNT() public view returns (uint256)",

  // Events — typed so ethers can parse logs
  "event JobCreated(uint256 indexed jobId, address indexed client, address indexed freelancer, uint256 totalAmount)",
  "event TrancheFundsReleased(uint256 indexed jobId, uint256 indexed trancheIndex, address to, uint256 amount)",
  "event TrancheDisputeRaised(uint256 indexed jobId, uint256 indexed trancheIndex, address raisedBy)",
  "event TrancheDisputeResolved(uint256 indexed jobId, uint256 indexed trancheIndex, uint256 freelancerPayout, uint256 clientRefund, bool scopeCreepDetected)",
  "event TrancheYieldDistributed(uint256 indexed jobId, uint256 indexed trancheIndex, uint256 clientYield, uint256 freelancerYield)",
];

export const REPUTATION_SBT_ABI = [
  "function getReputation(address user) external view returns (uint8 deliverySpeed, uint8 disputeWinRate, uint8 antiGhostingRating, uint8 completionRate, uint8 trustTier, uint256 totalJobs, uint256 successfulJobs, uint256 totalDisputes, uint256 disputesWon)",
  "function mint(address to) external returns (uint256)",
  "function userToTokenId(address) external view returns (uint256)",
];

/** Maps on-chain uint8 status enum to UI string labels */
export const TRANCHE_STATUS_MAP: Record<number, string> = {
  0: "Pending",
  1: "Funded",
  2: "Submitted",
  3: "Disputed",
  4: "Released",
  5: "Refunded",
};
