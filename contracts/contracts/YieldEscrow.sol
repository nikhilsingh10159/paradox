// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Interfaces for mock Aave and Streaming
interface IAavePool {
    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
}

contract YieldEscrow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public acceptedToken;
    IAavePool public aavePool;
    address public aTokenAddress;
    address public trustedOracle;
    uint256 public inactivityTimeout; // e.g., 7 days

    enum MilestoneStatus { Pending, Funded, Delivered, Disputed, Released, Refunded }

    struct Milestone {
        uint256 id;
        address client;
        address freelancer;
        uint256 amount;
        uint256 clientStake;
        uint256 freelancerStake;
        uint256 lastUpdate;
        MilestoneStatus status;
        string requirementsCID; // IPFS CID for requirements
        string deliverableCID;  // IPFS CID for submitted deliverables
    }

    uint256 public milestoneCount;
    mapping(uint256 => Milestone) public milestones;

    uint256 public constant STAKE_AMOUNT = 50 * 10**6; // e.g. 50 USDC (assuming 6 decimals)

    event MilestoneCreated(uint256 indexed id, address indexed client, address indexed freelancer, uint256 amount);
    event MilestoneFunded(uint256 indexed id);
    event DeliverableSubmitted(uint256 indexed id, string deliverableCID);
    event DisputeRaised(uint256 indexed id, address raisedBy);
    event DisputeResolved(uint256 indexed id, uint256 freelancerPayout, uint256 clientRefund, bool scopeCreepDetected);
    event FundsReleased(uint256 indexed id, address to, uint256 amount);
    event TimeoutClaimed(uint256 indexed id, address claimedBy);

    error InvalidStatus();
    error Unauthorized();
    error InsufficientStake();

    constructor(
        address _acceptedToken,
        address _aavePool,
        address _aTokenAddress,
        address _trustedOracle
    ) Ownable(msg.sender) {
        acceptedToken = IERC20(_acceptedToken);
        aavePool = IAavePool(_aavePool);
        aTokenAddress = _aTokenAddress;
        trustedOracle = _trustedOracle;
        inactivityTimeout = 7 days;
    }

    function createMilestone(
        address freelancer,
        uint256 amount,
        string calldata requirementsCID
    ) external returns (uint256) {
        milestoneCount++;
        uint256 id = milestoneCount;

        milestones[id] = Milestone({
            id: id,
            client: msg.sender,
            freelancer: freelancer,
            amount: amount,
            clientStake: 0,
            freelancerStake: 0,
            lastUpdate: block.timestamp,
            status: MilestoneStatus.Pending,
            requirementsCID: requirementsCID,
            deliverableCID: ""
        });

        emit MilestoneCreated(id, msg.sender, freelancer, amount);
        return id;
    }

    function fundMilestone(uint256 id) external nonReentrant {
        Milestone storage m = milestones[id];
        require(m.status == MilestoneStatus.Pending, "Not pending");
        require(msg.sender == m.client, "Only client");

        uint256 totalDeposit = m.amount + STAKE_AMOUNT;
        
        acceptedToken.safeTransferFrom(msg.sender, address(this), totalDeposit);
        m.clientStake = STAKE_AMOUNT;
        m.status = MilestoneStatus.Funded;
        m.lastUpdate = block.timestamp;

        // Supply principal to Aave for yield
        acceptedToken.approve(address(aavePool), m.amount);
        aavePool.supply(address(acceptedToken), m.amount, address(this), 0);

        emit MilestoneFunded(id);
    }

    function stakeFreelancer(uint256 id) external nonReentrant {
        Milestone storage m = milestones[id];
        require(m.status == MilestoneStatus.Funded, "Not funded");
        require(msg.sender == m.freelancer, "Only freelancer");
        require(m.freelancerStake == 0, "Already staked");

        acceptedToken.safeTransferFrom(msg.sender, address(this), STAKE_AMOUNT);
        m.freelancerStake = STAKE_AMOUNT;
        m.lastUpdate = block.timestamp;
    }

    function submitDeliverable(uint256 id, string calldata deliverableCID) external {
        Milestone storage m = milestones[id];
        require(m.status == MilestoneStatus.Funded, "Not funded");
        require(msg.sender == m.freelancer, "Only freelancer");
        require(m.freelancerStake == STAKE_AMOUNT, "Must stake first");

        m.deliverableCID = deliverableCID;
        m.status = MilestoneStatus.Delivered;
        m.lastUpdate = block.timestamp;

        emit DeliverableSubmitted(id, deliverableCID);
    }

    function releaseFunds(uint256 id) external nonReentrant {
        Milestone storage m = milestones[id];
        require(m.status == MilestoneStatus.Delivered, "Not delivered");
        require(msg.sender == m.client, "Only client");

        m.status = MilestoneStatus.Released;

        // Withdraw principal from Aave
        aavePool.withdraw(address(acceptedToken), m.amount, address(this));

        // Return client stake
        acceptedToken.safeTransfer(m.client, m.clientStake);
        m.clientStake = 0;

        // Pay freelancer principal + stake
        uint256 totalFreelancerPayout = m.amount + m.freelancerStake;
        acceptedToken.safeTransfer(m.freelancer, totalFreelancerPayout);
        m.freelancerStake = 0;

        // Note: Accrued interest remains in aToken form or can be claimed to paymaster.

        emit FundsReleased(id, m.freelancer, totalFreelancerPayout);
    }

    function raiseDispute(uint256 id) external {
        Milestone storage m = milestones[id];
        require(m.status == MilestoneStatus.Delivered || m.status == MilestoneStatus.Funded, "Invalid status");
        require(msg.sender == m.client || msg.sender == m.freelancer, "Unauthorized");

        m.status = MilestoneStatus.Disputed;
        m.lastUpdate = block.timestamp;

        emit DisputeRaised(id, msg.sender);
    }

    function arbitrateDispute(
        uint256 id, 
        uint256 freelancerPct, 
        uint256 clientPct, 
        bool scopeCreep
    ) external nonReentrant {
        require(msg.sender == trustedOracle, "Only Oracle");
        Milestone storage m = milestones[id];
        require(m.status == MilestoneStatus.Disputed, "Not disputed");
        require(freelancerPct + clientPct == 100, "Invalid split");

        m.status = MilestoneStatus.Released; // Resolved

        // Withdraw principal from Aave
        aavePool.withdraw(address(acceptedToken), m.amount, address(this));

        uint256 freelancerPayout = (m.amount * freelancerPct) / 100;
        uint256 clientRefund = (m.amount * clientPct) / 100;

        // Slashing logic
        if (scopeCreep) {
            // Client slashed, freelancer gets client stake
            freelancerPayout += m.clientStake;
            freelancerPayout += m.freelancerStake;
        } else {
            // No malicious behavior, return stakes
            clientRefund += m.clientStake;
            freelancerPayout += m.freelancerStake;
        }

        m.clientStake = 0;
        m.freelancerStake = 0;

        if (freelancerPayout > 0) {
            acceptedToken.safeTransfer(m.freelancer, freelancerPayout);
        }
        if (clientRefund > 0) {
            acceptedToken.safeTransfer(m.client, clientRefund);
        }

        emit DisputeResolved(id, freelancerPayout, clientRefund, scopeCreep);
    }

    function claimTimeout(uint256 id) external nonReentrant {
        Milestone storage m = milestones[id];
        require(m.status == MilestoneStatus.Delivered, "Not delivered");
        require(msg.sender == m.freelancer, "Only freelancer");
        require(block.timestamp > m.lastUpdate + inactivityTimeout, "Timeout not reached");

        m.status = MilestoneStatus.Released;

        // Withdraw principal from Aave
        aavePool.withdraw(address(acceptedToken), m.amount, address(this));

        // Freelancer gets everything
        uint256 totalPayout = m.amount + m.clientStake + m.freelancerStake;
        acceptedToken.safeTransfer(m.freelancer, totalPayout);
        
        m.clientStake = 0;
        m.freelancerStake = 0;

        emit TimeoutClaimed(id, msg.sender);
    }
}
