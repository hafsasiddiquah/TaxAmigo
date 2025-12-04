from typing import List

from app.core.ai_client import generate_simple_explanation
from app.models.tax import (
    DeductionSuggestion,
    DeductionSuggestionRequest,
    DeductionSuggestionResponse,
)
from app.services.tax_logic import get_applicable_deductions


def suggest_deductions(payload: DeductionSuggestionRequest) -> DeductionSuggestionResponse:
    """
    Very simple rule-based + explanation-driven deduction suggestions.
    """
    profile = payload.profile
    claimed = get_applicable_deductions(profile)

    suggestions: List[DeductionSuggestion] = []

    # Example logic for 80C cap (1.5L)
    max_80c = 150000.0
    current_80c = claimed.get("80C", 0.0)
    if current_80c < max_80c:
        suggestions.append(
            DeductionSuggestion(
                section="80C",
                label="Investments under Section 80C",
                potential_amount=max_80c - current_80c,
                description=(
                    "You can potentially claim up to ₹1,50,000 under Section 80C "
                    "through EPF, PPF, ELSS, life insurance premiums, etc., "
                    "subject to eligibility and limits."
                ),
            )
        )

    # Example for 80D basic health insurance
    max_80d = 25000.0
    current_80d = claimed.get("80D", 0.0)
    if current_80d < max_80d:
        suggestions.append(
            DeductionSuggestion(
                section="80D",
                label="Health insurance premium (self/family)",
                potential_amount=max_80d - current_80d,
                description=(
                    "You may be able to claim medical insurance premiums under 80D "
                    "for yourself, spouse and children, within the applicable limits."
                ),
            )
        )

    note = generate_simple_explanation(
        "We generated the following potential deduction suggestions (they are not advice): "
        + str([s.model_dump() for s in suggestions])
    )

    return DeductionSuggestionResponse(suggestions=suggestions, note=note)



