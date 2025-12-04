import { useState } from "react";
import axios from "axios";
import { Card } from "../components/layout/Card";
import { Input } from "../components/ui/Input";

type RegimeSummary = {
  regime: "old" | "new";
  gross_total_income: number;
  deductions: number;
  taxable_income: number;
  tax_before_cess: number;
  cess: number;
  total_tax: number;
  effective_rate_percent: number;
};

export function TaxSummary() {
  const [payloadJson, setPayloadJson] = useState(
    JSON.stringify(
      {
        profile: {
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
          regime_preference: null
        },
        regime: null
      },
      null,
      2
    )
  );
  const [oldRegime, setOldRegime] = useState<RegimeSummary | null>(null);
  const [newRegime, setNewRegime] = useState<RegimeSummary | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function runCalculation() {
    setLoading(true);
    setError(null);
    try {
      const parsed = JSON.parse(payloadJson);
      const res = await axios.post("/api/v1/calculate_tax", parsed);
      setOldRegime(res.data.old_regime ?? null);
      setNewRegime(res.data.new_regime ?? null);
      setNote(res.data.note ?? null);
      setWarnings(res.data.warnings ?? []);
    } catch (e) {
      setError(
        "Could not run calculation. Check the JSON payload format and that the backend is running."
      );
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Tax Summary (Old vs New Regime)</h1>
      <Card title="1 · Request payload">
        <p className="text-xs text-slate-400 mb-2">
          This JSON is sent directly to the FastAPI{" "}
          <code className="font-mono text-emerald-400">/calculate_tax</code>{" "}
          endpoint. Adjust values to mirror your wizard inputs or custom scenarios.
        </p>
        <textarea
          className="input font-mono text-xs h-52"
          value={payloadJson}
          onChange={(e) => setPayloadJson(e.target.value)}
        />
        <button
          className="mt-3 btn-primary"
          onClick={runCalculation}
          disabled={loading}
        >
          {loading ? "Calculating…" : "Calculate tax"}
        </button>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {oldRegime && (
          <Card title="Old Regime">
            <RegimeView data={oldRegime} />
          </Card>
        )}
        {newRegime && (
          <Card title="New Regime">
            <RegimeView data={newRegime} />
          </Card>
        )}
      </div>
      {(note || warnings.length > 0) && (
        <Card>
          {note && <p className="text-xs text-slate-400 mb-2">{note}</p>}
          {warnings.length > 0 && (
            <ul className="space-y-1 text-xs text-amber-300">
              {warnings.map((w, idx) => (
                <li key={idx}>• {w}</li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}

function RegimeView({ data }: { data: RegimeSummary }) {
  return (
    <dl className="grid grid-cols-2 gap-2 text-sm">
      <Stat label="Gross total income" value={data.gross_total_income} />
      <Stat label="Deductions" value={data.deductions} />
      <Stat label="Taxable income" value={data.taxable_income} />
      <Stat label="Tax before cess" value={data.tax_before_cess} />
      <Stat label="Cess" value={data.cess} />
      <Stat label="Total tax" value={data.total_tax} highlight />
      <Stat
        label="Effective rate"
        value={`${data.effective_rate_percent.toFixed(2)} %`}
      />
    </dl>
  );
}

function Stat(props: { label: string; value: number | string; highlight?: boolean }) {
  const { label, value, highlight } = props;
  return (
    <div className="space-y-0.5">
      <dt className="text-[11px] uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd
        className={
          highlight ? "text-base font-semibold text-emerald-400" : "text-sm"
        }
      >
        {typeof value === "number" ? `₹${value.toLocaleString("en-IN")}` : value}
      </dd>
    </div>
  );
}


