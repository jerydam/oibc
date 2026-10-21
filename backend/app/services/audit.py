from uuid import UUID


async def audit(conn, actor_id: UUID | None, action: str, entity_type: str,
                entity_id, meta: dict | None = None) -> None:
    """Log *what* changed, never the sensitive values themselves."""
    await conn.execute(
        """insert into audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
           values ($1, $2, $3, $4, $5)""",
        actor_id, action, entity_type, str(entity_id), meta,
    )
