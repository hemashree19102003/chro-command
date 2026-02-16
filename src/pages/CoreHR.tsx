import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Users, Clock, Calendar, FileText, BarChart3,
  HeadphonesIcon, LogOut, Timer, ClipboardList, ArrowRight, ArrowLeft,
  CheckCircle2, Shield, Zap, Globe
} from "lucide-react";
import { motion } from "framer-motion";

const modules = [
  { id: "employee-management", name: "Employee Management", icon: Users, description: "Centralize employee records, manage profiles, and organize your entire workforce from one place.", highlights: ["Custom fields", "Org chart", "Bulk import"] },
  { id: "attendance-management", name: "Attendance Management", icon: Clock, description: "Track employee attendance in real-time with biometric, geo-fencing, and mobile check-in support.", highlights: ["Biometric", "GPS check-in", "Live dashboard"] },
  { id: "shift-management", name: "Shift Management", icon: Timer, description: "Create and manage complex shift schedules with auto-rotation and conflict detection.", highlights: ["Drag & drop", "Auto-rotation", "Overtime alerts"] },
  { id: "leave-management", name: "Leave Management (Time Off)", icon: Calendar, description: "Automate leave policies, track balances, and enable self-service leave applications.", highlights: ["Auto-accrual", "Team calendar", "Comp-off"] },
  { id: "timesheets", name: "Timesheets", icon: ClipboardList, description: "Log work hours, track project time, and generate accurate timesheet reports.", highlights: ["Project tracking", "Timer mode", "Billable hours"] },
  { id: "hr-help-desk", name: "HR Help Desk", icon: HeadphonesIcon, description: "Provide employees with a dedicated help desk for all HR-related queries and requests.", highlights: ["Ticket system", "Knowledge base", "SLA tracking"] },
  { id: "document-management", name: "Document Management", icon: FileText, description: "Store, organize, and manage all HR documents with version control and secure access.", highlights: ["E-signatures", "Version control", "Templates"] },
  { id: "hr-analytics", name: "HR Analytics", icon: BarChart3, description: "Gain actionable insights into workforce trends with powerful HR dashboards and reports.", highlights: ["Predictive AI", "Custom reports", "Trend analysis"] },
  { id: "offboarding", name: "Offboarding", icon: LogOut, description: "Manage employee exits smoothly with structured offboarding workflows and checklists.", highlights: ["Exit interviews", "Asset recovery", "Settlement calc"] },
];

const whyChoose = [
  { icon: Shield, title: "Enterprise Security", desc: "SOC 2 compliant with end-to-end encryption, role-based access, and complete audit trails." },
  { icon: Zap, title: "Instant Setup", desc: "Go live in under 48 hours with guided onboarding, data migration, and dedicated support." },
  { icon: Globe, title: "India-first Compliance", desc: "Built-in support for Indian labor laws, PF, ESI, gratuity, and state-specific regulations." },
  { icon: Users, title: "Scalable for All Sizes", desc: "From 50 to 50,000 employees — scales with your growth without compromising performance." },
];

const stats = [
  { value: "80%", label: "Reduction in manual HR tasks" },
  { value: "3x", label: "Faster onboarding process" },
  { value: "95%", label: "Employee self-service adoption" },
  { value: "60%", label: "Fewer payroll errors" },
];

export default function CoreHR() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/people")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Users className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">CHRO People</span>
            </div>
          </div>
          <Button size="sm">Start</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-4 border border-primary/20">Core HR Software</span>
          <h1 className="text-4xl font-bold text-foreground mb-4">Core HR Software</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Manage employee data, attendance, leave, and workforce operations from a centralized platform.
          </p>
          <Button size="lg" className="px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">Start Free Trial</Button>
        </motion.div>
      </section>

      {/* Module Cards */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-2xl border bg-white p-8 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-xl bg-[#6C3EFF]/10 flex items-center justify-center mb-6 border border-[#6C3EFF]/5">
                <mod.icon className="h-6 w-6 text-[#6C3EFF]" />
              </div>
              <h3 className="text-xl font-bold text-[#1e293b] mb-3">{mod.name}</h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">{mod.description}</p>

              {mod.id === "employee-management" || mod.id === "attendance-management" ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="sm" className="w-full border-slate-200 text-slate-600 hover:bg-slate-50">Start Trial</Button>
                    <Button variant="outline" size="sm" className="w-full border-slate-200 text-slate-600 hover:bg-slate-50">Demo</Button>
                  </div>
                  <Button
                    onClick={() => navigate(`/people/core-hr/${mod.id}/app`)}
                    className="w-full bg-[#6C3EFF] text-white hover:bg-[#5a31d6] shadow-lg shadow-[#6C3EFF]/20 font-bold transition-all duration-300"
                  >
                    Start
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => navigate(`/people/core-hr/${mod.id}`)}
                  className="w-full bg-white text-[#6C3EFF] border border-[#6C3EFF]/20 hover:bg-[#6C3EFF] hover:text-white transition-all duration-300"
                >
                  Start
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose */}
      <section className="bg-muted/30 border-y">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-3">Why choose CHRO Core HR?</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Purpose-built for Indian enterprises with world-class features and local compliance.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChoose.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border bg-white p-5 text-center"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1.5">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary">
        <div className="mx-auto max-w-7xl px-6 py-14 text-center">
          <h2 className="text-2xl font-bold text-primary-foreground mb-3">Streamline your Core HR operations</h2>
          <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto text-sm">Start managing your entire workforce from a single platform.</p>
          <div className="flex justify-center gap-4">
            <Button size="lg" variant="secondary">Start Free Trial</Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">Contact Sales</Button>
          </div>
        </div>
      </section>
    </div>
  );
}