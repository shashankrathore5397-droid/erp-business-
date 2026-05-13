import {
  Building2,
  CreditCard,
  LayoutDashboard,
  Package,
  ReceiptText,
  Settings,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Package },
  { to: "/employees", label: "Employees", icon: Users },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/invoices", label: "Invoices", icon: ReceiptText },
  { to: "/billing", label: "Billing", icon: CreditCard },
  { to: "/company", label: "Company", icon: Building2 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-full border-b border-white/20 bg-slate-950/90 px-6 py-6 text-white shadow-soft backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r lg:border-white/10">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ocean-500 text-lg font-bold">
          E
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
            ERP SaaS
          </p>
          <p className="text-lg font-semibold">Tenant workspace</p>
        </div>
      </div>

      <nav className="mt-8 grid gap-2" aria-label="Primary">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  isActive ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10"
                }`
              }
            >
              <Icon size={18} aria-hidden="true" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
        <p className="font-semibold text-white">Monthly goal</p>
        <p className="mt-1">$42k in invoiced revenue</p>
        <div className="mt-3 h-2 w-full rounded-full bg-white/10">
          <div className="h-full w-2/3 rounded-full bg-ocean-500" />
        </div>
      </div>
    </aside>
  );
}
