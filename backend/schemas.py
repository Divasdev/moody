from pydantic import BaseModel, Field


class MoodRequest(BaseModel):
    """Incoming request from the frontend containing the user's raw mood text."""

    user_mood: str = Field(
        ...,
        description="The raw text input from the user describing their current mood.",
        min_length=1,
        max_length=500,
    )


class SpotifyFeatures(BaseModel):
    """Spotify audio-feature targets derived from the user's mood."""

    target_valence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Musical positiveness. 0.0 is sad/depressed, 1.0 is happy/euphoric.",
    )
    target_energy: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Perceptual intensity. 0.0 is calm/ambient, 1.0 is fast/loud/energetic.",
    )
    target_danceability: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="How suitable for dancing. 0.0 is least danceable, 1.0 is most danceable.",
    )


class MediaRecommendation(BaseModel):
    """Structured AI output mapping a mood to multi-platform media parameters."""

    spotify: SpotifyFeatures
    tmdb_genres: list[int] = Field(
        ...,
        description="A list of 1 to 3 TMDB genre ID integers that best match the mood.",
        min_length=1,
        max_length=3,
    )
    youtube_query: str = Field(
        ...,
        description="A highly specific YouTube search query to find videos matching the mood.",
        min_length=1,
    )
