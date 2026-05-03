from transformers import pipeline
from collections import defaultdict
from ats.models.packets import DataPacket

_finbert = pipeline(
    "text-classification",
    model="ProsusAI/finbert",
    top_k=None,
    device=-1,
)

LABEL_SCORE = {"positive": 1.0, "negative": -1.0, "neutral": 0.0}

_headline_buffer: dict[str, list[tuple[str, float]]] = defaultdict(list)
MAX_BATCH = 10


def buffer_headline(packet: DataPacket) -> None:
    text = f"{packet.payload.get('title', '')} {packet.payload.get('description', '')}".strip()
    if text:
        _headline_buffer[packet.ticker].append((text, packet.cq_score))


def compute_sentiment(ticker: str) -> float | None:
    """
    Runs FinBERT on buffered headlines for ticker.
    Returns CQ-weighted average sentiment [-1.0, +1.0], or None if no headlines.
    """
    buffer = _headline_buffer.pop(ticker, [])
    if not buffer:
        return None

    texts = [t for t, _ in buffer[:MAX_BATCH]]
    weights = [w for _, w in buffer[:MAX_BATCH]]

    results = _finbert(texts)

    weighted_scores = []
    for result_list, weight in zip(results, weights):
        top = max(result_list, key=lambda x: x["score"])
        direction = LABEL_SCORE[top["label"]]
        weighted_scores.append(direction * top["score"] * weight)

    total_weight = sum(weights[:MAX_BATCH])
    return sum(weighted_scores) / total_weight if total_weight else None
