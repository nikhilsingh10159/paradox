export const TOKEN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000001";
export const ESCROW_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_ADDRESS || "0x0000000000000000000000000000000000000002";
export const REPUTATION_SBT_ADDRESS = process.env.NEXT_PUBLIC_REPUTATION_SBT_ADDRESS || "0x0000000000000000000000000000000000000003";

export const TOKEN_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function balanceOf(address account) public view returns (uint256)",
  "function decimals() public view returns (uint8)"
];

export const ESCROW_ABI = [
  "function createJob(address freelancer, uint256[] calldata amounts, string[] calldata requirementsCIDs) external returns (uint256)",
  "function fundJob(uint256 jobId) external",
  "function submitDeliverable(uint256 jobId, uint256 trancheIndex, string calldata deliverableCID) external",
  "function releaseTranche(uint256 jobId, uint256 trancheIndex) external",
  "function raiseDispute(uint256 jobId, uint256 trancheIndex) external",
  "function jobs(uint256) public view returns (uint256 id, address client, address freelancer, uint256 totalAmount, uint256 trancheCount, uint256 completedTranches, uint256 clientStake, uint256 freelancerStake)",
  "function getTrancheStatus(uint256 jobId, uint256 trancheIndex) external view returns (uint8)"
];

export const REPUTATION_SBT_ABI = [
  "function getReputation(address user) external view returns (uint8, uint8, uint8, uint8, uint8, uint256)",
  "function mint(address to) external returns (uint256)",
  "function userToTokenId(address) external view returns (uint256)"
];
