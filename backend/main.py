from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import random

app = FastAPI(title="YieldEscrow AI Engine")

class ScopeRequest(BaseModel):
    description: str

class DisputeRequest(BaseModel):
    milestone_requirements: str
    submitted_deliverable: str
    chat_logs: list[str] = []
    github_pr_diff: str = ""

class VerificationRequest(BaseModel):
    github_url: str = ""
    figma_url: str = ""

@app.post("/scope/optimize")
async def optimize_scope(req: ScopeRequest):
    # Mock LLM generation for acceptance criteria
    return {
        "optimized_criteria": [
            "Implement responsive UI for dashboard",
            "Achieve 90% test coverage",
            "Integrate wagmi for wallet connection"
        ]
    }

@app.post("/dispute/resolve")
async def resolve_dispute(req: DisputeRequest):
    # Mock AI resolution logic based on random logic for demo
    # In reality, this would use LangChain + GPT-4o
    freelancer_payout = 70
    client_refund = 30
    scope_creep = False

    if "extra feature" in req.chat_logs or "not in original" in req.chat_logs:
        scope_creep = True
        freelancer_payout = 100
        client_refund = 0

    return {
        "freelancer_payout_percentage": freelancer_payout,
        "client_refund_percentage": client_refund,
        "dispute_reasoning": "The freelancer delivered the core requirements, but failed on mobile responsiveness. Client refund is justified.",
        "confidence_score": 0.89,
        "detect_scope_creep": scope_creep
    }

@app.post("/verify/code")
async def verify_code(req: VerificationRequest):
    # Mock Docker sandboxed test execution
    return {
        "tests_passed": True,
        "coverage": "92%",
        "issues_found": 0
    }

@app.post("/verify/design")
async def verify_design(req: VerificationRequest):
    # Mock Figma API verification
    return {
        "design_match_score": 0.95,
        "responsive_constraints_met": True
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
