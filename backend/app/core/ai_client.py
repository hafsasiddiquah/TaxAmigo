"""
Thin wrapper around local Ollama models.

This module ensures we only ever talk to local, free models via the
`ollama` Python package (preferred) or subprocess fallback.
"""

from __future__ import annotations

import json
import subprocess
from typing import Any, Dict, List

from app.core.config import get_settings
from app.core.prompts import (
    build_simple_explanation_prompt,
    build_classification_prompt,
    build_chat_prompt,
)

try:
    import ollama  # type: ignore

    HAS_OLLAMA_PY = True
except Exception:  # pragma: no cover - fallback path
    HAS_OLLAMA_PY = False


def _ollama_generate(prompt: str) -> str:
    """
    Internal helper that calls a local Ollama model and returns the raw text.
    Prefers the Python package if installed; otherwise uses subprocess.
    """
    model = get_settings().ollama_model

    if HAS_OLLAMA_PY:
        response = ollama.generate(model=model, prompt=prompt)
        return response.get("response", "")

    # Subprocess fallback: `ollama run <model>`
    result = subprocess.run(
        ["ollama", "run", model],
        input=prompt.encode("utf-8"),
        capture_output=True,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(
            f"Ollama process failed with code {result.returncode}: {result.stderr.decode('utf-8', errors='ignore')}"
        )
    return result.stdout.decode("utf-8", errors="ignore")


def generate_simple_explanation(text: str) -> str:
    """
    Use the local model to explain complex tax terms or outputs in simple language.
    """
    prompt = build_simple_explanation_prompt(text)
    return _ollama_generate(prompt).strip()


def classify_financial_info(raw_input: str) -> Dict[str, Any]:
    """
    Ask the model to classify user financial information into structured JSON.
    """
    prompt = build_classification_prompt(raw_input)
    output = _ollama_generate(prompt).strip()

    # Defensive parsing
    try:
        data = json.loads(output)
        if isinstance(data, dict):
            return data
    except json.JSONDecodeError:
        # Fallback: wrap as a note
        return {"notes": f"Model returned non-JSON classification: {output}"}

    return {"notes": f"Unexpected classification output: {output}"}


def chat_with_assistant(history: List[Dict[str, Any]], user_input: str) -> str:
    """
    Simple chat helper that uses our prompt-templating to generate responses.
    History format:
        [{"role": "user" | "assistant", "content": "..."}, ...]
    """
    prompt = build_chat_prompt(history, user_input)
    return _ollama_generate(prompt).strip()



