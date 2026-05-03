from ats.models.state import SignalVote, Direction, Regime

SENTIMENT_LONG_THRESHOLD = 0.25
SENTIMENT_SHORT_THRESHOLD = -0.25


def combine(
    ticker: str,
    sentiment_score: float | None,
    technical_signal: Direction,
    regime: Regime,
    regime_confidence: float,
) -> SignalVote:
    direction: Direction = "NEUTRAL"
    confidence = 0.0

    if sentiment_score is None:
        direction = technical_signal
        confidence = 0.55 if technical_signal != "NEUTRAL" else 0.0
    else:
        sentiment_direction: Direction = (
            "LONG" if sentiment_score >= SENTIMENT_LONG_THRESHOLD
            else "SHORT" if sentiment_score <= SENTIMENT_SHORT_THRESHOLD
            else "NEUTRAL"
        )

        if sentiment_direction == technical_signal and sentiment_direction != "NEUTRAL":
            direction = sentiment_direction
            sentiment_strength = min(abs(sentiment_score), 1.0)
            confidence = round((sentiment_strength + regime_confidence) / 2, 3)
        else:
            direction = "NEUTRAL"
            confidence = 0.0

    return SignalVote(
        direction=direction,
        confidence=confidence,
        sentiment_score=sentiment_score or 0.0,
        technical_signal=technical_signal,
        regime_used=regime,
    )
