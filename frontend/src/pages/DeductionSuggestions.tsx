import { useState } from "react";
import axios from "axios";
import { Card } from "../components/layout/Card";

type Suggestion = {
  section: string;
  label: string;
  potential_amount: number;
  description: string;
};

export function DeductionSuggestions() {
  const [profileJson, setProfileJson] = useState(
    JSON.stringify(
      {
        fy: "2024-25",
        age: 30,
        resident_status: "resident",
        income: {
          salary: 1200000,
          business: 0,
          interest: 20000,
          rental: 0,
          capital_gains: 0,
          other: 0
        },
        deductions: {
          section_80c: 80000,
          section_80d: 10000,
          section_24b: 100000,
          nps_80ccd1b: 0,
          other_deductions: 0
        },
        regime_preference: "old"
      },
      null,
      2
    )
  );
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchSuggestions() {
    setLoading(true);
    setError(null);
    try {
      const profile = JSON.parse(profileJson);
      const res = await axios.post("/api/v1/suggest_deductions", {
        profile
      });
      setSuggestions(res.data.suggestions ?? []);
      setNote(res.data.note ?? null);
    } catch (e) {
      console.error(e);
      setError(
        "Could not fetch suggestions. Check profile JSON and backend connectivity."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Deduction Suggestions</h1>
      <Card title="1 · Profile JSON">
        <p className="text-xs text-slate-400 mb-2">
          Paste or tweak your financial profile JSON. The backend applies simple
          rules and then asks the local AI to generate a plain‑language note.
        </p>
        <textarea
          className="input font-mono text-xs h-52"
          value={profileJson}
          onChange={(e) => setProfileJson(e.target.value)}
        />
        <button
          className="mt-3 btn-primary"
          onClick={fetchSuggestions}
          disabled={loading}
        >
          {loading ? "Fetching suggestions…" : "Suggest deductions"}
        </button>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </Card>

      <Card title="2 · Suggestions">
        {suggestions.length === 0 ? (
          <p className="text-sm text-slate-400">
            No suggestions yet. Run the request above to see potential deductions.
          </p>
        ) : (
          <ul className="space-y-3 text-sm">
            {suggestions.map((s, idx) => (
              <li key={idx} className="border border-slate-800 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">
                    {s.label}{" "}
                    <span className="text-xs text-emerald-400">
                      ({s.section})
                    </span>
                  </div>
                  <div className="text-sm text-emerald-400">
                    Potential: ₹{s.potential_amount.toLocaleString("en-IN")}
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-300">{s.description}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {note && (
        <Card title="AI Explanation">
          <p className="text-sm text-slate-200 whitespace-pre-wrap">{note}</p>
        </Card>
      )}
    </div>
  );
}


