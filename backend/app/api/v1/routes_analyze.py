from fastapi import APIRouter

from app.models.financial import AnalyzeFinancialsRequest, AnalyzeFinancialsResponse
from app.models.checklist import FilingChecklistRequest, FilingChecklistResponse
from app.services.financial_analysis_service import analyze_financials
from app.services.checklist_service import generate_filing_checklist

router = APIRouter()


@router.post("/analyze_financials", response_model=AnalyzeFinancialsResponse)
async def analyze_financials_endpoint(payload: AnalyzeFinancialsRequest) -> AnalyzeFinancialsResponse:
    """
    Analyze free-form user financial description using the AI layer.
    """
    return analyze_financials(payload)


@router.post("/filing_checklist", response_model=FilingChecklistResponse)
async def filing_checklist_endpoint(
    payload: FilingChecklistRequest,
) -> FilingChecklistResponse:
    """
    Generate a step-by-step filing checklist based on the user's financial profile.
    """
    return generate_filing_checklist(payload)



