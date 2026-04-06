from pathlib import Path

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()


class Settings(BaseSettings):
    app_name: str = "llm-viz-server"
    data_file: str = "data/employees.json"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


def get_repo_root() -> Path:
    return Path(__file__).resolve().parents[4]


def resolve_data_file(settings: Settings | None = None) -> Path:
    cfg = settings or Settings()
    candidate = Path(cfg.data_file)
    if candidate.is_absolute():
        return candidate
    return get_repo_root() / candidate
