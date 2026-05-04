# Phase 8 API, WebSocket, And Conversation Layer

Last updated: 2026-05-04

Phase 8 exposes the ATS pipeline through FastAPI and adds WebSocket events and receipt-aware chat.

## Implemented Files

- `ats/api/main.py`
- `ats/api/ws_manager.py`
- `ats/api/routes/activations.py`
- `ats/api/routes/receipts.py`
- `ats/api/routes/chat.py`
- `ats/api/conversation/rag.py`
- `tests/test_phase8.py`

## Routes

| Route | Purpose |
|---|---|
| `GET /health` | Returns API status and WebSocket connection count. |
| `WS /ws` | Keeps a WebSocket open for server-pushed events. |
| `POST /activations/{activation_id}/execute` | Runs the ATS pipeline for a trigger and broadcasts completion. |
| `GET /receipts/{receipt_id}` | Returns a stored decision receipt. |
| `POST /chat` | Conversation endpoint with recent receipt context. |

## Startup

`ats/api/main.py`:

1. creates database tables
2. starts the Agent 6 stop-loss monitor
3. registers activation, receipt, and chat routers

## WebSocket Events

`WebSocketManager` tracks active connections and prunes dead sockets during broadcast. Activation execution broadcasts a `pipeline_complete` event with activation, ticker, receipt, consensus, and regime fields.

## Conversation

The chat route uses recent `DecisionReceipt` rows as context through `ats/api/conversation/rag.py`. It can use the configured Anthropic/API model settings from `ats/config.py`.

## Validate

```bash
python -m pytest tests/test_phase8.py -v
```

## Current Limitations

- CORS is open in development and must be tightened for production.
- WebSocket auth is not implemented.
- Chat context is receipt-based RAG only; it is not a full vector store.
