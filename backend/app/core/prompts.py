"""
Prompt templates for interacting with local Ollama models.

These templates are intentionally simple and transparent so you can
update them easily for future tax years or jurisdictions.
"""

from typing import List, Dict, Any


def build_simple_explanation_prompt(text: str) -> str:
    return (
        "You are a helpful tax assistant for Indian taxpayers (FY 2024-25).\n"
        "Explain the following tax concept or output in very simple terms that a beginner can understand.\n"
        "Avoid legal jargon, and keep the explanation under 200 words.\n\n"
        f"TEXT:\n{text}\n"
    )


def build_classification_prompt(raw_input: str) -> str:
    return (
        "You are helping to classify user-provided financial information for Indian income tax filing (FY 2024-25).\n"
        "Read the user's message and output a concise JSON object with the following optional fields ONLY:\n"
        '  - "income_sources": array of strings\n'
        '  - "deductions": array of strings\n'
        '  - "capital_gains": array of strings\n'
        '  - "notes": string (free-form helpful note to the system)\n'
        "If you are unsure about anything, add a clarifying note in the 'notes' field.\n"
        "Do not include any text before or after the JSON.\n\n"
        f"USER_INPUT:\n{raw_input}\n"
    )


def build_chat_prompt(history: List[Dict[str, Any]], user_input: str) -> str:
    """
    Convert structured chat history into a single prompt string for models
    that don't support native chat APIs.
    """
    messages = [
        "You are an AI-powered personalized tax filing assistant for Indian taxpayers (FY 2024-25).",
        "You MUST NOT give legal or financial advice; instead, you explain options, rules, and examples in simple language.",
        "You only use Indian tax rules for FY 2024-25 and you explicitly say so when relevant.",
        "You can ask follow-up questions to clarify missing information.",
        "",
        "Conversation so far:",
    ]

    for turn in history:
        role = turn.get("role", "user")
        content = turn.get("content", "")
        if role == "user":
            messages.append(f"User: {content}")
        else:
            messages.append(f"Assistant: {content}")

    messages.append("")
    messages.append(f"User: {user_input}")
    messages.append("Assistant:")

    return "\n".join(messages)



