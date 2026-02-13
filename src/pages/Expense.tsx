import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Bot, CheckCircle2, ShieldCheck } from "lucide-react";

export default function Expense() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expense</h1>
          <p className="text-sm text-muted-foreground">Employee expense claims and reimbursements</p>
        </div>

        <div className="rounded-xl border bg-card p-5 enterprise-shadow">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold">Hotel Claim</h3>
              <p className="text-xs text-muted-foreground">₹4,500 – Submitted by Ramesh Kumar</p>
              <p className="text-xs text-muted-foreground">Business trip – Mumbai, Jan 28–30</p>
            </div>
            <Badge className="bg-success/10 text-success border-success/20">Cleared</Badge>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 rounded-lg bg-accent p-3">
              <ShieldCheck className="h-4 w-4 text-success" />
              <div>
                <p className="text-xs font-medium text-accent-foreground">Fraud Detection Agent: Cleared</p>
                <p className="text-[10px] text-muted-foreground">No anomalies detected. Receipt verified.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-accent p-3">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <div>
                <p className="text-xs font-medium text-accent-foreground">Policy Agent: Within limits</p>
                <p className="text-[10px] text-muted-foreground">Hotel expense within ₹5,000/night policy.</p>
              </div>
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
