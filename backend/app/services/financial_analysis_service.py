from app.core.ai_client import classify_financial_info, generate_simple_explanation
from app.models.financial import AnalyzeFinancialsRequest, AnalyzeFinancialsResponse


def analyze_financials(payload: AnalyzeFinancialsRequest) -> AnalyzeFinancialsResponse:
    """
    Use the AI layer to turn free-form text into structured hints
    about income sources, deductions, etc.
    """
    structured = classify_financial_info(payload.raw_text)
    explanation = generate_simple_explanation(
        "Here is how we interpreted your financial information: " + str(structured)
    )
    return AnalyzeFinancialsResponse(
        structured_financial_info=structured,
        explanation=explanation,
    )



