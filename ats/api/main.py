from fastapi import FastAPI
from ats.data.postgres_client import create_tables

app = FastAPI(title="ATS API", version="0.1.0")


@app.on_event("startup")
async def startup():
    await create_tables()


@app.get("/health")
async def health():
    return {"status": "ok"}
