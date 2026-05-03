import json
import pandas as pd
import pandas_ta as ta
from ats.data.redis_client import get_redis
from ats.models.state import Direction, Regime

TRENDING_REGIMES = {"low_vol_bull", "high_vol_bull"}
MEAN_REVERSION_REGIMES = {"choppy"}
STAND_DOWN_REGIMES = {"bear", "high_vol_bear", "crisis"}


async def compute_technical_signal(ticker: str, regime: Regime) -> Direction:
    if regime in STAND_DOWN_REGIMES:
        return "NEUTRAL"

    r = await get_redis()
    raw = await r.lrange(f"price_buffer:{ticker}", 0, 59)
    if len(raw) < 20:
        return "NEUTRAL"

    bars = [json.loads(b) for b in reversed(raw)]
    df = pd.DataFrame(bars)

    if "close" not in df.columns and "price" in df.columns:
        df["close"] = df["price"]
    if "close" not in df.columns:
        return "NEUTRAL"

    close = df["close"].astype(float)

    if regime in TRENDING_REGIMES:
        macd_df = ta.macd(close)
        if macd_df is None or macd_df.empty:
            return "NEUTRAL"
        histogram = macd_df.iloc[-1].get("MACDh_12_26_9", 0)
        if histogram > 0.001:
            return "LONG"
        elif histogram < -0.001:
            return "SHORT"
        return "NEUTRAL"

    elif regime in MEAN_REVERSION_REGIMES:
        bb_df = ta.bbands(close, length=20)
        if bb_df is None or bb_df.empty:
            return "NEUTRAL"
        pct_b_col = [c for c in bb_df.columns if "BBP" in c]
        if not pct_b_col:
            return "NEUTRAL"
        pct_b = float(bb_df.iloc[-1][pct_b_col[0]])
        if pct_b < 0.20:
            return "LONG"
        elif pct_b > 0.80:
            return "SHORT"
        return "NEUTRAL"

    return "NEUTRAL"
