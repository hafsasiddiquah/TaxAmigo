"""
Pure tax computation utilities, independent from AI.

These implement simplified versions of Indian income tax slabs for
FY 2024-25 (AY 2025-26) for demonstration purposes.
Do NOT treat this as production-grade tax advice.
"""

from __future__ import annotations

from typing import Dict, List, Tuple

import json
import os

from app.models.financial import FinancialProfile
from app.models.tax import RegimeTaxBreakdown

_RULES_CACHE: Dict[str, object] | None = None


def _load_rules() -> Dict[str, object]:
    """
    Load tax rules JSON once and cache in memory.
    """
    global _RULES_CACHE
    if _RULES_CACHE is None:
        base_dir = os.path.dirname(os.path.dirname(__file__))
        path = os.path.join(base_dir, "data", "tax_rules_2024_25_india.json")
        with open(path, "r", encoding="utf-8") as f:
            _RULES_CACHE = json.load(f)
    return _RULES_CACHE  # type: ignore[return-value]


def _compute_cess(amount: float) -> float:
    """Health & education cess from rules (default 4%)."""
    rules = _load_rules()
    cess_cfg = rules.get("cess", {})
    rate_percent = cess_cfg.get("health_education_cess_percent", 4)
    return round(amount * rate_percent / 100.0, 2)


def _round_tax(amount: float) -> float:
    """Round tax to nearest rupee."""
    return round(amount, 0)


def _get_surcharge_rate(taxable_income: float) -> float:
    """
    Basic surcharge rate lookup based on taxable income.
    Uses simplified demo bands from JSON.
    """
    rules = _load_rules()
    surcharge_cfg = rules.get("surcharge", {})
    bands: List[Dict[str, float]] = surcharge_cfg.get("bands", [])
    rate = 0.0
    for band in bands:
        threshold = float(band.get("threshold", 0))
        if taxable_income > threshold:
            rate = float(band.get("rate_percent", 0))
    return rate


def _apply_deduction_caps_old_regime(profile: FinancialProfile) -> Tuple[float, List[str]]:
    """
    Apply deduction caps for old regime using JSON rules.
    Returns: (total_deductions, warnings)
    """
    rules = _load_rules()
    deductions_cfg = rules.get("old_regime", {}).get("common_deductions", {})
    d = profile.deductions
    warnings: List[str] = []

    # 80C
    max_80c = float(deductions_cfg.get("80C", {}).get("max_amount", d.section_80c))
    allowed_80c = min(d.section_80c, max_80c)
    if d.section_80c > max_80c:
        warnings.append(
            f"80C claimed ₹{d.section_80c:.0f} exceeds cap ₹{max_80c:.0f}. "
            f"Only ₹{allowed_80c:.0f} considered for this estimate."
        )

    # 80D
    max_80d = float(
        deductions_cfg.get("80D", {}).get("max_amount_self_family", d.section_80d)
    )
    allowed_80d = min(d.section_80d, max_80d)
    if d.section_80d > max_80d:
        warnings.append(
            f"80D claimed ₹{d.section_80d:.0f} exceeds sample cap ₹{max_80d:.0f}. "
            f"Only ₹{allowed_80d:.0f} considered."
        )

    # 24B
    max_24b = float(deductions_cfg.get("24B", {}).get("max_amount", d.section_24b))
    allowed_24b = min(d.section_24b, max_24b)
    if d.section_24b > max_24b:
        warnings.append(
            f"24(b) home loan interest claimed ₹{d.section_24b:.0f} exceeds cap "
            f"₹{max_24b:.0f}. Only ₹{allowed_24b:.0f} considered."
        )

    # 80CCD(1B) - additional NPS
    max_nps = float(deductions_cfg.get("80CCD(1B)", {}).get("max_amount", d.nps_80ccd1b))
    allowed_nps = min(d.nps_80ccd1b, max_nps)
    if d.nps_80ccd1b > max_nps:
        warnings.append(
            f"NPS 80CCD(1B) claimed ₹{d.nps_80ccd1b:.0f} exceeds cap ₹{max_nps:.0f}. "
            f"Only ₹{allowed_nps:.0f} considered."
        )

    total_deductions = (
        allowed_80c
        + allowed_80d
        + allowed_24b
        + allowed_nps
        + d.other_deductions
    )
    return total_deductions, warnings


def _apply_deduction_caps_new_regime(profile: FinancialProfile) -> Tuple[float, List[str]]:
    """
    Apply permitted deductions under new regime (very limited in this demo).
    Returns: (total_deductions, warnings)
    """
    rules = _load_rules()
    deductions_cfg = rules.get("new_regime", {}).get("allowed_deductions", {})
    d = profile.deductions
    warnings: List[str] = []

    max_nps = float(deductions_cfg.get("80CCD(1B)", {}).get("max_amount", d.nps_80ccd1b))
    allowed_nps = min(d.nps_80ccd1b, max_nps)
    if d.nps_80ccd1b > max_nps:
        warnings.append(
            f"New regime: NPS 80CCD(1B) claimed ₹{d.nps_80ccd1b:.0f} exceeds cap "
            f"₹{max_nps:.0f}. Only ₹{allowed_nps:.0f} considered."
        )

    # All other deductions ignored in this simplified new regime
    ignored_total = (
        d.section_80c + d.section_80d + d.section_24b + d.other_deductions
    )
    if ignored_total > 0:
        warnings.append(
          "New regime: standard deductions like 80C/80D/24(b) are ignored in this "
          "simplified demo; only eligible NPS 80CCD(1B) is considered."
        )

    return allowed_nps, warnings


def _compute_gross_total_income(profile: FinancialProfile) -> float:
    income = profile.income
    return (
        income.salary
        + income.business
        + income.interest
        + income.rental
        + income.capital_gains
        + income.other
    )


def _compute_tax_from_slabs(taxable_income: float, slabs: List[Dict[str, float]]) -> float:
    """
    Generic progressive slab calculator using rule JSON.
    Each slab is of the form:
        { "upto": 250000, "rate_percent": 0 }
        { "from": 250001, "upto": 500000, "rate_percent": 5 }
        { "from": 1500001, "rate_percent": 30 }
    """
    remaining = taxable_income
    tax = 0.0
    last_upto = 0.0
    for slab in slabs:
        rate = float(slab.get("rate_percent", 0)) / 100.0
        slab_from = float(slab.get("from", last_upto + 1))
        slab_upto = float(slab.get("upto", taxable_income))
        if remaining <= 0:
            break
        # Determine overlap of [slab_from, slab_upto] with [1, taxable_income]
        width = max(0.0, min(taxable_income, slab_upto) - slab_from + 1)
        if width <= 0:
            continue
        slab_amount = min(remaining, width)
        tax += slab_amount * rate
        remaining -= slab_amount
        last_upto = slab_upto
    return _round_tax(tax)

def compute_tax_old_regime(profile: FinancialProfile) -> RegimeTaxBreakdown:
    """
    Old regime computation using JSON-configured slabs and deduction caps.
    Includes basic age handling (adult / senior / super-senior) and surcharge.
    """
    rules = _load_rules()
    old_cfg = rules.get("old_regime", {})

    gross_total_income = _compute_gross_total_income(profile)
    total_deductions, _warnings = _apply_deduction_caps_old_regime(profile)
    taxable_income = max(gross_total_income - total_deductions, 0)

    slabs: List[Dict[str, float]] = old_cfg.get("slabs", [])

    # Age-based info (for notes only in this demo; slabs kept same)
    age_bands = old_cfg.get("age_bands", [])
    age_label = "adult"
    for band in age_bands:
        if band.get("min_age") <= profile.age <= band.get("max_age"):
            age_label = band.get("label", age_label)
            break

    tax = _compute_tax_from_slabs(taxable_income, slabs)

    # Surcharge
    surcharge_rate = _get_surcharge_rate(taxable_income)
    surcharge = _round_tax(tax * surcharge_rate / 100.0)
    tax_with_surcharge = tax + surcharge

    cess = _compute_cess(tax_with_surcharge)
    total = tax_with_surcharge + cess

    effective_rate = (total / taxable_income * 100) if taxable_income > 0 else 0.0

    return RegimeTaxBreakdown(
        regime="old",
        gross_total_income=gross_total_income,
        deductions=total_deductions,
        taxable_income=taxable_income,
        tax_before_cess=tax,
        cess=cess,
        total_tax=total,
        effective_rate_percent=round(effective_rate, 2),
    )


def compute_tax_new_regime(profile: FinancialProfile) -> RegimeTaxBreakdown:
    """
    New regime computation using JSON-configured slabs and deduction rules.
    Applies limited deductions and surcharge.
    """
    rules = _load_rules()
    new_cfg = rules.get("new_regime", {})

    gross_total_income = _compute_gross_total_income(profile)
    total_deductions, _warnings = _apply_deduction_caps_new_regime(profile)
    taxable_income = max(gross_total_income - total_deductions, 0)

    slabs: List[Dict[str, float]] = new_cfg.get("slabs", [])

    tax = _compute_tax_from_slabs(taxable_income, slabs)

    surcharge_rate = _get_surcharge_rate(taxable_income)
    surcharge = _round_tax(tax * surcharge_rate / 100.0)
    tax_with_surcharge = tax + surcharge

    cess = _compute_cess(tax_with_surcharge)
    total = tax_with_surcharge + cess

    effective_rate = (total / taxable_income * 100) if taxable_income > 0 else 0.0

    return RegimeTaxBreakdown(
        regime="new",
        gross_total_income=gross_total_income,
        deductions=total_deductions,
        taxable_income=taxable_income,
        tax_before_cess=tax,
        cess=cess,
        total_tax=total,
        effective_rate_percent=round(effective_rate, 2),
    )


def get_applicable_deductions(profile: FinancialProfile) -> Dict[str, float]:
    """
    Return a simple mapping of section -> amount claimed for current FY.
    """
    d = profile.deductions
    return {
        "80C": d.section_80c,
        "80D": d.section_80d,
        "24B": d.section_24b,
        "80CCD(1B)": d.nps_80ccd1b,
        "OTHER": d.other_deductions,
    }



