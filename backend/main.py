from dotenv import load_dotenv

# Load environment variables BEFORE importing engine (which reads GEMINI_API_KEY at import time)
load_dotenv()

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from google.api_core.exceptions import ResourceExhausted, GoogleAPIError

from schemas import MoodRequest, MediaRecommendation
from engine import analyze_mood

# Rate limiter — keyed by client IP
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Aura Engine",
    description="AI-powered mood engine for Moodify — generates media recommendations based on your vibe.",
    version="0.1.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — allow requests from the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def health_check():
    return {"status": "Aura Engine is live"}


@app.post("/api/v1/recommend", response_model=MediaRecommendation)
@limiter.limit("5/minute")
async def recommend(request: Request, body: MoodRequest):
    """Analyze the user's mood and return structured media recommendations."""
    try:
        result = await analyze_mood(body.user_mood)
        return result
    except ResourceExhausted:
        raise HTTPException(
            status_code=429,
            detail="Gemini API rate limit exceeded. Please wait a moment and try again.",
        )
    except GoogleAPIError as e:
        raise HTTPException(
            status_code=502,
            detail=f"AI engine error: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}",
        )


