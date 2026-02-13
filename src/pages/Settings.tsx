import { Layout } from "@/components/Layout";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Platform configuration and preferences</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { title: "Company Profile", desc: "DemoCorp India Pvt Ltd – Update company details" },
            { title: "AI Agent Configuration", desc: "Configure agent behavior, guardrails, and triggers" },
            { title: "User Management", desc: "Manage admin roles and permissions" },
            { title: "Integrations", desc: "Connect payroll banks, tax portals, and more" },
            { title: "Notifications", desc: "Configure email and in-app notification preferences" },
            { title: "Compliance", desc: "Indian labor law compliance settings" },
          ].map((item, i) => (
            <div key={i} className="cursor-pointer rounded-xl border bg-card p-5 enterprise-shadow hover:enterprise-shadow-md hover:border-primary/30 transition-all">
              <p className="text-sm font-semibold text-foreground">{item.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
