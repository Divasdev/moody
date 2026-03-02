import json
import os

import google.generativeai as genai

from schemas import MediaRecommendation

# Configure Gemini with API key from environment
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

SYSTEM_INSTRUCTION = """\
You are a mood-to-media routing engine. Given a user's raw mood description, \
you must output structured JSON that maps their emotional state to three media \
platforms: Spotify, Movies/TV Shows, and YouTube.

**Spotify features** — set float values between 0.0 and 1.0:
- target_valence: 0.0 = sad/depressed → 1.0 = happy/euphoric
- target_energy: 0.0 = calm/ambient → 1.0 = fast/loud/energetic
- target_danceability: 0.0 = still/contemplative → 1.0 = dance-worthy

**Movies** — recommend 3 to 5 movies or TV shows that match the user's mood. \
For each, provide the title and a 1-sentence synopsis explaining why it fits. \
Be creative and accurate. Include a mix of well-known and hidden gems.

**YouTube query** — write a highly specific search query that would surface \
videos, mixes, or playlists matching the user's mood. Be creative and specific.\
"""

# Build a Gemini-compatible schema (no ge/le/minItems/maxItems — unsupported by the SDK)
_GEMINI_SCHEMA = {
    "type": "object",
    "properties": {
        "spotify": {
            "type": "object",
            "properties": {
                "target_valence": {"type": "number", "description": "0.0 = sad → 1.0 = happy"},
                "target_energy": {"type": "number", "description": "0.0 = calm → 1.0 = energetic"},
                "target_danceability": {"type": "number", "description": "0.0 = still → 1.0 = danceable"},
            },
            "required": ["target_valence", "target_energy", "target_danceability"],
        },
        "movies": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Movie or TV show title"},
                    "synopsis": {"type": "string", "description": "1-sentence reason it fits the mood"},
                },
                "required": ["title", "synopsis"],
            },
            "description": "3–5 movie/TV show recommendations matching the mood",
        },
        "youtube_query": {
            "type": "string",
            "description": "Specific YouTube search query matching the mood",
        },
    },
    "required": ["spotify", "movies", "youtube_query"],
}


async def analyze_mood(mood_text: str) -> MediaRecommendation:
    """Send the user's mood text to Gemini and get structured media recommendations."""

    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction=SYSTEM_INSTRUCTION,
    )

    response = model.generate_content(
        mood_text,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
            response_schema=_GEMINI_SCHEMA,
        ),
    )

    # Parse and validate through Pydantic (this enforces ge/le constraints)
    result = MediaRecommendation.model_validate_json(response.text)
    return result

