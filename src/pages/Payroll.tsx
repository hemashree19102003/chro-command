import { Layout } from "@/components/Layout";
import { AgentCard } from "@/components/AgentCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Bot, CheckCircle2 } from "lucide-react";

const payrollAgents = [
  { name: "Compliance Agent", status: "active" as const, lastRun: "34 min ago", confidence: 97, lastAction: "Flagged 2 calculation errors" },
  { name: "Salary Discrepancy Agent", status: "idle" as const, lastRun: "1 day ago", confidence: 93 },
  { name: "Tax Suggestion Agent", status: "idle" as const, lastRun: "3 days ago", confidence: 90 },
];

export default function Payroll() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payroll</h1>
          <p className="text-sm text-muted-foreground">Salary structure, compliance, and payroll processing</p>
        </div>

        <Tabs defaultValue="run">
          <TabsList>
            <TabsTrigger value="structure">Salary Structure</TabsTrigger>
            <TabsTrigger value="run">Payroll Run</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="agents">AI Agents</TabsTrigger>
          </TabsList>

          <TabsContent value="run" className="mt-4 space-y-4">
            <div className="rounded-xl border bg-card p-5 enterprise-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">February 2026 Payroll</h3>
                  <p className="text-sm text-muted-foreground">352 employees • ₹1.2 Cr estimated</p>
                </div>
                <Badge className="bg-warning/10 text-warning border-warning/20">Issues Found</Badge>
              </div>
            </div>

            <div className="rounded-xl border border-warning/30 bg-warning/5 p-5 enterprise-shadow">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-warning" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Payroll Compliance Agent detected issues</p>
                  <p className="text-xs text-muted-foreground mt-1">"Missing attendance data for 2 employees – Arjun Menon, Vikram Patel"</p>
                  <Button size="sm" className="mt-3 h-8 text-xs">Resolve Issue</Button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 enterprise-shadow">
              <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                <Bot className="h-3 w-3" /> HR Final Approval Required before payroll processing
              </p>
            </div>
          </TabsContent>

          <TabsContent value="structure" className="mt-4">
            <div className="rounded-xl border bg-card p-5 enterprise-shadow">
              <p className="text-sm text-muted-foreground">Salary structure configuration will appear here.</p>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="mt-4">
            <div className="rounded-xl border bg-card p-5 enterprise-shadow space-y-3">
              <h3 className="text-sm font-semibold">Compliance Checks</h3>
              <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-success" /> PF Contribution Validated</div>
              <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-success" /> ESI Calculation Correct</div>
              <div className="flex items-center gap-2 text-sm"><AlertTriangle className="h-4 w-4 text-warning" /> Professional Tax: 2 states pending</div>
            </div>
          </TabsContent>

          <TabsContent value="agents" className="mt-4">
            <div className="mb-3 flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Payroll AI Agents</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {payrollAgents.map((a) => (
                <AgentCard key={a.name} {...a} onTrigger={() => {}} onViewLogs={() => {}} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
