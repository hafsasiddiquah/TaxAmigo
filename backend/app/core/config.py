import os
from functools import lru_cache


class Settings:
    """
    Basic application settings.

    For simplicity we read directly from environment variables.
    You can later swap this for pydantic-settings if desired.
    """

    def __init__(self) -> None:
        self.app_env: str = os.getenv("APP_ENV", "development")
        self.app_host: str = os.getenv("APP_HOST", "0.0.0.0")
        self.app_port: int = int(os.getenv("APP_PORT", "8000"))
        self.ollama_model: str = os.getenv("OLLAMA_MODEL", "llama3")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()



