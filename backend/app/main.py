from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.api.v1.routes_analyze import router as analyze_router
from app.api.v1.routes_tax import router as tax_router
from app.api.v1.routes_deductions import router as deductions_router
from app.api.v1.routes_forms import router as forms_router
from app.api.v1.routes_chat import router as chat_router


def create_app() -> FastAPI:
    """
    Application factory.
    """
    settings = get_settings()

    app = FastAPI(
        title="AI-Powered Personalized Tax Filing Assistant",
        version="0.1.0",
        description="FastAPI backend using local Ollama models only.",
    )

    # Basic CORS config for local dev; adjust for production as needed
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register versioned API routers
    app.include_router(analyze_router, prefix="/api/v1", tags=["financial-analysis"])
    app.include_router(tax_router, prefix="/api/v1", tags=["tax-calculation"])
    app.include_router(deductions_router, prefix="/api/v1", tags=["deductions"])
    app.include_router(forms_router, prefix="/api/v1", tags=["forms"])
    app.include_router(chat_router, prefix="/api/v1", tags=["chat"])

    @app.get("/health", tags=["health"])
    async def health_check():
        return {"status": "ok"}

    return app


app = create_app()


