import { Card } from "../components/layout/Card";
import { useNavigate } from "react-router-dom";

export function HomeDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Personalized Tax Filing Assistant</h1>
      <p className="text-sm text-slate-400 max-w-2xl">
        This workspace helps you estimate income tax for FY 2024–25 (India), explore
        deductions, auto-fill key form fields, and chat with a local AI assistant.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <button
          type="button"
          onClick={() => navigate("/wizard")}
          className="text-left"
        >
          <Card title="1 · Capture finances">
          <p className="text-sm text-slate-300">
            Start with the multi-step{" "}
            <span className="font-semibold">Financial Input Wizard</span> to enter
            your income, deductions and preferences.
          </p>
          </Card>
        </button>
        <button
          type="button"
          onClick={() => navigate("/summary")}
          className="text-left"
        >
          <Card title="2 · Review tax summary">
          <p className="text-sm text-slate-300">
            Compare old vs new regime estimates, see effective tax rates and how
            deductions impact your liability.
          </p>
          </Card>
        </button>
        <button
          type="button"
          onClick={() => navigate("/chat")}
          className="text-left"
        >
          <Card title="3 · Ask the AI anything">
          <p className="text-sm text-slate-300">
            Use the <span className="font-semibold">Chat Assistant</span> for
            step‑by‑step explanations. It uses only local models through Ollama.
          </p>
          </Card>
        </button>
      </div>
    </div>
  );
}


