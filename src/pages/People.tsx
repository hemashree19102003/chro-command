import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, Users, Clock, Calendar, FileText, Shield, 
  BarChart3, UserPlus, Briefcase, MessageSquare, Smartphone,
  Link2, Bot, HeadphonesIcon, LogOut, Timer, ClipboardList,
  Star, Zap, CheckCircle2, ArrowRight, HelpCircle
} from "lucide-react";
import { motion } from "framer-motion";

const featuresMenu = [
  { 
    label: "Hiring & Onboarding", icon: UserPlus,
    items: ["Applicant Tracking", "Offer Management", "Employee Onboarding", "Background Verification"]
  },
  { 
    label: "Core HR", icon: Users, link: "/people/core-hr",
    items: ["Employee Management", "Attendance Management", "Shift Management", "Leave Management", "Timesheets", "HR Help Desk", "Document Management", "HR Analytics", "Offboarding"]
  },
  { 
    label: "Performance & Development", icon: Star,
    items: ["Goal Setting", "Performance Reviews", "360 Feedback", "Learning Management"]
  },
  { 
    label: "Payroll & Expense", icon: Briefcase,
    items: ["Payroll Processing", "Expense Claims", "Tax Compliance", "Salary Structure"]
  },
  { 
    label: "Employee Engagement", icon: Zap,
    items: ["Surveys", "Rewards & Recognition", "Team Collaboration", "Announcements"]
  },
  { 
    label: "HR Automation", icon: Bot,
    items: ["Workflow Builder", "Auto-approvals", "Policy Engine", "Scheduled Tasks"]
  },
  { 
    label: "HR Chatbot", icon: MessageSquare,
    items: ["Employee Queries", "Policy Q&A", "Leave Requests", "IT Help Desk"]
  },
  { 
    label: "Mobile App", icon: Smartphone,
    items: ["Attendance Check-in", "Leave Apply", "Payslip View", "Approvals"]
  },
  { 
    label: "Integrations", icon: Link2,
    items: ["Slack", "Microsoft Teams", "Google Workspace", "Accounting Software"]
  },
];

const stats = [
  { value: "10,000+", label: "Businesses trust CHRO People" },
  { value: "50+", label: "Countries supported" },
  { value: "99.9%", label: "Uptime guarantee" },
  { value: "4.8/5", label: "Customer satisfaction" },
];

export default function People() {
  const navigate = useNavigate();
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(1); // Core HR default
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFeaturesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Users className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">CHRO People</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setFeaturesOpen(!featuresOpen)}
                  className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features <ChevronDown className={`h-3.5 w-3.5 transition-transform ${featuresOpen ? "rotate-180" : ""}`} />
                </button>
                {featuresOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute left-0 top-full mt-2 flex w-[720px] rounded-xl border bg-white shadow-xl"
                  >
                    {/* Left column - categories */}
                    <div className="w-[260px] border-r bg-muted/30 p-3 rounded-l-xl">
                      <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Categories</p>
                      {featuresMenu.map((cat, i) => (
                        <button
                          key={cat.label}
                          onMouseEnter={() => setActiveCategory(i)}
                          onClick={() => {
                            if (cat.link) {
                              navigate(cat.link);
                              setFeaturesOpen(false);
                            }
                          }}
                          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                            activeCategory === i
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-foreground hover:bg-muted/50"
                          }`}
                        >
                          <cat.icon className="h-4 w-4 shrink-0" />
                          <span>{cat.label}</span>
                          {cat.link && <ArrowRight className="ml-auto h-3 w-3 opacity-50" />}
                        </button>
                      ))}
                    </div>
                    {/* Right column - items */}
                    <div className="flex-1 p-5">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {featuresMenu[activeCategory].label}
                      </p>
                      <div className="grid grid-cols-2 gap-1">
                        {featuresMenu[activeCategory].items.map((item) => (
                          <button
                            key={item}
                            onClick={() => {
                              if (featuresMenu[activeCategory].link) {
                                navigate(featuresMenu[activeCategory].link!);
                              }
                              setFeaturesOpen(false);
                            }}
                            className="rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted/50 transition-colors"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                      {featuresMenu[activeCategory].link && (
                        <button
                          onClick={() => {
                            navigate(featuresMenu[activeCategory].link!);
                            setFeaturesOpen(false);
                          }}
                          className="mt-4 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          Explore all {featuresMenu[activeCategory].label} features <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
              <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Solutions</button>
              <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</button>
              <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Customers</button>
              <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Partners</button>
              <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Resources</button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">Sign in</Button>
            <Button size="sm">Start</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-6">
                #1 HR Software for Indian Enterprises
              </span>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
                HR software for{" "}
                <span className="text-primary">modern businesses</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Streamline your HR processes and deliver exceptional employee experiences with CHRO People — cloud-based HR software built for Indian enterprises.
              </p>
              <div className="flex items-center gap-4">
                <Button size="lg" className="px-8">Start Free Trial</Button>
                <Button size="lg" variant="outline" className="px-8">Contact Sales</Button>
              </div>
              <div className="mt-10 flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Trusted by <span className="font-semibold text-foreground">10,000+</span> businesses
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="rounded-2xl border bg-gradient-to-br from-muted/50 to-muted p-8 shadow-lg">
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Employee Dashboard</p>
                      <p className="text-xs text-muted-foreground">Real-time workforce insights</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {["Total Employees: 352", "New Joiners: 12 this month", "On Leave Today: 8", "Pending Approvals: 5"].map((line) => (
                      <div key={line} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs text-foreground">{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-primary">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-foreground mb-4">Everything you need to manage HR</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From hiring to retirement, CHRO People covers every aspect of human resource management with intelligent automation.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresMenu.slice(0, 6).map((feat, i) => (
            <motion.div
              key={feat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => feat.link && navigate(feat.link)}
              className={`rounded-xl border bg-white p-6 hover:shadow-md transition-all ${feat.link ? "cursor-pointer hover:border-primary/30" : ""}`}
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feat.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{feat.label}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {feat.items.slice(0, 3).join(", ")} and more.
              </p>
              {feat.link && (
                <span className="text-sm font-medium text-primary flex items-center gap-1">
                  Learn more <ArrowRight className="h-3.5 w-3.5" />
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Ready to transform your HR?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Join thousands of Indian enterprises using CHRO People to streamline HR operations and enhance employee experience.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" variant="secondary" className="px-8">Start Free Trial</Button>
            <Button size="lg" variant="outline" className="px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                <Users className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">CHRO People</span>
            </div>
            <p className="text-xs text-muted-foreground">© 2026 CHRO Cloud. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
