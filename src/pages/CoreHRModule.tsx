import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Users, Clock, Calendar, FileText, BarChart3, HeadphonesIcon, LogOut, Timer, ClipboardList, ArrowLeft, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const moduleData: Record<string, {
  name: string; icon: any; subtitle: string;
  features: { title: string; desc: string }[];
  benefits: string[];
  faqs: { q: string; a: string }[];
}> = {
  "employee-management": {
    name: "Employee Management Software", icon: Users,
    subtitle: "Organize employee data, manage profiles, and structure your workforce with ease.",
    features: [
      { title: "Centralized Employee Database", desc: "Store all employee information in one secure, accessible location with custom fields and filters." },
      { title: "Custom Employee Fields", desc: "Create custom data fields tailored to your organization's unique requirements." },
      { title: "Department & Hierarchy Management", desc: "Define organizational structure with multi-level hierarchy and reporting lines." },
      { title: "Employee Lifecycle Tracking", desc: "Track every stage from onboarding to exit with automated milestone triggers." },
      { title: "Digital Employee Records", desc: "Go paperless with digitized employee files, certificates, and compliance documents." },
      { title: "Bulk Import & Export", desc: "Easily migrate data with CSV/Excel import and export capabilities." },
    ],
    benefits: ["Reduce manual errors by 80%", "Improve HR efficiency with automation", "Real-time employee insights and reporting", "Compliance-ready documentation"],
    faqs: [
      { q: "Can I import existing employee data?", a: "Yes, CHRO People supports bulk import via CSV, Excel, and direct API integration with other HRMS platforms." },
      { q: "Is employee data secure?", a: "All data is encrypted at rest and in transit with enterprise-grade security, role-based access control, and audit logging." },
      { q: "Can I customize employee fields?", a: "Absolutely. You can create unlimited custom fields including text, dropdown, date, and file upload types." },
      { q: "Does it support multi-location companies?", a: "Yes, you can manage employees across multiple offices, cities, and even countries with location-specific policies." },
    ],
  },
  "attendance-management": {
    name: "Attendance Management Software", icon: Clock,
    subtitle: "Track employee attendance in real-time with multiple check-in methods and smart analytics.",
    features: [
      { title: "Real-time Attendance Tracking", desc: "Monitor attendance across all locations with live dashboards and instant alerts." },
      { title: "Biometric Integration", desc: "Connect with fingerprint, face recognition, and RFID devices for accurate tracking." },
      { title: "Geo-fencing & GPS Check-in", desc: "Enable location-based check-in for field employees and remote workers." },
      { title: "Attendance Reports & Analytics", desc: "Generate detailed attendance reports with trend analysis and anomaly detection." },
      { title: "Regularization Workflows", desc: "Allow employees to submit regularization requests with manager approval flows." },
      { title: "Integration with Payroll", desc: "Automatically sync attendance data with payroll for accurate salary processing." },
    ],
    benefits: ["Eliminate buddy punching and time theft", "Reduce payroll errors by 90%", "Support remote and hybrid work models", "Automated compliance with labor laws"],
    faqs: [
      { q: "What devices are supported for biometric integration?", a: "We support all major biometric devices including ZKTeco, Suprema, HID, and more via standard APIs." },
      { q: "Can remote employees mark attendance?", a: "Yes, with mobile check-in using GPS verification and selfie capture for remote and field employees." },
      { q: "How are attendance anomalies handled?", a: "Our AI detects patterns like frequent late-ins or early-outs and flags them for manager review." },
      { q: "Is overtime tracked automatically?", a: "Yes, overtime is calculated based on your configured policies and reflected in payroll automatically." },
    ],
  },
  "shift-management": {
    name: "Shift Management Software", icon: Timer,
    subtitle: "Create and manage complex shift schedules with auto-rotation and conflict detection.",
    features: [
      { title: "Visual Shift Scheduler", desc: "Drag-and-drop interface for creating and managing shifts across teams." },
      { title: "Auto-rotation Policies", desc: "Configure automatic shift rotations based on rules and employee preferences." },
      { title: "Conflict Detection", desc: "Automatically detect scheduling conflicts, overtime violations, and compliance issues." },
      { title: "Shift Swap & Bidding", desc: "Allow employees to swap shifts or bid for preferred shifts with manager approval." },
      { title: "Shift Differential Pay", desc: "Configure different pay rates for night shifts, weekends, and holidays." },
      { title: "Real-time Shift Tracking", desc: "Monitor shift adherence in real-time with automated notifications for no-shows." },
    ],
    benefits: ["Reduce scheduling time by 70%", "Minimize overtime costs with optimization", "Improve employee satisfaction with preferences", "Ensure compliance with labor regulations"],
    faqs: [
      { q: "Can shifts span across midnight?", a: "Yes, our system fully supports overnight shifts and correctly handles date transitions for attendance and payroll." },
      { q: "How does auto-rotation work?", a: "You define rotation patterns (weekly, bi-weekly, monthly) and the system automatically assigns shifts following the pattern." },
      { q: "Can employees request shift changes?", a: "Yes, employees can request swaps or time-off through self-service, routed through configurable approval workflows." },
      { q: "Does it handle public holidays?", a: "Yes, you can configure region-specific holiday calendars that automatically adjust shift schedules." },
    ],
  },
  "leave-management": {
    name: "Leave Management Software", icon: Calendar,
    subtitle: "Automate leave policies, track balances, and enable seamless self-service leave applications.",
    features: [
      { title: "Configurable Leave Policies", desc: "Set up unlimited leave types with accrual rules, carry-forward limits, and encashment policies." },
      { title: "Self-service Leave Applications", desc: "Employees can apply for leave, check balances, and track approvals from web or mobile." },
      { title: "Multi-level Approval Workflows", desc: "Configure approval hierarchies with auto-escalation and delegation rules." },
      { title: "Leave Calendar View", desc: "Visual team calendar showing who's on leave, helping managers plan resources." },
      { title: "Comp-off & Restricted Holidays", desc: "Manage compensatory offs and restricted holiday selections with full tracking." },
      { title: "Leave Balance Reports", desc: "Generate comprehensive reports on leave utilization, trends, and liability." },
    ],
    benefits: ["Eliminate manual leave tracking", "Reduce leave policy violations", "Improve workforce planning", "Automated compliance with leave laws"],
    faqs: [
      { q: "Can I create custom leave types?", a: "Yes, you can create unlimited leave types like casual leave, sick leave, marriage leave, etc. with unique policies for each." },
      { q: "Does it support half-day leaves?", a: "Yes, the system supports full-day, half-day, and even hourly leave applications." },
      { q: "How are leave balances calculated?", a: "Balances are automatically calculated based on your accrual policies, pro-rating rules, and carry-forward settings." },
      { q: "Can managers see team availability?", a: "Yes, managers get a team calendar view showing current and upcoming leaves for better resource planning." },
    ],
  },
  "timesheets": {
    name: "Timesheet Management Software", icon: ClipboardList,
    subtitle: "Log work hours, track project time, and generate accurate timesheet reports effortlessly.",
    features: [
      { title: "Project-based Time Tracking", desc: "Log hours against specific projects, tasks, and clients for accurate billing." },
      { title: "Weekly Timesheet Views", desc: "Easy-to-use weekly timesheet interface with quick-fill and copy-previous options." },
      { title: "Approval Workflows", desc: "Multi-level timesheet approval with reminder notifications and auto-escalation." },
      { title: "Billable vs Non-billable Hours", desc: "Categorize time entries for accurate client billing and internal cost analysis." },
      { title: "Timer Integration", desc: "Start/stop timers for real-time tracking without manual entry." },
      { title: "Timesheet Reports", desc: "Detailed reports on utilization, project costs, and employee productivity." },
    ],
    benefits: ["Accurate client billing", "Better project cost estimation", "Improved resource utilization", "Simplified compliance for contract workers"],
    faqs: [
      { q: "Can employees track time on mobile?", a: "Yes, our mobile app supports timer-based and manual time entry with offline capability." },
      { q: "How does it integrate with payroll?", a: "Approved timesheet hours automatically flow into payroll for accurate overtime and project-based pay calculation." },
      { q: "Can I set up timesheet reminders?", a: "Yes, automated reminders can be configured for timesheet submission and approval deadlines." },
      { q: "Does it support multiple billing rates?", a: "Yes, you can configure different rates per employee, project, or client for accurate billing." },
    ],
  },
  "hr-help-desk": {
    name: "HR Help Desk Software", icon: HeadphonesIcon,
    subtitle: "Provide employees with a dedicated help desk for all HR-related queries and requests.",
    features: [
      { title: "Ticket Management", desc: "Employees raise tickets for HR queries with automatic categorization and routing." },
      { title: "Knowledge Base", desc: "Self-service knowledge base with searchable articles on policies, benefits, and procedures." },
      { title: "SLA Management", desc: "Configure response and resolution SLAs with escalation rules." },
      { title: "Multi-channel Support", desc: "Accept requests via email, chat, mobile app, and web portal." },
      { title: "Canned Responses", desc: "Pre-built response templates for common queries to speed up resolution." },
      { title: "Analytics Dashboard", desc: "Track ticket volumes, resolution times, satisfaction scores, and trends." },
    ],
    benefits: ["Reduce HR query response time by 60%", "Improve employee satisfaction", "Track and audit all HR interactions", "Scale HR support without adding headcount"],
    faqs: [
      { q: "Can employees raise tickets anonymously?", a: "Yes, anonymous ticket submission is supported for sensitive issues like harassment or compliance concerns." },
      { q: "How are tickets routed?", a: "Tickets are automatically categorized and routed to the right HR team member based on configurable rules." },
      { q: "Can I track SLA compliance?", a: "Yes, the dashboard shows real-time SLA compliance metrics with alerts for potential breaches." },
      { q: "Is there a chatbot for common queries?", a: "Yes, our AI chatbot handles common queries instantly and creates tickets only when human intervention is needed." },
    ],
  },
  "document-management": {
    name: "Document Management Software", icon: FileText,
    subtitle: "Store, organize, and manage all HR documents with version control and secure access.",
    features: [
      { title: "Centralized Document Storage", desc: "Secure cloud storage for all HR documents with folder organization and tagging." },
      { title: "Version Control", desc: "Track document versions with full change history and rollback capability." },
      { title: "E-signatures", desc: "Collect digital signatures on offer letters, policies, and compliance documents." },
      { title: "Access Control", desc: "Role-based document access with sharing permissions and audit trails." },
      { title: "Template Library", desc: "Pre-built templates for common HR documents like offer letters and NDAs." },
      { title: "Expiry Tracking", desc: "Automatic alerts for document renewals like licenses, certifications, and contracts." },
    ],
    benefits: ["Go 100% paperless", "Ensure compliance with document retention policies", "Reduce document retrieval time", "Secure sensitive employee information"],
    faqs: [
      { q: "What file formats are supported?", a: "We support PDF, Word, Excel, images, and 50+ other file formats with preview capability." },
      { q: "Is there a storage limit?", a: "Plans include generous storage with options to expand. Enterprise plans offer unlimited storage." },
      { q: "Can employees access their own documents?", a: "Yes, employees can view and download their own documents through the self-service portal." },
      { q: "How is document security handled?", a: "Documents are encrypted, access-controlled, and fully audited with enterprise-grade security." },
    ],
  },
  "hr-analytics": {
    name: "HR Analytics Software", icon: BarChart3,
    subtitle: "Gain actionable insights into workforce trends with powerful HR dashboards and reports.",
    features: [
      { title: "Pre-built Dashboards", desc: "Ready-to-use dashboards for headcount, attrition, diversity, and compensation analysis." },
      { title: "Custom Report Builder", desc: "Drag-and-drop report builder with filters, grouping, and visualization options." },
      { title: "Predictive Analytics", desc: "AI-powered predictions for attrition risk, hiring needs, and workforce planning." },
      { title: "Trend Analysis", desc: "Track KPIs over time with trend lines, benchmarks, and anomaly detection." },
      { title: "Scheduled Reports", desc: "Automate report generation and delivery to stakeholders on schedule." },
      { title: "Data Export", desc: "Export reports in PDF, Excel, and CSV formats for further analysis." },
    ],
    benefits: ["Data-driven HR decision making", "Early attrition risk detection", "Optimize workforce costs", "Board-ready HR reports"],
    faqs: [
      { q: "What data sources can I connect?", a: "CHRO Analytics pulls data from all CHRO modules. You can also import external data via CSV or API." },
      { q: "Can I create custom metrics?", a: "Yes, define custom KPIs using formulas combining any data fields from across the platform." },
      { q: "Are dashboards real-time?", a: "Yes, dashboards refresh in real-time as data changes across the platform." },
      { q: "Can I share dashboards with leadership?", a: "Yes, dashboards can be shared via link, embedded in portals, or scheduled as email reports." },
    ],
  },
  "offboarding": {
    name: "Offboarding Management Software", icon: LogOut,
    subtitle: "Manage employee exits smoothly with structured offboarding workflows and checklists.",
    features: [
      { title: "Exit Workflow Automation", desc: "Automated task lists for IT, finance, admin, and manager during employee exits." },
      { title: "Exit Interview Management", desc: "Schedule and conduct exit interviews with structured questionnaires." },
      { title: "Asset Recovery Tracking", desc: "Track return of company assets like laptops, ID cards, and access cards." },
      { title: "Final Settlement Calculator", desc: "Automatically calculate final settlement including leave encashment and gratuity." },
      { title: "Knowledge Transfer", desc: "Structured handover process with documentation and timeline tracking." },
      { title: "Alumni Network", desc: "Maintain ex-employee network for rehiring, referrals, and engagement." },
    ],
    benefits: ["Ensure nothing is missed during exits", "Protect company assets and IP", "Reduce final settlement delays", "Maintain positive employer brand"],
    faqs: [
      { q: "Can I customize the exit checklist?", a: "Yes, create custom checklists per department, role, or exit type with specific tasks and owners." },
      { q: "How is final settlement calculated?", a: "The system considers remaining salary, leave encashment, gratuity, bonuses, and deductions as per your policies." },
      { q: "Can exit interviews be anonymous?", a: "Yes, you can configure anonymous feedback collection for honest exit insights." },
      { q: "Does it handle notice period management?", a: "Yes, including notice period buy-out, early release requests, and garden leave tracking." },
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
          <h2 className="text-xl font-semibold text-foreground mb-2">Module not found</h2>
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
            <button onClick={() => navigate("/people/core-hr")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" /> Core HR
            </button>
            <div className="h-5 w-px bg-border" />
            <span className="text-sm font-semibold text-foreground">{data.name}</span>
          </div>
          <Button size="sm">Start</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">{data.name}</h1>
            <p className="text-lg text-muted-foreground mb-8">{data.subtitle}</p>
            <Button size="lg" className="px-8">Start</Button>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="hidden lg:block">
            <div className="rounded-2xl border bg-gradient-to-br from-muted/50 to-muted p-8">
              <div className="rounded-xl bg-white border p-6 shadow-sm space-y-3">
                {data.features.slice(0, 4).map((f) => (
                  <div key={f.title} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2.5">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm text-foreground">{f.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 border-y">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="text-2xl font-bold text-foreground mb-10 text-center">Key Features</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border bg-white p-5"
              >
                <h3 className="text-sm font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Benefits</h2>
        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {data.benefits.map((b) => (
            <div key={b} className="flex items-center gap-3 rounded-xl border p-4">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm font-medium text-foreground">{b}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Screenshot Placeholder */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="rounded-2xl border bg-gradient-to-br from-muted/30 to-muted p-10 text-center">
          <div className="rounded-xl border bg-white p-12 shadow-sm">
            <Icon className="h-12 w-12 text-primary/30 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Product screenshot preview</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {data.faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border bg-white px-5">
                <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary">
        <div className="mx-auto max-w-7xl px-6 py-14 text-center">
          <h2 className="text-2xl font-bold text-primary-foreground mb-3">Get started with {data.name.replace(" Software", "")}</h2>
          <p className="text-primary-foreground/80 mb-6 text-sm">See how CHRO People can transform your HR operations.</p>
          <div className="flex justify-center gap-4">
            <Button size="lg" variant="secondary">Start Free Trial</Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">Contact Sales</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
