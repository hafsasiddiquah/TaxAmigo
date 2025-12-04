import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/wizard", label: "Financial Wizard" },
  { to: "/summary", label: "Tax Summary" },
  { to: "/deductions", label: "Deductions" },
  { to: "/form-preview", label: "Form Preview" },
  { to: "/chat", label: "Chat Assistant" }
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/80 backdrop-blur-lg p-4 flex flex-col">
      <div className="mb-6">
        <div className="text-lg font-semibold">Tax Amigo</div>
      </div>
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "flex items-center rounded-xl px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-slate-800 text-slate-50"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-50"
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-4 text-xs text-slate-500">
        FY 2024–25 · India · Educational use only
      </div>
    </aside>
  );
}


