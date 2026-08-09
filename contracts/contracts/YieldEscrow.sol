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

interface IReputationSBT {
    function recordSuccess(address user) external;
    function recordDisputeOutcome(address user, bool won) external;
}

contract YieldEscrow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public acceptedToken;
    IAavePool public aavePool;
    address public aTokenAddress;
    address public trustedOracle;
    uint256 public inactivityTimeout; // e.g., 7 days
    address public reputationSBT;

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

    struct Job {
        uint256 id;
        address client;
        address freelancer;
        uint256 totalAmount;
        uint256 trancheCount;
        uint256 completedTranches;
        uint256 clientStake;
        uint256 freelancerStake;
    }

    struct Tranche {
        uint256 id;
        uint256 jobId;
        address client;
        address freelancer;
        uint256 amount;
        uint256 clientStake;
        uint256 freelancerStake;
        uint256 lastUpdate;
        MilestoneStatus status;
        string requirementsCID;
        string deliverableCID;
    }

    uint256 public milestoneCount;
    mapping(uint256 => Milestone) public milestones;

    uint256 public jobCount;
    mapping(uint256 => Job) public jobs;
    mapping(uint256 => mapping(uint256 => Tranche)) public tranches;

    uint256 public constant STAKE_AMOUNT = 50 * 10**6; // e.g. 50 USDC (assuming 6 decimals)
    uint256 public constant MAX_TRANCHES = 20; // DoS guard: max tranches per job

    event MilestoneCreated(uint256 indexed id, address indexed client, address indexed freelancer, uint256 amount);
    event MilestoneFunded(uint256 indexed id);
    event DeliverableSubmitted(uint256 indexed id, string deliverableCID);
    event DisputeRaised(uint256 indexed id, address raisedBy);
    event DisputeResolved(uint256 indexed id, uint256 freelancerPayout, uint256 clientRefund, bool scopeCreepDetected);
    event FundsReleased(uint256 indexed id, address to, uint256 amount);
    event YieldDistributed(uint256 indexed id, uint256 clientYield, uint256 freelancerYield);
    event TimeoutClaimed(uint256 indexed id, address claimedBy);

    event JobCreated(uint256 indexed jobId, address indexed client, address indexed freelancer, uint256 totalAmount);
    event JobFunded(uint256 indexed jobId);
    event TrancheDeliverableSubmitted(uint256 indexed jobId, uint256 indexed trancheIndex, string deliverableCID);
    event TrancheFundsReleased(uint256 indexed jobId, uint256 indexed trancheIndex, address to, uint256 amount);
    event TrancheDisputeRaised(uint256 indexed jobId, uint256 indexed trancheIndex, address raisedBy);
    event TrancheDisputeResolved(uint256 indexed jobId, uint256 indexed trancheIndex, uint256 freelancerPayout, uint256 clientRefund, bool scopeCreepDetected);
    event TrancheYieldDistributed(uint256 indexed jobId, uint256 indexed trancheIndex, uint256 clientYield, uint256 freelancerYield);

    error InvalidStatus();
    error Unauthorized();
    error InsufficientStake();

    constructor(
        address _acceptedToken,
        address _aavePool,
        address _aTokenAddress,
        address _trustedOracle,
        address _reputationSBT
    ) Ownable(msg.sender) {
        acceptedToken = IERC20(_acceptedToken);
        aavePool = IAavePool(_aavePool);
        aTokenAddress = _aTokenAddress;
        trustedOracle = _trustedOracle;
        reputationSBT = _reputationSBT;
        inactivityTimeout = 7 days;
    }

    function setReputationSBT(address _reputationSBT) external onlyOwner {
        reputationSBT = _reputationSBT;
    }

    function setTrustedOracle(address _trustedOracle) external onlyOwner {
        trustedOracle = _trustedOracle;
    }

    // --- Internal helper: withdraw from Aave and calculate yield ---

    /// @dev Withdraws `principal` from Aave, measures actual received amount,
    ///      and returns (received, yieldEarned). yieldEarned = received - principal (or 0).
    function _withdrawFromAave(uint256 principal) internal returns (uint256 received, uint256 yieldEarned) {
        uint256 balanceBefore = acceptedToken.balanceOf(address(this));
        aavePool.withdraw(address(acceptedToken), principal, address(this));
        uint256 balanceAfter = acceptedToken.balanceOf(address(this));
        received = balanceAfter - balanceBefore;
        yieldEarned = received > principal ? received - principal : 0;
    }

    // --- Legacy Milestone Functions ---

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

        // Withdraw principal from Aave and capture any accrued yield
        (uint256 received, uint256 yieldEarned) = _withdrawFromAave(m.amount);

        // Return client stake
        acceptedToken.safeTransfer(m.client, m.clientStake);
        m.clientStake = 0;

        // Pay freelancer principal + stake + all yield as bonus for successful delivery
        uint256 totalFreelancerPayout = received + m.freelancerStake;
        acceptedToken.safeTransfer(m.freelancer, totalFreelancerPayout);
        m.freelancerStake = 0;

        // Update reputation
        if (reputationSBT != address(0)) {
            IReputationSBT(reputationSBT).recordSuccess(m.freelancer);
        }

        if (yieldEarned > 0) {
            emit YieldDistributed(id, 0, yieldEarned);
        }

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

        // Withdraw principal from Aave and capture yield
        (uint256 received, uint256 yieldEarned) = _withdrawFromAave(m.amount);

        uint256 freelancerPayout = (received * freelancerPct) / 100;
        uint256 clientRefund = (received * clientPct) / 100;

        // Slashing logic
        if (scopeCreep) {
            // Client slashed, freelancer gets client stake + all yield
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

        // Update reputation based on dispute outcome
        if (reputationSBT != address(0)) {
            bool freelancerWon = freelancerPct > 50;
            IReputationSBT(reputationSBT).recordDisputeOutcome(m.freelancer, freelancerWon);
        }

        if (yieldEarned > 0) {
            emit YieldDistributed(id, scopeCreep ? 0 : 0, yieldEarned);
        }

        emit DisputeResolved(id, freelancerPayout, clientRefund, scopeCreep);
    }

    function claimTimeout(uint256 id) external nonReentrant {
        Milestone storage m = milestones[id];
        require(m.status == MilestoneStatus.Delivered, "Not delivered");
        require(msg.sender == m.freelancer, "Only freelancer");
        require(block.timestamp > m.lastUpdate + inactivityTimeout, "Timeout not reached");

        m.status = MilestoneStatus.Released;

        // Withdraw from Aave and capture yield
        (uint256 received, uint256 yieldEarned) = _withdrawFromAave(m.amount);

        // Freelancer gets everything: principal + yield + both stakes
        uint256 totalPayout = received + m.clientStake + m.freelancerStake;
        acceptedToken.safeTransfer(m.freelancer, totalPayout);
        
        m.clientStake = 0;
        m.freelancerStake = 0;

        if (yieldEarned > 0) {
            emit YieldDistributed(id, 0, yieldEarned);
        }

        emit TimeoutClaimed(id, msg.sender);
    }

    // --- New Job/Tranche Functions ---

    function createJob(
        address freelancer,
        uint256[] calldata amounts,
        string[] calldata requirementsCIDs
    ) external returns (uint256) {
        // FIX: Bound array size to prevent DoS via Out-Of-Gas
        require(amounts.length > 0 && amounts.length <= MAX_TRANCHES, "Tranche count out of bounds");
        require(amounts.length == requirementsCIDs.length, "Arrays length mismatch");
        
        jobCount++;
        uint256 jobId = jobCount;
        uint256 totalAmount = 0;

        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
            
            tranches[jobId][i] = Tranche({
                id: i,
                jobId: jobId,
                client: msg.sender,
                freelancer: freelancer,
                amount: amounts[i],
                clientStake: 0,
                freelancerStake: 0,
                lastUpdate: block.timestamp,
                status: MilestoneStatus.Pending,
                requirementsCID: requirementsCIDs[i],
                deliverableCID: ""
            });
        }

        jobs[jobId] = Job({
            id: jobId,
            client: msg.sender,
            freelancer: freelancer,
            totalAmount: totalAmount,
            trancheCount: amounts.length,
            completedTranches: 0,
            clientStake: 0,
            freelancerStake: 0
        });

        emit JobCreated(jobId, msg.sender, freelancer, totalAmount);
        return jobId;
    }

    function fundJob(uint256 jobId) external nonReentrant {
        Job storage job = jobs[jobId];
        require(job.clientStake == 0, "Already funded");
        require(msg.sender == job.client, "Only client");

        uint256 totalDeposit = job.totalAmount + STAKE_AMOUNT;
        
        acceptedToken.safeTransferFrom(msg.sender, address(this), totalDeposit);
        job.clientStake = STAKE_AMOUNT;

        for (uint256 i = 0; i < job.trancheCount; i++) {
            Tranche storage t = tranches[jobId][i];
            t.status = MilestoneStatus.Funded;
            t.lastUpdate = block.timestamp;
            t.clientStake = (i == job.trancheCount - 1) ? STAKE_AMOUNT : 0; // Attach stake to last tranche conceptually or just keep on job
        }

        // Supply principal to Aave for yield
        acceptedToken.approve(address(aavePool), job.totalAmount);
        aavePool.supply(address(acceptedToken), job.totalAmount, address(this), 0);

        emit JobFunded(jobId);
    }

    function stakeFreelancerJob(uint256 jobId) external nonReentrant {
        Job storage job = jobs[jobId];
        require(job.clientStake > 0, "Not funded");
        require(msg.sender == job.freelancer, "Only freelancer");
        require(job.freelancerStake == 0, "Already staked");

        acceptedToken.safeTransferFrom(msg.sender, address(this), STAKE_AMOUNT);
        job.freelancerStake = STAKE_AMOUNT;
    }

    function submitDeliverable(uint256 jobId, uint256 trancheIndex, string calldata deliverableCID) external {
        Job storage job = jobs[jobId];
        Tranche storage t = tranches[jobId][trancheIndex];
        
        require(t.status == MilestoneStatus.Funded, "Not funded");
        require(msg.sender == t.freelancer, "Only freelancer");
        require(job.freelancerStake == STAKE_AMOUNT, "Must stake first");

        t.deliverableCID = deliverableCID;
        t.status = MilestoneStatus.Delivered;
        t.lastUpdate = block.timestamp;

        emit TrancheDeliverableSubmitted(jobId, trancheIndex, deliverableCID);
    }

    function releaseTranche(uint256 jobId, uint256 trancheIndex) external nonReentrant {
        Job storage job = jobs[jobId];
        Tranche storage t = tranches[jobId][trancheIndex];
        
        require(t.status == MilestoneStatus.Delivered, "Not delivered");
        require(msg.sender == t.client, "Only client");

        t.status = MilestoneStatus.Released;
        job.completedTranches++;

        // Withdraw this tranche's principal from Aave and capture yield
        (uint256 received, uint256 yieldEarned) = _withdrawFromAave(t.amount);

        // Split yield 50/50 between client and freelancer on each tranche
        uint256 clientYieldShare = yieldEarned / 2;
        uint256 freelancerYieldShare = yieldEarned - clientYieldShare;

        uint256 freelancerPayout = received + freelancerYieldShare;
        uint256 clientRefund = clientYieldShare;

        if (job.completedTranches == job.trancheCount) {
            // Last tranche: return stakes
            clientRefund += job.clientStake;
            freelancerPayout += job.freelancerStake;
            job.clientStake = 0;
            job.freelancerStake = 0;
            
            if (reputationSBT != address(0)) {
                IReputationSBT(reputationSBT).recordSuccess(job.freelancer);
            }
        }

        if (freelancerPayout > 0) {
            acceptedToken.safeTransfer(job.freelancer, freelancerPayout);
        }
        if (clientRefund > 0) {
            acceptedToken.safeTransfer(job.client, clientRefund);
        }

        if (yieldEarned > 0) {
            emit TrancheYieldDistributed(jobId, trancheIndex, clientYieldShare, freelancerYieldShare);
        }

        emit TrancheFundsReleased(jobId, trancheIndex, job.freelancer, freelancerPayout);
    }

    function raiseDispute(uint256 jobId, uint256 trancheIndex) external {
        Tranche storage t = tranches[jobId][trancheIndex];
        require(t.status == MilestoneStatus.Delivered || t.status == MilestoneStatus.Funded, "Invalid status");
        require(msg.sender == t.client || msg.sender == t.freelancer, "Unauthorized");

        t.status = MilestoneStatus.Disputed;
        t.lastUpdate = block.timestamp;

        emit TrancheDisputeRaised(jobId, trancheIndex, msg.sender);
    }

    function arbitrateDispute(
        uint256 jobId, 
        uint256 trancheIndex, 
        uint256 freelancerPct, 
        uint256 clientPct, 
        bool scopeCreep
    ) external nonReentrant {
        require(msg.sender == trustedOracle, "Only Oracle");
        Job storage job = jobs[jobId];
        Tranche storage t = tranches[jobId][trancheIndex];
        
        require(t.status == MilestoneStatus.Disputed, "Not disputed");
        require(freelancerPct + clientPct == 100, "Invalid split");

        t.status = MilestoneStatus.Released; // Resolved
        job.completedTranches++;

        // Withdraw this tranche's principal from Aave and capture yield
        (uint256 received, uint256 yieldEarned) = _withdrawFromAave(t.amount);

        uint256 freelancerPayout = (received * freelancerPct) / 100;
        uint256 clientRefund = (received * clientPct) / 100;

        if (job.completedTranches == job.trancheCount) {
            // Conclude stakes logic on final tranche
            if (scopeCreep) {
                freelancerPayout += job.clientStake;
                freelancerPayout += job.freelancerStake;
                // Freelancer also gets all yield on scope creep (client penalized)
                freelancerPayout += yieldEarned;
            } else {
                clientRefund += job.clientStake;
                freelancerPayout += job.freelancerStake;
                // Split yield evenly
                uint256 clientYieldShare = yieldEarned / 2;
                clientRefund += clientYieldShare;
                freelancerPayout += yieldEarned - clientYieldShare;
            }
            job.clientStake = 0;
            job.freelancerStake = 0;
        } else {
            // Non-final tranche: still split yield
            uint256 clientYieldShare = yieldEarned / 2;
            clientRefund += clientYieldShare;
            freelancerPayout += yieldEarned - clientYieldShare;
        }

        if (freelancerPayout > 0) {
            acceptedToken.safeTransfer(t.freelancer, freelancerPayout);
        }
        if (clientRefund > 0) {
            acceptedToken.safeTransfer(t.client, clientRefund);
        }

        if (reputationSBT != address(0)) {
            bool freelancerWon = freelancerPct > 50; // simple heuristic
            bool clientWon = clientPct > 50;
            if (freelancerWon) IReputationSBT(reputationSBT).recordDisputeOutcome(t.freelancer, true);
            else if (clientWon) IReputationSBT(reputationSBT).recordDisputeOutcome(t.freelancer, false);
        }

        emit TrancheDisputeResolved(jobId, trancheIndex, freelancerPayout, clientRefund, scopeCreep);
    }

    function getTrancheStatus(uint256 jobId, uint256 trancheIndex) external view returns (MilestoneStatus) {
        return tranches[jobId][trancheIndex].status;
    }
}
