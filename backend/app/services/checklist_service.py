from app.core.ai_client import generate_simple_explanation
from app.models.checklist import FilingChecklistRequest, FilingChecklistResponse


def generate_filing_checklist(payload: FilingChecklistRequest) -> FilingChecklistResponse:
    """
    Build a human-readable filing checklist for the given profile,
    powered by the same generate_simple_explanation AI helper.
    """
    profile = payload.profile
    base_text = (
        "Create a clear, step-by-step income tax filing checklist for India FY 2024-25. "
        "Assume this is for an individual taxpayer (no business entity). "
        "Use short bullet points and simple language. Mention documents, key forms, "
        "and important decision points (like choosing regime), but do not give legal advice.\n\n"
        f"Profile JSON:\n{profile.model_dump_json(indent=2)}"
    )
    checklist = generate_simple_explanation(base_text)
    return FilingChecklistResponse(checklist_text=checklist)



