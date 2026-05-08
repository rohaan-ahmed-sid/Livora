"""
DFRS — Diabetic Food Recommendation System
Uses the PPGR model to rank food candidates for the user's real-time context.
Respects dietary preferences (halal, vegetarian, vegan, gluten-free, nut-free, dairy-free).
"""
from datetime import datetime
from app.ml.ppgr import predict_ppgr

# ── Food library ──────────────────────────────────────────────────────────────
# Format: name -> (carbs, protein, fat, tags)
# Tags control dietary filtering. Every item is halal by default unless tagged
# "non-halal". "vegan" items are also vegetarian.

FOOD_LIBRARY = {
    # ── Rice & Grains ─────────────────────────────────────────────────────────
    "White Rice (1 cup)":          (45, 4,  0.5, {"vegan", "gluten-free", "nut-free", "dairy-free", "halal"}),
    "Brown Rice (1 cup)":          (35, 5,  2.0, {"vegan", "gluten-free", "nut-free", "dairy-free", "halal"}),
    "Chapati (2 pcs)":             (30, 5,  3.0, {"vegan", "nut-free", "dairy-free", "halal"}),
    "Roti (2 pcs)":                (28, 4,  2.0, {"vegan", "nut-free", "dairy-free", "halal"}),
    "Paratha (2 pcs)":             (40, 6,  15.0,{"vegetarian", "nut-free", "halal"}),
    "Oats Porridge (1 bowl)":      (27, 5,  3.0, {"vegan", "gluten-free", "nut-free", "dairy-free", "halal"}),
    "Overnight Oats":              (30, 10, 5.0, {"vegetarian", "gluten-free", "nut-free", "halal"}),
    "Whole Wheat Bread (2 slices)":(28, 6,  2.0, {"vegan", "nut-free", "dairy-free", "halal"}),

    # ── Eggs & Dairy ──────────────────────────────────────────────────────────
    "Egg Omelette (2 eggs)":       (1,  14, 12.0,{"vegetarian", "gluten-free", "nut-free", "halal"}),
    "Boiled Eggs (2)":             (1,  12, 10.0,{"vegetarian", "gluten-free", "nut-free", "halal"}),
    "Paratha + Egg":               (42, 12, 18.0,{"vegetarian", "nut-free", "halal"}),
    "Greek Yogurt (1 cup)":        (9,  17, 0.0, {"vegetarian", "gluten-free", "nut-free", "halal"}),
    "Cereal + Milk":               (40, 8,  4.0, {"vegetarian", "nut-free", "halal"}),

    # ── Chicken & Meat (halal) ────────────────────────────────────────────────
    "Grilled Chicken Breast":      (0,  30, 5.0, {"gluten-free", "nut-free", "dairy-free", "halal"}),
    "Chicken Karahi (1 bowl)":     (5,  30, 18.0,{"gluten-free", "nut-free", "dairy-free", "halal"}),
    "Palak Chicken (1 bowl)":      (8,  28, 15.0,{"gluten-free", "nut-free", "dairy-free", "halal"}),
    "Nihari (1 bowl)":             (10, 25, 20.0,{"nut-free", "dairy-free", "halal"}),
    "Haleem (1 bowl)":             (18, 20, 10.0,{"nut-free", "dairy-free", "halal"}),
    "Biryani (1 plate)":           (65, 18, 12.0,{"nut-free", "dairy-free", "halal"}),
    "Aloo Gosht (1 bowl)":         (22, 18, 14.0,{"gluten-free", "nut-free", "dairy-free", "halal"}),

    # ── Fish & Seafood ────────────────────────────────────────────────────────
    "Grilled Fish":                (0,  22, 6.0, {"gluten-free", "nut-free", "dairy-free", "halal"}),
    "Tuna Salad":                  (2,  25, 8.0, {"gluten-free", "nut-free", "dairy-free", "halal"}),
    "Fish Curry (1 bowl)":         (8,  24, 12.0,{"gluten-free", "nut-free", "dairy-free", "halal"}),

    # ── Lentils & Legumes (vegan) ─────────────────────────────────────────────
    "Daal (lentils, 1 bowl)":      (20, 9,  3.0, {"vegan", "gluten-free", "nut-free", "dairy-free", "halal"}),
    "Chana Masala (1 bowl)":       (25, 12, 8.0, {"vegan", "gluten-free", "nut-free", "dairy-free", "halal"}),
    "Roasted Chickpeas":           (22, 7,  5.0, {"vegan", "gluten-free", "nut-free", "dairy-free", "halal"}),
    "Moong Daal (1 bowl)":         (18, 8,  2.0, {"vegan", "gluten-free", "nut-free", "dairy-free", "halal"}),

    # ── Vegetables ────────────────────────────────────────────────────────────
    "Vegetable Curry (1 bowl)":    (15, 5,  8.0, {"vegan", "gluten-free", "nut-free", "dairy-free", "halal"}),
    "Mixed Salad":                 (8,  3,  2.0, {"vegan", "gluten-free", "nut-free", "dairy-free", "halal"}),
    "Aloo Palak (1 bowl)":         (20, 4,  6.0, {"vegan", "gluten-free", "nut-free", "dairy-free", "halal"}),
    "Bhindi (Okra, 1 bowl)":       (12, 3,  5.0, {"vegan", "gluten-free", "nut-free", "dairy-free", "halal"}),

    # ── Fruits ────────────────────────────────────────────────────────────────
    "Apple (1 medium)":            (25, 0,  0.0, {"vegan", "gluten-free", "nut-free", "dairy-free", "halal"}),
    "Banana (1 medium)":           (27, 1,  0.0, {"vegan", "gluten-free", "nut-free", "dairy-free", "halal"}),
    "Fruit Bowl (seasonal)":       (25, 1,  0.0, {"vegan", "gluten-free", "nut-free", "dairy-free", "halal"}),
    "Papaya (1 cup)":              (15, 1,  0.0, {"vegan", "gluten-free", "nut-free", "dairy-free", "halal"}),
    "Guava (1 medium)":            (14, 1,  0.5, {"vegan", "gluten-free", "nut-free", "dairy-free", "halal"}),

    # ── Nuts & Seeds (tagged separately so nut-free users can exclude) ─────────
    "Nuts Mix (30g)":              (6,  6,  15.0,{"vegan", "gluten-free", "dairy-free", "halal", "contains-nuts"}),
    "Almond Milk (1 cup)":         (8,  1,  2.5, {"vegan", "gluten-free", "dairy-free", "halal", "contains-nuts"}),

    # ── Sandwiches & Wraps ────────────────────────────────────────────────────
    "Whole Wheat Sandwich":        (35, 12, 8.0, {"nut-free", "halal"}),
    "Chicken Wrap":                (38, 22, 10.0,{"nut-free", "dairy-free", "halal"}),
}


# ── Dietary filter logic ──────────────────────────────────────────────────────

def _passes_dietary_filter(tags: set, preferences: list[str]) -> bool:
    """
    Returns True if the food item is safe for the given dietary preferences.

    Rules:
    - halal       → only show items tagged "halal"
    - vegetarian  → exclude meat/fish (items must have "vegetarian" or "vegan" tag)
    - vegan       → only items tagged "vegan"
    - gluten-free → only items tagged "gluten-free"
    - nut-free    → exclude items tagged "contains-nuts"
    - dairy-free  → only items tagged "dairy-free"
    """
    prefs = {p.lower().strip() for p in preferences}

    if "halal" in prefs and "halal" not in tags:
        return False

    if "vegan" in prefs and "vegan" not in tags:
        return False

    if "vegetarian" in prefs and "vegetarian" not in tags and "vegan" not in tags:
        return False

    if "gluten-free" in prefs and "gluten-free" not in tags:
        return False

    if "nut-free" in prefs and "contains-nuts" in tags:
        return False

    if "dairy-free" in prefs and "dairy-free" not in tags:
        return False

    return True


# ── Context adjustments to PPGR ───────────────────────────────────────────────

def _adjusted_baseline(
    baseline_glucose: float,
    hba1c: float | None,
    bp_systolic: float | None,
    weight_kg: float | None,
    height_cm: float | None,
) -> float:
    """
    Adjusts the effective baseline glucose for PPGR calculation
    based on broader health profile.

    - High HbA1c → chronically elevated → adds to effective baseline
    - Hypertension → insulin resistance → adds small penalty
    - Obesity (BMI > 30) → insulin resistance → adds small penalty
    """
    adjusted = baseline_glucose

    # HbA1c adjustment: each 1% above 7.0 adds ~5 mg/dL to effective baseline
    if hba1c and hba1c > 7.0:
        adjusted += (hba1c - 7.0) * 5.0

    # BP adjustment: systolic > 140 = stage 2 hypertension
    if bp_systolic:
        if bp_systolic > 160:
            adjusted += 8.0
        elif bp_systolic > 140:
            adjusted += 4.0
        elif bp_systolic > 130:
            adjusted += 2.0

    # BMI adjustment
    if weight_kg and height_cm and height_cm > 0:
        bmi = weight_kg / ((height_cm / 100) ** 2)
        if bmi > 35:
            adjusted += 6.0
        elif bmi > 30:
            adjusted += 3.0

    return min(adjusted, 250.0)  # cap at 250


def _sleep_adjusted(sleep_hours: float, sleep_goal: float) -> float:
    """
    If user slept less than their goal, increase effective sleep deprivation
    effect on glucose metabolism.
    """
    # Already passed to PPGR model directly — just normalize to goal
    deficit = max(0, sleep_goal - sleep_hours)
    # Every hour of deficit below goal slightly reduces sleep quality
    # We return the actual hours but floored to a minimum of 3h
    return max(3.0, sleep_hours)


def get_recommendations(
    baseline_glucose: float = 110.0,
    activity_level: int = 1,
    sleep_hours: float = 7.0,
    sleep_goal: float = 8.0,
    time_since_last_meal: float = 3.0,
    dietary_preferences: list[str] | None = None,
    hba1c: float | None = None,
    bp_systolic: float | None = None,
    bp_diastolic: float | None = None,
    weight_kg: float | None = None,
    height_cm: float | None = None,
    top_n: int = 10,
) -> list[dict]:
    """
    Rank all foods for the user's full health context.
    Filters by dietary preferences first, then ranks by predicted PPGR.
    """
    prefs = dietary_preferences or []
    hour  = datetime.now().hour

    # Adjusted baseline incorporates HbA1c, BP, BMI
    adj_baseline = _adjusted_baseline(
        baseline_glucose, hba1c, bp_systolic, weight_kg, height_cm
    )
    adj_sleep = _sleep_adjusted(sleep_hours, sleep_goal)

    results = []
    skipped = []

    for name, (carbs, protein, fat, tags) in FOOD_LIBRARY.items():
        if not _passes_dietary_filter(tags, prefs):
            skipped.append(name)
            continue

        result = predict_ppgr(
            carbs=carbs,
            protein=protein,
            fat=fat,
            baseline_glucose=adj_baseline,
            activity_level=activity_level,
            sleep_hours=adj_sleep,
            time_since_last_meal=time_since_last_meal,
            hour=hour,
        )
        results.append({
            "meal_name": name,
            "carbs": carbs,
            "protein": protein,
            "fat": fat,
            "predicted_ppgr": result["predicted_ppgr"],
            "risk_flag": result["risk_flag"],
            "tags": list(tags),
        })

    results.sort(key=lambda x: x["predicted_ppgr"])

    for i, r in enumerate(results[:top_n]):
        r["rank"] = i + 1

    return results[:top_n]
