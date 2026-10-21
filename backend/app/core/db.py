import json

import asyncpg

from app.core.config import settings

pool: asyncpg.Pool | None = None


async def _init(conn: asyncpg.Connection) -> None:
    await conn.set_type_codec(
        "jsonb", encoder=json.dumps, decoder=json.loads, schema="pg_catalog"
    )


async def connect() -> None:
    global pool
    # statement_cache_size=0 keeps this compatible with Supabase's pgbouncer pooler
    pool = await asyncpg.create_pool(
        settings.database_url, min_size=1, max_size=10, init=_init, statement_cache_size=0
    )


async def disconnect() -> None:
    if pool:
        await pool.close()


async def get_conn():
    assert pool is not None
    async with pool.acquire() as conn:
        yield conn
