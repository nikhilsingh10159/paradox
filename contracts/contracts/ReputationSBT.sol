// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ERC-5192 Minimal Interface
interface IERC5192 {
    /// @notice Emitted when the locking status is changed to locked.
    /// @dev If a token is minted and the status is locked, this event should be emitted.
    /// @param tokenId The identifier for a token.
    event Locked(uint256 tokenId);

    /// @notice Emitted when the locking status is changed to unlocked.
    /// @dev If a token is minted and the status is unlocked, this event should be emitted.
    /// @param tokenId The identifier for a token.
    event Unlocked(uint256 tokenId);

    /// @notice Returns the locking status of an Soulbound Token
    /// @dev SBTs assigned to zero address are considered invalid, and queries
    /// about them do throw.
    /// @param tokenId The identifier for an SBT.
    function locked(uint256 tokenId) external view returns (bool);
}

/// @title ReputationSBT
/// @notice Soulbound Token for tracking Freelancer and Client reputation.
contract ReputationSBT is ERC721, IERC5192, Ownable {
    uint256 private _nextTokenId;
    address public escrowContract;

    struct ReputationScore {
        uint8 deliverySpeed; // 0-100
        uint8 disputeWinRate; // 0-100
        uint8 antiGhostingRating; // 0-100
        uint8 completionRate; // 0-100
        uint8 trustTier; // 1-5
        uint256 totalJobs;
        uint256 successfulJobs;
        uint256 totalDisputes;
        uint256 disputesWon;
    }

    mapping(uint256 => ReputationScore) public profiles;
    mapping(address => uint256) public userToTokenId;

    event ReputationUpdated(uint256 indexed tokenId, ReputationScore score);
    event EscrowContractUpdated(address indexed newEscrowContract);

    modifier onlyAuthorized() {
        require(msg.sender == owner() || msg.sender == escrowContract, "Unauthorized: Not Admin or Escrow");
        _;
    }

    constructor() ERC721("Freelance Reputation", "FREEREP") Ownable(msg.sender) {}

    /// @notice Set the escrow contract address that is allowed to update reputation.
    function setEscrowContract(address _escrowContract) external onlyOwner {
        escrowContract = _escrowContract;
        emit EscrowContractUpdated(_escrowContract);
    }

    /// @notice Mints a new SBT to a user.
    function mint(address to) external onlyAuthorized returns (uint256) {
        require(userToTokenId[to] == 0, "User already has a reputation profile");
        
        _nextTokenId++;
        uint256 tokenId = _nextTokenId;
        
        _safeMint(to, tokenId);
        userToTokenId[to] = tokenId;
        
        // Initialize with default scores
        profiles[tokenId] = ReputationScore({
            deliverySpeed: 50,
            disputeWinRate: 50,
            antiGhostingRating: 100,
            completionRate: 100,
            trustTier: 1,
            totalJobs: 0,
            successfulJobs: 0,
            totalDisputes: 0,
            disputesWon: 0
        });

        emit Locked(tokenId);
        return tokenId;
    }

    /// @notice Updates the reputation profile of a user.
    function updateReputation(
        address user,
        uint8 _deliverySpeed,
        uint8 _disputeWinRate,
        uint8 _antiGhostingRating,
        uint8 _completionRate,
        uint8 _trustTier
    ) external onlyAuthorized {
        uint256 tokenId = userToTokenId[user];
        require(tokenId != 0, "User does not have an SBT");

        ReputationScore storage profile = profiles[tokenId];
        profile.deliverySpeed = _deliverySpeed;
        profile.disputeWinRate = _disputeWinRate;
        profile.antiGhostingRating = _antiGhostingRating;
        profile.completionRate = _completionRate;
        profile.trustTier = _trustTier;
        profile.totalJobs++;

        emit ReputationUpdated(tokenId, profile);
    }

    function _recalculateTrustTier(ReputationScore storage profile) internal {
        if (profile.totalJobs < 3) {
            profile.trustTier = 1;
        } else if (profile.totalJobs < 10) {
            profile.trustTier = 2;
        } else if (profile.totalJobs < 25) {
            profile.trustTier = 3;
        } else if (profile.totalJobs < 50) {
            profile.trustTier = 4;
        } else {
            profile.trustTier = 5;
        }
    }

    function recordSuccess(address user) external onlyAuthorized {
        uint256 tokenId = userToTokenId[user];
        require(tokenId != 0, "User does not have an SBT");

        ReputationScore storage profile = profiles[tokenId];
        profile.totalJobs++;
        profile.successfulJobs++;
        profile.completionRate = uint8((profile.successfulJobs * 100) / profile.totalJobs);

        if (profile.completionRate > 90) {
            profile.deliverySpeed = 95;
        } else {
            if (profile.deliverySpeed >= 5) {
                profile.deliverySpeed -= 5;
            } else {
                profile.deliverySpeed = 0;
            }
        }

        _recalculateTrustTier(profile);
        emit ReputationUpdated(tokenId, profile);
    }

    function recordDisputeOutcome(address user, bool won) external onlyAuthorized {
        uint256 tokenId = userToTokenId[user];
        require(tokenId != 0, "User does not have an SBT");

        ReputationScore storage profile = profiles[tokenId];
        profile.totalJobs++;
        profile.totalDisputes++;

        if (won) {
            profile.disputesWon++;
            profile.successfulJobs++;
        } else {
            if (profile.antiGhostingRating >= 10) {
                profile.antiGhostingRating -= 10;
            } else {
                profile.antiGhostingRating = 0;
            }
        }

        if (profile.totalDisputes > 0) {
            profile.disputeWinRate = uint8((profile.disputesWon * 100) / profile.totalDisputes);
        } else {
            profile.disputeWinRate = 50;
        }

        profile.completionRate = uint8((profile.successfulJobs * 100) / profile.totalJobs);
        _recalculateTrustTier(profile);

        emit ReputationUpdated(tokenId, profile);
    }

    function getReputation(address user) external view returns (uint8, uint8, uint8, uint8, uint8, uint256, uint256, uint256, uint256) {
        uint256 tokenId = userToTokenId[user];
        require(tokenId != 0, "User does not have an SBT");
        ReputationScore memory profile = profiles[tokenId];
        return (
            profile.deliverySpeed,
            profile.disputeWinRate,
            profile.antiGhostingRating,
            profile.completionRate,
            profile.trustTier,
            profile.totalJobs,
            profile.successfulJobs,
            profile.totalDisputes,
            profile.disputesWon
        );
    }

    /// @inheritdoc IERC5192
    function locked(uint256) external pure override returns (bool) {
        return true;
    }

    /// @notice ERC-5192 Soulbound implementation
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "Err: Token is Soulbound");
        return super._update(to, tokenId, auth);
    }
}
