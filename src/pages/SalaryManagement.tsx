import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Briefcase,
    ArrowLeft,
    DollarSign,
    Search,
    Plus,
    Bot,
    Clock,
    MoreHorizontal,
    PieChart,
    TrendingUp,
    CreditCard,
    CreditCard as BankIcon,
    CheckCircle2,
    FileText,
    Settings,
    Send,
    X,
    Target,
    BarChart3,
    Calculator
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
type TabId = "structure" | "bonus" | "commissions" | "appraisals";

interface SalaryInfo {
    id: string;
    name: string;
    role: string;
    base: string;
    allowance: string;
    net: string;
    status: "Active" | "Revised" | "Pending Approval";
}

// --- Mock Data ---
const initialSalaries: SalaryInfo[] = [
    { id: "1", name: "Amit Kumar", role: "Product Manager", base: "₹1,20,000", allowance: "₹30,000", net: "₹1,50,000", status: "Active" },
    { id: "2", name: "Sneha Patel", role: "Software Engineer", base: "₹90,000", allowance: "₹10,000", net: "₹1,00,000", status: "Revised" },
    { id: "3", name: "Rohan Singh", role: "UI/UX Designer", base: "₹80,000", allowance: "₹5,000", net: "₹85,000", status: "Pending Approval" },
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

export default function SalaryManagement() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabId>("structure");
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);
    const [search, setSearch] = useState("");

    const menuItems: { id: TabId; label: string; icon: any }[] = [
        { id: "structure", label: "Salary Structure", icon: BankIcon },
        { id: "bonus", label: "Bonus Management", icon: TrendingUp },
        { id: "commissions", label: "Commissions", icon: Calculator },
        { id: "appraisals", label: "Appraisals", icon: Target },
    ];

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-['Inter',_sans-serif] text-[#1e293b] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-white flex flex-col shrink-0 h-full z-20">
                <div className="h-16 border-b flex items-center px-6 gap-3 bg-white sticky top-0">
                    <div className="h-8 w-8 rounded-lg bg-[#6C3EFF] flex items-center justify-center shrink-0">
                        <Briefcase className="h-4 w-4 text-white" />
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
                        <p className="px-4 mb-2 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">SALARY</p>
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
                                <h3 className="font-bold text-sm mb-1">Payroll AI</h3>
                                <p className="text-[10px] text-white/70 leading-relaxed mb-4">
                                    Need help with salary benchmarking or bonus calculations?
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
                            placeholder="Search salary records..."
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
                            {activeTab === "structure" && <SalaryStructureView />}
                            {activeTab === "bonus" && <BonusManagementView />}
                            {activeTab === "commissions" && <CommissionsView />}
                            {activeTab === "appraisals" && <AppraisalsView />}
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

function SalaryStructureView() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Salary Structure</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Manage base pay, allowances, and net salary components.</p>
                </div>
                <div className="flex gap-3">
                    <AIButton label="Salary Benchmark" onClick={() => toast.success("AI is fetching market standards for these roles...")} />
                    <Button className="bg-[#6C3EFF] hover:bg-[#5a31d6] font-bold shadow-lg shadow-[#6C3EFF]/20 h-10 px-5 text-white rounded-xl">
                        <Plus className="h-4 w-4 mr-2" /> New Component
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <SalaryStat label="Total Monthly Payout" value="₹45.6L" trend="+2.4%" icon={PieChart} />
                <SalaryStat label="Pending Approvals" value="8" trend="Fixed" icon={Clock} />
                <SalaryStat label="Average Hikes" value="12%" trend="+1%" icon={TrendingUp} />
                <SalaryStat label="Active Structures" value="124" trend="-- " icon={CreditCard} />
            </div>

            <Card className="rounded-[24px] border-slate-200/60 overflow-hidden bg-white shadow-sm font-['Inter',_sans-serif]">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100">
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400 py-4 px-6">Employee</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Base Salary</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Allowances</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Net Pay</TableHead>
                            <TableHead className="text-right pr-6 font-bold text-[9px] uppercase tracking-widest text-slate-400">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialSalaries.map((sal) => (
                            <TableRow key={sal.id} className="group hover:bg-slate-50 border-slate-50 transition-colors">
                                <TableCell className="py-4 px-6">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-800">{sal.name}</span>
                                        <span className="text-[10px] text-slate-400">{sal.role}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm font-medium text-slate-600 font-mono">{sal.base}</TableCell>
                                <TableCell className="text-sm text-slate-500 font-mono">{sal.allowance}</TableCell>
                                <TableCell className="font-bold text-[#6C3EFF] font-mono">{sal.net}</TableCell>
                                <TableCell className="text-right pr-6">
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${sal.status === "Active" ? "bg-emerald-50 text-emerald-600" :
                                        sal.status === "Revised" ? "bg-blue-50 text-blue-600" :
                                            "bg-amber-50 text-amber-600"
                                        }`}>
                                        {sal.status}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

function BonusManagementView() {
    return (
        <div className="flex items-center justify-center h-[50vh] text-center">
            <div>
                <TrendingUp className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800">Bonus & Increments</h3>
                <p className="text-slate-400 text-sm">Automating performance-linked bonus payouts.</p>
            </div>
        </div>
    );
}

function CommissionsView() {
    return (
        <div className="flex items-center justify-center h-[50vh] text-center">
            <div>
                <Calculator className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800">Commissions Dashboard</h3>
                <p className="text-slate-400 text-sm">Tracking sales and operational commissions in real-time.</p>
            </div>
        </div>
    );
}

function AppraisalsView() {
    return (
        <div className="flex items-center justify-center h-[50vh] text-center">
            <div>
                <Target className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800">Salary Appraisals</h3>
                <p className="text-slate-400 text-sm">Managing the end-to-end salary revision cycle.</p>
            </div>
        </div>
    );
}

// --- Helper Components ---

function SalaryStat({ label, value, trend, icon: Icon }: { label: string; value: string; trend: string; icon: any }) {
    return (
        <Card className="rounded-[24px] border-slate-100 p-6 flex flex-col font-['Inter',_sans-serif] shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#6C3EFF]">
                    <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">{trend}</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </Card>
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
                                <h3 className="font-bold text-slate-800">Payroll AI</h3>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
                                <X className="h-4 w-4 text-slate-400" />
                            </Button>
                        </div>

                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-6">
                                <div className="flex flex-col items-start px-2">
                                    <div className="bg-slate-100 p-4 rounded-2xl text-[13px] font-medium text-slate-600 leading-relaxed">
                                        I can help you analyze salary trends, calculate tax-efficient structures, or run what-if scenarios for bonus pools. Ready to assist!
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>

                        <div className="p-6 border-t bg-white">
                            <div className="relative">
                                <Input placeholder="Ask about payroll..." className="h-12 pr-12 rounded-xl focus-visible:ring-[#6C3EFF]/20" />
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
