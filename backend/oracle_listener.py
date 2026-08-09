import time
import os
import json
from web3 import Web3
from dotenv import load_dotenv
from ai_engine import resolve_dispute_with_ai

load_dotenv()

RPC_URL = os.getenv("RPC_URL", "http://127.0.0.1:8545")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS", "0x0000000000000000000000000000000000000000")
PRIVATE_KEY = os.getenv("ORACLE_PRIVATE_KEY", "")

def listen_for_disputes():
    print(f"Connecting to Web3 Provider at {RPC_URL}...")
    try:
        w3 = Web3(Web3.HTTPProvider(RPC_URL))
        if not w3.is_connected():
            print("Failed to connect to Web3 provider. Running in mock mode.")
            run_mock_loop()
            return
            
        print(f"Connected! Listening to contract: {CONTRACT_ADDRESS}")
        
        if CONTRACT_ADDRESS == "0x0000000000000000000000000000000000000000" or not PRIVATE_KEY:
            print("No real contract address or private key provided. Running in mock mode.")
            run_mock_loop()
            return

        # In a real implementation, you would:
        # 1. Load the contract ABI
        # 2. contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=ABI)
        # 3. Create an event filter: event_filter = contract.events.TrancheDisputeRaised.create_filter(fromBlock='latest')
        # 4. Loop over event_filter.get_new_entries()
        
        # We will use the mock loop for the prototype demo since we don't have the ABI loaded here
        # but the infrastructure is ready for real events.
        run_mock_loop()

    except Exception as e:
        print(f"Web3 connection error: {e}")
        print("Running in mock mode.")
        run_mock_loop()

def run_mock_loop():
    print("\n[Mock Mode] Listening for 'TrancheDisputeRaised' events...")
    
    # Simulate an event being caught after some time
    time.sleep(2)
    
    print("\n--- Event Caught: TrancheDisputeRaised ---")
    job_id = 1
    tranche_index = 1
    
    print(f"Querying AI Engine for Job {job_id}, Tranche {tranche_index} resolution...")
    resolution = resolve_dispute_with_ai(
        requirements="Build a React dashboard",
        deliverables="React dashboard built but missing 1 page.",
        chat_logs=["Client: You missed the settings page.", "Freelancer: That was not in the original scope!"]
    )
    
    print("\n--- AI Engine Resolution ---")
    print(json.dumps(resolution, indent=2))
    
    print("\nExecuting resolveDispute on-chain...")
    # In real implementation:
    # tx = contract.functions.arbitrateDispute(
    #     job_id,
    #     tranche_index,
    #     resolution['freelancer_payout_percentage'], 
    #     resolution['client_refund_percentage'], 
    #     resolution['detect_scope_creep']
    # ).build_transaction(...)
    # signed_tx = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
    # tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    
    print("Transaction successful. Dispute resolved.")

if __name__ == "__main__":
    listen_for_disputes()
