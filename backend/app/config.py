from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    jwt_secret_key: str = "pqkzh9UXXe/lbwPSEQ7aiDiOUZtYAGrH/wNoPP5cGYA="
    jwt_algorithm: str = "HS256"
    environment: str = "development"
    log_level: str = "INFO"
    task_table_name: str = "tasks"
    user_table_name: str = "users"
    valid_jwt_token: str = ""

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
