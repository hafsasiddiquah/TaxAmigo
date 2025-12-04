import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "../components/layout/Card";
import { Stepper } from "../components/ui/Stepper";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";

const steps = ["Profile", "Income", "Deductions", "Review"];

export function FinancialWizard() {
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [taxSummary, setTaxSummary] = useState<{
    old_regime: any | null;
    new_regime: any | null;
    warnings: string[];
  } | null>(null);
  const [checklist, setChecklist] = useState<string | null>(null);

  const storageKey = "tax-assistant-wizard-state-v1";

  const [fy, setFy] = useState("2024-25");
  const [age, setAge] = useState(30);
  const [residentStatus, setResidentStatus] = useState("resident");
  const [regimePref, setRegimePref] = useState<string | null>(null);

  const [salary, setSalary] = useState(1200000);
  const [business, setBusiness] = useState(0);
  const [interest, setInterest] = useState(20000);
  const [rental, setRental] = useState(0);
  const [capitalGains, setCapitalGains] = useState(0);
  const [otherIncome, setOtherIncome] = useState(0);

  const [d80c, setD80c] = useState(100000);
  const [d80d, setD80d] = useState(30000);
  const [d24b, setD24b] = useState(180000);
  const [nps, setNps] = useState(0);
  const [otherDed, setOtherDed] = useState(0);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const s = JSON.parse(raw);
      setFy(s.fy ?? "2024-25");
      setAge(s.age ?? 30);
      setResidentStatus(s.residentStatus ?? "resident");
      setRegimePref(s.regimePref ?? null);
      setSalary(s.salary ?? 1200000);
      setBusiness(s.business ?? 0);
      setInterest(s.interest ?? 0);
      setRental(s.rental ?? 0);
      setCapitalGains(s.capitalGains ?? 0);
      setOtherIncome(s.otherIncome ?? 0);
      setD80c(s.d80c ?? 0);
      setD80d(s.d80d ?? 0);
      setD24b(s.d24b ?? 0);
      setNps(s.nps ?? 0);
      setOtherDed(s.otherDed ?? 0);
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist to localStorage whenever core fields change
  useEffect(() => {
    if (typeof window === "undefined") return;
    const state = {
      fy,
      age,
      residentStatus,
      regimePref,
      salary,
      business,
      interest,
      rental,
      capitalGains,
      otherIncome,
      d80c,
      d80d,
      d24b,
      nps,
      otherDed
    };
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [
    fy,
    age,
    residentStatus,
    regimePref,
    salary,
    business,
    interest,
    rental,
    capitalGains,
    otherIncome,
    d80c,
    d80d,
    d24b,
    nps,
    otherDed
  ]);

  const profilePayload = {
    fy,
    age,
    resident_status: residentStatus,
    regime_preference: regimePref,
    income: {
      salary,
      business,
      interest,
      rental,
      capital_gains: capitalGains,
      other: otherIncome
    },
    deductions: {
      section_80c: d80c,
      section_80d: d80d,
      section_24b: d24b,
      nps_80ccd1b: nps,
      other_deductions: otherDed
    }
  };

  async function runAnalysis() {
    setLoading(true);
    setChecklist(null);
    try {
      const rawText = `I am ${age} years old, ${residentStatus}, with salary income of ₹${salary}, business income ₹${business}, interest ₹${interest}, rental ₹${rental}, capital gains ₹${capitalGains}, other income ₹${otherIncome}. I invest ₹${d80c} under 80C, pay ₹${d80d} under 80D, home loan interest ₹${d24b}, NPS ₹${nps}, and other deductions ₹${otherDed}.`;
      const res = await axios.post("/api/v1/analyze_financials", {
        raw_text: rawText
      });
      setAnalysis(res.data.explanation);
    } catch {
      setAnalysis(
        "Could not reach backend for AI analysis. Check FastAPI/Ollama are running."
      );
    } finally {
      setLoading(false);
    }
  }

  async function computeTaxNow() {
    setLoading(true);
    try {
      const res = await axios.post("/api/v1/calculate_tax", {
        profile: profilePayload,
        regime: null
      });
      setTaxSummary({
        old_regime: res.data.old_regime ?? null,
        new_regime: res.data.new_regime ?? null,
        warnings: res.data.warnings ?? []
      });
    } catch {
      setTaxSummary({
        old_regime: null,
        new_regime: null,
        warnings: [
          "Could not reach backend for tax computation. Check FastAPI/Ollama are running."
        ]
      });
    } finally {
      setLoading(false);
    }
  }

  async function generateChecklist() {
    setLoading(true);
    try {
      const res = await axios.post("/api/v1/filing_checklist", {
        profile: profilePayload
      });
      setChecklist(res.data.checklist_text);
    } catch {
      setChecklist(
        "Could not contact backend for checklist generation. Please verify FastAPI/Ollama are running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Financial Input Wizard</h1>
        <Stepper steps={steps} activeIndex={active} />
      </div>
      <Card>
        {active === 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Financial Year"
              value={fy}
              onChange={(e) => setFy(e.target.value)}
            />
            <Input
              label="Age"
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
            />
            <Select
              label="Resident status"
              value={residentStatus}
              onChange={(e) => setResidentStatus(e.target.value)}
            >
              <option value="resident">Resident</option>
              <option value="non-resident">Non-resident</option>
              <option value="resident-but-not-ordinary">
                Resident but not ordinarily resident
              </option>
            </Select>
            <Select
              label="Preferred regime"
              value={regimePref ?? ""}
              onChange={(e) =>
                setRegimePref(e.target.value || null)
              }
            >
              <option value="">Let system compare</option>
              <option value="old">Old regime</option>
              <option value="new">New regime</option>
            </Select>
          </div>
        )}

        {active === 1 && (
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Salary income (₹)"
              type="number"
              value={salary}
              onChange={(e) => setSalary(Number(e.target.value))}
            />
            <Input
              label="Business / professional (₹)"
              type="number"
              value={business}
              onChange={(e) => setBusiness(Number(e.target.value))}
            />
            <Input
              label="Interest income (₹)"
              type="number"
              value={interest}
              onChange={(e) => setInterest(Number(e.target.value))}
            />
            <Input
              label="Rental income (₹)"
              type="number"
              value={rental}
              onChange={(e) => setRental(Number(e.target.value))}
            />
            <Input
              label="Capital gains (₹)"
              type="number"
              value={capitalGains}
              onChange={(e) => setCapitalGains(Number(e.target.value))}
            />
            <Input
              label="Other income (₹)"
              type="number"
              value={otherIncome}
              onChange={(e) => setOtherIncome(Number(e.target.value))}
            />
          </div>
        )}

        {active === 2 && (
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="80C investments (₹)"
              type="number"
              value={d80c}
              onChange={(e) => setD80c(Number(e.target.value))}
            />
            <Input
              label="80D medical insurance (₹)"
              type="number"
              value={d80d}
              onChange={(e) => setD80d(Number(e.target.value))}
            />
            <Input
              label="24(b) home loan interest (₹)"
              type="number"
              value={d24b}
              onChange={(e) => setD24b(Number(e.target.value))}
            />
            <Input
              label="80CCD(1B) NPS (₹)"
              type="number"
              value={nps}
              onChange={(e) => setNps(Number(e.target.value))}
            />
            <Input
              label="Other deductions (₹)"
              type="number"
              value={otherDed}
              onChange={(e) => setOtherDed(Number(e.target.value))}
            />
          </div>
        )}

        {active === 3 && (
          <div className="space-y-3 text-sm text-slate-200">
            <p className="text-slate-300">
              Review your snapshot. You can now run an{" "}
              <span className="font-semibold">AI interpretation</span> of your
              profile or{" "}
              <span className="font-semibold">compute tax inline</span> using
              the same payload the backend receives.
            </p>
            <pre className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 text-xs overflow-x-auto">
{JSON.stringify(profilePayload, null, 2)}
            </pre>
            <div className="flex flex-wrap gap-2">
              <button
                className="btn-primary"
                onClick={runAnalysis}
                disabled={loading}
              >
                {loading ? "Analyzing via local AI…" : "Run AI interpretation"}
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={computeTaxNow}
                disabled={loading}
              >
                {loading ? "Computing tax…" : "Compute tax now"}
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={generateChecklist}
                disabled={loading}
              >
                {loading ? "Generating checklist…" : "Filing checklist"}
              </button>
            </div>
            {analysis && (
              <p className="mt-2 text-sm text-slate-200 whitespace-pre-wrap">
                {analysis}
              </p>
            )}
            {taxSummary && (
              <div className="mt-3 grid gap-3 md:grid-cols-2 text-xs">
                {taxSummary.old_regime && (
                  <div className="border border-slate-800 rounded-xl p-3">
                    <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">
                      Old regime
                    </div>
                    <div className="text-sm font-semibold text-emerald-400">
                      Total tax: ₹
                      {taxSummary.old_regime.total_tax.toLocaleString("en-IN")}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400">
                      Effective rate:{" "}
                      {taxSummary.old_regime.effective_rate_percent.toFixed(2)}%
                    </div>
                  </div>
                )}
                {taxSummary.new_regime && (
                  <div className="border border-slate-800 rounded-xl p-3">
                    <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">
                      New regime
                    </div>
                    <div className="text-sm font-semibold text-emerald-400">
                      Total tax: ₹
                      {taxSummary.new_regime.total_tax.toLocaleString("en-IN")}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400">
                      Effective rate:{" "}
                      {taxSummary.new_regime.effective_rate_percent.toFixed(2)}%
                    </div>
                  </div>
                )}
                {taxSummary.warnings.length > 0 && (
                  <div className="md:col-span-2 text-[11px] text-amber-300 space-y-1">
                    {taxSummary.warnings.map((w, idx) => (
                      <div key={idx}>• {w}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {checklist && (
              <div className="mt-3 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 whitespace-pre-wrap">
                <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">
                  Filing checklist (AI‑generated)
                </div>
                {checklist}
              </div>
            )}
          </div>
        )}
      </Card>

      <div className="flex justify-between">
        <button
          className="text-xs text-slate-400 hover:text-slate-100"
          disabled={active === 0}
          onClick={() => setActive((i) => Math.max(0, i - 1))}
        >
          ← Back
        </button>
        <button
          className="btn-primary"
          disabled={active === steps.length - 1}
          onClick={() =>
            setActive((i) => Math.min(steps.length - 1, i + 1))
          }
        >
          Next →
        </button>
      </div>
    </div>
  );
}


