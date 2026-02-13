import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Bot, CheckCircle2, Bell, FileText } from "lucide-react";

export default function SignModule() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sign</h1>
          <p className="text-sm text-muted-foreground">Digital document signing and compliance</p>
        </div>

        <div className="rounded-xl border bg-card p-5 enterprise-shadow">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2.5">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Offer Letter – Rahul Sharma</h3>
                  <p className="text-xs text-muted-foreground">Software Developer – Chennai</p>
                </div>
                <Badge variant="secondary">Pending Signature</Badge>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 rounded-lg bg-accent p-3">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <div>
                    <p className="text-xs font-medium text-accent-foreground">Document Clause Validator Agent</p>
                    <p className="text-[10px] text-muted-foreground">All required clauses present. Compliant with Indian labor law.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-accent p-3">
                  <Bell className="h-4 w-4 text-warning" />
                  <div>
                    <p className="text-xs font-medium text-accent-foreground">Auto Reminder Agent</p>
                    <p className="text-[10px] text-muted-foreground">Reminder will be sent after 48 hours if unsigned.</p>
                  </div>
                </div>
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
