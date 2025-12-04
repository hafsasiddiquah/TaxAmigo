from fastapi import APIRouter

from app.models.financial import FinancialProfile
from app.services.form_service import autofill_form_fields

router = APIRouter()


@router.post("/fill_form")
async def fill_form_endpoint(profile: FinancialProfile) -> dict:
    """
    Return a JSON structure representing an auto-filled tax form
    based on the user's financial profile.
    """
    return {"fields": autofill_form_fields(profile)}



