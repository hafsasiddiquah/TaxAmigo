from typing import List, Literal

from pydantic import BaseModel, Field


ChatRole = Literal["user", "assistant"]


class ChatMessage(BaseModel):
    role: ChatRole
    content: str


class ChatRequest(BaseModel):
    history: List[ChatMessage] = Field(
        default_factory=list,
        description="Previous turns including assistant responses.",
    )
    user_input: str = Field(..., description="New user message to send to assistant.")


class ChatResponse(BaseModel):
    reply: str



