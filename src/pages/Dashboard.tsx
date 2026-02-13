import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { Users, Briefcase, AlertTriangle, Calendar, Bot, Clock } from "lucide-react";

const agentLogs = [
  { agent: "Resume Screening Agent", action: "Scored 24 candidates for Software Developer role", time: "12 min ago", module: "Recruit" },
  { agent: "Payroll Compliance Agent", action: "Flagged 2 errors in salary calculation", time: "34 min ago", module: "Payroll" },
  { agent: "Leave Policy Agent", action: "Auto-approved 3 casual leave requests", time: "1 hr ago", module: "People" },
  { agent: "Shift Optimization Agent", action: "Reduced overtime by 12% for next week", time: "2 hrs ago", module: "Shifts" },
];

export default function Dashboard() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back, CHRO Admin. Here's your overview.</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard title="Total Employees" value={352} icon={Users} trend="+3 this month" variant="primary" />
          <StatCard title="Active Hiring" value="8 Jobs" icon={Briefcase} variant="default" />
          <StatCard title="Payroll Issues" value={3} icon={AlertTriangle} variant="warning" />
          <StatCard title="Leave Pending" value={5} icon={Calendar} variant="default" />
          <StatCard title="AI Agents Running" value={4} icon={Bot} variant="success" />
        </div>

        {/* Recent Agent Activities */}
        <div className="rounded-xl border bg-card p-6 enterprise-shadow">
          <div className="mb-4 flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Recent Agent Activities</h2>
          </div>
          <div className="space-y-3">
            {agentLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border bg-background p-3">
                <div className="mt-0.5 rounded-md bg-primary/10 p-1.5">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{log.agent}</p>
                  <p className="text-xs text-muted-foreground">{log.action}</p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                    {log.module}
                  </span>
                  <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" /> {log.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-3">
          <QuickAction title="Run Payroll" desc="Process monthly payroll for all employees" />
          <QuickAction title="Review Candidates" desc="8 candidates waiting for review" />
          <QuickAction title="Approve Leaves" desc="5 pending leave requests" />
        </div>
      </div>
    </Layout>
  );
}

function QuickAction({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="cursor-pointer rounded-xl border bg-card p-4 transition-all hover:enterprise-shadow-md hover:border-primary/30">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}
