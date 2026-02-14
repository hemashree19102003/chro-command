import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Users, Clock, Calendar, FileText, BarChart3, 
  HeadphonesIcon, LogOut, Timer, ClipboardList, ArrowRight, ArrowLeft
} from "lucide-react";
import { motion } from "framer-motion";

const modules = [
  { id: "employee-management", name: "Employee Management", icon: Users, description: "Centralize employee records, manage profiles, and organize your entire workforce from one place." },
  { id: "attendance-management", name: "Attendance Management", icon: Clock, description: "Track employee attendance in real-time with biometric, geo-fencing, and mobile check-in support." },
  { id: "shift-management", name: "Shift Management", icon: Timer, description: "Create and manage complex shift schedules with auto-rotation and conflict detection." },
  { id: "leave-management", name: "Leave Management", icon: Calendar, description: "Automate leave policies, track balances, and enable self-service leave applications." },
  { id: "timesheets", name: "Timesheets", icon: ClipboardList, description: "Log work hours, track project time, and generate accurate timesheet reports." },
  { id: "hr-help-desk", name: "HR Help Desk", icon: HeadphonesIcon, description: "Provide employees with a dedicated help desk for all HR-related queries and requests." },
  { id: "document-management", name: "Document Management", icon: FileText, description: "Store, organize, and manage all HR documents with version control and secure access." },
  { id: "hr-analytics", name: "HR Analytics", icon: BarChart3, description: "Gain actionable insights into workforce trends with powerful HR dashboards and reports." },
  { id: "offboarding", name: "Offboarding", icon: LogOut, description: "Manage employee exits smoothly with structured offboarding workflows and checklists." },
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
          <Button size="sm">Request Demo</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-4">Core HR</span>
          <h1 className="text-4xl font-bold text-foreground mb-4">Core HR Software</h1>
          <p className="text-lg text-muted-foreground">
            Centralize and manage all employee data efficiently. From attendance to offboarding, handle every HR process with ease.
          </p>
        </motion.div>
      </section>

      {/* Module Cards */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/people/core-hr/${mod.id}`)}
              className="group rounded-xl border bg-white p-6 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
            >
              <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <mod.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{mod.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{mod.description}</p>
              <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                Learn More <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary">
        <div className="mx-auto max-w-7xl px-6 py-14 text-center">
          <h2 className="text-2xl font-bold text-primary-foreground mb-3">Streamline your Core HR operations</h2>
          <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto text-sm">Start managing your entire workforce from a single platform.</p>
          <div className="flex justify-center gap-4">
            <Button size="lg" variant="secondary">Start Free Trial</Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">Request Demo</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
