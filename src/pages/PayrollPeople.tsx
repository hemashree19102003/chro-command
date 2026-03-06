import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FileText,
    ArrowLeft,
    DollarSign,
    Search,
    Plus,
    Bot,
    MoreHorizontal,
    CreditCard,
    TrendingUp,
    Percent,
    CheckCircle2,
    Settings,
    Send,
    X,
    History,
    AlertCircle,
    FileCheck
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
type TabId = "processing" | "compliance" | "payslips" | "expenses";

interface PayrollRun {
    id: string;
    month: string;
    employees: number;
    totalAmount: string;
    status: "Draft" | "Processing" | "Completed";
}

interface Expense {
    id: string;
    name: string;
    category: string;
    amount: string;
    status: "Pending" | "Approved" | "Paid";
}

// --- Mock Data ---
const payrollRuns: PayrollRun[] = [
    { id: "1", month: "February 2024", employees: 124, totalAmount: "₹42,50,000", status: "Completed" },
    { id: "2", month: "March 2024", employees: 128, totalAmount: "₹43,80,000", status: "Draft" },
];

const pendingExpenses: Expense[] = [
    { id: "1", name: "Amit Kumar", category: "Travel", amount: "₹4,500", status: "Pending" },
    { id: "2", name: "Sneha Patel", category: "Hardware", amount: "₹12,000", status: "Approved" },
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

export default function PayrollPeople() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabId>("processing");
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);
    const [search, setSearch] = useState("");

    const menuItems: { id: TabId; label: string; icon: any }[] = [
        { id: "processing", label: "Payroll Processing", icon: CreditCard },
        { id: "compliance", label: "Tax Compliance", icon: TrendingUp },
        { id: "payslips", label: "Payslip Generation", icon: FileCheck },
        { id: "expenses", label: "Expense Claims", icon: DollarSign },
    ];

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-['Inter',_sans-serif] text-[#1e293b] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-white flex flex-col shrink-0 h-full z-20">
                <div className="h-16 border-b flex items-center px-6 gap-3 bg-white sticky top-0">
                    <div className="h-8 w-8 rounded-lg bg-[#6C3EFF] flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-white" />
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
                        <p className="px-4 mb-2 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">PAYROLL</p>
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
                                <h3 className="font-bold text-sm mb-1">Tax AI</h3>
                                <p className="text-[10px] text-white/70 leading-relaxed mb-4">
                                    Need help calculating tax deductions or verifying expense bills?
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
                            placeholder="Search payroll records..."
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
                            {activeTab === "processing" && <PayrollProcessingView />}
                            {activeTab === "compliance" && <TaxComplianceView />}
                            {activeTab === "payslips" && <PayslipGenerationView />}
                            {activeTab === "expenses" && <ExpensesView />}
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

function PayrollProcessingView() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Payroll Processing</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Review and execute monthly payroll runs.</p>
                </div>
                <div className="flex gap-3">
                    <AIButton label="Variance Report" onClick={() => toast.success("AI is preparing payroll variance report...")} />
                    <Button className="bg-[#6C3EFF] hover:bg-[#5a31d6] font-bold shadow-lg shadow-[#6C3EFF]/20 h-10 px-5 text-white rounded-xl">
                        Run Payroll
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {payrollRuns.map((run) => (
                    <Card key={run.id} className="rounded-[32px] border-slate-100 p-8 bg-white shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">{run.month}</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{run.employees} Employees</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${run.status === "Completed" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                                }`}>{run.status}</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-800 mb-6 font-mono">{run.totalAmount}</p>
                        <div className="flex items-center justify-between">
                            <Button variant="ghost" className="h-9 rounded-xl text-[10px] font-bold uppercase text-[#6C3EFF]">View Breakdown</Button>
                            {run.status === "Draft" && <Button className="h-9 px-6 rounded-xl bg-slate-900 text-white font-bold text-xs">Execute Run</Button>}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function TaxComplianceView() {
    return (
        <div className="flex items-center justify-center h-[50vh] text-center">
            <div>
                <TrendingUp className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800">Tax Compliance Hub</h3>
                <p className="text-slate-400 text-sm">Managing TDS, PF, and ESI filings.</p>
            </div>
        </div>
    );
}

function PayslipGenerationView() {
    return (
        <div className="flex items-center justify-center h-[50vh] text-center">
            <div>
                <FileCheck className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800">Payslip Center</h3>
                <p className="text-slate-400 text-sm">Automated generation and distribution of payslips.</p>
            </div>
        </div>
    );
}

function ExpensesView() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Expense Claims</h2>
            <Card className="rounded-[24px] border-slate-200/60 overflow-hidden bg-white shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100">
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400 py-4 px-6">Employee</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Category</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Amount</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Status</TableHead>
                            <TableHead className="text-right pr-6 font-bold text-[9px] uppercase tracking-widest text-slate-400">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pendingExpenses.map((exp) => (
                            <TableRow key={exp.id} className="group hover:bg-slate-50 border-slate-50 transition-colors">
                                <TableCell className="py-4 px-6 font-bold text-slate-800">{exp.name}</TableCell>
                                <TableCell className="text-sm font-medium text-slate-600">{exp.category}</TableCell>
                                <TableCell className="font-bold text-slate-700 font-mono">{exp.amount}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${exp.status === "Approved" ? "bg-emerald-50 text-emerald-600" :
                                            exp.status === "Pending" ? "bg-amber-50 text-amber-600" :
                                                "bg-blue-50 text-blue-600"
                                        }`}>
                                        {exp.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[#6C3EFF] font-bold">Review</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
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
                                <h3 className="font-bold text-slate-800">Tax AI</h3>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
                                <X className="h-4 w-4 text-slate-400" />
                            </Button>
                        </div>

                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-6">
                                <div className="flex flex-col items-start px-2">
                                    <div className="bg-slate-100 p-4 rounded-2xl text-[13px] font-medium text-slate-600 leading-relaxed">
                                        I can help you audit expense claims for policy violations or generate tax liability reports for the current quarter. How can I help?
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>

                        <div className="p-6 border-t bg-white">
                            <div className="relative">
                                <Input placeholder="Ask about payroll taxes..." className="h-12 pr-12 rounded-xl focus-visible:ring-[#6C3EFF]/20" />
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
