from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "ShopPilot AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = "sqlite:///./shoppilot.db"
    
    # AI - Google Gemini
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    # PayPal Sandbox
    PAYPAL_ENVIRONMENT: str = "sandbox"
    PAYPAL_CLIENT_ID: Optional[str] = None
    PAYPAL_CLIENT_SECRET: Optional[str] = None
    PAYPAL_BASE_URL: str = "https://api-m.sandbox.paypal.com"
    
    # Currency
    DEFAULT_CURRENCY: str = "USD"
    # Exchange rate from INR to USD for catalogue demonstration display (1 USD ~ 83 INR)
    INR_TO_USD_RATE: float = 0.012
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

