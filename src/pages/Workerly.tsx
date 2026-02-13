import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Bot, AlertTriangle, HardHat } from "lucide-react";

const contractors = [
  { name: "Suresh G.", role: "Security Guard", contract: "Mar 2026", status: "Active" },
  { name: "Lakshmi R.", role: "Housekeeping", contract: "Feb 20, 2026", status: "Expiring Soon" },
  { name: "Mohan K.", role: "Cafeteria Staff", contract: "Feb 18, 2026", status: "Expiring Soon" },
];

export default function Workerly() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <HardHat className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Workerly</h1>
            <p className="text-sm text-muted-foreground">Temporary staff management</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card enterprise-shadow">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Contract Expiry</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {contractors.map((c, i) => (
                <tr key={i} className="border-b hover:bg-muted/30">
                  <td className="p-4 text-sm font-medium">{c.name}</td>
                  <td className="p-4 text-sm text-muted-foreground">{c.role}</td>
                  <td className="p-4 text-sm text-muted-foreground">{c.contract}</td>
                  <td className="p-4">
                    <Badge variant={c.status === "Active" ? "default" : "secondary"}
                      className={c.status !== "Active" ? "bg-warning/10 text-warning border-warning/20" : ""}>
                      {c.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-warning/30 bg-warning/5 p-5 enterprise-shadow">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-warning" />
            <div>
              <p className="text-sm font-semibold text-foreground">Contract Expiry Agent</p>
              <p className="text-xs text-muted-foreground">2 contracts expiring in 7 days. Review and renew.</p>
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
