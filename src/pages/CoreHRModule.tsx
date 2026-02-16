import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Users, Clock, Calendar, FileText, BarChart3,
  HeadphonesIcon, LogOut, Timer, ClipboardList,
  ArrowLeft, CheckCircle2, ArrowRight, Zap, Shield, HelpCircle, Building2, Rocket, Factory, Bot
} from "lucide-react";
import { motion } from "framer-motion";

const moduleData: Record<string, {
  name: string;
  icon: any;
  subtext: string;
  capabilities: { title: string; desc: string }[];
  automation: string[];
  benefits: string[];
  useCases: { title: string; desc: string; icon: any }[];
  faqs: { q: string; a: string }[];
}> = {
  "employee-management": {
    name: "Employee Management Software",
    icon: Users,
    subtext: "Centralize employee records, manage workforce structure, and automate lifecycle processes with CHRO People.",
    capabilities: [
      { title: "Centralized Employee Database", desc: "Manage all employee information in one secure, searchable database with customizable fields." },
      { title: "Organizational Structure Management", desc: "Visualize reporting hierarchy, departments, and teams with dynamic org charts." },
      { title: "Employee Lifecycle Tracking", desc: "Track onboarding, role changes, promotions, and offboarding workflows seamlessly." },
      { title: "Role-Based Access Control", desc: "Define secure permissions and control access to employee data." },
      { title: "Digital Employee Profiles", desc: "Maintain structured digital profiles including documents, skills, and history." },
    ],
    automation: [
      "Auto profile creation during onboarding",
      "Automated status updates",
      "Policy-driven employee classification",
      "Workflow-based approvals"
    ],
    benefits: [
      "Reduce manual data errors",
      "Improve HR visibility",
      "Faster onboarding process",
      "Compliance-ready documentation",
      "Real-time workforce insights"
    ],
    useCases: [
      { title: "IT Companies", desc: "Managing distributed workforce across multiple timezones and tech stacks.", icon: Rocket },
      { title: "Manufacturing", desc: "Tracking complex reporting structures across different factory units and departments.", icon: Factory },
      { title: "Startups", desc: "Scaling workforce structure rapidly while maintaining clear hierarchy and roles.", icon: Building2 },
    ],
    faqs: [
      { q: "Can employee data be customized?", a: "Yes, administrators can create custom fields and categories tailored to your organization's specific data requirements." },
      { q: "Is employee data secure?", a: "Yes, data is encrypted and role-based access is strictly enforced to ensure only authorized personnel can view sensitive info." },
      { q: "Does it support bulk data import?", a: "Absolutely. You can import large volumes of employee data using our Excel/CSV upload tool or via API integrations." },
      { q: "Can we visualize the reporting structure?", a: "Yes, our dynamic Org Chart feature automatically generates a visual representation of your entire company hierarchy." },
    ],
  },
  "attendance-management": {
    name: "Attendance Management Software",
    icon: Clock,
    subtext: "Track workforce presence with precision using biometric integration and geo-fenced attendance tracking.",
    capabilities: [
      { title: "Biometric Integration Support", desc: "Sync attendance data directly from biometric devices and facial recognition systems for 100% accuracy." },
      { title: "Geo-fenced Attendance", desc: "Allow remote and field employees to mark attendance within defined geographical boundaries using GPS." },
      { title: "Real-time Attendance Dashboard", desc: "Get instant visibility into employee presence, late-ins, and early-outs across all office locations." },
      { title: "Attendance Anomaly Detection", desc: "AI-driven detection of irregular attendance patterns or missed punch-ins/outs." },
      { title: "Shift-based Attendance Calculation", desc: "Automatically calculate working hours based on assigned shifts and overtime policies." },
    ],
    automation: [
      "Late marking automation",
      "Attendance regularization workflows",
      "Auto-sync with payroll engine",
      "Holiday-based attendance rules"
    ],
    benefits: [
      "Eliminate buddy punching",
      "Reduce payroll processing time",
      "Improve workforce discipline",
      "Accurate overtime calculation",
      "Real-time visibility for managers"
    ],
    useCases: [
      { title: "Retail Chains", desc: "Managing store staff attendance across hundreds of different physical locations.", icon: Building2 },
      { title: "Field Operations", desc: "Tracking sales and service teams visiting client sites using geo-fencing.", icon: Rocket },
      { title: "Industrial Plants", desc: "High-volume biometric attendance tracking for large workforce shifts.", icon: Factory },
    ],
    faqs: [
      { q: "What devices are supported?", a: "We support major biometric brands via API and can integrate with existing hardware in most cases." },
      { q: "How does geo-fencing work?", a: "Employees can only mark attendance through their mobile app when they are within a pre-defined radius of the office." },
      { q: "Is regularization supported?", a: "Yes, employees can request attendance regularization for missed punches, subject to manager approval." },
    ],
  },
  "shift-management": {
    name: "Shift Management Software",
    icon: Timer,
    subtext: "Design, assign, and manage complex shifts with automated rotation and conflict detection.",
    capabilities: [
      { title: "Visual Shift Scheduler", desc: "Drag-and-drop interface for creating complex shift patterns and assigning them to teams." },
      { title: "Auto-rotation Policies", desc: "Configure automatic rotation of shifts (e.g., Weekly, Fortnightly) based on predefined rules." },
      { title: "Shift Conflict Detection", desc: "Instant alerts for back-to-back shifts, overlapping schedules, or rest-period violations." },
      { title: "Shift Swap Management", desc: "Allow employees to request shift swaps with colleagues through a structured approval flow." },
      { title: "Roster Management", desc: "Create and publish monthly or weekly rosters for specific departments or units." },
    ],
    automation: [
      "Automated shift rotation",
      "Overtime limit enforcement",
      "Notifications for roster changes",
      "Rest period compliance checks"
    ],
    benefits: [
      "Minimize scheduling errors",
      "Ensure 24/7 operational coverage",
      "Reduce manager's planning time",
      "Enhance employee work-life balance",
      "Compliance with labor laws"
    ],
    useCases: [
      { title: "Hospitals", desc: "Managing 24/7 nursing and doctor shifts with strict compliance and rest needs.", icon: Building2 },
      { title: "BPO/KPO Units", desc: "Handling complex rotational shifts across multiple international timezones.", icon: Rocket },
      { title: "Factories", desc: "Planning production line shifts for large mechanical and labor units.", icon: Factory },
    ],
    faqs: [
      { q: "Can we handle night shifts?", a: "Yes, the system is designed to handle shifts that cross the midnight boundary seamlessly." },
      { q: "Do employees get notified of changes?", a: "Yes, any changes to published rosters trigger instant notifications via email and mobile app." },
      { q: "Is there a limit to shift types?", a: "No, you can create unlimited shift types with varying start times, break durations, and pay rates." },
    ],
  },
  "leave-management": {
    name: "Leave Management System",
    icon: Calendar,
    subtext: "Simplify time-off requests with custom policies, automated tracking, and multi-level approvals.",
    capabilities: [
      { title: "Custom Leave Policies", desc: "Create unlimited leave types (Sick, Casual, Earned) with specific accrual and carry-forward rules." },
      { title: "Multi-level Approval Workflows", desc: "Define hierarchical or departmental approval flows for different types of leave." },
      { title: "Leave Balance Tracking", desc: "Real-time visibility for employees into their remaining leave balances and history." },
      { title: "Auto Accrual Calculation", desc: "Automatically credit leave balances monthly or annually based on configurable rules." },
      { title: "Holiday Calendar Management", desc: "Set up location-specific public and restricted holiday calendars for your organization." },
    ],
    automation: [
      "Monthly leave accrual credit",
      "Auto-lapse of unused balances",
      "Manager notifications for requests",
      "Leave-payroll integration"
    ],
    benefits: [
      "Eliminate manual leave tracking",
      "Reduce leave policy violations",
      "Better workforce planning",
      "Improved employee transparency",
      "Automated compliance tracking"
    ],
    useCases: [
      { title: "Corporate Offices", desc: "Standardizing leave policies across multiple country-wide branch offices.", icon: Building2 },
      { title: "Consultancy Firms", desc: "Tracking billable vs non-billable time off for project-based resources.", icon: Rocket },
      { title: "Manufacturing", desc: "Managing leave quotas for large scale industrial workforce during peak seasons.", icon: Factory },
    ],
    faqs: [
      { q: "Can we set carry-forward limits?", a: "Yes, you can define exactly how many days can be carried forward to the next year and set expiry dates." },
      { q: "Is half-day leave supported?", a: "Yes, employees can apply for first-half, second-half, or full-day leaves as per policy." },
      { q: "Does it sync with attendance?", a: "Absolutely. Any approved leave is automatically reflected in the attendance and payroll systems." },
    ],
  },
  "timesheets": {
    name: "Timesheet Management Software",
    icon: ClipboardList,
    subtext: "Monitor project progress and billable hours with structured timesheet logging and approvals.",
    capabilities: [
      { title: "Project-based Time Entry", desc: "Employees can log hours against specific projects, tasks, and client accounts." },
      { title: "Weekly/Daily Log Views", desc: "Flexible views for employees to enter and review their time logs before submission." },
      { title: "Manager Approval Dashboard", desc: "A centralized view for managers to review, approve, or reject timesheets for their teams." },
      { title: "Billable Hour Tracking", desc: "Differentiate between billable and non-billable hours for accurate client invoicing." },
      { title: "Cost & Budget Monitoring", desc: "Track project costs based on employee hourly rates and logged time." },
    ],
    automation: [
      "Submission deadline reminders",
      "Auto-escalation for approvals",
      "Project cost calculations",
      "Utilization report generation"
    ],
    benefits: [
      "Precise project costing",
      "Improved billable utilization",
      "Reduced time-tracking errors",
      "Better resource allocation",
      "Accurate client reporting"
    ],
    useCases: [
      { title: "Agencies & Design Firms", desc: "Tracking time spent on creative projects for multiple client accounts.", icon: Rocket },
      { title: "Software Development", desc: "Monitoring developer hours spent on different modules and feature requests.", icon: Building2 },
      { title: "Engineering Services", desc: "Tracking field engineer hours for maintenance and service contracts.", icon: Factory },
    ],
    faqs: [
      { q: "Can we set time limits per task?", a: "Yes, you can define budget hours for specific tasks and get alerts when logs exceed them." },
      { q: "Does it support mobile logging?", a: "Yes, employees can log their time on-the-go using our mobile-friendly timesheet interface." },
      { q: "Can we export logs for billing?", a: "Yes, all timesheet data can be exported in formats compatible with major accounting softwares." },
    ],
  },
  "hr-help-desk": {
    name: "HR Help Desk Software",
    icon: HeadphonesIcon,
    subtext: "Empower employees with a centralized ticketing system for all HR queries and requests.",
    capabilities: [
      { title: "Ticket Management System", desc: "Streamline employee queries into a structured ticket-based system for faster resolution." },
      { title: "Categorized Query Routing", desc: "Automatically route tickets to specialized HR teams (Payroll, Benefits, Admin) based on category." },
      { title: "SLA Tracking & Alerts", desc: "Define and monitor Service Level Agreements for response and resolution times." },
      { title: "Knowledge Base Integration", desc: "Reduce ticket volume by providing self-service access to HR FAQs and policy docs." },
      { title: "Query History & Audit", desc: "Maintain a complete history of all HR-employee interactions for future reference." },
    ],
    automation: [
      "Auto-assignment of tickets",
      "SLA breach escalations",
      "Canned response templates",
      "Feedback collection on closure"
    ],
    benefits: [
      "Faster query resolution",
      "Reduced HR workload",
      "Improved employee trust",
      "Data on common HR issues",
      "Standardized support quality"
    ],
    useCases: [
      { title: "Rapidly Growing Startups", desc: "Providing structured support to employees as HR teams scale up.", icon: Rocket },
      { title: "Large Enterprises", desc: "Managing thousands of monthly queries across diverse HR departments efficiently.", icon: Building2 },
      { title: "Distributed Organizations", desc: "Offering a consistent help desk experience to employees across the globe.", icon: Factory },
    ],
    faqs: [
      { q: "Can employees track ticket status?", a: "Yes, employees get real-time updates on ticket status and which HR associate is handling it." },
      { q: "Is anonymity supported?", a: "Yes, for sensitive issues like whistleblowing, we offer anonymous ticket categories." },
      { q: "Can we integrate with Email?", a: "Absolutely. Employees can raise tickets simply by sending an email to a designated HR address." },
    ],
  },
  "document-management": {
    name: "Document Management Software",
    icon: FileText,
    subtext: "Securely store, organize, and manage digital employee records and company policies.",
    capabilities: [
      { title: "Digital Employee Files", desc: "Maintain a structured folder for every employee containing all their legal and personal docs." },
      { title: "e-Signature Integration", desc: "Send offer letters, NDAs, and policy updates for digital signing within the platform." },
      { title: "Document Expiry Alerts", desc: "Automatic notifications for documents that require renewal (e.g., Visas, Licenses)." },
      { title: "Bulk Policy Distribution", desc: "Publish new company policies to all employees and track their acknowledgment." },
      { title: "Secure Cloud Storage", desc: "Enterprise-grade encryption for all stored documents with redundant backups." },
    ],
    automation: [
      "Auto-folder creation for new hires",
      "Expiry notification triggers",
      "Policy acknowledgment tracking",
      "Document versioning"
    ],
    benefits: [
      "Eliminate physical paperwork",
      "100% compliance readiness",
      "Fast document retrieval",
      "Enhanced data privacy",
      "Reduced storage costs"
    ],
    useCases: [
      { title: "Regulated Industries", desc: "Maintaining strict documentation standards for audits and compliance checks.", icon: Factory },
      { title: "Remote Companies", desc: "Onboarding and managing employee paperwork without any physical presence.", icon: Rocket },
      { title: "Professional Services", desc: "Organizing client-facing documentation and project archives securely.", icon: Building2 },
    ],
    faqs: [
      { q: "What file formats are supported?", a: "We support PDF, Word, Excel, Images, and most common document formats." },
      { q: "Can we set access levels?", a: "Yes, document access can be tightly controlled based on role, department, or individual permissions." },
      { q: "Is there a size limit?", a: "No, our enterprise-grade cloud storage scales with your needs. Individual file limits are configurable." },
    ],
  },
  "hr-analytics": {
    name: "HR Analytics Software",
    icon: BarChart3,
    subtext: "Turn workforce data into actionable insights with powerful dashboards and custom reporting.",
    capabilities: [
      { title: "Executive Dashboards", desc: "Get a high-level overview of headcount, attrition, and diversity metrics at a glance." },
      { title: "Custom Report Builder", desc: "Create tailored reports using any combination of data points across the CHRO platform." },
      { title: "Attrition Risk Analysis", desc: "Identify flight risks and potential attrition trends using AI-powered predictive models." },
      { title: "Compensation Benchmarking", desc: "Compare internal salary structures with industry standards and budget targets." },
      { title: "Employee Performance Metrics", desc: "Visualize performance trends, goal completion rates, and learning progress." },
    ],
    automation: [
      "Scheduled report delivery",
      "Real-time dashboard updates",
      "Anomaly detection in data",
      "Automated KPI tracking"
    ],
    benefits: [
      "Data-driven HR decisions",
      "Identify workforce gaps",
      "Measure HR ROI",
      "Faster strategic planning",
      "Improved transparency"
    ],
    useCases: [
      { title: "Leadership Teams", desc: "Making strategic decisions on workforce growth and compensation budgets.", icon: Building2 },
      { title: "Talent Ops Teams", desc: "Optimizing the hiring pipeline and identifying bottlenecks in recruitment.", icon: Rocket },
      { title: "Finance Departments", desc: "Analyzing labor costs and projecting future workforce expenses accurately.", icon: Factory },
    ],
    faqs: [
      { q: "Can we export reports?", a: "Yes, reports can be exported to Excel, PDF, and CSV for further analysis or presentations." },
      { q: "Is data updated in real-time?", a: "Yes, dashboards refresh automatically as data is entered in other modules." },
      { q: "Can we restrict dashboard access?", a: "Absolutely. You can define exactly which managers or leaders have access to specific dashboards." },
    ],
  },
  "offboarding": {
    name: "Offboarding Management Software",
    icon: LogOut,
    subtext: "Manage employee exits professionally with structured workflows, exit interviews, and asset recovery.",
    capabilities: [
      { title: "Structured Exit Workflows", desc: "Define step-by-step tasks for different departments (IT, Admin, Finance) during an exit." },
      { title: "Asset Recovery Tracking", desc: "Keep track of all company property (Laptops, ID cards, Keys) to be returned by the employee." },
      { title: "Exit Interview Management", desc: "Conduct structured exit interviews and capture feedback to improve employee retention." },
      { title: "Final Settlement Calculation", desc: "Automate the calculation of final dues, leave encashment, and notice period adjustments." },
      { title: "Knowledge Transfer (KT) Plans", desc: "Create and track handover plans to ensure smooth transition of responsibilities." },
    ],
    automation: [
      "Task-list generation on exit",
      "Auto-settlement calculations",
      "Feedback collection triggers",
      "IT access revocation alerts"
    ],
    benefits: [
      "Compliance with labor laws",
      "Smooth employee transition",
      "Protect company intellectual property",
      "Reduced settlement errors",
      "Positive employer branding"
    ],
    useCases: [
      { title: "Tech Firms", desc: "Ensuring secure revocation of all digital access and intellectual property during exits.", icon: Rocket },
      { title: "Large Manufacturing", desc: "Managing high-volume blue-collar exits with clarity and compliance.", icon: Factory },
      { title: "Corporate HQs", desc: "Providing a consistent exit experience across all leadership and staff levels.", icon: Building2 },
    ],
    faqs: [
      { q: "Can we customize exit checklists?", a: "Yes, you can have separate checklists for different roles, departments, or exit types." },
      { q: "How is final settlement handled?", a: "The system integrates with payroll to calculate all dues accurately and generates a final statement." },
      { q: "Can managers see exit feedback?", a: "Yes, consolidated exit insights are available for leadership to analyze and address attrition." },
    ],
  },
};

export default function CoreHRModule() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const data = moduleData[moduleId || ""];

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-4">Module not found</h2>
          <Button onClick={() => navigate("/people/core-hr")}>Back to Core HR</Button>
        </div>
      </div>
    );
  }

  const Icon = data.icon;

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/people/core-hr")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
              <ArrowLeft className="h-4 w-4" /> Core HR
            </button>
            <div className="h-5 w-px bg-border" />
            <span className="text-sm font-bold text-foreground">{data.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="ghost">Request Demo</Button>
            <Button size="sm">Start Free Trial</Button>
          </div>
        </div>
      </nav>

      {/* 1️⃣ Hero Section */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 border border-primary/5">
              <Icon className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground mb-6 leading-tight">
              {data.name}
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              {data.subtext}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="px-8 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20">Start Free Trial</Button>
              <Button size="lg" variant="outline" className="px-8 border-primary/20">Request Demo</Button>
              <Button
                size="lg"
                variant="secondary"
                className="px-8 border border-primary/20 font-bold"
                onClick={() => navigate(`/people/core-hr/${moduleId}/app`)}
              >
                ✅ Start
              </Button>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="hidden lg:block relative">
            <div className="rounded-3xl border bg-gradient-to-br from-muted/50 to-muted p-4 shadow-2xl">
              <div className="aspect-[4/3] rounded-2xl bg-white border shadow-sm flex items-center justify-center overflow-hidden">
                <div className="text-center p-8">
                  <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
                    <Icon className="h-10 w-10 text-primary/40" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Product Screenshot Preview</p>
                  <div className="mt-8 space-y-3 opacity-20">
                    <div className="h-4 w-48 bg-muted rounded-full mx-auto" />
                    <div className="h-4 w-64 bg-muted rounded-full mx-auto" />
                    <div className="h-4 w-40 bg-muted rounded-full mx-auto" />
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative element */}
            <div className="absolute -z-10 -bottom-6 -right-6 h-64 w-64 bg-primary/5 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </section>

      {/* 2️⃣ Key Capabilities Section */}
      <section className="bg-muted/30 border-y py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Key Capabilities</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg italic">Comprehensive features designed for enterprise excellence.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.capabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-2xl border bg-white p-8 hover:shadow-xl hover:border-primary/30 transition-all duration-300"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">{cap.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{cap.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3️⃣ Automation Section */}
      <section className="py-24 border-b overflow-hidden relative">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-foreground mb-8">Automate Core HR Processes</h2>
              <div className="space-y-6">
                {data.automation.map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 bg-muted/30 border border-primary/5 p-4 rounded-xl"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-lg font-medium text-foreground">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="rounded-3xl bg-primary shadow-2xl p-12 text-primary-foreground text-center relative overflow-hidden">
                <div className="relative z-10">
                  <Bot className="h-16 w-16 mx-auto mb-6 opacity-80" />
                  <h3 className="text-2xl font-bold mb-4">Powered by CHRO AI</h3>
                  <p className="text-primary-foreground/70 text-lg leading-relaxed">
                    Our intelligent engine handles repetitive tasks, letting you focus on strategic people development.
                  </p>
                </div>
                <div className="absolute top-0 right-0 h-64 w-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4️⃣ Benefits Section */}
      <section className="bg-muted/20 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-bold text-foreground mb-16 text-center">Benefits</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.benefits.map((benefit, i) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 bg-white border p-6 rounded-2xl shadow-sm"
              >
                <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <span className="text-sm font-semibold text-foreground">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5️⃣ Use Case Section */}
      <section className="py-24 border-y">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">How Businesses Use {data.name.replace(" Software", "")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg italic">Built to adapt to your unique organizational needs.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {data.useCases.map((useCase, i) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-8 rounded-3xl border bg-white hover:bg-muted/10 transition-colors"
              >
                <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-6">
                  <useCase.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">{useCase.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{useCase.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6️⃣ FAQ Section */}
      <section className="py-24 bg-muted/10">
        <div className="mx-auto max-w-3xl px-6">
          <div className="flex items-center justify-center gap-3 mb-10">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-4">
            {data.faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="rounded-2xl border bg-white px-6 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <AccordionTrigger className="text-lg font-bold text-foreground hover:no-underline py-6">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground pb-6 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* 7️⃣ CTA Footer Section */}
      <section className="bg-primary relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-6">
            Ready to simplify your {data.name.replace(" Software", "").toLowerCase()}?
          </h2>
          <p className="text-primary-foreground/70 text-lg mb-10 max-w-2xl mx-auto">
            Experience the power of modern HR automation with CHRO People. Start your 14-day free trial today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" className="px-10 h-14 text-lg font-bold shadow-xl">Start Free Trial</Button>
            <Button size="lg" variant="outline" className="px-10 h-14 text-lg font-bold border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">Contact Sales</Button>
          </div>
        </div>
        {/* Background art */}
        <div className="absolute top-0 left-0 h-full w-full opacity-10 pointer-events-none">
          <div className="absolute top-20 left-20 h-64 w-64 bg-white/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 h-96 w-96 bg-white/20 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Footer link */}
      <footer className="py-12 border-t text-center bg-white">
        <p className="text-sm text-muted-foreground">© 2026 CHRO Cloud. All rights reserved.</p>
      </footer>
    </div>
  );
}
