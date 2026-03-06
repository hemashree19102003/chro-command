import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Shield,
    ArrowLeft,
    FileText,
    Search,
    Plus,
    Bot,
    MoreHorizontal,
    Lock,
    AlertTriangle,
    FileCheck,
    CheckCircle2,
    Settings,
    Send,
    X,
    Scale,
    Gavel,
    Eye,
    Download
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
type TabId = "statutory" | "policies" | "audits" | "legal";

interface Policy {
    id: string;
    title: string;
    category: string;
    lastUpdated: string;
    status: "Active" | "Under Review" | "Archived";
}

interface StatutoryCompliance {
    id: string;
    requirement: string;
    deadline: string;
    status: "Compliant" | "Action Required" | "Overdue";
}

// --- Mock Data ---
const initialPolicies: Policy[] = [
    { id: "1", title: "Code of Conduct", category: "General", lastUpdated: "2024-01-10", status: "Active" },
    { id: "2", title: "Data Privacy Policy", category: "IT & Legal", lastUpdated: "2024-02-15", status: "Under Review" },
    { id: "3", title: "Work From Home Policy", category: "Operations", lastUpdated: "2023-11-20", status: "Active" },
];

const statutoryRequirements: StatutoryCompliance[] = [
    { id: "1", requirement: "EPF Monthly Contribution", deadline: "2024-03-15", status: "Compliant" },
    { id: "2", requirement: "Professional Tax Filing", deadline: "2024-03-20", status: "Action Required" },
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

export default function CompliancePolicies() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabId>("statutory");
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);
    const [search, setSearch] = useState("");

    const menuItems: { id: TabId; label: string; icon: any }[] = [
        { id: "statutory", label: "Statutory Compliance", icon: Gavel },
        { id: "policies", label: "Company Policies", icon: FileText },
        { id: "legal", label: "Legal Documentation", icon: Scale },
        { id: "audits", label: "Audit Logs", icon: Eye },
    ];

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-['Inter',_sans-serif] text-[#1e293b] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-white flex flex-col shrink-0 h-full z-20">
                <div className="h-16 border-b flex items-center px-6 gap-3 bg-white sticky top-0">
                    <div className="h-8 w-8 rounded-lg bg-[#6C3EFF] flex items-center justify-center shrink-0">
                        <Shield className="h-4 w-4 text-white" />
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
                        <p className="px-4 mb-2 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">COMPLIANCE</p>
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
                                <h3 className="font-bold text-sm mb-1">Compliance AI</h3>
                                <p className="text-[10px] text-white/70 leading-relaxed mb-4">
                                    Need a summary of recent labor law changes or policy drafting?
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
                            placeholder="Search policies or requirements..."
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
                            {activeTab === "statutory" && <StatutoryComplianceView />}
                            {activeTab === "policies" && <CompanyPoliciesView />}
                            {activeTab === "legal" && <LegalDocumentationView />}
                            {activeTab === "audits" && <AuditLogsView />}
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

function StatutoryComplianceView() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Statutory Compliance</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Track regulatory filings and statutory requirements.</p>
                </div>
                <div className="flex gap-3">
                    <AIButton label="Regulation Alerts" onClick={() => toast.success("AI is checking for new labor law updates...")} />
                    <Button className="bg-[#6C3EFF] hover:bg-[#5a31d6] font-bold shadow-lg shadow-[#6C3EFF]/20 h-10 px-5 text-white rounded-xl">
                        <Plus className="h-4 w-4 mr-2" /> Add Requirement
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ComplianceStat label="Compliance Score" value="94%" status="High" color="text-emerald-500" icon={Shield} />
                <ComplianceStat label="Open Filings" value="3" status="Pending" color="text-amber-500" icon={AlertTriangle} />
                <ComplianceStat label="Audit Status" value="Clean" status="Verified" color="text-blue-500" icon={FileCheck} />
            </div>

            <Card className="rounded-[24px] border-slate-200/60 overflow-hidden bg-white shadow-sm font-['Inter',_sans-serif]">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100">
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400 py-4 px-6">Requirement</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Due Date</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Status</TableHead>
                            <TableHead className="text-right pr-6 font-bold text-[9px] uppercase tracking-widest text-slate-400">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {statutoryRequirements.map((req) => (
                            <TableRow key={req.id} className="group hover:bg-slate-50 border-slate-50 transition-colors">
                                <TableCell className="py-4 px-6 font-bold text-slate-800">{req.requirement}</TableCell>
                                <TableCell className="text-xs font-medium text-slate-600">{req.deadline}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${req.status === "Compliant" ? "bg-emerald-50 text-emerald-600" :
                                            req.status === "Action Required" ? "bg-amber-50 text-amber-600" :
                                                "bg-rose-50 text-rose-600"
                                        }`}>
                                        {req.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[#6C3EFF] font-bold">File Now</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

function CompanyPoliciesView() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Company Policies</h2>
                <Button className="bg-white border border-[#6C3EFF]/20 text-[#6C3EFF] font-bold hover:bg-[#6C3EFF]/5 h-10 px-6 rounded-xl transition-all">Upload Policy</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialPolicies.map((policy) => (
                    <Card key={policy.id} className="rounded-[24px] border-slate-100 p-6 bg-white shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-[#6C3EFF]">
                                <FileText className="h-5 w-5" />
                            </div>
                            <Badge variant="outline" className={`text-[9px] font-bold ${policy.status === "Active" ? "border-emerald-100 text-emerald-600 bg-emerald-50/30" : "border-amber-100 text-amber-600 bg-amber-50/30"
                                }`}>
                                {policy.status}
                            </Badge>
                        </div>
                        <h3 className="font-bold text-slate-800 mb-1">{policy.title}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">{policy.category}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <span className="text-[10px] text-slate-400">Updated: {policy.lastUpdated}</span>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#6C3EFF]"><Download className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#6C3EFF]"><Eye className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function LegalDocumentationView() {
    return (
        <div className="flex items-center justify-center h-[50vh] text-center">
            <div>
                <Scale className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800">Legal Documentation</h3>
                <p className="text-slate-400 text-sm">Centralized repository for contracts and legal agreements.</p>
            </div>
        </div>
    );
}

function AuditLogsView() {
    return (
        <div className="flex items-center justify-center h-[50vh] text-center">
            <div>
                <Eye className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800">Compliance Audit Logs</h3>
                <p className="text-slate-400 text-sm">Full trail of all compliance and activity changes.</p>
            </div>
        </div>
    );
}

// --- Helper Components ---

function ComplianceStat({ label, value, status, color, icon: Icon }: { label: string; value: string; status: string; color: string; icon: any }) {
    return (
        <Card className="rounded-[24px] border-slate-100 p-6 flex items-center justify-between font-['Inter',_sans-serif] shadow-sm">
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-slate-800">{value}</p>
                    <span className={`text-[10px] font-bold uppercase ${color}`}>{status}</span>
                </div>
            </div>
            <div className={`h-11 w-11 rounded-xl bg-slate-50 flex items-center justify-center ${color}`}>
                <Icon className="h-5 w-5" />
            </div>
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
                                <h3 className="font-bold text-slate-800">Compliance AI</h3>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
                                <X className="h-4 w-4 text-slate-400" />
                            </Button>
                        </div>

                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-6">
                                <div className="flex flex-col items-start px-2">
                                    <div className="bg-slate-100 p-4 rounded-2xl text-[13px] font-medium text-slate-600 leading-relaxed">
                                        I can help you review your internal policies against local regulations or draft new compliance guidelines. How can I assist you today?
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>

                        <div className="p-6 border-t bg-white">
                            <div className="relative">
                                <Input placeholder="Ask about regulations..." className="h-12 pr-12 rounded-xl focus-visible:ring-[#6C3EFF]/20" />
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
