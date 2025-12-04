from fastapi import APIRouter

from app.models.tax import DeductionSuggestionRequest, DeductionSuggestionResponse
from app.services.deduction_service import suggest_deductions

router = APIRouter()


@router.post("/suggest_deductions", response_model=DeductionSuggestionResponse)
async def suggest_deductions_endpoint(
    payload: DeductionSuggestionRequest,
) -> DeductionSuggestionResponse:
    """
    Suggest possible deductions based on the user's financial profile.
    """
    return suggest_deductions(payload)



