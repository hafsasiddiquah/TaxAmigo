import { Route, Routes, Navigate } from "react-router-dom";
import { Sidebar } from "./components/layout/Sidebar";
import { HomeDashboard } from "./pages/HomeDashboard";
import { FinancialWizard } from "./pages/FinancialWizard";
import { TaxSummary } from "./pages/TaxSummary";
import { DeductionSuggestions } from "./pages/DeductionSuggestions";
import { FormPreview } from "./pages/FormPreview";
import { ChatAssistant } from "./pages/ChatAssistant";

function App() {
  return (
    <div className="min-h-screen bg-bg-dark text-slate-50 flex">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <Routes>
          <Route path="/" element={<HomeDashboard />} />
          <Route path="/wizard" element={<FinancialWizard />} />
          <Route path="/summary" element={<TaxSummary />} />
          <Route path="/deductions" element={<DeductionSuggestions />} />
          <Route path="/form-preview" element={<FormPreview />} />
          <Route path="/chat" element={<ChatAssistant />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;


