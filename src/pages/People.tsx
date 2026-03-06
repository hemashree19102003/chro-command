import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ChevronDown, Users, Clock, Calendar, FileText, Shield,
  BarChart3, UserPlus, Briefcase, MessageSquare, Smartphone,
  Link2, Bot, HeadphonesIcon, LogOut, Timer, ClipboardList,
  Star, Zap, CheckCircle2, ArrowRight, HelpCircle, Settings
} from "lucide-react";
import { motion } from "framer-motion";

const featuresMenu = [
  {
    label: "Onboarding & Offboarding",
    icon: UserPlus,
    link: "/people/onboarding-offboarding",
    items: ["Employee Onboarding", "Employee Offboarding", "Offer Management", "Background Verification"]
  },
  {
    label: "Attendance & Leave",
    icon: Clock,
    link: "/people/attendance-leave",
    items: ["Tracking employee attendance", "Managing leave requests", "WFH Requests", "Shift Management"]
  },
  {
    label: "Performance",
    icon: Star,
    link: "/people/performance",
    items: ["Performance Reviews", "Goal Setting", "360 Feedback", "Continuous Feedback"]
  },
  {
    label: "Training & Development",
    icon: Zap,
    link: "/people/training-development",
    items: ["Learning Management", "Skills Assessment", "Certifications", "Succession Planning"]
  },
  {
    label: "Salary Management",
    icon: Briefcase,
    link: "/people/salary-management",
    items: ["Salary Structure", "Bonus Management", "Commissions", "Appraisals"]
  },
  {
    label: "Compliance & Policies",
    icon: Shield,
    link: "/people/compliance-policies",
    items: ["Statutory Compliance", "Company Policies", "Legal Documentation", "Audit Logs"]
  },
  {
    label: "Employee Relation",
    icon: MessageSquare,
    link: "/people/employee-relations",
    items: ["Employee Engagement", "Surveys", "Rewards & Recognition", "Internal Communications"]
  },
  {
    label: "Payroll",
    icon: FileText,
    link: "/people/payroll",
    items: ["Payroll Processing", "Tax Compliance", "Payslip Generation", "Expense Reimbursements"]
  }
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
                          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${activeCategory === i
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
              className="hidden lg:block relative"
            >
              {/* Decorative background elements */}
              <div className="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

              <div className="relative rounded-2xl border border-white/50 bg-white shadow-2xl overflow-hidden backdrop-blur-sm">
                {/* Dashboard Windows Header */}
                <div className="h-10 border-b bg-muted/30 flex items-center px-4 justify-between">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400/20" />
                    <div className="h-3 w-3 rounded-full bg-amber-400/20" />
                    <div className="h-3 w-3 rounded-full bg-emerald-400/20" />
                  </div>
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Employee Dashboard</div>
                  <div className="w-10" />
                </div>

                <div className="flex h-[400px]">
                  {/* Sidebar */}
                  <div className="w-14 border-r bg-muted/10 flex flex-col items-center py-4 gap-4">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    {[Clock, Calendar, FileText, BarChart3, Settings].map((Icon, i) => (
                      <div key={i} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 p-6 bg-white overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">Welcome back, Sarah!</h3>
                        <p className="text-xs text-muted-foreground">Here's what's happening today.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                          SA
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Stat Cards */}
                      <div className="rounded-xl border p-4 hover:border-primary/30 transition-colors bg-gradient-to-br from-white to-muted/20">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-xs font-medium text-muted-foreground">Total Employees</p>
                          <span className="text-[10px] text-emerald-500 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">+12%</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">1,248</p>
                        <div className="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-[70%] bg-primary rounded-full" />
                        </div>
                      </div>

                      <div className="rounded-xl border p-4 hover:border-primary/30 transition-colors bg-gradient-to-br from-white to-muted/20">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-xs font-medium text-muted-foreground">Attendance</p>
                          <span className="text-[10px] text-primary font-bold bg-primary/5 px-1.5 py-0.5 rounded">Today</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">94.2%</p>
                        <div className="mt-2 flex gap-1">
                          {[3, 5, 4, 6, 5, 7, 8].map((h, i) => (
                            <div key={i} className="flex-1 rounded-sm bg-primary/20 hover:bg-primary transition-colors" style={{ height: `${h * 2}px` }} />
                          ))}
                        </div>
                      </div>

                      {/* List Widget */}
                      <div className="col-span-2 rounded-xl border p-4 bg-muted/5">
                        <h4 className="text-xs font-bold text-foreground mb-3">Recent Onboarding</h4>
                        <div className="space-y-3">
                          {[
                            { name: "Arjun Singh", role: "Product Designer", initial: "AS", color: "bg-blue-100 text-blue-600" },
                            { name: "Priya Sharma", role: "Frontend Dev", initial: "PS", color: "bg-purple-100 text-purple-600" }
                          ].map((user) => (
                            <div key={user.name} className="flex items-center gap-3">
                              <div className={`h-8 w-8 rounded-full ${user.color} flex items-center justify-center text-[10px] font-bold`}>
                                {user.initial}
                              </div>
                              <div className="flex-1">
                                <p className="text-[11px] font-semibold text-foreground leading-tight">{user.name}</p>
                                <p className="text-[10px] text-muted-foreground">{user.role}</p>
                              </div>
                              <div className="text-[10px] font-medium text-primary hover:underline cursor-pointer">View profile</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              {/* Status badges (Static) */}
              <div className="absolute -left-6 top-1/4 rounded-lg bg-white p-3 shadow-xl border border-muted/50 hidden xl:flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-foreground">Leave Approved</p>
                  <p className="text-[9px] text-muted-foreground">Arjun Sharma • Applied 2h ago</p>
                </div>
              </div>

              <div className="absolute -right-6 bottom-1/4 rounded-lg bg-white p-3 shadow-xl border border-muted/50 hidden xl:flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-foreground">Performance Review</p>
                  <p className="text-[9px] text-muted-foreground">Due in 3 days</p>
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuresMenu.slice(0, 8).map((feat, i) => (
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
