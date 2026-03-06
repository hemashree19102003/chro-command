import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Clock,
    ArrowLeft,
    Calendar,
    Search,
    Plus,
    Bot,
    MoreHorizontal,
    FileText,
    UserPlus,
    CheckCircle2,
    AlertCircle,
    Home,
    MapPin,
    Settings,
    Send,
    X,
    History,
    Timer,
    ChevronRight,
    ArrowRight,
    Users,
    Sun,
    Moon
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
import * as XLSX from 'xlsx';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

// --- Types ---
type TabId = "attendance" | "leave" | "wfh" | "shifts" | "myleaves" | "mywfh";
type UserRole = "none" | "admin" | "employee";

interface AttendanceRecord {
    id: string;
    name: string;
    status: "On Time" | "Late" | "Absent" | "WFH";
    checkIn: string;
    checkOut: string;
    hours: string;
}

interface Shift {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    breakDuration: string;
    department: string;
}

interface EmployeeShift {
    employeeName: string;
    department: string;
    shifts: { [key: string]: string };
    status: "Assigned" | "Unassigned" | "Pending";
}

interface ShiftChangeRequest {
    id: string;
    employeeName: string;
    currentShift: string;
    requestedShift: string;
    reason: string;
    status: "Pending" | "Approved" | "Rejected";
}

interface WFHRequest {
    id: string;
    employeeName: string;
    department: string;
    date: string;
    reason: string;
    manager: string;
    workPlan?: string;
    status: "Pending" | "Approved" | "Rejected";
    actionedBy?: string;
    actionedAt?: string;
}

interface LeaveRequest {
    id: string;
    employeeName: string;
    type: "Sick" | "Casual" | "Earned" | "Comp-off";
    dates: string;
    reason: string;
    status: "Pending" | "Approved" | "Rejected";
}

interface LeaveBalance {
    type: string;
    total: number;
    used: number;
    available: number;
}

// --- Mock Data ---
const initialAttendanceData: AttendanceRecord[] = [
    { id: "1", name: "Amit Kumar", status: "On Time", checkIn: "08:55 AM", checkOut: "06:15 PM", hours: "9h 20m" },
    { id: "2", name: "Sneha Patel", status: "Late", checkIn: "09:45 AM", checkOut: "07:00 PM", hours: "9h 15m" },
    { id: "3", name: "Rohan Singh", status: "WFH", checkIn: "09:00 AM", checkOut: "--", hours: "7h 30m" },
    { id: "4", name: "Priya Sharma", status: "Absent", checkIn: "--", checkOut: "--", hours: "0h" },
];

const initialLeaveRequests: LeaveRequest[] = [
    { id: "1", employeeName: "Vikram Malhotra", type: "Sick", dates: "Mar 10 - Mar 11", reason: "Viral Fever", status: "Pending" },
    { id: "2", employeeName: "Ananya Iyer", type: "Earned", dates: "Mar 20 - Mar 25", reason: "Family Vacation", status: "Approved" },
];

const employeeLeaveBalance: LeaveBalance[] = [
    { type: "Sick Leave", total: 12, used: 2, available: 10 },
    { type: "Casual Leave", total: 15, used: 4, available: 11 },
    { type: "Earned Leave", total: 24, used: 8, available: 16 },
];

const employeeLeaveHistory: LeaveRequest[] = [
    { id: "101", employeeName: "Rishi", type: "Sick", dates: "Feb 15 - Feb 16", reason: "Fever", status: "Approved" },
    { id: "102", employeeName: "Rishi", type: "Casual", dates: "Jan 10 - Jan 10", reason: "Personal work", status: "Approved" },
];

const initialWFHRequests: WFHRequest[] = [
    { id: "w1", employeeName: "Arjun Mehta", department: "Engineering", date: "2026-03-08", reason: "Home maintenance", manager: "Sarah Connor", status: "Pending" },
    { id: "w2", employeeName: "Rishi", department: "Design", date: "2026-03-05", reason: "Focus work", manager: "Sarah Connor", status: "Approved", actionedBy: "Sarah Connor", actionedAt: "2026-03-04 11:30 AM" },
    { id: "w3", employeeName: "Priya Sharma", department: "Marketing", date: "2026-03-07", reason: "Personal reasons", manager: "Vikram Shah", status: "Rejected", actionedBy: "Vikram Shah", actionedAt: "2026-03-06 09:15 AM" },
];

const initialShifts: Shift[] = [
    { id: "s1", name: "Morning Shift", startTime: "09:00 AM", endTime: "06:00 PM", breakDuration: "1 Hour", department: "All" },
    { id: "s2", name: "Evening Shift", startTime: "02:00 PM", endTime: "10:00 PM", breakDuration: "1 Hour", department: "Engineering" },
    { id: "s3", name: "Night Shift", startTime: "10:00 PM", endTime: "06:00 AM", breakDuration: "1 Hour", department: "Security" },
];

const initialEmployeeShifts: EmployeeShift[] = [
    {
        employeeName: "Rishi",
        department: "Design",
        shifts: { "Monday": "s1", "Tuesday": "s1", "Wednesday": "s2", "Thursday": "s1", "Friday": "s1" },
        status: "Assigned"
    },
    {
        employeeName: "Amit Kumar",
        department: "Engineering",
        shifts: { "Monday": "s1", "Tuesday": "s1", "Wednesday": "s1", "Thursday": "s1", "Friday": "s1" },
        status: "Unassigned"
    }
];

const mockEmployees = [
    { name: "Rishi", dept: "Design" },
    { name: "Rohan Singh", dept: "Engineering" },
    { name: "Rahul Sharma", dept: "Marketing" },
    { name: "Arjun Mehta", dept: "Engineering" },
    { name: "Sneha Patel", dept: "HR" },
    { name: "Priya Sharma", dept: "Marketing" },
    { name: "Amit Kumar", dept: "Engineering" },
    { name: "Vikram Malhotra", dept: "Sales" },
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

export default function AttendanceLeave() {
    const navigate = useNavigate();
    const [role, setRole] = useState<UserRole>("none");
    const [activeTab, setActiveTab] = useState<TabId>("attendance");
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);
    const [search, setSearch] = useState("");

    // State for mock interactions with localStorage persistence
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
        const saved = localStorage.getItem("hr_attendance_records");
        return saved ? JSON.parse(saved) : initialAttendanceData;
    });
    const [leaveReqs, setLeaveReqs] = useState<LeaveRequest[]>(() => {
        const saved = localStorage.getItem("hr_leave_requests");
        return saved ? JSON.parse(saved) : [...initialLeaveRequests, ...employeeLeaveHistory];
    });
    const [wfhReqs, setWfhReqs] = useState<WFHRequest[]>(() => {
        const saved = localStorage.getItem("hr_wfh_requests");
        return saved ? JSON.parse(saved) : initialWFHRequests;
    });
    const [shifts, setShifts] = useState<Shift[]>(() => {
        const saved = localStorage.getItem("hr_available_shifts");
        return saved ? JSON.parse(saved) : initialShifts;
    });
    const [employeeShifts, setEmployeeShifts] = useState<EmployeeShift[]>(() => {
        const saved = localStorage.getItem("hr_employee_shifts");
        return saved ? JSON.parse(saved) : initialEmployeeShifts;
    });
    const [shiftChangeRequests, setShiftChangeRequests] = useState<ShiftChangeRequest[]>(() => {
        const saved = localStorage.getItem("hr_shift_change_requests");
        return saved ? JSON.parse(saved) : [];
    });
    const [checkInTime, setCheckInTime] = useState<string | null>(() => localStorage.getItem("hr_checkin_time"));
    const [checkOutTime, setCheckOutTime] = useState<string | null>(() => localStorage.getItem("hr_checkout_time"));

    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [isWFHModalOpen, setIsWFHModalOpen] = useState(false);
    const [isShiftCreateModalOpen, setIsShiftCreateModalOpen] = useState(false);
    const [isShiftChangeModalOpen, setIsShiftChangeModalOpen] = useState(false);

    // Sync state to localStorage
    useEffect(() => {
        localStorage.setItem("hr_attendance_records", JSON.stringify(attendanceRecords));
    }, [attendanceRecords]);

    useEffect(() => {
        localStorage.setItem("hr_leave_requests", JSON.stringify(leaveReqs));
    }, [leaveReqs]);

    useEffect(() => {
        localStorage.setItem("hr_wfh_requests", JSON.stringify(wfhReqs));
    }, [wfhReqs]);

    useEffect(() => {
        localStorage.setItem("hr_available_shifts", JSON.stringify(shifts));
    }, [shifts]);

    useEffect(() => {
        localStorage.setItem("hr_employee_shifts", JSON.stringify(employeeShifts));
    }, [employeeShifts]);

    useEffect(() => {
        localStorage.setItem("hr_shift_change_requests", JSON.stringify(shiftChangeRequests));
    }, [shiftChangeRequests]);

    useEffect(() => {
        if (checkInTime) localStorage.setItem("hr_checkin_time", checkInTime);
        else localStorage.removeItem("hr_checkin_time");
    }, [checkInTime]);

    useEffect(() => {
        if (checkOutTime) localStorage.setItem("hr_checkout_time", checkOutTime);
        else localStorage.removeItem("hr_checkout_time");
    }, [checkOutTime]);

    const handleLogout = () => {
        setRole("none");
    };

    const handleLogin = (selectedRole: UserRole) => {
        setRole(selectedRole);
        setActiveTab("attendance");
    };

    if (role === "none") {
        return <LoginView onLogin={handleLogin} />;
    }

    const menuItems: { id: TabId; label: string; icon: any }[] = role === "admin" ? [
        { id: "attendance", label: "Attendance Overview", icon: Clock },
        { id: "leave", label: "Leave Requests", icon: Calendar },
        { id: "wfh", label: "WFH Requests", icon: Home },
        { id: "shifts", label: "Shift Schedule", icon: Timer },
    ] : [
        { id: "attendance", label: "My Attendance", icon: Clock },
        { id: "myleaves", label: "My Leaves", icon: Calendar },
        { id: "mywfh", label: "WFH Requests", icon: Home },
        { id: "shifts", label: "My Shift Schedule", icon: Timer },
    ];

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-['Inter',_sans-serif] text-[#1e293b] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-white flex flex-col shrink-0 h-full z-20">
                <div className="h-16 border-b flex items-center px-6 gap-3 bg-white sticky top-0">
                    <div className="h-8 w-8 rounded-lg bg-[#6C3EFF] flex items-center justify-center shrink-0">
                        <Clock className="h-4 w-4 text-white" />
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
                        <p className="px-4 mb-2 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">ATTENDANCE</p>
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
                                <h3 className="font-bold text-sm mb-1">Attendance AI</h3>
                                <p className="text-[10px] text-white/70 leading-relaxed mb-4">
                                    Need an analysis of attendance trends? I'm here to help.
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
                            placeholder="Search employee attendance..."
                            className="border-none bg-transparent h-10 shadow-none focus-visible:ring-0 text-sm font-medium w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-[#6C3EFF]/10 flex items-center justify-center font-bold text-[10px] text-[#6C3EFF] border border-[#6C3EFF]/20">
                                {role === "admin" ? "AD" : "RI"}
                            </div>
                            <div className="hidden md:block">
                                <p className="text-xs font-bold leading-none">
                                    {role === "admin" ? "Admin User" : "Rishi"}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase">
                                    {role === "admin" ? "HR Manager" : "Product Designer"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 pr-4 border-r mr-2">
                            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-rose-500 font-bold text-xs gap-2">
                                <ArrowLeft className="h-3.5 w-3.5" /> Logout
                            </Button>
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
                            {role === "admin" ? (
                                <>
                                    {activeTab === "attendance" && <AttendanceOverviewView attendanceData={attendanceRecords} />}
                                    {activeTab === "leave" && <LeaveRequestsView leaveRequests={leaveReqs} setLeaveRequests={setLeaveReqs} />}
                                    {activeTab === "wfh" && <WFHRequestsPortal role="admin" wfhReqs={wfhReqs} setWfhReqs={setWfhReqs} onOpenModal={() => setIsWFHModalOpen(true)} />}
                                    {activeTab === "shifts" && (
                                        <ShiftSchedulePortal
                                            role={role}
                                            shifts={shifts}
                                            employeeShifts={employeeShifts}
                                            setEmployeeShifts={setEmployeeShifts}
                                            shiftChangeRequests={shiftChangeRequests}
                                            setShiftChangeRequests={setShiftChangeRequests}
                                            onOpenShiftCreate={() => setIsShiftCreateModalOpen(true)}
                                            onOpenShiftChange={() => setIsShiftChangeModalOpen(true)}
                                        />
                                    )}
                                </>
                            ) : (
                                <>
                                    {activeTab === "attendance" && (
                                        <EmployeeAttendanceView
                                            checkInTime={checkInTime}
                                            checkOutTime={checkOutTime}
                                            onCheckIn={() => {
                                                const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                setCheckInTime(time);
                                                // Create a record in HR view immediately
                                                const newRecord: AttendanceRecord = {
                                                    id: "temp-rishi",
                                                    name: "Rishi",
                                                    status: "On Time",
                                                    checkIn: time,
                                                    checkOut: "--",
                                                    hours: "Working..."
                                                };
                                                setAttendanceRecords(prev => {
                                                    const filtered = prev.filter(r => r.id !== "temp-rishi");
                                                    return [newRecord, ...filtered];
                                                });
                                            }}
                                            onOpenLeaveModal={() => setIsLeaveModalOpen(true)}
                                            onCheckOut={() => {
                                                const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                setCheckOutTime(time);
                                                // Update HR record with checkout time
                                                setAttendanceRecords(prev => prev.map(rec =>
                                                    rec.id === "temp-rishi"
                                                        ? { ...rec, checkOut: time, hours: "8h 15m" }
                                                        : rec
                                                ));
                                            }}
                                        />
                                    )}
                                    {activeTab === "myleaves" && (
                                        <MyLeavesView
                                            leaveHistory={leaveReqs.filter(l => l.employeeName === "Rishi")}
                                            onOpenLeaveModal={() => setIsLeaveModalOpen(true)}
                                        />
                                    )}
                                    {activeTab === "mywfh" && (
                                        <WFHRequestsPortal
                                            role="employee"
                                            wfhReqs={wfhReqs.filter(r => r.employeeName === "Rishi")}
                                            setWfhReqs={setWfhReqs}
                                            onOpenModal={() => setIsWFHModalOpen(true)}
                                        />
                                    )}
                                    {activeTab === "shifts" && (
                                        <ShiftSchedulePortal
                                            role="employee"
                                            shifts={shifts}
                                            employeeShifts={employeeShifts}
                                            setEmployeeShifts={setEmployeeShifts}
                                            shiftChangeRequests={shiftChangeRequests}
                                            setShiftChangeRequests={setShiftChangeRequests}
                                            onOpenShiftCreate={() => setIsShiftCreateModalOpen(true)}
                                            onOpenShiftChange={() => setIsShiftChangeModalOpen(true)}
                                        />
                                    )}
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Modals & Panels */}
                <AIAssistantPanel isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
                <LeaveRequestModal
                    isOpen={isLeaveModalOpen}
                    onClose={() => setIsLeaveModalOpen(false)}
                    onSubmit={(newLeave) => {
                        const leave: LeaveRequest = {
                            id: (leaveReqs.length + 101).toString(),
                            employeeName: "Rishi",
                            ...newLeave,
                            status: "Pending"
                        };
                        setLeaveReqs(prev => [leave, ...prev]);
                        toast.success("Leave request submitted successfully!");
                        setIsLeaveModalOpen(false);
                    }}
                />
                <WFHRequestModal
                    isOpen={isWFHModalOpen}
                    onClose={() => setIsWFHModalOpen(false)}
                    onSubmit={(newWfh) => {
                        const request: WFHRequest = {
                            id: (wfhReqs.length + 1).toString(),
                            employeeName: "Rishi",
                            department: "Design",
                            status: "Pending",
                            ...newWfh
                        };
                        setWfhReqs(prev => [request, ...prev]);
                        toast.success("WFH request submitted successfully!");
                        setIsWFHModalOpen(false);
                    }}
                />
                <ShiftCreateModal
                    isOpen={isShiftCreateModalOpen}
                    onClose={() => setIsShiftCreateModalOpen(false)}
                    onSubmit={(newAssign) => {
                        const empName = (newAssign as any).employeeName;
                        const shiftId = (newAssign as any).shiftId;
                        const dept = (newAssign as any).department;
                        const newShifts = {
                            "Monday": shiftId, "Tuesday": shiftId,
                            "Wednesday": shiftId, "Thursday": shiftId, "Friday": shiftId
                        };
                        setEmployeeShifts(prev => {
                            const existingIdx = prev.findIndex(e => e.employeeName === empName);
                            if (existingIdx !== -1) {
                                // Update existing entry (upsert)
                                const updated = [...prev];
                                updated[existingIdx] = {
                                    ...updated[existingIdx],
                                    department: dept,
                                    shifts: newShifts,
                                    status: "Unassigned"
                                };
                                return updated;
                            } else {
                                // Insert new entry
                                return [{ employeeName: empName, department: dept, shifts: newShifts, status: "Unassigned" }, ...prev];
                            }
                        });
                        toast.success(`Shift configuration for ${empName} saved. Ready for assignment.`);
                        setIsShiftCreateModalOpen(false);
                    }}
                />
                <ShiftChangeRequestModal
                    isOpen={isShiftChangeModalOpen}
                    onClose={() => setIsShiftChangeModalOpen(false)}
                    shifts={shifts}
                    currentShiftName={(() => {
                        const rishi = employeeShifts.find(e => e.employeeName === "Rishi");
                        return shifts.find(s => s.id === rishi?.shifts["Monday"])?.name || "Morning Shift";
                    })()}
                    onSubmit={(request) => {
                        const newReq: ShiftChangeRequest = {
                            id: `scr-${Date.now()}`,
                            employeeName: "Rishi",
                            currentShift: request.currentShift,
                            requestedShift: request.requestedShift,
                            reason: request.reason,
                            status: "Pending"
                        };
                        setShiftChangeRequests(prev => [newReq, ...prev]);
                        toast.success("Shift change request submitted!");
                        setIsShiftChangeModalOpen(false);
                    }}
                />
            </main>
        </div>
    );
}

// --- Views ---

function AttendanceOverviewView({ attendanceData }: { attendanceData: AttendanceRecord[] }) {
    const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

    const handleDownloadReport = () => {
        // Prepare data for Excel
        const dataToExport = attendanceData.map(record => ({
            "Employee Name": record.name,
            "Status": record.status,
            "Check-In": record.checkIn,
            "Check-Out": record.checkOut,
            "Hours Worked": record.hours
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Daily Attendance");

        // Generate download
        XLSX.writeFile(workbook, `Attendance_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
        toast.success("Excel report generated successfully!");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Attendance Overview</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Real-time presence tracking for today, March 06.</p>
                </div>
                <div className="flex gap-3">
                    <AIButton label="Attendance Analytics" onClick={() => setIsAnalyticsOpen(true)} />
                    <Button
                        onClick={handleDownloadReport}
                        className="bg-[#6C3EFF] hover:bg-[#5a31d6] font-bold shadow-lg shadow-[#6C3EFF]/20 h-10 px-5 text-white rounded-xl"
                    >
                        <FileText className="h-4 w-4 mr-2" /> Download Report
                    </Button>
                </div>
            </div>

            <AnalyticsModal
                isOpen={isAnalyticsOpen}
                onClose={() => setIsAnalyticsOpen(false)}
                data={attendanceData}
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="Present Employees" value={attendanceData.filter(r => r.status !== "Absent").length.toString()} theme="emerald" icon={CheckCircle2} />
                <StatCard label="Absent Employees" value={attendanceData.filter(r => r.status === "Absent").length.toString()} theme="rose" icon={AlertCircle} />
                <StatCard label="Late Employees" value={attendanceData.filter(r => r.status === "Late").length.toString()} theme="amber" icon={Timer} />
                <StatCard label="On Leave" value="8" theme="blue" icon={Calendar} />
            </div>

            <Card className="rounded-[24px] border-slate-200/60 overflow-hidden bg-white shadow-sm font-['Inter',_sans-serif]">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100">
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400 py-4 px-6">Employee Name</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Status (On Time / Late / WFH / Absent)</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Check In Time</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Check Out Time</TableHead>
                            <TableHead className="text-right pr-6 font-bold text-[9px] uppercase tracking-widest text-slate-400">Total Hours</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {attendanceData.map((rec) => (
                            <TableRow key={rec.id} className="group hover:bg-slate-50 border-slate-50 transition-colors">
                                <TableCell className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-slate-100 border flex items-center justify-center font-bold text-slate-400 text-xs">
                                            {rec.name.charAt(0)}
                                        </div>
                                        <span className="font-bold text-slate-800">{rec.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${rec.status === "On Time" ? "bg-emerald-50 text-emerald-600" :
                                        rec.status === "Late" ? "bg-amber-50 text-amber-600" :
                                            rec.status === "WFH" ? "bg-blue-50 text-blue-600" :
                                                "bg-rose-50 text-rose-600"
                                        }`}>
                                        {rec.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-xs font-bold text-slate-600">{rec.checkIn}</TableCell>
                                <TableCell className="text-xs font-bold text-slate-600">{rec.checkOut}</TableCell>
                                <TableCell className="text-right pr-6 font-mono text-xs font-bold text-[#6C3EFF]">{rec.hours}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

function LeaveRequestsView({ leaveRequests, setLeaveRequests }: { leaveRequests: LeaveRequest[]; setLeaveRequests: React.Dispatch<React.SetStateAction<LeaveRequest[]>> }) {
    const [isPolicyBotOpen, setIsPolicyBotOpen] = useState(false);

    const handleStatus = (id: string, status: "Approved" | "Rejected") => {
        setLeaveRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
        toast.success(`Leave request ${status.toLowerCase()} successfully`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Leave Requests</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Review and manage employee time-off requests.</p>
                </div>
                <div className="flex gap-3">
                    <AIButton label="Leave Policy Bot" onClick={() => setIsPolicyBotOpen(true)} />
                </div>
            </div>

            <LeavePolicyModal
                isOpen={isPolicyBotOpen}
                onClose={() => setIsPolicyBotOpen(false)}
                requests={leaveRequests}
            />

            <Card className="rounded-[24px] border-slate-200/60 overflow-hidden bg-white shadow-sm font-['Inter',_sans-serif]">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100">
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400 py-4 px-6">Employee Name</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Leave Type</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Dates</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Reason</TableHead>
                            <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400 text-center">Status</TableHead>
                            <TableHead className="text-right pr-6 font-bold text-[9px] uppercase tracking-widest text-slate-400">Actions (Approve / Reject)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leaveRequests.map((req) => (
                            <TableRow key={req.id} className="group hover:bg-slate-50 border-slate-50 transition-colors">
                                <TableCell className="py-4 px-6 font-bold text-slate-800">{req.employeeName}</TableCell>
                                <TableCell>
                                    <span className="inline-flex px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold">
                                        {req.type}
                                    </span>
                                </TableCell>
                                <TableCell className="text-xs font-medium text-slate-600">{req.dates}</TableCell>
                                <TableCell className="text-xs text-slate-400 italic max-w-xs truncate">{req.reason}</TableCell>
                                <TableCell className="text-center">
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${req.status === "Approved" ? "bg-emerald-50 text-emerald-600" :
                                        req.status === "Rejected" ? "bg-rose-50 text-rose-600" :
                                            "bg-amber-50 text-amber-600"
                                        }`}>
                                        {req.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    {req.status === "Pending" ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleStatus(req.id, "Approved")} className="h-8 rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-100 font-bold px-3">Approve</Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleStatus(req.id, "Rejected")} className="h-8 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 font-bold px-3">Reject</Button>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">Decision Taken</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

// --- New Views for Role Selection & Employee ---

function LoginView({ onLogin }: { onLogin: (role: UserRole) => void }) {
    const [selectedRole, setSelectedRole] = useState<UserRole>("employee");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-4 font-['Inter',_sans-serif]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white rounded-[32px] shadow-2xl shadow-[#6C3EFF]/10 border border-slate-100 p-8"
            >
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="h-16 w-16 bg-[#6C3EFF] rounded-2xl flex items-center justify-center shadow-xl shadow-[#6C3EFF]/20 mb-6">
                        <Clock className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900">Attendance & Leave</h2>
                    <p className="text-slate-500 mt-2 font-medium">Log in to access your portal</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Email</label>
                        <Input
                            type="email"
                            placeholder="user@chro.com"
                            className="h-12 rounded-xl bg-slate-50 border-slate-100 focus-visible:ring-[#6C3EFF]/20"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Password</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            className="h-12 rounded-xl bg-slate-50 border-slate-100 focus-visible:ring-[#6C3EFF]/20"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Role</label>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setSelectedRole("admin")}
                                className={`flex-1 py-3 px-4 rounded-xl border text-sm font-bold transition-all ${selectedRole === "admin"
                                    ? "bg-[#6C3EFF]/10 border-[#6C3EFF] text-[#6C3EFF]"
                                    : "bg-white border-slate-100 text-slate-500 hover:border-[#6C3EFF]/30"
                                    }`}
                            >
                                HR / Admin
                            </button>
                            <button
                                onClick={() => setSelectedRole("employee")}
                                className={`flex-1 py-3 px-4 rounded-xl border text-sm font-bold transition-all ${selectedRole === "employee"
                                    ? "bg-[#6C3EFF]/10 border-[#6C3EFF] text-[#6C3EFF]"
                                    : "bg-white border-slate-100 text-slate-500 hover:border-[#6C3EFF]/30"
                                    }`}
                            >
                                Employee
                            </button>
                        </div>
                    </div>

                    <Button
                        onClick={() => onLogin(selectedRole)}
                        className="w-full h-12 bg-[#6C3EFF] hover:bg-[#5a31d6] text-white font-bold rounded-xl shadow-lg shadow-[#6C3EFF]/20 transition-all active:scale-[0.98]"
                    >
                        Enter Portal
                    </Button>

                    <div className="text-center">
                        <p className="text-xs text-slate-400">Demo Mode: Any credentials will work</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function EmployeeAttendanceView({
    checkInTime,
    checkOutTime,
    onCheckIn,
    onCheckOut,
    onOpenLeaveModal
}: {
    checkInTime: string | null;
    checkOutTime: string | null;
    onCheckIn: () => void;
    onCheckOut: () => void;
    onOpenLeaveModal: () => void;
}) {
    const isCheckedIn = !!checkInTime;
    const isCheckedOut = !!checkOutTime;

    return (
        <div className="space-y-8 max-w-5xl">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Attendance Dashboard</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">Good Morning! Track your daily attendance here.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Today's Attendance Card */}
                <Card className="rounded-[32px] border-slate-100 p-8 shadow-sm bg-white overflow-hidden relative">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-[#6C3EFF]" />
                                Today's Attendance
                            </h3>
                            <Badge variant="outline" className={`${isCheckedIn ? (isCheckedOut ? "bg-slate-50 text-slate-500" : "bg-emerald-50 text-emerald-600") : "bg-amber-50 text-amber-600"} font-bold border-none`}>
                                {isCheckedIn ? (isCheckedOut ? "Work Completed" : "On Duty") : "Not Checked In"}
                            </Badge>
                        </div>

                        <div className="flex flex-col items-center justify-center py-4">
                            <p className="text-4xl font-bold text-slate-900 mb-2">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">Current Time</p>

                            {!isCheckedIn ? (
                                <Button
                                    onClick={onCheckIn}
                                    className="w-48 h-12 bg-[#6C3EFF] hover:bg-[#5a31d6] text-white font-bold rounded-2xl shadow-lg shadow-[#6C3EFF]/20"
                                >
                                    Check In
                                </Button>
                            ) : !isCheckedOut ? (
                                <div className="space-y-4 w-full flex flex-col items-center">
                                    <div className="flex items-center gap-6 w-full justify-center">
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-slate-800">{checkInTime}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Check In</p>
                                        </div>
                                        <div className="h-10 w-[1px] bg-slate-100" />
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-slate-300">--:--</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Check Out</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={onCheckOut}
                                        variant="outline"
                                        className="w-48 h-12 border-rose-100 text-rose-600 hover:bg-rose-50 font-bold rounded-2xl transition-colors"
                                    >
                                        Check Out
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6 w-full flex flex-col items-center">
                                    <div className="flex items-center gap-8 w-full justify-center">
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-slate-800">{checkInTime}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Check In</p>
                                        </div>
                                        <div className="h-12 w-[1px] bg-slate-100" />
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-slate-800">{checkOutTime}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Check Out</p>
                                        </div>
                                    </div>
                                    <div className="bg-[#6C3EFF]/5 px-4 py-2 rounded-xl">
                                        <p className="text-xs font-bold text-[#6C3EFF]">Total Working Hours: 8h 15m</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="absolute -bottom-8 -right-8 h-32 w-32 bg-[#6C3EFF]/5 rounded-full blur-2xl" />
                </Card>

                {/* Info Card */}
                <div className="space-y-6">
                    <Card className="rounded-[24px] border-slate-100 p-6 shadow-sm bg-white">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                <MapPin className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">Office Location</h4>
                                <p className="text-xs text-slate-500 font-medium">Main Office - Perungudi, Chennai</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="rounded-[24px] border-slate-100 p-6 shadow-sm bg-[#6C3EFF] text-white overflow-hidden relative group cursor-pointer" onClick={onOpenLeaveModal}>
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                                <Plus className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold">Quick Request</h4>
                                <p className="text-xs text-white/70 font-medium">Apply for leave or WFH instantly.</p>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    </Card>
                </div>
            </div>
        </div>
    );
}

function MyLeavesView({ onOpenLeaveModal, leaveHistory }: { onOpenLeaveModal: () => void; leaveHistory: LeaveRequest[] }) {
    return (
        <div className="space-y-8 max-w-6xl">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">My Leaves Management</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">Manage your time off and view leave balances.</p>
                </div>
                <Button
                    onClick={onOpenLeaveModal}
                    className="bg-[#6C3EFF] hover:bg-[#5a31d6] font-bold shadow-lg shadow-[#6C3EFF]/20 h-11 px-6 text-white rounded-xl"
                >
                    <Plus className="h-4 w-4 mr-2" /> New Leave Request
                </Button>
            </div>

            {/* Leave Balance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {employeeLeaveBalance.map((item) => (
                    <Card key={item.type} className="rounded-[24px] border-slate-100 p-6 bg-white overflow-hidden relative">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{item.type}</p>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-3xl font-bold text-slate-900">{item.available}</p>
                                <p className="text-xs text-slate-500 mt-1 font-medium">Days Available</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-400">Used: {item.used}</p>
                                <p className="text-xs font-bold text-slate-300">Total: {item.total}</p>
                            </div>
                        </div>
                        <Progress value={(item.available / item.total) * 100} className="h-1.5 mt-6 bg-slate-100 rounded-full overflow-hidden [&>div]:bg-[#6C3EFF]" />
                    </Card>
                ))}
            </div>

            {/* History Table */}
            <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-lg">Leave History</h3>
                <Card className="rounded-[24px] border-slate-200/60 overflow-hidden bg-white shadow-sm font-['Inter',_sans-serif]">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-slate-100">
                                <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400 py-4 px-6">Leave Type</TableHead>
                                <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Dates</TableHead>
                                <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Reason</TableHead>
                                <TableHead className="text-right pr-6 font-bold text-[9px] uppercase tracking-widest text-slate-400">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leaveHistory.map((req) => (
                                <TableRow key={req.id} className="group hover:bg-slate-50 border-slate-50 transition-colors">
                                    <TableCell className="py-4 px-6 font-bold text-slate-800">{req.type}</TableCell>
                                    <TableCell className="text-xs font-medium text-slate-600">{req.dates}</TableCell>
                                    <TableCell className="text-xs text-slate-400 italic max-w-xs truncate">{req.reason}</TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Badge className={`rounded-full text-[10px] font-bold border-none ${req.status === "Approved" ? "bg-emerald-50 text-emerald-600" :
                                            req.status === "Rejected" ? "bg-rose-50 text-rose-600" :
                                                "bg-amber-50 text-amber-600"
                                            }`}>
                                            {req.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>

        </div>
    );
}

function LeaveRequestModal({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: (leave: Omit<LeaveRequest, "id" | "employeeName" | "status">) => void }) {
    const [formData, setFormData] = useState({
        type: "Sick" as LeaveRequest["type"],
        startDate: "",
        endDate: "",
        reason: ""
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed z-[51] bg-white rounded-[32px] w-full max-w-xl p-8 shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold text-slate-900">Apply for Leave</h3>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Leave Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as LeaveRequest["type"] })}
                                    className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-sm font-medium focus:ring-2 focus:ring-[#6C3EFF]/20 focus:outline-none transition-all"
                                >
                                    <option value="Sick">Sick Leave</option>
                                    <option value="Casual">Casual Leave</option>
                                    <option value="Earned">Earned Leave</option>
                                    <option value="Comp-off">Comp-off</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Start Date</label>
                                    <Input
                                        type="date"
                                        className="h-12 rounded-xl bg-slate-50 border-slate-100"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">End Date</label>
                                    <Input
                                        type="date"
                                        className="h-12 rounded-xl bg-slate-50 border-slate-100"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Reason</label>
                                <textarea
                                    className="w-full h-32 rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm font-medium focus:ring-2 focus:ring-[#6C3EFF]/20 focus:outline-none transition-all resize-none"
                                    placeholder="Brief description of why you're taking leave..."
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                />
                            </div>
                            <Button
                                onClick={() => {
                                    onSubmit({
                                        type: formData.type,
                                        dates: `${formData.startDate} - ${formData.endDate}`,
                                        reason: formData.reason
                                    });
                                }}
                                className="w-full h-12 bg-[#6C3EFF] hover:bg-[#5a31d6] text-white font-bold rounded-xl"
                            >
                                Submit Request
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function WFHRequestsPortal({
    role,
    wfhReqs,
    setWfhReqs,
    onOpenModal
}: {
    role: UserRole;
    wfhReqs: WFHRequest[];
    setWfhReqs: React.Dispatch<React.SetStateAction<WFHRequest[]>>;
    onOpenModal: () => void;
}) {
    const [activeFilter, setActiveFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");

    const filteredReqs = wfhReqs.filter(r => activeFilter === "All" || r.status === activeFilter);

    const [selectedWfhForDetails, setSelectedWfhForDetails] = useState<WFHRequest | null>(null);

    const stats = {
        total: wfhReqs.length,
        pending: wfhReqs.filter(r => r.status === "Pending").length,
        approved: wfhReqs.filter(r => r.status === "Approved").length,
        rejected: wfhReqs.filter(r => r.status === "Rejected").length,
    };

    const handleAction = (id: string, status: "Approved" | "Rejected") => {
        const now = new Date();
        const formattedDate = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

        setWfhReqs(prev => prev.map(r => r.id === id ? {
            ...r,
            status,
            actionedBy: "HR Admin", // In a real app, this would be the logged-in user
            actionedAt: formattedDate
        } : r));
        toast.success(`WFH request ${status.toLowerCase()} successfully`);
    };

    return (
        <div className="space-y-8">
            <WFHDetailsModal
                isOpen={!!selectedWfhForDetails}
                onClose={() => setSelectedWfhForDetails(null)}
                request={selectedWfhForDetails}
            />
            {/* Header section with Stats or Title */}
            <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                        {role === "admin" ? "WFH Requests Management" : "My Work From Home Requests"}
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        {role === "admin" ? "Review and manage departmental remote work applications." : "Manage your remote work requests and track approvals."}
                    </p>
                </div>
                {role === "employee" && (
                    <Button
                        onClick={onOpenModal}
                        className="bg-[#6C3EFF] hover:bg-[#5a31d6] font-bold shadow-lg shadow-[#6C3EFF]/20 h-11 px-6 text-white rounded-xl"
                    >
                        <Plus className="h-4 w-4 mr-2" /> Request WFH
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Stats Cards (mostly for Admin, but useful for employee too) */}
                    {/* Main Analytics Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <StatCard label="Total Requests" value={stats.total.toString()} theme="indigo" icon={FileText} />
                        <StatCard label="Pending Approval" value={stats.pending.toString()} theme="amber" icon={Timer} />
                        <StatCard label="Approved WFH" value={stats.approved.toString()} theme="emerald" icon={CheckCircle2} />
                        <StatCard label="Rejected WFH" value={stats.rejected.toString()} theme="rose" icon={X} />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex bg-slate-100/50 p-1 rounded-2xl w-fit">
                        {["All", "Pending", "Approved", "Rejected"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveFilter(tab as any)}
                                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeFilter === tab ? "bg-white text-[#6C3EFF] shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Requests Table */}
                    <Card className="rounded-[32px] border-slate-200/60 overflow-hidden bg-white shadow-sm">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow className="border-slate-100">
                                    {role === "admin" && <TableHead className="py-4 px-6 font-bold text-[9px] uppercase tracking-widest text-slate-400">Employee</TableHead>}
                                    <TableHead className="py-4 px-6 font-bold text-[9px] uppercase tracking-widest text-slate-400">Date</TableHead>
                                    <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Reason</TableHead>
                                    <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">{role === "admin" ? "Dept" : "Manager"}</TableHead>
                                    <TableHead className="text-center font-bold text-[9px] uppercase tracking-widest text-slate-400">Status</TableHead>
                                    {role === "admin" && <TableHead className="text-right pr-6 font-bold text-[9px] uppercase tracking-widest text-slate-400">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredReqs.map((req) => (
                                    <TableRow key={req.id} className="group hover:bg-slate-50 transition-colors">
                                        {role === "admin" && (
                                            <TableCell className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 border">
                                                        {req.employeeName.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-slate-800 text-sm">{req.employeeName}</span>
                                                </div>
                                            </TableCell>
                                        )}
                                        <TableCell className="py-4 px-6 font-bold text-slate-600 text-xs">{req.date}</TableCell>
                                        <TableCell className="text-xs text-slate-500 max-w-xs truncate">{req.reason}</TableCell>
                                        <TableCell className="text-xs font-bold text-slate-600">{role === "admin" ? req.department : req.manager}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge className={`rounded-full text-[10px] font-bold border-none shadow-none ${req.status === "Approved" ? "bg-emerald-50 text-emerald-600" :
                                                req.status === "Rejected" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                                                }`}>
                                                {req.status}
                                            </Badge>
                                        </TableCell>
                                        {role === "admin" && (
                                            <TableCell className="text-right pr-6">
                                                {req.status === "Pending" ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button onClick={() => handleAction(req.id, "Approved")} variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none shadown-none">
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button onClick={() => handleAction(req.id, "Rejected")} variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border-none shadown-none">
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg bg-slate-100 text-slate-400">
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        onClick={() => setSelectedWfhForDetails(req)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-24 rounded-lg text-slate-400 font-bold text-[10px] uppercase hover:bg-slate-100"
                                                    >
                                                        View Details
                                                    </Button>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </div>

                {/* Sidebar AI Assistant */}
                <div className="space-y-6">
                    <Card className="p-6 rounded-[32px] border-none bg-gradient-to-br from-[#6C3EFF] to-[#4c2bbd] text-white shadow-xl shadow-[#6C3EFF]/20 sticky top-24">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Bot className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold">{role === "admin" ? "WFH Analytics AI" : "WFH AI Assistant"}</h3>
                        </div>
                        <p className="text-xs text-white/80 leading-relaxed mb-6">
                            {role === "admin"
                                ? "Helping you analyze WFH trends, department productivity patterns, and weekly peaks."
                                : "Suggesting optimal WFH days based on your work patterns and providing productivity tips."}
                        </p>

                        <div className="space-y-3 mb-8">
                            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Example Prompt</p>
                            <div className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors cursor-pointer border border-white/10 group">
                                <p className="text-xs italic leading-tight text-white/90">
                                    {role === "admin"
                                        ? "\"Analyze WFH trends for this month.\""
                                        : "\"Suggest best days for WFH based on my pattern.\""}
                                </p>
                                <ArrowRight className="h-3 w-3 mt-2 ml-auto opacity-0 group-hover:opacity-100 transition-all" />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="text-center">
                                    <p className="text-xl font-bold">2.4</p>
                                    <p className="text-[8px] font-bold text-white/60 uppercase">Avg Requests/Wk</p>
                                </div>
                                <div className="text-center border-l border-white/10">
                                    <p className="text-xl font-bold">{stats.approved}%</p>
                                    <p className="text-[8px] font-bold text-white/60 uppercase">Approval Rate</p>
                                </div>
                            </div>
                            <Button className="w-full bg-white text-[#6C3EFF] hover:bg-white/90 font-bold rounded-xl shadow-lg border-none h-11">
                                Ask AI Assistant
                            </Button>
                        </div>
                    </Card>

                    {role === "employee" && (
                        <Card className="p-5 rounded-[24px] border-slate-100 bg-emerald-50/50">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                <p className="text-xs font-bold text-emerald-700 uppercase tracking-tighter">Productivity Tip</p>
                            </div>
                            <p className="text-xs text-slate-500 italic leading-relaxed">
                                "Batch your meetings on Tuesdays to maximize focus time during your WFH days."
                            </p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

function WFHRequestModal({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: (wfh: Omit<WFHRequest, "id" | "employeeName" | "department" | "status">) => void }) {
    const [formData, setFormData] = useState({
        date: "",
        reason: "",
        manager: "Sarah Connor",
        workPlan: ""
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose} />
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed z-[51] bg-white rounded-[32px] w-full max-w-xl p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold text-slate-900">WFH Request</h3>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full"><X className="h-5 w-5" /></Button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Employee Name</label>
                                <Input value="Rishi" disabled className="h-12 rounded-xl bg-slate-50 border-slate-100 font-bold" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Requested Date</label>
                                    <Input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="h-12 rounded-xl bg-slate-50 border-slate-100" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Manager</label>
                                    <select value={formData.manager} onChange={e => setFormData({ ...formData, manager: e.target.value })} className="w-full h-12 rounded-xl bg-slate-50 border border-slate-100 px-4 text-sm font-medium focus:ring-2 focus:ring-[#6C3EFF]/20 focus:outline-none transition-all">
                                        <option value="Sarah Connor">Sarah Connor</option>
                                        <option value="Vikram Shah">Vikram Shah</option>
                                        <option value="Michael Scott">Michael Scott</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Reason</label>
                                <textarea placeholder="Why are you requesting WFH?" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} className="w-full h-24 rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm font-medium focus:ring-2 focus:ring-[#6C3EFF]/20 focus:outline-none transition-all resize-none" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Work Plan (Optional)</label>
                                <textarea placeholder="Outline your deliverables for the day..." value={formData.workPlan} onChange={e => setFormData({ ...formData, workPlan: e.target.value })} className="w-full h-24 rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm font-medium focus:ring-2 focus:ring-[#6C3EFF]/20 focus:outline-none transition-all resize-none" />
                            </div>

                            <div className="flex gap-4">
                                <Button variant="ghost" onClick={onClose} className="flex-1 h-12 rounded-xl font-bold">Cancel</Button>
                                <Button onClick={() => onSubmit(formData)} className="flex-[2] h-12 bg-[#6C3EFF] hover:bg-[#5a31d6] text-white font-bold rounded-xl">Submit Request</Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function ShiftSchedulePortal({
    role,
    shifts,
    employeeShifts,
    setEmployeeShifts,
    shiftChangeRequests,
    setShiftChangeRequests,
    onOpenShiftCreate,
    onOpenShiftChange
}: {
    role: UserRole;
    shifts: Shift[];
    employeeShifts: EmployeeShift[];
    setEmployeeShifts: React.Dispatch<React.SetStateAction<EmployeeShift[]>>;
    shiftChangeRequests: ShiftChangeRequest[];
    setShiftChangeRequests: React.Dispatch<React.SetStateAction<ShiftChangeRequest[]>>;
    onOpenShiftCreate: () => void;
    onOpenShiftChange: () => void;
}) {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const rishiShift = employeeShifts.find(e => e.employeeName === "Rishi");

    // Calculate dates for the current week (Monday to Friday)
    const getWeekDates = () => {
        const now = new Date();
        const monday = new Date(now);
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diff);

        return days.map((dayName, index) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + index);
            return {
                name: dayName,
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            };
        });
    };

    const weekDates = getWeekDates();

    // Get today's shift dynamically
    const todayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
    const todayShiftId = rishiShift?.status === "Assigned" ? rishiShift?.shifts[todayName] : undefined;
    const todayShift = shifts.find(s => s.id === todayShiftId);

    const stats = {
        total: employeeShifts.length,
        morning: employeeShifts.filter(e => e.shifts["Monday"] === "s1").length + 12,
        evening: employeeShifts.filter(e => e.shifts["Monday"] === "s2").length + 5,
        night: employeeShifts.filter(e => e.shifts["Monday"] === "s3").length + 3
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                        {role === "admin" ? "Shift Schedule Management" : "My Shift Schedule"}
                    </h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">
                        {role === "admin" ? "Design shifts and assign them to your workforce." : "View your assigned shifts and request changes."}
                    </p>
                </div>
                <div className="flex gap-3">
                    {role === "admin" ? (
                        <Button onClick={onOpenShiftCreate} className="bg-[#6C3EFF] hover:bg-[#5a31d6] font-bold shadow-lg shadow-[#6C3EFF]/20 h-11 px-6 text-white rounded-xl">
                            <Plus className="h-4 w-4 mr-2" /> Create Shift
                        </Button>
                    ) : (
                        <Button onClick={onOpenShiftChange} className="bg-[#6C3EFF] hover:bg-[#5a31d6] font-bold shadow-lg shadow-[#6C3EFF]/20 h-11 px-6 text-white rounded-xl">
                            <ArrowRight className="h-4 w-4 mr-2" /> Request Shift Change
                        </Button>
                    )}
                </div>
            </div>

            {role === "admin" ? (
                /* ADMIN VIEW */
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3 space-y-8">
                        {/* Premium Analytics Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard label="Total Staff" value={stats.total.toString()} theme="indigo" icon={Users} />
                            <StatCard label="Morning Shift" value={stats.morning.toString()} theme="emerald" icon={Sun} />
                            <StatCard label="Evening Shift" value={stats.evening.toString()} theme="blue" icon={Moon} />
                            <StatCard label="Night Shift" value={stats.night.toString()} theme="rose" icon={Timer} />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-[#6C3EFF]" />
                                    Weekly Roster Status
                                </h3>
                                <Badge variant="outline" className="rounded-full bg-white text-slate-400 border-slate-200 font-semibold text-[10px] px-3">Live Roster</Badge>
                            </div>
                            <div className="grid grid-cols-5 gap-3">
                                {days.map(day => (
                                    <Card key={day} className="rounded-2xl border-none bg-white p-4 shadow-sm hover:translate-y-[-2px] transition-all border border-slate-100/50">
                                        <div className="mb-4">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{day}</p>
                                            <div className="h-0.5 w-4 bg-[#6C3EFF] mt-1 rounded-full" />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                                                    <span>Morning</span>
                                                    <span>12</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: '75%' }} />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                                                    <span>Evening</span>
                                                    <span>5</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-400 rounded-full" style={{ width: '35%' }} />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                                                    <span>Night</span>
                                                    <span>3</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                                    <div className="h-full bg-rose-400 rounded-full" style={{ width: '20%' }} />
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-900">Resource Assignments</h3>
                            <Card className="rounded-[32px] border-none bg-white shadow-sm overflow-hidden border border-slate-100">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow className="border-slate-100 hover:bg-transparent">
                                            <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-wider text-slate-400">Team Member</TableHead>
                                            <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-wider text-slate-400">Department</TableHead>
                                            <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-wider text-slate-400 text-center">Assigned Shift</TableHead>
                                            <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-wider text-slate-400">Change Request</TableHead>
                                            <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-wider text-slate-400 text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {employeeShifts.map((emp, idx) => {
                                            const pendingReq = shiftChangeRequests.find(
                                                r => r.employeeName === emp.employeeName && r.status === "Pending"
                                            );
                                            const requestedShiftName = pendingReq
                                                ? shifts.find(s => s.id === pendingReq.requestedShift)?.name || pendingReq.requestedShift
                                                : null;
                                            return (
                                                <TableRow key={idx} className="group transition-all hover:bg-slate-50/30 border-slate-50">
                                                    <TableCell className="py-4 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-xs border border-slate-200">
                                                                {emp.employeeName.charAt(0)}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-900 text-sm">{emp.employeeName}</span>
                                                                <span className="text-[10px] font-semibold text-slate-400 uppercase">ID: 00{idx + 1}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4 px-6">
                                                        <span className="text-xs font-semibold text-slate-500">{emp.department}</span>
                                                    </TableCell>
                                                    <TableCell className="py-4 px-6 text-center">
                                                        <Badge variant="outline" className="rounded-full bg-indigo-50/50 text-indigo-600 border-indigo-100 font-bold text-[10px] px-3">
                                                            {shifts.find(s => s.id === (emp.shifts["Monday"]))?.name || "None"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="py-4 px-6">
                                                        {pendingReq ? (
                                                            <div className="bg-amber-50 rounded-2xl p-3 border border-amber-100/50 max-w-[200px]">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                                    <span className="text-[10px] font-bold text-amber-900 uppercase">{requestedShiftName}</span>
                                                                </div>
                                                                <p className="text-[9px] text-amber-700 font-medium leading-tight mb-2 truncate">"{pendingReq.reason}"</p>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            const updatedShifts = [...employeeShifts];
                                                                            const shiftObj = shifts.find(s => s.id === pendingReq.requestedShift);
                                                                            if (shiftObj) {
                                                                                updatedShifts[idx] = {
                                                                                    ...updatedShifts[idx],
                                                                                    shifts: { "Monday": shiftObj.id, "Tuesday": shiftObj.id, "Wednesday": shiftObj.id, "Thursday": shiftObj.id, "Friday": shiftObj.id },
                                                                                    status: "Assigned"
                                                                                };
                                                                                setEmployeeShifts(updatedShifts);
                                                                            }
                                                                            setShiftChangeRequests(prev => prev.map(r => r.id === pendingReq.id ? { ...r, status: "Approved" } : r));
                                                                            toast.success(`Shift Change Approved`);
                                                                        }}
                                                                        className="h-6 px-2 bg-emerald-500 text-white text-[9px] font-bold rounded-lg hover:bg-emerald-600 transition-colors"
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setShiftChangeRequests(prev => prev.map(r => r.id === pendingReq.id ? { ...r, status: "Rejected" } : r));
                                                                            toast.error(`Rejected`);
                                                                        }}
                                                                        className="h-6 px-2 bg-white text-rose-500 border border-rose-100 text-[9px] font-bold rounded-lg hover:bg-rose-50 transition-colors"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] font-semibold text-slate-300 italic">No request</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="py-4 px-6 text-right">
                                                        {emp.status === "Assigned" ? (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Badge className="bg-emerald-500 text-white border-none font-bold text-[9px] px-3 py-1 rounded-full uppercase shadow-lg shadow-emerald-500/20">Assigned</Badge>
                                                                <button
                                                                    onClick={() => {
                                                                        const updated = [...employeeShifts];
                                                                        updated[idx].status = "Unassigned";
                                                                        setEmployeeShifts(updated);
                                                                        toast.info("Assignment Revoked");
                                                                    }}
                                                                    className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-300 hover:text-rose-500 transition-all"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    const updated = [...employeeShifts];
                                                                    updated[idx].status = "Assigned";
                                                                    setEmployeeShifts(updated);
                                                                    toast.success(`Shift assigned to ${emp.employeeName}`);
                                                                }}
                                                                className="rounded-xl bg-[#6C3EFF] hover:bg-[#5a31d6] text-white font-bold text-[10px] shadow-lg shadow-[#6C3EFF]/20 h-8 px-5 transition-all active:scale-95"
                                                            >
                                                                Assign
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </Card>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Refined AI Planning Card */}
                        <Card className="p-7 rounded-[32px] border-none bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl shadow-indigo-100/50 relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20">
                                        <Bot className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base leading-tight">Planning AI</h3>
                                        <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Smart Forecast</p>
                                    </div>
                                </div>
                                <p className="text-[11px] text-white/80 leading-relaxed font-semibold mb-6">
                                    Analyzing shift distribution patterns to optimize upcoming week coverage.
                                </p>
                                <div className="p-4 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 mb-6">
                                    <p className="text-[9px] font-bold text-white/50 uppercase mb-2">Suggested Adjustment</p>
                                    <p className="text-xs font-semibold leading-snug italic">"Consider moving 2 employees to Evening shift on Wednesday."</p>
                                </div>
                                <Button className="w-full bg-white text-indigo-600 hover:bg-white/90 font-bold rounded-xl shadow-lg border-none h-12 text-xs">
                                    Update Roster
                                </Button>
                            </div>
                        </Card>

                        {/* Professional Reminders */}
                        <Card className="p-7 rounded-[32px] border-slate-100 bg-white shadow-sm h-fit">
                            <h3 className="font-bold text-slate-800 mb-6">Quick Notices</h3>
                            <div className="space-y-5">
                                <div className="flex gap-4">
                                    <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                                        <AlertCircle className="h-4.5 w-4.5" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-amber-600 uppercase mb-0.5">Coverage Gap</p>
                                        <p className="text-xs text-slate-600 font-semibold leading-tight">Evening slot for Engineering team requires 1 more staff.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                                        <Timer className="h-4.5 w-4.5" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-indigo-600 uppercase mb-0.5">Requests</p>
                                        <p className="text-xs text-slate-600 font-semibold leading-tight">There are 4 pending change requests to review.</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            ) : (
                /* EMPLOYEE VIEW */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800">Today's Assignment</h3>
                            {todayShift ? (
                                <Card className="rounded-[32px] border-none bg-[#6C3EFF] p-8 text-white shadow-xl shadow-[#6C3EFF]/20 flex items-center justify-between">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge className="bg-white/20 text-white border-none shadow-none text-[10px] font-bold uppercase">Active</Badge>
                                            <p className="text-xs font-bold text-white/70">{todayShift.name}</p>
                                        </div>
                                        <h4 className="text-3xl font-bold">{todayShift.startTime} – {todayShift.endTime}</h4>
                                        <div className="flex gap-4 pt-4">
                                            <div className="bg-white/10 px-4 py-2 rounded-xl">
                                                <p className="text-[8px] font-bold text-white/50 uppercase">Break</p>
                                                <p className="text-sm font-bold">{todayShift.breakDuration}</p>
                                            </div>
                                            <div className="bg-white/10 px-4 py-2 rounded-xl">
                                                <p className="text-[8px] font-bold text-white/50 uppercase">Dept</p>
                                                <p className="text-sm font-bold">{rishiShift?.department || "—"}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-24 w-24 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 animate-pulse">
                                        <Clock className="h-10 w-10 text-white" />
                                    </div>
                                </Card>
                            ) : (
                                <Card className="rounded-[32px] border-slate-100 p-8 bg-white shadow-sm flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center border border-dashed border-slate-200">
                                        <Timer className="h-7 w-7 text-slate-300" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-700 text-lg">No shift assigned today</p>
                                        <p className="text-sm text-slate-400 mt-1">{todayName === "Saturday" || todayName === "Sunday" ? "It's the weekend! Enjoy your day off. 🎉" : "Contact HR to get your shift assigned."}</p>
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Weekly Table */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800">Weekly Schedule</h3>
                            <Card className="rounded-[32px] border-slate-200/60 overflow-hidden bg-white shadow-sm">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow className="border-slate-100">
                                            <TableHead className="py-4 px-6 font-bold text-[9px] uppercase tracking-widest text-slate-400">Date & Day</TableHead>
                                            <TableHead className="py-4 px-6 font-bold text-[9px] uppercase tracking-widest text-slate-400">Shift Name</TableHead>
                                            <TableHead className="py-4 px-6 font-bold text-[9px] uppercase tracking-widest text-slate-400 text-center">Timing</TableHead>
                                            <TableHead className="py-4 px-6 font-bold text-[9px] uppercase tracking-widest text-slate-400 text-right">Request Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {weekDates.map(({ name: day, date }) => {
                                            const shiftId = rishiShift?.status === "Assigned" ? rishiShift?.shifts[day] : undefined;
                                            const shift = shifts.find(s => s.id === shiftId);
                                            const isToday = day === todayName;
                                            const dotColor = shift?.id === "s2" ? "bg-blue-500" : shift?.id === "s3" ? "bg-rose-500" : "bg-emerald-500";

                                            // Find requests for this employee
                                            const rishiRequests = shiftChangeRequests.filter(req => req.employeeName === "Rishi");

                                            // Determine status to show for this specific row
                                            // A row should show status if:
                                            // 1. A request is PENDING or REJECTED for this shift name (the "from" shift)
                                            // 2. A request was APPROVED for this shift name (the "to" shift)
                                            const relevantRequest = rishiRequests.find(req => {
                                                if (req.status === "Approved") {
                                                    const targetShiftName = shifts.find(s => s.id === req.requestedShift)?.name;
                                                    return targetShiftName === shift?.name;
                                                }
                                                return req.currentShift === shift?.name;
                                            });

                                            return (
                                                <TableRow key={day} className={`border-slate-50 ${isToday ? "bg-[#6C3EFF]/5" : ""}`}>
                                                    <TableCell className="py-4 px-6">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-800 text-sm">
                                                                {day} {isToday && <Badge className="ml-2 bg-[#6C3EFF]/10 text-[#6C3EFF] border-none text-[9px] font-bold px-2">Today</Badge>}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-medium">{date}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`h-2 w-2 rounded-full ${shift ? dotColor : "bg-slate-200"}`} />
                                                            <span className="text-xs font-bold text-slate-600">{shift?.name || "Off / Not Assigned"}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4 px-6 text-center text-xs font-medium text-slate-500">
                                                        {shift ? `${shift.startTime} – ${shift.endTime}` : "—"}
                                                    </TableCell>
                                                    <TableCell className="py-4 px-6 text-right">
                                                        {relevantRequest ? (
                                                            <Badge className={`
                                                                ${relevantRequest.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' :
                                                                    relevantRequest.status === 'Rejected' ? 'bg-rose-50 text-rose-600' :
                                                                        'bg-amber-50 text-amber-600'} 
                                                                border-none text-[10px] font-bold px-2
                                                            `}>
                                                                {relevantRequest.status}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-[10px] text-slate-300">—</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </Card>
                        </div>
                    </div>

                    <div>
                        <Card className="p-6 rounded-[32px] border-slate-100 bg-white shadow-sm h-fit">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-amber-50 rounded-xl text-amber-500"><AlertCircle className="h-5 w-5" /></div>
                                <h3 className="font-bold text-slate-800">Shift Reminders</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Upcoming Change</p>
                                    <p className="text-xs text-slate-600 font-medium">Your shift starts at <span className="font-bold text-slate-800">02:00 PM</span> this Wednesday.</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Status</p>
                                    <p className="text-xs text-slate-600 font-medium">You are on the <span className="font-bold text-slate-800">Morning Roster</span> for the rest of the week.</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}



function ShiftCreateModal({
    isOpen,
    onClose,
    onSubmit
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (assignment: any) => void
}) {
    const [formData, setFormData] = useState({
        employeeName: "",
        department: "Design",
        shiftId: "s1"
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    const filteredEmployees = mockEmployees.filter(e =>
        e.name.toLowerCase().startsWith(searchTerm.toLowerCase()) && searchTerm.length > 0
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose} />
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed z-[51] bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Assign New Shift</h3>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full shadow-none"><X className="h-5 w-5" /></Button>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2 relative">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Employee Name</label>
                                <div className="relative">
                                    <Input
                                        placeholder="Type name (e.g. 'R')..."
                                        value={searchTerm}
                                        onChange={e => {
                                            setSearchTerm(e.target.value);
                                            setShowSuggestions(true);
                                        }}
                                        className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold pl-10"
                                    />
                                    <Search className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                                </div>
                                {showSuggestions && filteredEmployees.length > 0 && (
                                    <div className="absolute top-[100%] left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[60]">
                                        {filteredEmployees.map((emp, i) => (
                                            <button
                                                key={i}
                                                className="w-full text-left px-6 py-4 hover:bg-slate-50 border-b border-slate-50 last:border-none transition-colors group"
                                                onClick={() => {
                                                    setFormData({ ...formData, employeeName: emp.name, department: emp.dept });
                                                    setSearchTerm(emp.name);
                                                    setShowSuggestions(false);
                                                }}
                                            >
                                                <p className="font-bold text-slate-800 group-hover:text-[#6C3EFF]">{emp.name}</p>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold">{emp.dept}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Department</label>
                                <select
                                    className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold focus:ring-2 focus:ring-[#6C3EFF]/20 focus:outline-none transition-all appearance-none"
                                    value={formData.department}
                                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                                >
                                    <option value="Design">Design</option>
                                    <option value="Engineering">Engineering</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="HR">HR</option>
                                    <option value="Sales">Sales</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Assign Shift</label>
                                <select
                                    className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold focus:ring-2 focus:ring-[#6C3EFF]/20 focus:outline-none transition-all appearance-none"
                                    value={formData.shiftId}
                                    onChange={e => setFormData({ ...formData, shiftId: e.target.value })}
                                >
                                    <option value="s1">Morning Shift (09:00 AM)</option>
                                    <option value="s2">Evening Shift (02:00 PM)</option>
                                    <option value="s3">Night Shift (10:00 PM)</option>
                                </select>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button variant="ghost" onClick={onClose} className="flex-1 h-14 rounded-2xl font-bold text-slate-400">Discard</Button>
                                <Button
                                    onClick={() => {
                                        if (formData.employeeName) {
                                            onSubmit({ ...formData });
                                        } else {
                                            toast.error("Please select an employee");
                                        }
                                    }}
                                    className="flex-[2] h-14 bg-[#6C3EFF] hover:bg-[#5a31d6] text-white font-bold rounded-2xl shadow-xl shadow-[#6C3EFF]/20"
                                >
                                    Save Assignment
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function ShiftChangeRequestModal({
    isOpen,
    onClose,
    shifts,
    currentShiftName,
    onSubmit
}: {
    isOpen: boolean;
    onClose: () => void;
    shifts: Shift[];
    currentShiftName: string;
    onSubmit: (request: any) => void
}) {
    const [formData, setFormData] = useState({
        currentShift: currentShiftName,
        requestedShift: "",
        reason: ""
    });

    // Sync when currentShiftName changes
    useEffect(() => {
        setFormData(f => ({ ...f, currentShift: currentShiftName }));
    }, [currentShiftName]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose} />
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed z-[51] bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Shift Change Request</h3>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full shadow-none"><X className="h-5 w-5" /></Button>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Current Assigned Shift</label>
                                <Input value={formData.currentShift} disabled className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Requested Shift</label>
                                <select className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 px-4 text-sm font-bold focus:ring-2 focus:ring-[#6C3EFF]/20 focus:outline-none transition-all" value={formData.requestedShift} onChange={e => setFormData({ ...formData, requestedShift: e.target.value })}>
                                    <option value="">Select Shift</option>
                                    {shifts.map(s => <option key={s.id} value={s.id}>{s.name} ({s.startTime})</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Reason for Request</label>
                                <textarea placeholder="Describe why you need a shift change..." className="w-full h-32 rounded-2xl bg-slate-100 border-none p-4 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-[#6C3EFF]/20" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Button variant="ghost" onClick={onClose} className="flex-1 h-14 rounded-2xl font-bold text-slate-400">Keep Current</Button>
                                <Button onClick={() => onSubmit(formData)} className="flex-[2] h-14 bg-[#6C3EFF] hover:bg-[#5a31d6] text-white font-bold rounded-2xl shadow-xl shadow-[#6C3EFF]/20 uppercase tracking-widest">
                                    Send Request
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function ShiftScheduleView() {
    return (
        <div className="flex items-center justify-center h-[50vh] text-center">
            <div>
                <Timer className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800">Shift Management Coming Soon</h3>
                <p className="text-slate-400 text-sm">Scheduling rotational shifts and roster management.</p>
            </div>
        </div>
    );
}

// --- Helper Components ---

// --- Modal Components ---

// --- Modal Components ---

function WFHDetailsModal({ isOpen, onClose, request }: { isOpen: boolean; onClose: () => void; request: WFHRequest | null }) {
    if (!request) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative z-[101] bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                                    <FileText className="h-5 w-5 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Request Details</h3>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100 shadow-none">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Employee</p>
                                        <p className="text-sm font-bold text-slate-800">{request.employeeName}</p>
                                    </div>
                                    <Badge className={`rounded-lg text-[10px] font-bold border-none shadow-none ${request.status === "Approved" ? "bg-emerald-50 text-emerald-600" :
                                        request.status === "Rejected" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                                        }`}>
                                        {request.status}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Request Date</p>
                                        <p className="text-xs font-bold text-slate-600">{request.date}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Department</p>
                                        <p className="text-xs font-bold text-slate-600">{request.department}</p>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reason</p>
                                    <p className="text-xs text-slate-600 italic leading-relaxed">"{request.reason}"</p>
                                </div>
                            </div>

                            {request.status !== "Pending" && (
                                <div className="p-6 rounded-3xl bg-indigo-50/30 border border-indigo-100/50 space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`h-2 w-2 rounded-full ${request.status === 'Approved' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Decision History</span>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white border border-indigo-100 flex items-center justify-center text-xs font-bold text-[#6C3EFF]">
                                            {request.actionedBy?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">
                                                {request.status === 'Approved' ? 'Approved by' : 'Rejected by'} {request.actionedBy}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400">
                                                at {request.actionedAt}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white/50 rounded-2xl border border-indigo-50">
                                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                            The request was processed via the HR Central Portal. All security protocols and departmental bandwidth checks were verified.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8">
                            <Button onClick={onClose} className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all">
                                Close Details
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function LeavePolicyModal({ isOpen, onClose, requests }: { isOpen: boolean; onClose: () => void; requests: LeaveRequest[] }) {
    const pendingCount = requests.filter(r => r.status === 'Pending').length;

    const policies = [
        { type: "Sick Leave", allowance: "12 Days/Year", color: "bg-rose-500" },
        { type: "Casual Leave", allowance: "10 Days/Year", color: "bg-blue-500" },
        { type: "Earned Leave", allowance: "15 Days/Year", color: "bg-emerald-500" },
        { type: "Comp-off", allowance: "Project Based", color: "bg-amber-500" }
    ];

    const COLORS = ['#F43F5E', '#3B82F6', '#10B981', '#F59E0B'];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative z-[101] bg-white rounded-[40px] w-full max-w-4xl p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-[#6C3EFF]/10 flex items-center justify-center">
                                    <Bot className="h-6 w-6 text-[#6C3EFF]" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Leave Intelligence Bot</h3>
                                    <p className="text-sm text-slate-400 font-medium mt-1">Policy compliance & entitlement analysis</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100 shadow-none">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Policy Breakdown */}
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Current Leave Policies</h4>
                                <div className="grid grid-cols-1 gap-4">
                                    {policies.map((policy, idx) => (
                                        <div key={policy.type} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-[#6C3EFF]/20 transition-all duration-300">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-2 w-2 rounded-full ${policy.color}`} />
                                                <span className="font-bold text-slate-700 text-sm">{policy.type}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-[#6C3EFF] bg-[#6C3EFF]/5 px-3 py-1 rounded-full uppercase tracking-tighter">
                                                {policy.allowance}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Eligibility Summary */}
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">AI Suitability Scan</h4>
                                <Card className="p-8 rounded-[36px] bg-slate-900 border-none relative overflow-hidden h-full">
                                    <div className="absolute top-0 right-0 p-8">
                                        <div className="h-1 w-20 bg-gradient-to-r from-transparent to-[#6C3EFF]/30 rounded-full" />
                                    </div>

                                    <div className="relative z-10 space-y-8">
                                        <div>
                                            <div className="text-5xl font-bold text-white tracking-tighter mb-2">{pendingCount}</div>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Awaiting Verification</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-[11px] font-bold">
                                                <span className="text-slate-500 uppercase tracking-widest">Policy Compliance</span>
                                                <span className="text-emerald-400">92% Match</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '92%' }}
                                                    className="h-full bg-gradient-to-r from-[#6C3EFF] to-emerald-400"
                                                />
                                            </div>
                                        </div>

                                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                                            <div className="flex items-center gap-2 mb-2 text-[#6C3EFF]">
                                                <AlertCircle className="h-3 w-3" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Bot Insight</span>
                                            </div>
                                            <p className="text-[11px] text-slate-300 leading-relaxed italic">
                                                "All pending requests currently meet baseline eligibility requirements. High concentration of Friday requests noted for the Product team."
                                            </p>
                                        </div>
                                    </div>

                                    {/* Abstract patterns in background */}
                                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#6C3EFF]/10 to-transparent pointer-events-none" />
                                </Card>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-xs text-slate-400 font-medium max-w-lg">
                                * This AI assessment is based on the Employee Handbook (v2.4) and current departmental bandwidth tracking.
                            </p>
                            <Button onClick={onClose} className="rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 px-8">
                                Close Scanner
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function AnalyticsModal({ isOpen, onClose, data }: { isOpen: boolean; onClose: () => void; data: AttendanceRecord[] }) {
    // Pie Chart Data
    const pieData = [
        { name: 'Present', value: data.filter(r => r.status !== 'Absent').length },
        { name: 'Absent', value: data.filter(r => r.status === 'Absent').length },
    ];

    // Bar Chart Data (Detailed status)
    const barData = [
        { name: 'On Time', count: data.filter(r => r.status === 'On Time').length },
        { name: 'Late', count: data.filter(r => r.status === 'Late').length },
        { name: 'WFH', count: data.filter(r => r.status === 'WFH').length },
        { name: 'Absent', count: data.filter(r => r.status === 'Absent').length },
    ];

    const COLORS = ['#6C3EFF', '#F43F5E', '#10B981', '#F59E0B'];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative z-[101] bg-white rounded-[40px] w-full max-w-4xl p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance Intelligence</h3>
                                <p className="text-sm text-slate-400 font-medium mt-1">AI-driven patterns and distribution analysis</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100 shadow-none">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card className="p-8 rounded-[32px] border-slate-100 shadow-sm bg-slate-50/50">
                                <h4 className="font-bold text-slate-800 mb-8 uppercase text-[10px] tracking-widest text-center">Global Presence</h4>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                innerRadius={70}
                                                outerRadius={90}
                                                paddingAngle={8}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {pieData.map((_entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity cursor-pointer" />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            <Card className="p-8 rounded-[32px] border-slate-100 shadow-sm bg-slate-50/50">
                                <h4 className="font-bold text-slate-800 mb-8 uppercase text-[10px] tracking-widest text-center">Status Distribution</h4>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={barData}>
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                                            />
                                            <YAxis hide />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(108, 62, 255, 0.05)', radius: 8 }}
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Bar dataKey="count" fill="#6C3EFF" radius={[10, 10, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>

                        <div className="mt-10 p-8 bg-indigo-50/30 rounded-[32px] border border-[#6C3EFF]/10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-[#6C3EFF]/10 rounded-xl">
                                    <Bot className="h-5 w-5 text-[#6C3EFF]" />
                                </div>
                                <h4 className="text-sm font-bold text-[#6C3EFF] uppercase tracking-wider">AI Observation</h4>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                Today's attendance is holding steady at <span className="text-[#6C3EFF] font-bold">85%</span>.
                                We've noticed a <span className="text-emerald-600 font-bold">12% decrease</span> in late arrivals compared to the monthly average.
                                Peak check-in density occurred between 8:50 AM and 9:10 AM. WFH engagement remains high within the design team.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function StatCard({ label, value, theme, icon: Icon }: { label: string; value: string; theme: "indigo" | "emerald" | "blue" | "rose" | "amber"; icon: any }) {
    const themes = {
        indigo: { bg: "bg-indigo-50/50", text: "text-indigo-900", accent: "text-indigo-400", iconText: "text-indigo-500" },
        emerald: { bg: "bg-emerald-50/50", text: "text-emerald-900", accent: "text-emerald-400", iconText: "text-emerald-500" },
        blue: { bg: "bg-blue-50/50", text: "text-blue-900", accent: "text-blue-400", iconText: "text-blue-500" },
        rose: { bg: "bg-rose-50/50", text: "text-rose-900", accent: "text-rose-400", iconText: "text-rose-500" },
        amber: { bg: "bg-amber-50/50", text: "text-amber-900", accent: "text-amber-400", iconText: "text-amber-500" },
    };

    const t = themes[theme] || themes.indigo;

    return (
        <Card className={`p-6 rounded-[32px] border-none ${t.bg} shadow-sm transition-all hover:shadow-md`}>
            <p className={`text-[10px] font-bold ${t.accent} uppercase tracking-wider mb-2`}>{label}</p>
            <div className="flex items-end justify-between">
                <p className={`text-3xl font-bold ${t.text} leading-none`}>{value}</p>
                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Icon className={`h-4 w-4 ${t.iconText}`} />
                </div>
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
                                <h3 className="font-bold text-slate-800">Attendance AI</h3>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
                                <X className="h-4 w-4 text-slate-400" />
                            </Button>
                        </div>

                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-6">
                                <div className="flex flex-col items-start">
                                    <div className="bg-slate-100 p-4 rounded-2xl text-xs font-bold text-slate-600 leading-relaxed max-w-[90%]">
                                        Hello! I can help you analyze employee attendance trends, identify top late-comers, or verify leave eligibility against company policy. What would you like to know today?
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>

                        <div className="p-6 border-t bg-white">
                            <div className="relative">
                                <Input placeholder="Ask about attendance..." className="h-12 pr-12 rounded-xl focus-visible:ring-[#6C3EFF]/20" />
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
