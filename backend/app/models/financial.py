from typing import List, Optional

from pydantic import BaseModel, Field


class IncomeBreakdown(BaseModel):
    salary: float = Field(0, description="Salary income")
    business: float = Field(0, description="Business/professional income")
    interest: float = Field(0, description="Interest income")
    rental: float = Field(0, description="Rental income")
    capital_gains: float = Field(0, description="Capital gains")
    other: float = Field(0, description="Other income")


class DeductionInputs(BaseModel):
    section_80c: float = Field(0, description="Investments eligible under 80C")
    section_80d: float = Field(0, description="Medical insurance under 80D")
    section_24b: float = Field(0, description="Home loan interest under 24(b)")
    nps_80ccd1b: float = Field(0, description="Additional NPS (80CCD(1B))")
    other_deductions: float = Field(0, description="Other eligible deductions")


class FinancialProfile(BaseModel):
    """
    Aggregate financial inputs for a given financial year.
    """

    fy: str = Field(..., description="Financial year, e.g., '2024-25'")
    age: int = Field(..., ge=18, le=100)
    resident_status: str = Field(
        "resident", description="resident | non-resident | resident-but-not-ordinary"
    )
    income: IncomeBreakdown
    deductions: DeductionInputs
    regime_preference: Optional[str] = Field(
        None, description="old | new | None (let system compare)"
    )


class AnalyzeFinancialsRequest(BaseModel):
    raw_text: str = Field(..., description="User's free-form description of finances")


class AnalyzeFinancialsResponse(BaseModel):
    structured_financial_info: dict
    explanation: str



