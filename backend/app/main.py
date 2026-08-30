from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.models import init_db
from app.api.routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title=settings.app_name,
    description="Turn prospect websites into multimodal agent proof-of-concepts",
    version="0.1.0",
    lifespan=lifespan,
)

_cors_allow_all = "*" in settings.cors_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if _cors_allow_all else settings.cors_origins,
    allow_credentials=not _cors_allow_all,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/")
async def root():
    return {"service": "Sightline API", "docs": "/docs"}
