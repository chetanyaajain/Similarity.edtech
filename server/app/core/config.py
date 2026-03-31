from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "AI Assignment Similarity Checker API"
    app_env: str = "development"
    secret_key: str
    access_token_expire_minutes: int = 1440
    database_url: str
    ml_service_url: str
    client_url: str = "http://localhost:3000"
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from: str = ""
    upload_dir: str = "uploads"
    report_dir: str = "reports"


settings = Settings()

