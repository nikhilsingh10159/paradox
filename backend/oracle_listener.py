"""
oracle_listener.py
------------------
Production-grade oracle listener for the YieldEscrow smart contract.

Lifecycle:
1. Connects to the configured Web3 RPC endpoint.
2. Loads the contract ABI and address from environment variables.
3. Creates event filters for `DisputeRaised` and `TrancheDisputeRaised`.
4. On each new dispute event, calls the AI engine to resolve the dispute.
5. Builds, signs, and broadcasts an `arbitrateDispute` transaction on-chain.
6. Polls for new events every `POLL_INTERVAL` seconds.
"""

import time
import os
import json
import logging
from web3 import Web3
from web3.exceptions import ContractLogicError
from dotenv import load_dotenv
from ai_engine import resolve_dispute_with_ai

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("oracle_listener")

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

RPC_URL = os.getenv("RPC_URL", "http://127.0.0.1:8545")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS", "")
PRIVATE_KEY = os.getenv("ORACLE_PRIVATE_KEY", "")
POLL_INTERVAL = int(os.getenv("ORACLE_POLL_INTERVAL", "5"))  # seconds

# Minimal ABI — only the events and functions this oracle needs
ORACLE_ABI = [
    # Events
    {
        "name": "DisputeRaised",
        "type": "event",
        "inputs": [
            {"name": "id", "type": "uint256", "indexed": True},
            {"name": "raisedBy", "type": "address", "indexed": False},
        ],
    },
    {
        "name": "TrancheDisputeRaised",
        "type": "event",
        "inputs": [
            {"name": "jobId", "type": "uint256", "indexed": True},
            {"name": "trancheIndex", "type": "uint256", "indexed": True},
            {"name": "raisedBy", "type": "address", "indexed": False},
        ],
    },
    # View getters for dispute context
    {
        "name": "milestones",
        "type": "function",
        "stateMutability": "view",
        "inputs": [{"name": "", "type": "uint256"}],
        "outputs": [
            {"name": "id", "type": "uint256"},
            {"name": "client", "type": "address"},
            {"name": "freelancer", "type": "address"},
            {"name": "amount", "type": "uint256"},
            {"name": "clientStake", "type": "uint256"},
            {"name": "freelancerStake", "type": "uint256"},
            {"name": "lastUpdate", "type": "uint256"},
            {"name": "status", "type": "uint8"},
            {"name": "requirementsCID", "type": "string"},
            {"name": "deliverableCID", "type": "string"},
        ],
    },
    {
        "name": "tranches",
        "type": "function",
        "stateMutability": "view",
        "inputs": [
            {"name": "", "type": "uint256"},
            {"name": "", "type": "uint256"},
        ],
        "outputs": [
            {"name": "id", "type": "uint256"},
            {"name": "jobId", "type": "uint256"},
            {"name": "client", "type": "address"},
            {"name": "freelancer", "type": "address"},
            {"name": "amount", "type": "uint256"},
            {"name": "clientStake", "type": "uint256"},
            {"name": "freelancerStake", "type": "uint256"},
            {"name": "lastUpdate", "type": "uint256"},
            {"name": "status", "type": "uint8"},
            {"name": "requirementsCID", "type": "string"},
            {"name": "deliverableCID", "type": "string"},
        ],
    },
    # Write functions
    {
        "name": "arbitrateDispute",
        "type": "function",
        "stateMutability": "nonpayable",
        "inputs": [
            {"name": "id", "type": "uint256"},
            {"name": "freelancerPct", "type": "uint256"},
            {"name": "clientPct", "type": "uint256"},
            {"name": "scopeCreep", "type": "bool"},
        ],
        "outputs": [],
    },
    {
        "name": "arbitrateDispute",
        "type": "function",
        "stateMutability": "nonpayable",
        "inputs": [
            {"name": "jobId", "type": "uint256"},
            {"name": "trancheIndex", "type": "uint256"},
            {"name": "freelancerPct", "type": "uint256"},
            {"name": "clientPct", "type": "uint256"},
            {"name": "scopeCreep", "type": "bool"},
        ],
        "outputs": [],
    },
]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _send_arbitration(w3: Web3, contract, account, job_id: int, tranche_index: int | None,
                      freelancer_pct: int, client_pct: int, scope_creep: bool) -> str:
    """Build, sign, and broadcast an arbitrateDispute transaction. Returns tx hash."""
    nonce = w3.eth.get_transaction_count(account.address)
    gas_price = w3.eth.gas_price

    if tranche_index is None:
        # Legacy milestone dispute
        fn = contract.functions.arbitrateDispute(job_id, freelancer_pct, client_pct, scope_creep)
    else:
        # Tranche dispute
        fn = contract.functions.arbitrateDispute(job_id, tranche_index, freelancer_pct, client_pct, scope_creep)

    tx = fn.build_transaction({
        "from": account.address,
        "nonce": nonce,
        "gas": 300_000,
        "gasPrice": gas_price,
    })

    signed = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    log.info(f"  TX submitted: {tx_hash.hex()}")

    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
    if receipt.status != 1:
        raise ContractLogicError(f"Transaction reverted. Receipt: {receipt}")

    log.info(f"  TX confirmed in block {receipt.blockNumber}")
    return tx_hash.hex()


def _handle_legacy_dispute(w3: Web3, contract, account, event) -> None:
    """Resolve a legacy `DisputeRaised` milestone dispute."""
    milestone_id = event["args"]["id"]
    log.info(f"[DisputeRaised] Milestone ID: {milestone_id}")

    milestone = contract.functions.milestones(milestone_id).call()
    requirements_cid = milestone[8]
    deliverable_cid = milestone[9]

    resolution = resolve_dispute_with_ai(
        requirements=f"Requirements CID: {requirements_cid}",
        deliverables=f"Deliverable CID: {deliverable_cid}",
        chat_logs=[],
    )
    log.info(f"  AI resolution: {json.dumps(resolution, indent=2)}")

    _send_arbitration(
        w3, contract, account,
        job_id=milestone_id,
        tranche_index=None,
        freelancer_pct=resolution["freelancer_payout_percentage"],
        client_pct=resolution["client_refund_percentage"],
        scope_creep=resolution["detect_scope_creep"],
    )


def _handle_tranche_dispute(w3: Web3, contract, account, event) -> None:
    """Resolve a `TrancheDisputeRaised` event."""
    job_id = event["args"]["jobId"]
    tranche_index = event["args"]["trancheIndex"]
    log.info(f"[TrancheDisputeRaised] Job: {job_id}, Tranche: {tranche_index}")

    tranche = contract.functions.tranches(job_id, tranche_index).call()
    requirements_cid = tranche[9]
    deliverable_cid = tranche[10]

    resolution = resolve_dispute_with_ai(
        requirements=f"Requirements CID: {requirements_cid}",
        deliverables=f"Deliverable CID: {deliverable_cid}",
        chat_logs=[],
    )
    log.info(f"  AI resolution: {json.dumps(resolution, indent=2)}")

    _send_arbitration(
        w3, contract, account,
        job_id=job_id,
        tranche_index=tranche_index,
        freelancer_pct=resolution["freelancer_payout_percentage"],
        client_pct=resolution["client_refund_percentage"],
        scope_creep=resolution["detect_scope_creep"],
    )


# ---------------------------------------------------------------------------
# Main listener loop
# ---------------------------------------------------------------------------

def listen_for_disputes() -> None:
    """Connect to the chain and poll for dispute events indefinitely."""
    if not CONTRACT_ADDRESS or CONTRACT_ADDRESS == "0x" + "0" * 40:
        log.error("CONTRACT_ADDRESS is not set. Set it in backend/.env before running the oracle.")
        return

    if not PRIVATE_KEY:
        log.error("ORACLE_PRIVATE_KEY is not set. Set it in backend/.env before running the oracle.")
        return

    log.info(f"Connecting to Web3 RPC: {RPC_URL}")
    w3 = Web3(Web3.HTTPProvider(RPC_URL))

    if not w3.is_connected():
        log.error("Failed to connect to Web3 provider. Ensure the Hardhat node is running.")
        return

    log.info(f"Connected. Chain ID: {w3.eth.chain_id}")
    account = w3.eth.account.from_key(PRIVATE_KEY)
    log.info(f"Oracle wallet: {account.address}")

    checksum_address = Web3.to_checksum_address(CONTRACT_ADDRESS)
    contract = w3.eth.contract(address=checksum_address, abi=ORACLE_ABI)

    # Create event filters starting from the latest block
    from_block = w3.eth.block_number
    log.info(f"Listening for dispute events from block {from_block}...")

    legacy_filter = contract.events.DisputeRaised.create_filter(from_block=from_block)
    tranche_filter = contract.events.TrancheDisputeRaised.create_filter(from_block=from_block)

    while True:
        try:
            # Poll legacy milestone disputes
            for event in legacy_filter.get_new_entries():
                try:
                    _handle_legacy_dispute(w3, contract, account, event)
                except Exception as e:
                    log.error(f"Error handling legacy dispute: {e}")

            # Poll tranche disputes
            for event in tranche_filter.get_new_entries():
                try:
                    _handle_tranche_dispute(w3, contract, account, event)
                except Exception as e:
                    log.error(f"Error handling tranche dispute: {e}")

        except Exception as e:
            log.error(f"Polling error: {e}. Retrying in {POLL_INTERVAL}s...")

        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    listen_for_disputes()
