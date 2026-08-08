import time
from web3 import Web3
from ai_engine import resolve_dispute_with_ai

# Mock Setup for Web3 Listener
# In a real environment, you'd use a real RPC URL (Alchemy/Infura) and private key.
RPC_URL = "http://127.0.0.1:8545" # Local Hardhat Node
CONTRACT_ADDRESS = "0xYourContractAddress"
PRIVATE_KEY = "0xYourPrivateKey"

def listen_for_disputes():
    print(f"Connecting to Web3 Provider at {RPC_URL}...")
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    
    # Mocking the listener loop since we don't have a real deployed contract yet
    print("Listening for 'DisputeRaised' events...")
    
    # Simulate an event being caught after some time
    time.sleep(2)
    
    print("\n--- Event Caught: DisputeRaised ---")
    milestone_id = 1
    
    print(f"Querying AI Engine for Milestone {milestone_id} resolution...")
    resolution = resolve_dispute_with_ai(
        requirements="Build a React dashboard",
        deliverables="React dashboard built but missing 1 page.",
        chat_logs=["Client: You missed the settings page.", "Freelancer: That was not in the original scope!"]
    )
    
    print("\n--- AI Engine Resolution ---")
    print(resolution)
    
    print("\nExecuting resolveDispute on-chain...")
    # In real implementation:
    # tx = contract.functions.arbitrateDispute(
    #     milestone_id, 
    #     resolution['freelancer_payout_percentage'], 
    #     resolution['client_refund_percentage'], 
    #     resolution['detect_scope_creep']
    # ).build_transaction(...)
    # signed_tx = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
    # tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    
    print("Transaction successful. Dispute resolved.")

if __name__ == "__main__":
    listen_for_disputes()
