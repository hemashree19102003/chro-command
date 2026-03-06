import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Zap,
    ArrowLeft,
    BookOpen,
    Search,
    Plus,
    Bot,
    MoreHorizontal,
    Award,
    Users,
    PlayCircle,
    Clock,
    CheckCircle2,
    FileText,
    Settings,
    Send,
    X,
    Target,
    GraduationCap
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
type TabId = "courses" | "skills" | "certifications" | "succession";

interface Course {
    id: string;
    title: string;
    category: string;
    enrolled: number;
    duration: string;
    rating: string;
}

interface Skill {
    id: string;
    employee: string;
    skill: string;
    level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
    lastAssessed: string;
}

// --- Mock Data ---
const initialCourses: Course[] = [
    { id: "1", title: "Advanced React Patterns", category: "Engineering", enrolled: 45, duration: "6h 30m", rating: "4.9" },
    { id: "2", title: "Product Management 101", category: "Product", enrolled: 28, duration: "4h 15m", rating: "4.7" },
    { id: "3", title: "Leadership Excellence", category: "Management", enrolled: 12, duration: "8h 00m", rating: "4.8" },
];

const initialSkills: Skill[] = [
    { id: "1", employee: "Amit Kumar", skill: "TypeScript", level: "Advanced", lastAssessed: "2024-01-15" },
    { id: "2", employee: "Sneha Patel", skill: "UI Design", level: "Expert", lastAssessed: "2024-02-10" },
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

export default function TrainingDevelopment() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabId>("courses");
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);
    const [search, setSearch] = useState("");

    const menuItems: { id: TabId; label: string; icon: any }[] = [
        { id: "courses", label: "Learning Management", icon: BookOpen },
        { id: "skills", label: "Skills Assessment", icon: Target },
        { id: "certifications", label: "Certifications", icon: Award },
        { id: "succession", label: "Succession Planning", icon: Users },
    ];

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-['Inter',_sans-serif] text-[#1e293b] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-white flex flex-col shrink-0 h-full z-20">
                <div className="h-16 border-b flex items-center px-6 gap-3 bg-white sticky top-0">
                    <div className="h-8 w-8 rounded-lg bg-[#6C3EFF] flex items-center justify-center shrink-0">
                        <Zap className="h-4 w-4 text-white" />
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
                        <p className="px-4 mb-2 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">TRAINING</p>
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
                                <h3 className="font-bold text-sm mb-1">Learning AI</h3>
                                <p className="text-[10px] text-white/70 leading-relaxed mb-4">
                                    Let AI recommend courses based on skill gaps and career paths.
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
                            placeholder="Search courses or skills..."
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
                            {activeTab === "courses" && <LearningManagementView />}
                            {activeTab === "skills" && <SkillsAssessmentView />}
                            {activeTab === "certifications" && <CertificationsView />}
                            {activeTab === "succession" && <SuccessionPlanningView />}
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

function LearningManagementView() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Learning Management</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Manage external and internal training courses for your team.</p>
                </div>
                <div className="flex gap-3">
                    <AIButton label="Course Recommender" onClick={() => toast.success("AI is identifying relevant courses for your team...")} />
                    <Button className="bg-[#6C3EFF] hover:bg-[#5a31d6] font-bold shadow-lg shadow-[#6C3EFF]/20 h-10 px-5 text-white rounded-xl">
                        <Plus className="h-4 w-4 mr-2" /> Add Course
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {initialCourses.map((course) => (
                    <Card key={course.id} className="rounded-[32px] border-slate-100 p-8 bg-white shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-6">
                            <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#6C3EFF]">
                                <PlayCircle className="h-6 w-6" />
                            </div>
                            <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">{course.rating} ★</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">{course.title}</h3>
                        <p className="text-[10px] text-[#6C3EFF] font-bold uppercase tracking-widest mb-6">{course.category}</p>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center gap-2">
                                <Users className="h-3.5 w-3.5 text-slate-300" />
                                <span className="text-[11px] font-bold text-slate-500">{course.enrolled} Enrolled</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5 text-slate-300" />
                                <span className="text-[11px] font-bold text-slate-500">{course.duration}</span>
                            </div>
                        </div>
                        <Button className="w-full bg-slate-900 h-10 font-bold rounded-xl text-white">Manage Course</Button>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function SkillsAssessmentView() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Skills Assessment</h2>
            <Card className="rounded-[24px] border-slate-200/60 overflow-hidden bg-white shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100">
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400 py-4 px-6">Employee</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Skill</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Level</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Last Assessed</TableHead>
                            <TableHead className="text-right pr-6 font-bold text-[9px] uppercase tracking-widest text-slate-400">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialSkills.map((skill) => (
                            <TableRow key={skill.id} className="group hover:bg-slate-50 border-slate-50 transition-colors">
                                <TableCell className="py-4 px-6 font-bold text-slate-800">{skill.employee}</TableCell>
                                <TableCell className="text-sm font-medium text-slate-600">{skill.skill}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${skill.level === "Expert" ? "bg-purple-50 text-purple-600" :
                                            skill.level === "Advanced" ? "bg-blue-50 text-blue-600" :
                                                "bg-slate-100 text-slate-400"
                                        }`}>
                                        {skill.level}
                                    </span>
                                </TableCell>
                                <TableCell className="text-xs text-slate-500">{skill.lastAssessed}</TableCell>
                                <TableCell className="text-right pr-6">
                                    <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[#6C3EFF] font-bold">Re-assess</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

function CertificationsView() {
    return (
        <div className="flex items-center justify-center h-[50vh] text-center">
            <div>
                <GraduationCap className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800">Certifications Center</h3>
                <p className="text-slate-400 text-sm">Validating and storing professional certificates.</p>
            </div>
        </div>
    );
}

function SuccessionPlanningView() {
    return (
        <div className="flex items-center justify-center h-[50vh] text-center">
            <div>
                <Users className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800">Succession Planning</h3>
                <p className="text-slate-400 text-sm">Identifying future leaders and career progressions.</p>
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
                                <h3 className="font-bold text-slate-800">Learning AI</h3>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
                                <X className="h-4 w-4 text-slate-400" />
                            </Button>
                        </div>

                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-6">
                                <div className="flex flex-col items-start px-2">
                                    <div className="bg-slate-100 p-4 rounded-2xl text-[13px] font-medium text-slate-600 leading-relaxed">
                                        I can analyze your workforce skills and suggest training paths to fill competency gaps. Would you like a skill gap report?
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>

                        <div className="p-6 border-t bg-white">
                            <div className="relative">
                                <Input placeholder="Ask about team skills..." className="h-12 pr-12 rounded-xl focus-visible:ring-[#6C3EFF]/20" />
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
