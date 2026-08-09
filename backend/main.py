import os
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

from ai_engine import resolve_dispute_with_ai, optimize_scope_with_ai

load_dotenv()

class Settings(BaseSettings):
    cors_origins: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")

settings = Settings()

app = FastAPI(
    title="YieldEscrow AI Engine",
    description="AI dispute resolution and deliverable verification service for the Paradox escrow platform.",
    version="2.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Request / Response Models
# ---------------------------------------------------------------------------

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

class VerificationCodeResponse(BaseModel):
    reachable: bool
    url_provided: bool
    content_length: int
    has_readme: bool
    estimated_quality_score: float
    notes: str

class VerificationDesignResponse(BaseModel):
    reachable: bool
    url_provided: bool
    is_figma_link: bool
    estimated_match_score: float
    notes: str

# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "2.0.0"}


@app.post("/scope/optimize")
async def optimize_scope(req: ScopeRequest):
    result = optimize_scope_with_ai(req.description)
    return result


@app.post("/dispute/resolve")
async def resolve_dispute(req: DisputeRequest):
    result = resolve_dispute_with_ai(
        requirements=req.milestone_requirements,
        deliverables=req.submitted_deliverable,
        chat_logs=req.chat_logs,
    )
    return result


@app.post("/verify/code", response_model=VerificationCodeResponse)
async def verify_code(req: VerificationRequest):
    """
    Dynamically evaluates a GitHub URL for reachability, content size, and
    basic quality signals. Replaces hard-coded mock responses.
    """
    url = req.github_url.strip()
    url_provided = bool(url)
    reachable = False
    content_length = 0
    has_readme = False
    estimated_quality_score = 0.0
    notes = ""

    if not url_provided:
        return VerificationCodeResponse(
            reachable=False,
            url_provided=False,
            content_length=0,
            has_readme=False,
            estimated_quality_score=0.0,
            notes="No GitHub URL provided.",
        )

    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            response = await client.get(url, headers={"User-Agent": "ParadoxOracle/2.0"})
            reachable = response.status_code < 400
            content_length = len(response.content)
            body_text = response.text.lower()

            has_readme = "readme" in body_text or "readme.md" in body_text
            # Heuristic quality signals
            signals = [
                "test" in body_text,
                "ci" in body_text or "github actions" in body_text,
                has_readme,
                content_length > 5000,
                response.status_code == 200,
            ]
            estimated_quality_score = round(sum(signals) / len(signals), 2)
            notes = f"HTTP {response.status_code}. Content-length: {content_length} bytes."
    except httpx.RequestError as e:
        notes = f"Request failed: {str(e)}"
        reachable = False

    return VerificationCodeResponse(
        reachable=reachable,
        url_provided=url_provided,
        content_length=content_length,
        has_readme=has_readme,
        estimated_quality_score=estimated_quality_score,
        notes=notes,
    )


@app.post("/verify/design", response_model=VerificationDesignResponse)
async def verify_design(req: VerificationRequest):
    """
    Dynamically evaluates a Figma or design URL for reachability and
    link validity. Replaces hard-coded mock responses.
    """
    url = req.figma_url.strip()
    url_provided = bool(url)
    reachable = False
    is_figma_link = False
    estimated_match_score = 0.0
    notes = ""

    if not url_provided:
        return VerificationDesignResponse(
            reachable=False,
            url_provided=False,
            is_figma_link=False,
            estimated_match_score=0.0,
            notes="No design URL provided.",
        )

    is_figma_link = "figma.com" in url

    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            response = await client.get(url, headers={"User-Agent": "ParadoxOracle/2.0"})
            reachable = response.status_code < 400
            signals = [
                reachable,
                is_figma_link,
                response.status_code == 200,
                len(response.content) > 1000,
            ]
            estimated_match_score = round(sum(signals) / len(signals), 2)
            notes = f"HTTP {response.status_code}. Figma link detected: {is_figma_link}."
    except httpx.RequestError as e:
        notes = f"Request failed: {str(e)}"
        reachable = False

    return VerificationDesignResponse(
        reachable=reachable,
        url_provided=url_provided,
        is_figma_link=is_figma_link,
        estimated_match_score=estimated_match_score,
        notes=notes,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
