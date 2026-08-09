from langchain.prompts import PromptTemplate
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage
import json

def resolve_dispute_with_ai(requirements: str, deliverables: str, chat_logs: list[str]) -> dict:
    """
    Simulates calling an LLM (e.g. GPT-4o) using Langchain to resolve a dispute.
    In a real implementation, you would pass an OpenAI API Key.
    """
    
    prompt = PromptTemplate(
        input_variables=["requirements", "deliverables", "chat_logs"],
        template="""
        You are an unbiased AI arbitrator for a freelance escrow smart contract.
        
        Milestone Requirements: {requirements}
        Submitted Deliverable: {deliverables}
        Chat Logs: {chat_logs}
        
        Analyze the deliverables against the requirements. Check chat logs for any scope creep (client asking for extra features not in the original requirements).
        
        Output a JSON object with:
        - freelancer_payout_percentage (int 0-100)
        - client_refund_percentage (int 0-100)
        - dispute_reasoning (str)
        - confidence_score (float 0.0-1.0)
        - detect_scope_creep (bool)
        """
    )
    
    # Mocking LLM Output for now since we don't have API keys
    # To run for real: llm = ChatOpenAI(temperature=0, model_name="gpt-4o")
    # response = llm([HumanMessage(content=prompt.format(...))])
    
    scope_creep = False
    freelancer_payout = 50
    client_refund = 50
    reasoning = "Unable to fully determine. Defaulting to 50/50 split."

    if any("extra feature" in log.lower() or "not in original" in log.lower() for log in chat_logs):
        scope_creep = True
        freelancer_payout = 100
        client_refund = 0
        reasoning = "Scope creep detected from client chat logs. Full payout awarded to freelancer."
    elif len(deliverables) > len(requirements) // 2:
        freelancer_payout = 80
        client_refund = 20
        reasoning = "Deliverables mostly meet requirements, but missing some polish."
    
    return {
        "freelancer_payout_percentage": freelancer_payout,
        "client_refund_percentage": client_refund,
        "dispute_reasoning": reasoning,
        "confidence_score": 0.92,
        "detect_scope_creep": scope_creep
    }
