export const TOKEN_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000001"; // Placeholder
export const ESCROW_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000002"; // Placeholder
export const REPUTATION_SBT_ADDRESS = "0x0000000000000000000000000000000000000003"; // Placeholder

export const TOKEN_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function balanceOf(address account) public view returns (uint256)",
  "function decimals() public view returns (uint8)"
];

export const ESCROW_ABI = [
  "function createAgreement(address _freelancer, uint256 _amount) external",
  "function releaseToFreelancer(uint256 _agreementId) external",
  "function refundClient(uint256 _agreementId) external",
  "function agreements(uint256) public view returns (address client, address freelancer, uint256 amount, uint8 status)",
  "function createJob(address freelancer, uint256[] calldata amounts, string[] calldata requirementsCIDs) external returns (uint256)",
  "function fundJob(uint256 jobId) external",
  "function submitDeliverable(uint256 jobId, uint256 trancheIndex, string calldata deliverableCID) external",
  "function releaseTranche(uint256 jobId, uint256 trancheIndex) external",
  "function raiseDispute(uint256 jobId, uint256 trancheIndex) external",
  "function jobs(uint256) public view returns (uint256 id, address client, address freelancer, uint256 totalAmount, uint256 trancheCount, uint256 completedTranches, uint256 clientStake, uint256 freelancerStake)"
];

export const REPUTATION_SBT_ABI = [
  "function getReputation(address user) external view returns (uint8, uint8, uint8, uint8, uint8, uint256)",
  "function mint(address to) external returns (uint256)",
  "function userToTokenId(address) external view returns (uint256)"
];
