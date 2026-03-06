import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    MessageSquare,
    ArrowLeft,
    Users,
    Search,
    Plus,
    Bot,
    MoreHorizontal,
    Heart,
    Trophy,
    Megaphone,
    CheckCircle2,
    FileText,
    Settings,
    Send,
    X,
    Smile,
    Frown,
    Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
type TabId = "engagement" | "surveys" | "rewards" | "communications";

interface EngagementMetric {
    id: string;
    department: string;
    score: number;
    participation: string;
    trend: "up" | "down" | "stable";
}

interface Recognition {
    id: string;
    from: string;
    to: string;
    reason: string;
    badge: string;
    date: string;
}

// --- Mock Data ---
const engagementMetrics: EngagementMetric[] = [
    { id: "1", department: "Engineering", score: 8.4, participation: "92%", trend: "up" },
    { id: "2", department: "Product", score: 7.9, participation: "88%", trend: "stable" },
    { id: "3", department: "Design", score: 8.8, participation: "95%", trend: "up" },
];

const initialRecognitions: Recognition[] = [
    { id: "1", from: "Raj M.", to: "Amit Kumar", reason: "Outstanding contribution to the Q1 Product Roadmap.", badge: "Champion", date: "2024-03-01" },
    { id: "2", from: "Sarah J.", to: "Sneha Patel", reason: "Great teamwork on the UI refactor project.", badge: "Team Player", date: "2024-03-03" },
];

// --- Reusable Components ---

const AIButton = ({ label, onClick }: { label: string; onClick?: () => void }) => (
    <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        className="bg-[#6C3EFF]/5 border-[#6C3EFF]/20 text-[#6C3EFF] hover:bg-[#6C3EFF]/10 hover:text-[#6C3EFF] flex items-center gap-2 font-bold rounded-xl"
    >
        <Bot className="h-4 w-4 animate-pulse" />
        {label}
    </Button>
);

const SidebarItem = ({ id, label, icon: Icon, active, onClick }: { id: TabId; label: string; icon: any; active: boolean; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all
      ${active
                ? "bg-[#6C3EFF]/10 text-[#6C3EFF] font-bold"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
    >
        <Icon className={`h-4 w-4 ${active ? "text-[#6C3EFF]" : "text-slate-400"}`} />
        <span className="flex-1 text-left">{label}</span>
    </button>
);

export default function EmployeeRelations() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabId>("engagement");
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);
    const [search, setSearch] = useState("");

    const menuItems: { id: TabId; label: string; icon: any }[] = [
        { id: "engagement", label: "Employee Engagement", icon: Heart },
        { id: "surveys", label: "Sentiment Surveys", icon: Smile },
        { id: "rewards", label: "Rewards & Recognition", icon: Trophy },
        { id: "communications", label: "Communications", icon: Megaphone },
    ];

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-['Inter',_sans-serif] text-[#1e293b] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-white flex flex-col shrink-0 h-full z-20">
                <div className="h-16 border-b flex items-center px-6 gap-3 bg-white sticky top-0">
                    <div className="h-8 w-8 rounded-lg bg-[#6C3EFF] flex items-center justify-center shrink-0">
                        <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-slate-900">
                        CHRO Admin
                    </span>
                </div>

                <div className="p-4 flex-1 overflow-y-auto space-y-6">
                    <button
                        onClick={() => navigate("/people")}
                        className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-[#6C3EFF] transition-all mb-6 uppercase tracking-widest group"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Modules
                    </button>

                    <div className="space-y-1">
                        <p className="px-4 mb-2 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">RELATIONS</p>
                        <nav className="space-y-1">
                            {menuItems.map((item) => (
                                <SidebarItem
                                    key={item.id}
                                    {...item}
                                    active={activeTab === item.id}
                                    onClick={() => setActiveTab(item.id)}
                                />
                            ))}
                        </nav>
                    </div>

                    <div className="pt-8">
                        <div className="p-6 rounded-[24px] bg-[#6C3EFF] text-white shadow-lg shadow-[#6C3EFF]/20 relative overflow-hidden group">
                            <div className="relative z-10">
                                <Bot className="h-8 w-8 mb-4 text-white/80" />
                                <h3 className="font-bold text-sm mb-1">Culture AI</h3>
                                <p className="text-[10px] text-white/70 leading-relaxed mb-4">
                                    Need help analyzing employee feedback or planning engagement events?
                                </p>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="w-full text-[10px] font-bold h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white border-white/20 border"
                                    onClick={() => setIsAssistantOpen(true)}
                                >
                                    Open Assistant
                                </Button>
                            </div>
                            <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] relative">
                {/* Header */}
                <header className="h-16 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-10">
                    <div className="flex items-center gap-4 flex-1 max-w-xl">
                        <Search className="h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search engagement topics..."
                            className="border-none bg-transparent h-10 shadow-none focus-visible:ring-0 text-sm font-medium w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-500 border border-slate-200">
                                AD
                            </div>
                            <div className="hidden md:block">
                                <p className="text-xs font-bold leading-none">Admin User</p>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase">HR Manager</p>
                            </div>
                        </div>
                        <Settings className="h-5 w-5 text-slate-400 cursor-pointer hover:text-slate-600" />
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            {activeTab === "engagement" && <EngagementView />}
                            {activeTab === "surveys" && <SurveysView />}
                            {activeTab === "rewards" && <RewardsView />}
                            {activeTab === "communications" && <CommunicationsView />}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* AI Assistant Sliding Panel */}
                <AIAssistantPanel isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
            </main>
        </div>
    );
}

// --- Views ---

function EngagementView() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Employee Engagement</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Measuring organizational health and department participation.</p>
                </div>
                <div className="flex gap-3">
                    <AIButton label="Culture Analysis" onClick={() => toast.success("AI is analyzing recent engagement trends...")} />
                    <Button className="bg-[#6C3EFF] hover:bg-[#5a31d6] font-bold shadow-lg shadow-[#6C3EFF]/20 h-10 px-5 text-white rounded-xl">
                        <Plus className="h-4 w-4 mr-2" /> Plan Event
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {engagementMetrics.map((met) => (
                    <Card key={met.id} className="rounded-[24px] border-slate-100 p-6 flex flex-col font-['Inter',_sans-serif] shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{met.department}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${met.trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                                }`}>{met.trend === "up" ? "+12%" : "Stable"}</span>
                        </div>
                        <div className="flex items-baseline gap-2 mb-6">
                            <p className="text-3xl font-bold text-slate-800">{met.score}</p>
                            <span className="text-[10px] text-slate-400 font-bold">/ 10</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Participation</span>
                                <span className="text-[10px] font-bold text-[#6C3EFF]">{met.participation}</span>
                            </div>
                            <Progress value={parseInt(met.participation)} className="h-1 bg-slate-50" />
                        </div>
                    </Card>
                ))}
            </div>

            <Card className="rounded-[32px] border-slate-200/60 p-8 bg-white shadow-sm font-['Inter',_sans-serif]">
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Smile className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Overall Sentiment</h3>
                        <p className="text-xs text-slate-400">Based on last week's check-ins.</p>
                    </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed italic">"The team feels highly motivated after the product launch, though engineering workload remains a concern for some members."</p>
            </Card>
        </div>
    );
}

function SurveysView() {
    return (
        <div className="flex items-center justify-center h-[50vh] text-center">
            <div>
                <Smile className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800">Pulse Surveys</h3>
                <p className="text-slate-400 text-sm">Automated check-ins to monitor team health.</p>
            </div>
        </div>
    );
}

function RewardsView() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Rewards & Recognition</h2>
                <Button className="bg-[#6C3EFF] hover:bg-[#5a31d6] font-bold shadow-lg shadow-[#6C3EFF]/20 h-10 px-6 text-white rounded-xl">
                    Give Recognition
                </Button>
            </div>

            <div className="grid gap-4">
                {initialRecognitions.map((rec) => (
                    <Card key={rec.id} className="rounded-[24px] border-slate-100 p-6 bg-white shadow-sm flex items-start gap-4">
                        <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center border text-[#6C3EFF]">
                            <Star className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-bold text-slate-800">
                                    <span className="text-[#6C3EFF]">{rec.from}</span> recognized <span className="text-[#6C3EFF]">{rec.to}</span>
                                </p>
                                <span className="text-[10px] text-slate-400 font-bold uppercase">{rec.date}</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed mb-4">{rec.reason}</p>
                            <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-amber-100 rounded-lg text-[10px] font-bold px-3">
                                {rec.badge}
                            </Badge>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function CommunicationsView() {
    return (
        <div className="flex items-center justify-center h-[50vh] text-center">
            <div>
                <Megaphone className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800">Internal Communications</h3>
                <p className="text-slate-400 text-sm">Send announcements and manage company updates.</p>
            </div>
        </div>
    );
}

function AIAssistantPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute right-0 top-0 h-full w-96 bg-white border-l z-[101] flex flex-col shadow-2xl font-['Inter',_sans-serif]"
                    >
                        <div className="p-6 border-b flex items-center justify-between bg-white sticky top-0">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-[#6C3EFF] rounded-lg flex items-center justify-center">
                                    <Bot className="h-4 w-4 text-white" />
                                </div>
                                <h3 className="font-bold text-slate-800">Culture AI</h3>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
                                <X className="h-4 w-4 text-slate-400" />
                            </Button>
                        </div>

                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-6">
                                <div className="flex flex-col items-start px-2">
                                    <div className="bg-slate-100 p-4 rounded-2xl text-[13px] font-medium text-slate-600 leading-relaxed">
                                        I can analyze survey responses to detect sentiment shifts or suggest the perfect recognition for a team member's hard work. What can I do for you?
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>

                        <div className="p-6 border-t bg-white">
                            <div className="relative">
                                <Input placeholder="Ask about team health..." className="h-12 pr-12 rounded-xl focus-visible:ring-[#6C3EFF]/20" />
                                <Button size="icon" className="absolute right-1 top-1 h-10 w-10 bg-[#6C3EFF] hover:bg-[#5a31d6] rounded-lg">
                                    <Send className="h-4 w-4 text-white" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
