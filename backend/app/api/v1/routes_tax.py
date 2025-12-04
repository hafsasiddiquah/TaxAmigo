from fastapi import APIRouter

from app.models.tax import TaxComputationRequest, TaxComputationResponse
from app.services.tax_logic import (
    compute_tax_old_regime,
    compute_tax_new_regime,
    _apply_deduction_caps_old_regime,
    _apply_deduction_caps_new_regime,
    _compute_gross_total_income,
)

router = APIRouter()


@router.post("/calculate_tax", response_model=TaxComputationResponse)
async def calculate_tax_endpoint(payload: TaxComputationRequest) -> TaxComputationResponse:
    """
    Compute tax for old/new regime for the given financial profile.
    """
    profile = payload.profile
    response = TaxComputationResponse()
    warnings: list[str] = []

    # Run validation / cap logic once up-front for warnings
    gross_total_income = _compute_gross_total_income(profile)
    old_deductions, old_warnings = _apply_deduction_caps_old_regime(profile)
    new_deductions, new_warnings = _apply_deduction_caps_new_regime(profile)

    # Only attach warnings that are actually relevant to selected regimes
    if payload.regime in (None, "old"):
        warnings.extend(old_warnings)
    if payload.regime in (None, "new"):
        warnings.extend(new_warnings)

    # Simple informational note about age band
    if profile.age >= 60:
        warnings.append(
            "Senior/super-senior handling is included only at a high level in this demo. "
            "Please cross-check slab and deduction rules before relying on these numbers."
        )

    if payload.regime in (None, "old"):
        response.old_regime = compute_tax_old_regime(profile)
    if payload.regime in (None, "new"):
        response.new_regime = compute_tax_new_regime(profile)

    if response.old_regime and response.new_regime:
        response.recommended_regime = (
            "old"
            if response.old_regime.total_tax < response.new_regime.total_tax
            else "new"
        )
        response.note = (
            "Comparison based on simplified FY 2024-25 India income-tax rules "
            f"for FY 2024-25. Gross total income considered: ₹{gross_total_income:.0f}. "
            "This is an educational estimate, not legal or financial advice."
        )

    response.warnings = warnings

    return response



