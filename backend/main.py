from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from schemas import MoodRequest, MediaRecommendation
from engine import analyze_mood

# Load environment variables from .env
load_dotenv()

app = FastAPI(
    title="Aura Engine",
    description="AI-powered mood engine for Moodify — generates media recommendations based on your vibe.",
    version="0.1.0",
)

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
async def recommend(request: MoodRequest):
    """Analyze the user's mood and return structured media recommendations."""
    result = await analyze_mood(request.user_mood)
    return result

