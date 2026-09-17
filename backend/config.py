from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_title: str = "RailBlock AI"
    app_version: str = "1.0.0"
    cors_origins: list[str] = ["*"]
    database_url: str = "sqlite:///./railblock.db"

    class Config:
        env_file = ".env"

settings = Settings()
