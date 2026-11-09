def test_ai_query_user_example(client):
    """
    Directly tests the prompt's canonical example query:
    'I need wireless headphones for college under ₹5,000. Battery life, comfort, microphone quality, and value for money are my priorities.'
    """
    payload = {
        "query": "I need wireless headphones for college under ₹5,000. Battery life, comfort, microphone quality, and value for money are my priorities."
    }
    response = client.post("/api/ai/query", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Verify extracted preferences
    prefs = data["parsed_preferences"]
    assert prefs["category"] == "Headphones"
    assert prefs["currency"] == "INR"
    assert prefs["budget_max"] == 5000.0
    assert "college" in (prefs["use_case"] or "").lower()
    assert any("battery" in p for p in prefs["priorities"])
    assert any("comfort" in p for p in prefs["priorities"])
    assert any("mic" in p for p in prefs["priorities"])

    # Verify recommendations
    recs = data["recommendations"]
    assert len(recs) > 0
    top_pick = recs[0]
    
    # Top pick must be within budget
    assert top_pick["product"]["price_inr"] <= 5000.0
    assert top_pick["match_tier"] == "Strong Match"
    assert top_pick["match_score"] >= 80

    # Sony WH-CH520 or boAt Rockerz should be top ranked
    top_ids = [r["product"]["id"] for r in recs[:3]]
    assert "prod_sony_whch520" in top_ids

    # Out of budget alternative (Sennheiser HD 450SE at 7990 or Apple) should have Budget Exceeded tier if present
    for r in recs:
        if r["product"]["price_inr"] > 5000.0:
            assert r["match_tier"] == "Budget Exceeded Alternative"

    # Conversational narrative grounded in catalogue
    assert len(data["conversational_response"]) > 20
    assert len(data["suggested_followups"]) > 0

def test_ai_refinement(client):
    payload = {
        "query": "Show me cheaper alternatives under ₹3,000",
        "existing_preferences": {
            "category": "Headphones",
            "use_case": "college",
            "budget_max": 5000.0,
            "currency": "INR",
            "priorities": ["battery life", "value for money"],
            "required_features": [],
            "preferred_brands": [],
            "excluded_brands": [],
            "strict_budget": True,
            "query_summary": "college headphones under 5000"
        }
    }
    response = client.post("/api/ai/refine", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["parsed_preferences"]["budget_max"] == 3000.0
    # Top recommendation must be <= 3000
    assert data["recommendations"][0]["product"]["price_inr"] <= 3000.0

