import { Layout } from "@/components/Layout";
import { AgentCard } from "@/components/AgentCard";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, CheckCircle2 } from "lucide-react";

const employees = [
  { name: "Ananya Desai", dept: "Engineering", role: "Frontend Developer", status: "Active" },
  { name: "Vikram Patel", dept: "Product", role: "Product Manager", status: "Active" },
  { name: "Sneha Iyer", dept: "HR", role: "HR Executive", status: "Active" },
  { name: "Arjun Menon", dept: "Engineering", role: "Backend Developer", status: "On Leave" },
  { name: "Pooja Reddy", dept: "Finance", role: "Accountant", status: "Active" },
];

const peopleAgents = [
  { name: "Leave Policy Agent", status: "active" as const, lastRun: "1 hr ago", confidence: 96, lastAction: "Auto-approved 3 leaves" },
  { name: "Attendance Anomaly Agent", status: "active" as const, lastRun: "30 min ago", confidence: 91 },
  { name: "Performance Review Assistant", status: "idle" as const, lastRun: "2 days ago", confidence: 89 },
  { name: "Exit Risk Predictor", status: "idle" as const, lastRun: "1 day ago", confidence: 84 },
];

export default function People() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">People</h1>
          <p className="text-sm text-muted-foreground">Core HR — Employee directory, attendance, leave, and performance</p>
        </div>

        <Tabs defaultValue="directory">
          <TabsList>
            <TabsTrigger value="directory">Employee Directory</TabsTrigger>
            <TabsTrigger value="leave">Leave</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="agents">AI Agents</TabsTrigger>
          </TabsList>

          <TabsContent value="directory" className="mt-4">
            <div className="rounded-xl border bg-card enterprise-shadow">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="p-4 font-medium">Employee</th>
                    <th className="p-4 font-medium">Department</th>
                    <th className="p-4 font-medium">Role</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((e, i) => (
                    <tr key={i} className="border-b hover:bg-muted/30">
                      <td className="p-4 text-sm font-medium">{e.name}</td>
                      <td className="p-4 text-sm text-muted-foreground">{e.dept}</td>
                      <td className="p-4 text-sm text-muted-foreground">{e.role}</td>
                      <td className="p-4">
                        <Badge variant={e.status === "Active" ? "default" : "secondary"}>{e.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="leave" className="mt-4 space-y-4">
            <div className="rounded-xl border bg-card p-5 enterprise-shadow">
              <h3 className="text-sm font-semibold text-foreground mb-3">Pending Leave Application</h3>
              <div className="rounded-lg border bg-background p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">Ananya Desai</p>
                    <p className="text-xs text-muted-foreground">3 Days – Casual Leave – Feb 17–19, 2026</p>
                  </div>
                  <Badge className="bg-success/10 text-success border-success/20">Auto-Approved</Badge>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-accent p-3">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <div>
                    <p className="text-xs font-medium text-accent-foreground">Leave Policy Agent: Approved</p>
                    <p className="text-[10px] text-muted-foreground">Reason: Casual leave balance sufficient (8 remaining)</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic flex items-center gap-1">
              <Bot className="h-3 w-3" /> HR Final Approval Required for all agent-recommended decisions
            </p>
          </TabsContent>

          <TabsContent value="attendance" className="mt-4">
            <div className="rounded-xl border bg-card p-5 enterprise-shadow">
              <p className="text-sm text-muted-foreground">Attendance tracking overview will appear here.</p>
            </div>
          </TabsContent>

          <TabsContent value="agents" className="mt-4">
            <div className="mb-3 flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">People AI Agents</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {peopleAgents.map((a) => (
                <AgentCard key={a.name} {...a} onTrigger={() => {}} onViewLogs={() => {}} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
