import asyncio
from ats.data.queue import normalized_queue
from ats.data.redis_client import get_json, set_json
from ats.models.packets import DataPacket
from ats.agents.signal.sentiment import buffer_headline, compute_sentiment
from ats.agents.signal.technicals import compute_technical_signal
from ats.agents.signal.combiner import combine


class Agent2Signal:
    async def run(self):
        while True:
            packet: DataPacket = await normalized_queue.get()
            await self._process(packet)

    async def _process(self, packet: DataPacket):
        if packet.type == "news":
            buffer_headline(packet)
            return

        if packet.type not in ("price", "onchain_event"):
            return

        regime_data = await get_json("regime:current")
        if not regime_data:
            return
        regime = regime_data["regime"]
        regime_confidence = regime_data["confidence"]

        sentiment = compute_sentiment(packet.ticker)
        technical = await compute_technical_signal(packet.ticker, regime)
        vote = combine(packet.ticker, sentiment, technical, regime, regime_confidence)

        await set_json(f"signal:latest:{packet.ticker}", vote.model_dump())
