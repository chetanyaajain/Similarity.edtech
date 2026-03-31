from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.routes import analytics, auth, batches, reports, submissions, ws
from app.core.config import settings
from app.core.logging import configure_logging
from app.core.rate_limit import limiter
from app.db.session import init_db


@asynccontextmanager
async def lifespan(_: FastAPI):
    configure_logging()
    init_db()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

allowed_origins = {
    settings.client_url.rstrip("/"),
    "http://localhost:3000",
    "http://127.0.0.1:3000",
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(batches.router, prefix="/api/batches", tags=["batches"])
app.include_router(submissions.router, prefix="/api/submissions", tags=["submissions"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(ws.router, tags=["ws"])


@app.get("/health")
def healthcheck():
    return {"status": "ok"}
