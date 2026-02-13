import { Layout } from "@/components/Layout";
import { AgentCard } from "@/components/AgentCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Eye, MapPin, Briefcase, User } from "lucide-react";
import { useState } from "react";

const pipelineStages = ["Applied", "Screening", "AI Interview", "HR Round", "Offer", "Hired"];
const pipelineCounts = [12, 8, 3, 2, 1, 0];

const recruitAgents = [
  { name: "JD Generator Agent", status: "active" as const, lastRun: "10 min ago", confidence: 95 },
  { name: "JD Compliance Guardrail Agent", status: "active" as const, lastRun: "10 min ago", confidence: 98 },
  { name: "Resume Screening Agent", status: "active" as const, lastRun: "12 min ago", confidence: 92 },
  { name: "AI Interview Agent", status: "idle" as const, lastRun: "2 hrs ago", confidence: 88 },
  { name: "Offer Draft Agent", status: "idle" as const, lastRun: "1 day ago", confidence: 90 },
];

export default function Recruit() {
  const [selectedCandidate, setSelectedCandidate] = useState(true);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Recruit</h1>
            <p className="text-sm text-muted-foreground">Manage hiring pipeline with AI-powered recruitment</p>
          </div>
          <Button>+ Post New Job</Button>
        </div>

        <Tabs defaultValue="pipeline">
          <TabsList>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="agents">AI Agents</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="mt-4">
            <div className="rounded-xl border bg-card p-5 enterprise-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Software Developer</h3>
                  <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Chennai</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> 2–4 years</span>
                    <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> 26 Applicants</span>
                  </div>
                </div>
                <Badge className="bg-success text-success-foreground">Active</Badge>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="candidates" className="mt-4">
            <div className="rounded-xl border bg-card enterprise-shadow">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="p-4 font-medium">Candidate</th>
                    <th className="p-4 font-medium">Experience</th>
                    <th className="p-4 font-medium">Stage</th>
                    <th className="p-4 font-medium">AI Score</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-4 text-sm font-medium">Rahul Sharma</td>
                    <td className="p-4 text-sm text-muted-foreground">3 years</td>
                    <td className="p-4"><Badge variant="secondary">AI Interview</Badge></td>
                    <td className="p-4 text-sm font-semibold text-primary">88%</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          <Eye className="mr-1 h-3 w-3" /> Resume
                        </Button>
                        <Button size="sm" className="h-7 text-xs">
                          <Bot className="mr-1 h-3 w-3" /> AI Interview
                        </Button>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-4 text-sm font-medium">Priya Nair</td>
                    <td className="p-4 text-sm text-muted-foreground">4 years</td>
                    <td className="p-4"><Badge variant="secondary">Screening</Badge></td>
                    <td className="p-4 text-sm font-semibold text-primary">92%</td>
                    <td className="p-4">
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        <Eye className="mr-1 h-3 w-3" /> Resume
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="pipeline" className="mt-4">
            <div className="flex gap-3 overflow-x-auto pb-4">
              {pipelineStages.map((stage, i) => (
                <div key={stage} className="min-w-[160px] rounded-xl border bg-card p-4 enterprise-shadow">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{stage}</p>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{pipelineCounts[i]}</span>
                  </div>
                  {stage === "AI Interview" && (
                    <div className="mt-3 rounded-lg border bg-background p-2.5">
                      <p className="text-xs font-medium">Rahul Sharma</p>
                      <p className="text-[10px] text-muted-foreground">3 yrs • Score: 88%</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="agents" className="mt-4">
            <div className="mb-3 flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Active Agents in Recruit</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recruitAgents.map((a) => (
                <AgentCard key={a.name} {...a} onTrigger={() => {}} onViewLogs={() => {}} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
