export const TOKEN_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000001"; // Placeholder
export const ESCROW_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000002"; // Placeholder

export const TOKEN_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function balanceOf(address account) public view returns (uint256)",
  "function decimals() public view returns (uint8)"
];

export const ESCROW_ABI = [
  "function createAgreement(address _freelancer, uint256 _amount) external",
  "function releaseToFreelancer(uint256 _agreementId) external",
  "function refundClient(uint256 _agreementId) external",
  "function agreements(uint256) public view returns (address client, address freelancer, uint256 amount, uint8 status)"
];
