from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
import json
import os
import re

def resolve_dispute_with_ai(requirements: str, deliverables: str, chat_logs: list[str]) -> dict:
    """
    Simulates calling an LLM (e.g. GPT-4o) using Langchain to resolve a dispute.
    Uses real OpenAI API if OPENAI_API_KEY is present, otherwise falls back to heuristics.
    """
    
    api_key = os.environ.get("OPENAI_API_KEY")
    
    # Fallback heuristic logic if no API key is provided or it is a placeholder
    if not api_key or api_key == "sk-your-openai-api-key":
        scope_creep = False
        freelancer_payout = 50
        client_refund = 50
        reasoning = "[DEMO MODE] Unable to fully determine. Defaulting to 50/50 split."

        if any("extra feature" in log.lower() or "not in original" in log.lower() for log in chat_logs):
            scope_creep = True
            freelancer_payout = 100
            client_refund = 0
            reasoning = "[DEMO MODE] Scope creep detected from client chat logs. Full payout awarded to freelancer."
        elif len(deliverables) > len(requirements) // 2:
            freelancer_payout = 80
            client_refund = 20
            reasoning = "[DEMO MODE] Deliverables mostly meet requirements, but missing some polish."
        
        return {
            "freelancer_payout_percentage": freelancer_payout,
            "client_refund_percentage": client_refund,
            "dispute_reasoning": reasoning,
            "confidence_score": 0.92,
            "detect_scope_creep": scope_creep
        }

    # Real LLM Logic
    prompt = PromptTemplate(
        input_variables=["requirements", "deliverables", "chat_logs"],
        template="""
        You are an unbiased AI arbitrator for a freelance escrow smart contract.
        
        Milestone Requirements: {requirements}
        Submitted Deliverable: {deliverables}
        Chat Logs: {chat_logs}
        
        Analyze the deliverables against the requirements. Check chat logs for any scope creep (client asking for extra features not in the original requirements).
        
        Output a JSON object EXACTLY with this format, nothing else:
        {{
            "freelancer_payout_percentage": <int 0-100>,
            "client_refund_percentage": <int 0-100>,
            "dispute_reasoning": "<string>",
            "confidence_score": <float 0.0-1.0>,
            "detect_scope_creep": <bool>
        }}
        """
    )
    
    try:
        llm = ChatOpenAI(temperature=0, model_name="gpt-4o", openai_api_key=api_key)
        response = llm.invoke([HumanMessage(content=prompt.format(
            requirements=requirements,
            deliverables=deliverables,
            chat_logs=json.dumps(chat_logs)
        ))])
        
        content = response.content
        # Try to parse the JSON
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].strip()
            
        result = json.loads(content)
        
        # Ensure percentages sum to 100
        if result.get("freelancer_payout_percentage", 0) + result.get("client_refund_percentage", 0) != 100:
            result["client_refund_percentage"] = 100 - result.get("freelancer_payout_percentage", 50)
            
        return result
    except Exception as e:
        print(f"LLM Error: {e}")
        return {
            "freelancer_payout_percentage": 50,
            "client_refund_percentage": 50,
            "dispute_reasoning": f"AI evaluation failed: {str(e)}",
            "confidence_score": 0.0,
            "detect_scope_creep": False
        }

def optimize_scope_with_ai(description: str) -> dict:
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key or api_key == "sk-your-openai-api-key":
        return {
            "optimized_criteria": [
                "[DEMO MODE] Implement responsive UI for dashboard",
                "[DEMO MODE] Achieve 90% test coverage",
                "[DEMO MODE] Integrate wagmi for wallet connection"
            ]
        }
    
    prompt = PromptTemplate(
        input_variables=["description"],
        template="""
        You are a technical product manager. Extract 3-5 clear, testable acceptance criteria from the following project description.
        
        Description: {description}
        
        Output a JSON object EXACTLY in this format:
        {{
            "optimized_criteria": ["criteria 1", "criteria 2", ...]
        }}
        """
    )
    
    try:
        llm = ChatOpenAI(temperature=0, model_name="gpt-4o", openai_api_key=api_key)
        response = llm.invoke([HumanMessage(content=prompt.format(description=description))])
        
        content = response.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].strip()
            
        result = json.loads(content)
        return result
    except Exception as e:
        print(f"LLM Error: {e}")
        return {
            "optimized_criteria": ["Could not parse description using AI."]
        }
