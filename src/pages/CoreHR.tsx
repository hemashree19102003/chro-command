import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Users, Clock, Calendar, FileText, BarChart3,
  HeadphonesIcon, LogOut, Timer, ClipboardList, ArrowRight, ArrowLeft,
  CheckCircle2, Shield, Zap, Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ModuleCarousel({ modules, navigate }: { modules: any[], navigate: any }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (isHovering) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % modules.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isHovering, modules.length]);

  return (
    <div
      className="relative w-full max-w-5xl h-full flex items-center justify-center pt-24"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{ perspective: "2000px" }}
    >
      <div className="relative w-full flex items-center justify-center transform-gpu">
        <AnimatePresence mode="popLayout">
          {modules.map((mod, i) => {
            let diff = i - activeIndex;
            if (diff < -Math.floor(modules.length / 2)) diff += modules.length;
            if (diff > Math.floor(modules.length / 2)) diff -= modules.length;

            const isActive = diff === 0;
            const isVisible = Math.abs(diff) <= 2;

            if (!isVisible) return null;

            return (
              <motion.div
                key={mod.id}
                onClick={() => setActiveIndex(i)}
                initial={{ opacity: 0, scale: 0.5, z: -500, rotateY: diff * 45 }}
                animate={{
                  opacity: 1 - Math.abs(diff) * 0.25,
                  scale: isActive ? 1.15 : 0.85,
                  x: diff * 290,
                  z: isActive ? 150 : -Math.abs(diff) * 150,
                  y: Math.abs(diff) * 30,
                  rotateY: diff * -25,
                  rotateX: isActive ? 0 : 5,
                  zIndex: 10 - Math.abs(diff),
                  filter: isActive ? "blur(0px)" : `blur(${Math.abs(diff) * 1.5}px)`,
                }}
                exit={{ opacity: 0, scale: 0.5, z: -500 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 25,
                  mass: 1
                }}
                className={`absolute w-[300px] cursor-pointer rounded-[40px] border overflow-hidden group/card transition-all duration-700 ${isActive
                    ? "bg-white border-[#6C3EFF]/30 shadow-[0_40px_80px_-15px_rgba(108,62,255,0.15)]"
                    : "bg-slate-50/80 border-slate-200/50 grayscale-[0.4]"
                  }`}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Visual Accent Gradients */}
                {isActive && (
                  <>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#6C3EFF]/10 to-transparent rounded-bl-full pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#6C3EFF]/5 to-transparent rounded-tr-full pointer-events-none" />
                  </>
                )}

                <div className="relative p-8 z-10">
                  {/* Floating Rank Indicator */}
                  <div className={`absolute top-6 right-8 text-[10px] font-black tracking-[0.2em] transition-colors duration-700 ${isActive ? "text-[#6C3EFF]/40" : "text-slate-300"
                    }`}>
                    0{i + 1}
                  </div>

                  {/* Icon with Glowing Backdrop */}
                  <div className="relative mb-8">
                    {isActive && (
                      <motion.div
                        layoutId="glow"
                        className="absolute inset-0 bg-[#6C3EFF]/20 blur-2xl rounded-full scale-150"
                      />
                    )}
                    <div className={`relative h-14 w-14 rounded-2xl flex items-center justify-center border transition-all duration-700 ${isActive
                        ? "bg-white border-[#6C3EFF]/20 shadow-[0_10px_30px_-5px_rgba(108,62,255,0.2)]"
                        : "bg-slate-100 border-slate-200"
                      }`}>
                      <mod.icon className={`h-7 w-7 transition-colors duration-700 ${isActive ? "text-[#6C3EFF]" : "text-slate-400"}`} />
                    </div>
                  </div>

                  <h3 className={`text-xl font-black mb-3 tracking-tight leading-tight transition-colors duration-700 ${isActive ? "text-slate-900" : "text-slate-400"
                    }`}>
                    {mod.name}
                  </h3>

                  <p className={`text-[13px] leading-relaxed mb-8 transition-colors duration-700 ${isActive ? "text-slate-600 font-medium" : "text-slate-300"
                    }`}>
                    {mod.description}
                  </p>

                  <div className="space-y-3 mb-10">
                    {mod.highlights?.map((h: string) => (
                      <div key={h} className="flex items-center gap-3">
                        <div className={`h-1 w-1 rounded-full transition-colors duration-700 ${isActive ? "bg-[#6C3EFF]" : "bg-slate-200"
                          }`} />
                        <span className={`text-[11px] font-bold tracking-wide uppercase transition-colors duration-700 ${isActive ? "text-slate-500" : "text-slate-300"
                          }`}>
                          {h}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant={isActive ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (mod.id === "employee-management" || mod.id === "attendance-management" || mod.id === "shift-management") {
                        navigate(`/people/core-hr/${mod.id}/app`);
                      } else {
                        navigate(`/people/core-hr/${mod.id}`);
                      }
                    }}
                    className={`w-full font-black h-12 text-sm rounded-2xl transition-all duration-500 transform-gpu ${isActive
                        ? "bg-[#6C3EFF] hover:bg-[#5a31d6] text-white shadow-[0_15px_30px_-5px_rgba(108,62,255,0.4)] hover:-translate-y-1"
                        : "border-slate-200 text-slate-300 hover:text-slate-400 hover:bg-slate-50"
                      }`}
                  >
                    Start Experience
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Navigation Indicators */}
      <div className="absolute -bottom-24 flex gap-3">
        {modules.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`h-2 rounded-full transition-all duration-700 ${activeIndex === i ? "w-12 bg-[#6C3EFF]" : "w-3 bg-slate-200 hover:bg-slate-300"
              }`}
          />
        ))}
      </div>
    </div>
  );
}

const modules = [
  { id: "employee-management", name: "Employee Management", icon: Users, description: "Manage employees, structure, and lifecycle efficiently.", highlights: ["Custom fields", "Org chart", "Bulk import"] },
  { id: "attendance-management", name: "Attendance Management", icon: Clock, description: "Track employee attendance, shifts, and work hours efficiently.", highlights: ["Biometric", "GPS check-in", "Live dashboard"] },
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
          <Button size="sm" variant="outline" onClick={() => navigate("/people/core-hr/employee-management/app")}>Start</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl">
            <span className="inline-block rounded-full bg-[#6C3EFF]/10 px-4 py-1.5 text-xs font-semibold text-[#6C3EFF] mb-4 border border-[#6C3EFF]/20">Core HR Software</span>
            <h1 className="text-4xl md:text-5xl lg:text-5xl font-extrabold text-[#111827] mb-6 leading-[1.1]">The complete people software for Indian teams.</h1>
            <p className="text-lg text-slate-500 mb-8 leading-relaxed">
              Manage employee data, attendance, leave, and workforce operations from a centralized platform built for modern enterprises. Scalable from startup to enterprise.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="outline" className="px-8 h-14 text-lg font-bold border-slate-200" onClick={() => navigate("/people/core-hr/employee-management/app")}>Start</Button>
            </div>

            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-slate-600">Join <span className="text-[#6C3EFF] font-bold">50,000+</span> HR professionals today.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative"
          >
            <div className="rounded-[40px] border border-slate-200/60 shadow-2xl overflow-hidden bg-white p-2 relative z-10 scale-[0.85] lg:scale-100 origin-right">
              {/* Fake App Header */}
              <div className="bg-slate-50 border-b px-6 py-3 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="bg-white border rounded-lg px-4 py-1 text-[10px] text-slate-400 font-mono">chro.admin/dashboard</div>
                <div className="w-12" />
              </div>

              {/* Fake Dashboard Body */}
              <div className="p-6 bg-[#F8FAFC] min-h-[500px] overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white border shadow-sm overflow-hidden"><img src="https://i.pravatar.cc/100?u=admin" className="object-cover" /></div>
                    <div><h4 className="text-sm font-bold">Good Morning, Admin!</h4><p className="text-[9px] text-slate-400 italic">"Efficiency is doing things right..."</p></div>
                  </div>
                  <div className="h-8 w-24 bg-[#6C3EFF] rounded-lg shadow-lg shadow-[#6C3EFF]/20" />
                </div>

                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[4, 12, 8, 24].map((v, i) => (
                    <div key={i} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="h-1 bg-[#6C3EFF]/10 rounded-full w-8 mb-2" />
                      <p className="text-lg font-black text-slate-800 leading-none">{v}</p>
                      <p className="text-[7px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">{['Tasks', 'New Hires', 'Openings', 'Reports'][i]}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <h5 className="text-[10px] font-bold text-slate-800">Recruitment Pipeline</h5>
                    <div className="space-y-3">
                      {[
                        { l: 'Applied', w: '100%', c: 'bg-slate-100' },
                        { l: 'Selected', w: '40%', c: 'bg-[#6C3EFF]' },
                        { l: 'Offered', w: '15%', c: 'bg-emerald-400' }
                      ].map(p => (
                        <div key={p.l} className="space-y-1">
                          <div className="flex justify-between text-[8px] font-bold uppercase"><span className="text-slate-400">{p.l}</span></div>
                          <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: p.w }} className={`h-full ${p.c}`} /></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                    <div className="flex justify-between mb-3">
                      <h5 className="text-[10px] font-bold text-slate-800">Attendance Today</h5>
                      <span className="text-[9px] text-emerald-500 font-bold italic">92% Live</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 flex-1">
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          {[
                            { l: 'P', c: 'bg-[#6C3EFF]', v: '432' },
                            { l: 'L', c: 'bg-amber-400', v: '54' },
                            { l: 'A', c: 'bg-rose-400', v: '28' }
                          ].map(s => (
                            <div key={s.l} className="flex-1 p-1.5 rounded-lg bg-slate-50 border border-slate-100 items-center justify-center flex flex-col gap-0.5">
                              <p className="text-[7px] font-black text-slate-400 uppercase">{s.l}</p>
                              <p className={`text-[8px] font-black ${s.c.replace('bg-', 'text-')}`}>{s.v}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-end justify-between h-14 gap-1 px-1">
                          {[30, 50, 80, 60, 95, 70, 40].map((v, i) => (
                            <div key={i} className="flex-1 bg-slate-50 rounded-t-sm relative group overflow-hidden">
                              <motion.div initial={{ height: 0 }} animate={{ height: `${v}%` }} className="absolute bottom-0 w-full bg-[#6C3EFF]/10" />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-slate-50/50 rounded-2xl p-3 space-y-2">
                        <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Recent Logs</p>
                        {[
                          { n: 'Rahul S.', t: '09:05 AM' },
                          { n: 'Ananya I.', t: '09:12 AM' },
                          { n: 'Sid M.', t: '09:30 AM' }
                        ].map((log, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <div className="h-1 w-1 rounded-full bg-emerald-400" />
                              <span className="text-[8px] font-bold text-slate-700">{log.n}</span>
                            </div>
                            <span className="text-[7px] font-mono text-slate-400">{log.t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                  <h5 className="text-[10px] font-bold text-slate-800 mb-4">Celebrations Today</h5>
                  <div className="flex gap-4">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => <div key={i} className="h-8 w-8 rounded-full border-2 border-white overflow-hidden shadow-sm"><img src={`https://i.pravatar.cc/100?u=c${i}`} /></div>)}
                    </div>
                    <div><p className="text-[9px] font-bold text-slate-800">Ananya & 2 others</p><p className="text-[8px] text-[#6C3EFF] font-bold">Wishes Sent ✨</p></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Card 1 */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute -bottom-4 lg:-bottom-8 -left-4 lg:-left-8 bg-white rounded-2xl shadow-2xl p-4 border border-slate-100 flex items-center gap-4 z-20"
            >
              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Attendance: 92%</p>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight">On Track Today</p>
              </div>
            </motion.div>

            {/* Floating Card 2 */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute -top-4 lg:-top-10 -right-4 lg:-right-10 bg-white rounded-2xl shadow-2xl p-5 border border-slate-100 hidden md:block z-20"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#6C3EFF]" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New Hire</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                    <img src="https://i.pravatar.cc/100?u=rahul" alt="" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Rahul Dev</p>
                    <p className="text-[10px] text-slate-400">Head of Tech • Engineering</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Module Carousel Section */}
      <section className="mx-auto max-w-7xl px-6 py-24 relative overflow-hidden">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-slate-800 mb-4">Explore Our Modules</h2>
          <p className="text-slate-500 italic">Hover or tap to focus on a module. Auto-advances every 4 seconds.</p>
        </div>

        <div className="relative h-[600px] flex items-center justify-center">
          <ModuleCarousel modules={modules} navigate={navigate} />
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
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => navigate("/people/core-hr/employee-management/app")}>Start</Button>
          </div>
        </div>
      </section>
    </div>
  );
}