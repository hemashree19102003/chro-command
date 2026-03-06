import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    UserPlus,
    ArrowLeft,
    Briefcase,
    Search,
    Plus,
    Bot,
    MoreHorizontal,
    FileText,
    ShieldCheck,
    UserMinus,
    CheckCircle2,
    Trash2,
    Upload,
    FileSearch,
    CheckSquare,
    Settings,
    Send,
    X,
    Calendar,
    Building2,
    User,
    Mail,
    MapPin,
    Clock
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
type TabId = "offer" | "onboarding" | "verification" | "offboarding";

interface Candidate {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    manager: string;
    salary: string;
    bonus?: string;
    joiningDate: string;
    expiryDate: string;
    employmentType: string;
    workLocation: string;
    status: "Draft" | "Sent" | "Accepted" | "Rejected";
}

interface EmployeeOnboarding {
    id: string;
    name: string;
    role: string;
    joiningDate: string;
    status: "In Progress" | "Completed" | "Pending";
    progress: number;
}

interface VerificationRecord {
    id: string;
    name: string;
    idProof: "Verified" | "Pending" | "Rejected";
    education: "Verified" | "Pending" | "Rejected";
    employment: "Verified" | "Pending" | "Rejected";
    status: "Cleared" | "Flagged" | "In Review";
}

interface OffboardingRecord {
    id: string;
    name: string;
    role: string;
    lastWorkingDay: string;
    status: "Initiated" | "In Progress" | "Completed";
    progress: number;
}

// --- Mock Data ---
const initialCandidates: Candidate[] = [
    { id: "1", name: "Amit Kumar", email: "amit.k@example.com", role: "Product Manager", department: "Product", manager: "Sarah J.", salary: "18", joiningDate: "2024-04-01", expiryDate: "2024-03-20", employmentType: "Full-time", workLocation: "Remote", status: "Sent" },
    { id: "2", name: "Sneha Patel", email: "sneha.p@example.com", role: "Software Engineer", department: "Engineering", manager: "Raj M.", salary: "12", joiningDate: "2024-04-15", expiryDate: "2024-03-25", employmentType: "Full-time", workLocation: "Chennai", status: "Accepted" },
];

const initialOnboarding: EmployeeOnboarding[] = [
    { id: "1", name: "Priya Sharma", role: "Data Scientist", joiningDate: "2024-03-15", status: "In Progress", progress: 65 },
    { id: "2", name: "Vikram Malhotra", role: "Backend Developer", joiningDate: "2024-03-20", status: "Pending", progress: 20 },
];

const initialVerification: VerificationRecord[] = [
    { id: "1", name: "Rahul Verma", idProof: "Verified", education: "Verified", employment: "Pending", status: "In Review" },
    { id: "2", name: "Meera Reddy", idProof: "Verified", education: "Rejected", employment: "Verified", status: "Flagged" },
];

const initialOffboarding: OffboardingRecord[] = [
    { id: "1", name: "Siddharth Jain", role: "Full Stack Developer", lastWorkingDay: "2024-03-31", status: "In Progress", progress: 40 },
];

// --- Reusable Components ---

const AIButton = ({ label, onClick, className }: { label: string; onClick?: () => void; className?: string }) => (
    <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        className={`bg-[#6C3EFF]/5 border-[#6C3EFF]/20 text-[#6C3EFF] hover:bg-[#6C3EFF]/10 hover:text-[#6C3EFF] flex items-center gap-2 font-bold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-sm ${className}`}
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

// --- Sub-Pages/Views ---

export default function OnboardingOffboarding() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabId>("offer");
    const [selectedOnboarding, setSelectedOnboarding] = useState<EmployeeOnboarding | null>(null);
    const [selectedOffboarding, setSelectedOffboarding] = useState<OffboardingRecord | null>(null);
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);
    const [search, setSearch] = useState("");

    const menuItems: { id: TabId; label: string; icon: any }[] = [
        { id: "offer", label: "Offer Management", icon: Briefcase },
        { id: "onboarding", label: "Employee Onboarding", icon: UserPlus },
        { id: "verification", label: "Background Verification", icon: ShieldCheck },
        { id: "offboarding", label: "Employee Offboarding", icon: UserMinus },
    ];

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-['Inter',_sans-serif] text-[#1e293b] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-white flex flex-col shrink-0 h-full z-20">
                <div className="h-16 border-b flex items-center px-6 gap-3 bg-white sticky top-0">
                    <div className="h-8 w-8 rounded-lg bg-[#6C3EFF] flex items-center justify-center shrink-0">
                        <UserPlus className="h-4 w-4 text-white" />
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
                        <p className="px-4 mb-2 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">ONBOARDING</p>
                        <nav className="space-y-1">
                            {menuItems.map((item) => (
                                <SidebarItem
                                    key={item.id}
                                    {...item}
                                    active={activeTab === item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setSelectedOnboarding(null);
                                        setSelectedOffboarding(null);
                                    }}
                                />
                            ))}
                        </nav>
                    </div>

                    <div className="pt-8">
                        <div className="p-6 rounded-[24px] bg-[#6C3EFF] text-white shadow-lg shadow-[#6C3EFF]/20 relative overflow-hidden group">
                            <div className="relative z-10">
                                <Bot className="h-8 w-8 mb-4 text-white/80" />
                                <h3 className="font-bold text-sm mb-1">AI Assistant</h3>
                                <p className="text-[10px] text-white/70 leading-relaxed mb-4">
                                    Need help generating offer letters or checklists? I'm here to help.
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
                            placeholder="Search..."
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
                            key={activeTab + (selectedOnboarding ? "-details" : "") + (selectedOffboarding ? "-offboard" : "")}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="h-full"
                        >
                            {activeTab === "offer" && <OfferManagementView />}
                            {activeTab === "onboarding" && (
                                selectedOnboarding
                                    ? <OnboardingDetailsView employee={selectedOnboarding} onBack={() => setSelectedOnboarding(null)} />
                                    : <OnboardingListView onSelect={setSelectedOnboarding} />
                            )}
                            {activeTab === "verification" && <BackgroundVerificationView />}
                            {activeTab === "offboarding" && (
                                selectedOffboarding
                                    ? <OffboardingChecklistView employee={selectedOffboarding} onBack={() => setSelectedOffboarding(null)} />
                                    : <OffboardingListView onSelect={setSelectedOffboarding} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* AI Assistant Sliding Panel */}
                <AIAssistantPanel isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
            </main>
        </div>
    );
}

// --- Offer Management View ---

function OfferManagementView() {
    const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreateOffer = (newOffer: any) => {
        const candidate: Candidate = {
            ...newOffer,
            id: (candidates.length + 1).toString(),
            status: newOffer._action === "send" ? "Sent" : "Draft",
            salary: newOffer.salary + " LPA"
        };
        setCandidates([...candidates, candidate]);
        setIsModalOpen(false);
        toast.success(candidate.status === "Sent" ? "Offer sent successfully!" : "Draft saved successfully!");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Offer Management</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Manage and track all pending and finalized job offers.</p>
                </div>
                <div className="flex gap-3">
                    <AIButton label="Generate Offer Letter" onClick={() => toast.success("AI is drafting the offer letter...")} />
                    <Button
                        className="bg-[#6C3EFF] hover:bg-[#5a31d6] font-bold shadow-lg shadow-[#6C3EFF]/20 h-10 px-5 text-white rounded-xl"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" /> Create Offer
                    </Button>
                </div>
            </div>

            <Card className="rounded-[24px] border-slate-200/60 overflow-hidden bg-white shadow-sm font-['Inter',_sans-serif]">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100">
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400 py-4 px-6">Candidate Name</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Role</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Salary</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Status</TableHead>
                            <TableHead className="text-right pr-6 font-bold text-[9px] uppercase tracking-widest text-slate-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {candidates.map((c) => (
                            <TableRow key={c.id} className="group hover:bg-slate-50 border-slate-50 transition-colors">
                                <TableCell className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-slate-100 border flex items-center justify-center font-bold text-slate-400 text-xs shadow-sm">
                                            {c.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800">{c.name}</span>
                                            <span className="text-[10px] text-slate-400">{c.email}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm font-medium text-slate-600">
                                    <div className="flex flex-col">
                                        <span>{c.role}</span>
                                        <span className="text-[10px] text-slate-400">{c.department}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm text-slate-500 font-mono">{c.salary}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${c.status === "Accepted" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                            c.status === "Sent" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                                                c.status === "Draft" ? "bg-slate-100 text-slate-500" :
                                                    "bg-rose-50 text-rose-600"
                                        }`}>
                                        {c.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-300">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            <CreateOfferModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateOffer}
            />
        </div>
    );
}

// --- Create Offer Modal ---

function CreateOfferModal({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: (data: any) => void }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "",
        department: "",
        manager: "",
        salary: "",
        bonus: "",
        joiningDate: "",
        expiryDate: "",
        employmentType: "Full-time",
        workLocation: "Office",
    });

    const handleChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl font-['Inter',_sans-serif]">
                <DialogHeader className="p-8 bg-slate-50 border-b relative">
                    <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                        <div className="h-10 w-10 bg-[#6C3EFF] rounded-xl flex items-center justify-center">
                            <FileText className="h-5 w-5 text-white" />
                        </div>
                        Create Job Offer
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium">Draft a new job offer for a selected candidate.</DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[70vh]">
                    <div className="p-8 grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Candidate Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-slate-300" />
                                <Input placeholder="John Doe" className="pl-10 h-11 rounded-xl" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-300" />
                                <Input placeholder="john@example.com" type="email" className="pl-10 h-11 rounded-xl" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Job Role</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-300" />
                                <Input placeholder="UI/UX Designer" className="pl-10 h-11 rounded-xl" value={formData.role} onChange={(e) => handleChange("role", e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Department</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-300" />
                                <Input placeholder="Design" className="pl-10 h-11 rounded-xl" value={formData.department} onChange={(e) => handleChange("department", e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Hiring Manager</label>
                            <Input placeholder="Sarah Johnson" className="h-11 rounded-xl" value={formData.manager} onChange={(e) => handleChange("manager", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Annual Salary (LPA)</label>
                            <Input placeholder="15" type="number" className="h-11 rounded-xl" value={formData.salary} onChange={(e) => handleChange("salary", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Joining Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-300" />
                                <Input type="date" className="pl-10 h-11 rounded-xl" value={formData.joiningDate} onChange={(e) => handleChange("joiningDate", e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Offer Expiry</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-300" />
                                <Input type="date" className="pl-10 h-11 rounded-xl" value={formData.expiryDate} onChange={(e) => handleChange("expiryDate", e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Employment Type</label>
                            <Select onValueChange={(v) => handleChange("employmentType", v)} defaultValue="Full-time">
                                <SelectTrigger className="h-11 rounded-xl">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Full-time">Full-time</SelectItem>
                                    <SelectItem value="Contract">Contract</SelectItem>
                                    <SelectItem value="Internship">Internship</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Work Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-300" />
                                <Input placeholder="Chennai / Remote" className="pl-10 h-11 rounded-xl" value={formData.workLocation} onChange={(e) => handleChange("workLocation", e.target.value)} />
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="p-8 bg-slate-50 border-t flex items-center justify-between">
                    <Button variant="ghost" onClick={onClose} className="font-bold text-slate-500 h-11 px-6 rounded-xl">Cancel</Button>
                    <div className="flex gap-3">
                        <Button variant="outline" className="font-bold border-slate-200 h-11 px-6 rounded-xl text-slate-600" onClick={() => onSubmit({ ...formData, _action: "draft" })}>Save Draft</Button>
                        <Button className="bg-[#6C3EFF] hover:bg-[#5a31d6] font-bold h-11 px-8 rounded-xl shadow-lg shadow-[#6C3EFF]/20" onClick={() => onSubmit({ ...formData, _action: "send" })}>Send Offer</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// --- Onboarding Views ---

function OnboardingListView({ onSelect }: { onSelect: (e: EmployeeOnboarding) => void }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Employee Onboarding</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Track onboarding progress for new employees.</p>
                </div>
                <Button className="bg-[#6C3EFF] hover:bg-[#5a31d6] font-bold shadow-lg shadow-[#6C3EFF]/20 h-10 px-6 text-white rounded-xl">
                    Start Onboarding
                </Button>
            </div>

            <Card className="rounded-[24px] border-slate-200/60 overflow-hidden bg-white shadow-sm font-['Inter',_sans-serif]">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100">
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400 py-4 px-6">Employee Name</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Role</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Joining Date</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Progress</TableHead>
                            <TableHead className="text-right pr-6 font-bold text-[9px] uppercase tracking-widest text-slate-400">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialOnboarding.map((e) => (
                            <TableRow
                                key={e.id}
                                className="group cursor-pointer hover:bg-slate-50 border-slate-50 transition-all"
                                onClick={() => onSelect(e)}
                            >
                                <TableCell className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-slate-100 border flex items-center justify-center font-bold text-slate-400 text-xs group-hover:bg-white group-hover:text-[#6C3EFF] transition-all">
                                            {e.name.split(" ").map(n => n[0]).join("")}
                                        </div>
                                        <span className="font-bold text-slate-800">{e.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm font-medium text-slate-600">{e.role}</TableCell>
                                <TableCell className="text-sm text-slate-500">{e.joiningDate}</TableCell>
                                <TableCell className="w-[180px]">
                                    <div className="flex items-center gap-3">
                                        <Progress value={e.progress} className="h-1.5 flex-1 bg-slate-100" />
                                        <span className="text-[10px] font-bold text-[#6C3EFF]">{e.progress}%</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${e.status === "Completed" ? "bg-emerald-50 text-emerald-600" :
                                            e.status === "In Progress" ? "bg-amber-50 text-amber-600" :
                                                "bg-slate-100 text-slate-400"
                                        }`}>
                                        {e.status}
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

function OnboardingDetailsView({ employee, onBack }: { employee: EmployeeOnboarding, onBack: () => void }) {
    const [tasks, setTasks] = useState([
        { title: "Create company email", done: true },
        { title: "Provide laptop", done: true },
        { title: "Slack account setup", done: false },
        { title: "HR orientation meeting", done: false },
        { title: "Team introduction", done: false },
    ]);

    const toggleTask = (index: number) => {
        const newTasks = [...tasks];
        newTasks[index].done = !newTasks[index].done;
        setTasks(newTasks);
    };

    return (
        <div className="space-y-6 font-['Inter',_sans-serif]">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-[#6C3EFF] transition-all uppercase tracking-widest group"
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to List
            </button>

            <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-3xl font-bold">
                        {employee.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{employee.name}</h1>
                        <p className="text-[#6C3EFF] font-bold text-sm uppercase tracking-widest mt-1">{employee.role}</p>
                    </div>
                </div>
                <AIButton label="Generate Onboarding Checklist (AI)" onClick={() => toast.success("AI has refreshed your checklist with specialized tasks!")} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-2 rounded-[32px] border-slate-100 bg-white p-8">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <CheckSquare className="h-5 w-5 text-[#6C3EFF]" />
                        Onboarding Checklist
                    </h3>
                    <div className="space-y-4">
                        {tasks.map((task, idx) => (
                            <div
                                key={idx}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer
                  ${task.done ? "bg-slate-50/50 border-transparent opacity-60" : "bg-white border-slate-100 hover:border-[#6C3EFF]/30 hover:shadow-sm"}
                `}
                                onClick={() => toggleTask(idx)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center
                    ${task.done ? "bg-[#6C3EFF] border-[#6C3EFF] text-white" : "border-slate-200"}
                  `}>
                                        {task.done && <CheckSquare className="h-4 w-4" />}
                                    </div>
                                    <span className={`font-bold text-sm ${task.done ? "text-slate-400 line-through" : "text-slate-700"}`}>
                                        {task.title}
                                    </span>
                                </div>
                                {!task.done && <Button size="sm" variant="ghost" className="text-[10px] font-bold text-[#6C3EFF] h-8 px-3 rounded-lg hover:bg-[#6C3EFF]/5">Mark Done</Button>}
                            </div>
                        ))}
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card className="rounded-[32px] border-slate-100 bg-[#6C3EFF] p-6 text-white shadow-lg shadow-[#6C3EFF]/20">
                        <h4 className="font-bold text-sm mb-4">Onboarding Progress</h4>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-white/70 uppercase">Completed</span>
                            <span className="font-bold text-lg">{tasks.filter(t => t.done).length}/{tasks.length}</span>
                        </div>
                        <Progress value={(tasks.filter(t => t.done).length / tasks.length) * 100} className="h-2 bg-white/20" />
                    </Card>

                    <Card className="rounded-[32px] border-slate-100 bg-white p-6 shadow-sm">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Key Dates</h4>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-slate-300" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">Joining Date</span>
                                    <span className="text-xs font-bold text-slate-700">{employee.joiningDate}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// --- Background Verification View ---

function BackgroundVerificationView() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Background Verification</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Manage and track verification status for all new hires.</p>
                </div>
                <AIButton label="AI Document Summary" onClick={() => toast.success("AI is analyzing verification documents...")} />
            </div>

            <Card className="rounded-[24px] border-slate-200/60 overflow-hidden bg-white shadow-sm font-['Inter',_sans-serif]">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100">
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400 py-4 px-6">Employee Name</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">ID Proof</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Education</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Employment</TableHead>
                            <TableHead className="text-right pr-6 font-bold text-[9px] uppercase tracking-widest text-slate-400">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialVerification.map((rec) => (
                            <TableRow key={rec.id} className="group hover:bg-slate-50 border-slate-50 transition-colors">
                                <TableCell className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-slate-100 border flex items-center justify-center font-bold text-slate-400 text-xs shadow-sm">
                                            {rec.name.charAt(0)}
                                        </div>
                                        <span className="font-bold text-slate-800">{rec.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <VerificationBadge status={rec.idProof} label="ID Proof" />
                                </TableCell>
                                <TableCell>
                                    <VerificationBadge status={rec.education} label="Degree" />
                                </TableCell>
                                <TableCell>
                                    <VerificationBadge status={rec.employment} label="Exp Letter" />
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${rec.status === "Cleared" ? "bg-emerald-50 text-emerald-600" :
                                            rec.status === "Flagged" ? "bg-rose-50 text-rose-600" :
                                                "bg-amber-50 text-amber-600"
                                        }`}>
                                        {rec.status}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <UploadSection title="ID Proof" description="Aadhar, PAN or Passport" />
                <UploadSection title="Degree Certificate" description="Final degree or provisional" />
                <UploadSection title="Previous Company Letter" description="Relieving / Experience letter" />
            </div>
        </div>
    );
}

function VerificationBadge({ status, label }: { status: string; label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${status === "Verified" ? "bg-emerald-500" :
                    status === "Rejected" ? "bg-rose-500" :
                        "bg-amber-500"
                }`} />
            <span className="text-[11px] font-bold text-slate-700">{label}</span>
            <Upload className="h-3 w-3 text-slate-300 ml-1 cursor-pointer hover:text-[#6C3EFF]" />
        </div>
    );
}

function UploadSection({ title, description }: { title: string; description: string }) {
    return (
        <Card className="rounded-[32px] border-dashed border-2 border-slate-200 p-6 flex flex-col items-center justify-center text-center hover:bg-[#6C3EFF]/5 hover:border-[#6C3EFF]/50 transition-all cursor-pointer font-['Inter',_sans-serif]">
            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <Upload className="h-5 w-5 text-slate-400" />
            </div>
            <h4 className="font-bold text-sm text-slate-800">{title}</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">{description}</p>
        </Card>
    );
}

// --- Offboarding View ---

function OffboardingListView({ onSelect }: { onSelect: (e: OffboardingRecord) => void }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Employee Offboarding</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Manage and track employee exit processes.</p>
                </div>
                <Button className="bg-rose-500 hover:bg-rose-600 font-bold shadow-lg shadow-rose-100 h-10 px-6 text-white rounded-xl">
                    Start Offboarding
                </Button>
            </div>

            <Card className="rounded-[24px] border-slate-200/60 overflow-hidden bg-white shadow-sm font-['Inter',_sans-serif]">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100">
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400 py-4 px-6">Employee Name</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Last Working Day</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Progress</TableHead>
                            <TableHead className="text-right pr-6 font-bold text-[9px] uppercase tracking-widest text-slate-400">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialOffboarding.map((record) => (
                            <TableRow
                                key={record.id}
                                className="group cursor-pointer hover:bg-slate-50 border-slate-50 transition-all"
                                onClick={() => onSelect(record)}
                            >
                                <TableCell className="py-4 px-6 font-bold text-slate-800">{record.name}</TableCell>
                                <TableCell className="text-sm text-slate-500 font-medium">{record.lastWorkingDay}</TableCell>
                                <TableCell className="w-[180px]">
                                    <div className="flex items-center gap-3">
                                        <Progress value={record.progress} className="h-1.5 flex-1 bg-slate-100" />
                                        <span className="text-[10px] font-bold text-rose-500">{record.progress}%</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${record.status === "Completed" ? "bg-emerald-50 text-emerald-600" :
                                            record.status === "In Progress" ? "bg-amber-50 text-amber-600" :
                                                "bg-rose-50 text-rose-500"
                                        }`}>
                                        {record.status}
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

function OffboardingChecklistView({ employee, onBack }: { employee: OffboardingRecord, onBack: () => void }) {
    const [tasks, setTasks] = useState([
        { title: "Laptop return", done: true },
        { title: "Email account deactivation", done: true },
        { title: "Access revocation", done: false },
        { title: "Exit interview", done: false },
        { title: "Final payroll settlement", done: false },
    ]);

    return (
        <div className="space-y-6 font-['Inter',_sans-serif]">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-all uppercase tracking-widest group"
            >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to List
            </button>

            <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-rose-500 flex items-center justify-center text-white text-2xl font-bold">
                        {employee.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{employee.name}</h1>
                        <p className="text-rose-500 font-bold text-xs uppercase tracking-widest mt-1">Offboarding in progress</p>
                    </div>
                </div>
                <AIButton label="Generate Offboarding Checklist" onClick={() => toast.success("AI has generated specialized clearance tasks!")} />
            </div>

            <Card className="rounded-[32px] border-slate-100 bg-white p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-6 font-['Inter',_sans-serif]">Exit Clearance Tasks</h3>
                <div className="space-y-4">
                    {tasks.map((task, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center ${task.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200"}`}>
                                    {task.done && <CheckCircle2 className="h-4 w-4" />}
                                </div>
                                <span className={`font-bold text-sm ${task.done ? "text-slate-400 line-through" : "text-slate-700"}`}>
                                    {task.title}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

// --- AI Assistant Panel (Drawer) ---

function AIAssistantPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [messages, setMessages] = useState([
        { role: "assistant", text: "Hi! I can help with HR tasks like generating offer letters, creating onboarding checklists, drafting HR emails, or explaining policies." }
    ]);
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages([...messages, { role: "user", text: input }]);
        setInput("");
        setTimeout(() => {
            setMessages(prev => [...prev, { role: "assistant", text: "I'm processing your request using AI analysis. Please hold on a moment..." }]);
        }, 600);
    };

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
                        <div className="p-6 border-b flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-[#6C3EFF] rounded-lg flex items-center justify-center">
                                    <Bot className="h-4 w-4 text-white" />
                                </div>
                                <h3 className="font-bold text-slate-800">AI HR Assistant</h3>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 hover:bg-slate-100">
                                <X className="h-4 w-4 text-slate-400" />
                            </Button>
                        </div>

                        <ScrollArea className="flex-1 p-6 space-y-6">
                            <div className="space-y-6">
                                {messages.map((m, i) => (
                                    <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                                        <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] font-medium leading-relaxed
                      ${m.role === "user" ? "bg-[#6C3EFF] text-white" : "bg-slate-100 text-slate-700"}
                    `}>
                                            {m.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="p-6 border-t bg-white">
                            <div className="relative flex items-center">
                                <Input
                                    placeholder="Ask me anything..."
                                    className="h-12 pr-12 rounded-xl focus-visible:ring-[#6C3EFF]/20 border-slate-200 shadow-sm"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                />
                                <Button
                                    size="icon"
                                    className="absolute right-1 w-10 h-10 bg-[#6C3EFF] hover:bg-[#5a31d6] rounded-lg transition-all"
                                    onClick={handleSend}
                                >
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
