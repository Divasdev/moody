import json
import os

import google.generativeai as genai

from schemas import MediaRecommendation

# Configure Gemini with API key from environment
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

SYSTEM_INSTRUCTION = """\
You are a mood-to-media routing engine. Given a user's raw mood description, \
you must output structured JSON that maps their emotional state to three media \
platforms: Spotify, TMDB (movies/shows), and YouTube.

**Spotify features** — set float values between 0.0 and 1.0:
- target_valence: 0.0 = sad/depressed → 1.0 = happy/euphoric
- target_energy: 0.0 = calm/ambient → 1.0 = fast/loud/energetic
- target_danceability: 0.0 = still/contemplative → 1.0 = dance-worthy

**TMDB genre IDs cheat sheet** (pick 1–3 that match the mood):
Action=28, Adventure=12, Animation=16, Comedy=35, Crime=80, Documentary=99, \
Drama=18, Family=10751, Fantasy=14, History=36, Horror=27, Music=10402, \
Mystery=9648, Romance=10749, Sci-Fi=878, Thriller=53, War=10752, Western=37

**YouTube query** — write a highly specific search query that would surface \
videos, mixes, or playlists matching the user's mood. Be creative and specific.\
"""


async def analyze_mood(mood_text: str) -> MediaRecommendation:
    """Send the user's mood text to Gemini and get structured media recommendations."""

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction=SYSTEM_INSTRUCTION,
    )

    response = model.generate_content(
        mood_text,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            response_schema=MediaRecommendation,
        ),
    )

    # Parse the JSON response into our Pydantic model
    result = MediaRecommendation.model_validate_json(response.text)
    return result
