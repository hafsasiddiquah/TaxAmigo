from typing import Dict, Any

from app.models.financial import FinancialProfile


def autofill_form_fields(profile: FinancialProfile) -> Dict[str, Any]:
    """
    Very lightweight mapper from our internal FinancialProfile model
    to representative form field names (e.g., ITR-style fields).

    This is intended as a starting schema that you can adapt to the
    exact form specification you plan to support.
    """
    income = profile.income
    deductions = profile.deductions

    return {
        # Example income heads
        "salary_income": income.salary,
        "business_profession_income": income.business,
        "house_property_income": income.rental,
        "capital_gains": income.capital_gains,
        "other_sources_income": income.other + income.interest,
        # Example deductions
        "deduction_80C": deductions.section_80c,
        "deduction_80D": deductions.section_80d,
        "deduction_24B": deductions.section_24b,
        "deduction_80CCD_1B": deductions.nps_80ccd1b,
        "other_deductions": deductions.other_deductions,
        # Misc meta
        "financial_year": profile.fy,
        "age": profile.age,
        "resident_status": profile.resident_status,
        "preferred_regime": profile.regime_preference,
    }



