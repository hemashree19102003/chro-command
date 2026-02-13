import { Layout } from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Briefcase, Wallet, Receipt,
  FileSignature, Clock, HardHat, BarChart3, Settings
} from "lucide-react";
import { motion } from "framer-motion";

const hrApps = [
  { title: "Dashboard", desc: "Overview & key metrics", path: "/dashboard", icon: LayoutDashboard, color: "bg-primary/10 text-primary" },
  { title: "Recruit", desc: "Hiring & talent pipeline", path: "/recruit", icon: Briefcase, color: "bg-info/10 text-info" },
  { title: "People", desc: "Employee directory & HR", path: "/people", icon: Users, color: "bg-success/10 text-success" },
  { title: "Payroll", desc: "Salary & compliance", path: "/payroll", icon: Wallet, color: "bg-warning/10 text-warning" },
  { title: "Expense", desc: "Claims & reimbursements", path: "/expense", icon: Receipt, color: "bg-destructive/10 text-destructive" },
  { title: "Sign", desc: "Digital document signing", path: "/sign", icon: FileSignature, color: "bg-primary/10 text-primary" },
  { title: "Shifts", desc: "Scheduling & optimization", path: "/shifts", icon: Clock, color: "bg-info/10 text-info" },
  { title: "Workerly", desc: "Temporary staff management", path: "/workerly", icon: HardHat, color: "bg-success/10 text-success" },
  { title: "Analytics", desc: "AI insights & reports", path: "/analytics", icon: BarChart3, color: "bg-warning/10 text-warning" },
  { title: "Settings", desc: "Platform configuration", path: "/settings", icon: Settings, color: "bg-muted text-muted-foreground" },
];

export default function HRApps() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">HR Modules</h1>
          <p className="text-sm text-muted-foreground">Select an app to get started</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {hrApps.map((app, i) => (
            <motion.div
              key={app.path}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              onClick={() => navigate(app.path)}
              className="group cursor-pointer rounded-xl border bg-card p-5 enterprise-shadow hover:enterprise-shadow-md hover:border-primary/30 transition-all flex flex-col items-center text-center gap-3"
            >
              <div className={`rounded-xl p-3.5 ${app.color} transition-transform group-hover:scale-110`}>
                <app.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{app.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight">{app.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
