from backend.app.services.ranking_service import DeterministicRankingEngine
from backend.app.schemas.ai import ExtractedPreferences
from backend.app.models.product import Product

def test_deterministic_ranking_satisfies_hard_budget():
    p_cheap = Product(
        id="p1", name="Budget Cans", brand="BrandA", category="Headphones",
        description="good headphones", price=30.0, price_inr=2500.0,
        currency="USD", image_url="", features=["lightweight"],
        specifications={"battery_life": "50 hours", "weight": "140 g", "microphone": "beamforming"},
        rating=4.5, review_count=120, data_source="Catalogue",
        is_in_stock=True, stock_quantity=10
    )
    p_expensive = Product(
        id="p2", name="Luxury Cans", brand="BrandB", category="Headphones",
        description="expensive cans", price=120.0, price_inr=9999.0,
        currency="USD", image_url="", features=["premium"],
        specifications={"battery_life": "60 hours", "weight": "250 g", "microphone": "studio"},
        rating=4.8, review_count=450, data_source="Catalogue",
        is_in_stock=True, stock_quantity=10
    )

    prefs = ExtractedPreferences(
        category="Headphones",
        budget_max=5000.0,
        currency="INR",
        priorities=["battery life", "comfort", "microphone quality", "value for money"],
        strict_budget=True
    )

    ranked = DeterministicRankingEngine.rank_products([p_cheap, p_expensive], prefs)
    assert len(ranked) == 2
    
    # p_cheap must rank higher because it satisfies the hard budget constraint
    assert ranked[0].product.id == "p1"
    assert ranked[0].match_tier == "Strong Match"
    assert ranked[0].match_score > ranked[1].match_score
    
    # p_expensive must be marked as Budget Exceeded Alternative
    assert ranked[1].product.id == "p2"
    assert ranked[1].match_tier == "Budget Exceeded Alternative"
    assert "Exceeds target budget" in ranked[1].trade_offs[0]

def test_score_components_breakdown():
    product = Product(
        id="p1", name="Test Earphones", brand="Sony", category="Headphones",
        description="long battery and light", price=50.0, price_inr=4000.0,
        currency="USD", image_url="", features=[],
        specifications={"battery_life": "50 hours", "weight": "147 g", "microphone": "beamforming mic"},
        rating=4.6, review_count=210, data_source="Catalogue",
        is_in_stock=True, stock_quantity=5
    )
    prefs = ExtractedPreferences(
        category="Headphones",
        budget_max=5000.0,
        currency="INR",
        priorities=["battery life", "comfort", "microphone quality"],
        preferred_brands=["Sony"]
    )
    score, tier, breakdown, advantages, trade_offs = DeterministicRankingEngine.score_product(product, prefs)
    assert score >= 80
    assert tier == "Strong Match"
    assert breakdown["category"] == 25
    assert breakdown["budget"] == 25
    assert breakdown["brand"] == 10
    assert len(advantages) > 0
