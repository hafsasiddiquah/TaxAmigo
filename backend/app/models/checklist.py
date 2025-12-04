from pydantic import BaseModel

from app.models.financial import FinancialProfile


class FilingChecklistRequest(BaseModel):
  profile: FinancialProfile


class FilingChecklistResponse(BaseModel):
  checklist_text: str



