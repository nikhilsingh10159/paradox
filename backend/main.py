import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

from ai_engine import resolve_dispute_with_ai, optimize_scope_with_ai

load_dotenv()

class Settings(BaseSettings):
    cors_origins: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")

settings = Settings()

app = FastAPI(title="YieldEscrow AI Engine")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/scope/optimize")
async def optimize_scope(req: ScopeRequest):
    result = optimize_scope_with_ai(req.description)
    return result

@app.post("/dispute/resolve")
async def resolve_dispute(req: DisputeRequest):
    result = resolve_dispute_with_ai(
        requirements=req.milestone_requirements,
        deliverables=req.submitted_deliverable,
        chat_logs=req.chat_logs
    )
    return result

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
