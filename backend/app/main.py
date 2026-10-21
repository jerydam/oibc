from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.db import connect, disconnect
from app.api.routes.public import router as public_router
from app.api.routes.members import router as members_router
from app.api.routes.admin import router as admin_router
from app.api.routes.admin_content import router as admin_content_router
from app.api.routes.me import router as me_router
from app.api.routes.members_ext import router as members_ext_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect()
    yield
    await disconnect()


app = FastAPI(title="Church Platform API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(public_router,       prefix="/api/public",  tags=["public"])
app.include_router(members_router,      prefix="/api/members", tags=["members"])
app.include_router(admin_router,        prefix="/api",         tags=["admin"])
app.include_router(admin_content_router,prefix="/api",         tags=["admin-content"])
app.include_router(me_router,           prefix="/api/me",      tags=["me"])
app.include_router(members_ext_router,  prefix="/api",         tags=["admin-members"])


@app.get("/health")
async def health():
    return {"status": "ok"}