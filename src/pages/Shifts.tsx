import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Bot, Zap } from "lucide-react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const teams = ["Team A", "Team B", "Team C"];
const shifts = [
  ["Morning", "Morning", "Morning", "Evening", "Evening", "Off", "Off"],
  ["Evening", "Evening", "Night", "Night", "Off", "Morning", "Morning"],
  ["Night", "Off", "Morning", "Morning", "Morning", "Evening", "Night"],
];

const shiftColors: Record<string, string> = {
  Morning: "bg-info/10 text-info",
  Evening: "bg-warning/10 text-warning",
  Night: "bg-primary/10 text-primary",
  Off: "bg-muted text-muted-foreground",
};

export default function Shifts() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shifts</h1>
          <p className="text-sm text-muted-foreground">Employee shift scheduling and optimization</p>
        </div>

        <div className="rounded-xl border bg-card enterprise-shadow overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left text-xs font-medium text-muted-foreground">Team</th>
                {days.map(d => <th key={d} className="p-3 text-center text-xs font-medium text-muted-foreground">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {teams.map((team, ti) => (
                <tr key={team} className="border-b">
                  <td className="p-3 text-sm font-medium">{team}</td>
                  {shifts[ti].map((s, i) => (
                    <td key={i} className="p-2 text-center">
                      <span className={`inline-block rounded-md px-2 py-1 text-xs font-medium ${shiftColors[s]}`}>{s}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-success/30 bg-success/5 p-5 enterprise-shadow">
          <div className="flex items-start gap-3">
            <Zap className="mt-0.5 h-5 w-5 text-success" />
            <div>
              <p className="text-sm font-semibold text-foreground">Shift Optimization Agent</p>
              <p className="text-xs text-muted-foreground">"Optimized schedule reducing overtime by 12% for next week"</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground italic flex items-center gap-1">
          <Bot className="h-3 w-3" /> HR Final Approval Required
        </p>
      </div>
    </Layout>
  );
}
