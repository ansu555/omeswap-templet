from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from ats.config import settings

_connect_args = {"ssl": True} if settings.database_ssl else {}
_engine = create_async_engine(settings.database_url, echo=False, connect_args=_connect_args)
_session_factory = async_sessionmaker(_engine, expire_on_commit=False)


async def create_tables() -> None:
    from ats.models.receipts import Base
    async with _engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@asynccontextmanager
async def get_session() -> AsyncSession:
    async with _session_factory() as session:
        yield session
