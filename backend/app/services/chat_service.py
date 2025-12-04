from app.core.ai_client import chat_with_assistant
from app.models.chat import ChatRequest, ChatResponse


def handle_chat(payload: ChatRequest) -> ChatResponse:
    reply = chat_with_assistant(
        history=[m.model_dump() for m in payload.history],
        user_input=payload.user_input,
    )
    return ChatResponse(reply=reply)



