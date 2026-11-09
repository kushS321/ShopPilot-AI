import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.database import Base, get_db
from backend.app.main import app
from backend.app.seed_data.seed import seed_database
from backend.app.models.product import Product

# Use in-memory SQLite for fast, isolated tests
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    # Populate initial sample catalogue for testing
    from pathlib import Path
    import json
    json_path = Path(__file__).parent.parent / "app" / "seed_data" / "products.json"
    with open(json_path, "r", encoding="utf-8") as f:
        products_data = json.load(f)
    for item in products_data:
        p = Product(
            id=item["id"],
            name=item["name"],
            brand=item["brand"],
            category=item["category"],
            description=item["description"],
            price=item["price"],
            price_inr=item["price_inr"],
            currency=item.get("currency", "USD"),
            image_url=item["image_url"],
            features=item.get("features", []),
            specifications=item.get("specifications", {}),
            is_in_stock=item.get("is_in_stock", True),
            stock_quantity=item.get("stock_quantity", 25),
            rating=item.get("rating", 4.5),
            review_count=item.get("review_count", 0),
            data_source=item.get("data_source", "ShopPilot Verified Catalogue")
        )
        db.add(p)
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture()
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture()
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

