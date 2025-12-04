from typing import Literal, Optional

from pydantic import BaseModel, Field


TaxRegime = Literal["old", "new"]


class TaxComputationRequest(BaseModel):
    profile: "FinancialProfile"
    regime: Optional[TaxRegime] = Field(
        None,
        description="If omitted, both regimes will be computed for comparison.",
    )


class RegimeTaxBreakdown(BaseModel):
    regime: TaxRegime
    gross_total_income: float
    deductions: float
    taxable_income: float
    tax_before_cess: float
    # In this simplified demo, surcharge (if any) is rolled into tax_before_cess.
    cess: float
    total_tax: float
    effective_rate_percent: float


class TaxComputationResponse(BaseModel):
    old_regime: Optional[RegimeTaxBreakdown] = None
    new_regime: Optional[RegimeTaxBreakdown] = None
    recommended_regime: Optional[TaxRegime] = None
    note: Optional[str] = None
    warnings: list[str] = Field(
        default_factory=list,
        description="Non-fatal validation messages, e.g. deduction caps exceeded.",
    )


class DeductionSuggestionRequest(BaseModel):
    profile: "FinancialProfile"


class DeductionSuggestion(BaseModel):
    section: str
    label: str
    potential_amount: float
    description: str


class DeductionSuggestionResponse(BaseModel):
    suggestions: list[DeductionSuggestion]
    note: Optional[str] = None


# Late imports to avoid circular reference at type-check time
from app.models.financial import FinancialProfile  # noqa: E402  pylint: disable=C0413

TaxComputationRequest.update_forward_refs()


