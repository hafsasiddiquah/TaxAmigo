import { useState } from "react";
import axios from "axios";
import { Card } from "../components/layout/Card";

export function FormPreview() {
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
          section_80c: 100000,
          section_80d: 30000,
          section_24b: 180000,
          nps_80ccd1b: 0,
          other_deductions: 0
        },
        regime_preference: "old"
      },
      null,
      2
    )
  );
  const [fields, setFields] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchPreview() {
    setLoading(true);
    setError(null);
    try {
      const profile = JSON.parse(profileJson);
      const res = await axios.post("/api/v1/fill_form", profile);
      setFields(res.data.fields ?? null);
    } catch (e) {
      console.error(e);
      setError(
        "Could not fetch form preview. Check profile JSON and backend connectivity."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Auto-Filled Form Preview</h1>
      <Card title="1 · Profile JSON">
        <p className="text-xs text-slate-400 mb-2">
          This profile will be mapped into representative form fields, similar to
          an ITR. You can adapt the mapping in the backend&apos;s{" "}
          <code className="font-mono text-emerald-400">form_service</code>.
        </p>
        <textarea
          className="input font-mono text-xs h-52"
          value={profileJson}
          onChange={(e) => setProfileJson(e.target.value)}
        />
        <button
          className="mt-3 btn-primary"
          onClick={fetchPreview}
          disabled={loading}
        >
          {loading ? "Generating preview…" : "Generate preview"}
        </button>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </Card>

      <Card title="2 · Form fields">
        {fields ? (
          <pre className="text-xs font-mono bg-slate-900/70 border border-slate-800 rounded-xl p-3 overflow-x-auto">
{JSON.stringify(fields, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-slate-400">
            Run the preview above to see how your financial profile maps into form
            fields.
          </p>
        )}
      </Card>
    </div>
  );
}


