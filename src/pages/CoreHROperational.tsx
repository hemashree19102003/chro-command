import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Users, Clock, Calendar, FileText, BarChart3,
    Plus, ArrowLeft, Settings, UserPlus, Sliders, Database,
    LayoutGrid, CheckCircle2, X, MoreHorizontal, Building2,
    Briefcase, ChevronRight, Upload, AlertCircle, Check,
    Timer, ClipboardList, Search, Filter, Mail, Phone, MapPin, Zap, Info, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
type Employee = { id: string; name: string; email: string; phone: string; dept: string; desig: string; joinDate: string; type: string; status: 'Active' | 'Inactive'; img: string; };
type AttendanceLog = { id: string; empId: string; name: string; date: string; checkIn: string; checkOut: string; totalHours: string; status: 'Present' | 'Absent' | 'Late' | 'Leave'; };

// --- Mock Data ---
const initialEmployees: Employee[] = [
    { id: "EMP001", name: "Rahul Sharma", email: "rahul@chro.com", phone: "9876543210", dept: "Engineering", desig: "Senior Developer", joinDate: "2024-01-12", type: "Full-time", status: "Active", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop" },
    { id: "EMP002", name: "Ananya Iyer", email: "ananya@chro.com", phone: "9876543211", dept: "HR", desig: "HR Head", joinDate: "2024-02-15", type: "Full-time", status: "Active", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" },
    { id: "EMP003", name: "Arjun Patel", email: "arjun@chro.com", phone: "9876543212", dept: "Finance", desig: "Accountant", joinDate: "2023-11-05", type: "Full-time", status: "Active", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop" },
    { id: "EMP004", name: "Siddharth Malhotra", email: "sid@chro.com", phone: "9876543213", dept: "Engineering", desig: "Tech Lead", joinDate: "2023-09-20", type: "Full-time", status: "Active", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop" },
    { id: "EMP005", name: "Vikram Singh", email: "marketing@chro.com", phone: "9876543214", dept: "Marketing", desig: "Marketing Head", joinDate: "2024-03-01", type: "Full-time", status: "Active", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop" },
];

const initialAttendance: AttendanceLog[] = [
    { id: "1", empId: "EMP001", name: "Rahul Sharma", date: "2026-02-14", checkIn: "09:05 AM", checkOut: "06:15 PM", totalHours: "9h 10m", status: "Present" },
    { id: "2", empId: "EMP002", name: "Ananya Iyer", date: "2026-02-14", checkIn: "09:30 AM", checkOut: "06:45 PM", totalHours: "9h 15m", status: "Late" },
    { id: "3", empId: "EMP003", name: "Arjun Patel", date: "2026-02-14", checkIn: "---", checkOut: "---", totalHours: "0h", status: "Absent" },
    { id: "4", empId: "EMP004", name: "Siddharth Malhotra", date: "2026-02-14", checkIn: "08:55 AM", checkOut: "05:50 PM", totalHours: "8h 55m", status: "Present" },
    { id: "5", empId: "EMP005", name: "Vikram Singh", date: "2026-02-14", checkIn: "---", checkOut: "---", totalHours: "0h", status: "Leave" },
];

const initialDepts = [
    { name: "Engineering", head: "Siddharth Malhotra", count: 148 },
    { name: "HR", head: "Ananya Iyer", count: 12 },
    { name: "Finance", head: "Arjun Patel", count: 8 },
    { name: "Marketing", head: "Vikram Singh", count: 24 },
];

const initialDesigs = [
    { name: "Senior Developer", dept: "Engineering", level: "Senior" },
    { name: "HR Head", dept: "HR", level: "Lead" },
    { name: "Accountant", dept: "Finance", level: "Mid" },
    { name: "Tech Lead", dept: "Engineering", level: "Lead" },
];

const initialRoles = [
    { name: "Super Admin", perms: "Full Access", count: 2 },
    { name: "HR Manager", perms: "View, Edit, Approve", count: 5 },
    { name: "Employee", perms: "Self Service", count: 345 },
];

const initialCustomFields = [
    { name: "Blood Group", type: "Dropdown", req: "Yes" },
    { name: "LinkedIn Profile", type: "Text", req: "No" },
    { name: "Emergency Contact", type: "Number", req: "Yes" },
];

export default function CoreHROperational() {
    const { moduleId, subTab = "directory" } = useParams();
    const navigate = useNavigate();

    // --- Global States ---
    const [employees, setEmployees] = useState(initialEmployees);
    const [attendance, setAttendance] = useState(initialAttendance);
    const [depts, setDepts] = useState(initialDepts);
    const [designations, setDesignations] = useState(initialDesigs);
    const [roles, setRoles] = useState(initialRoles);
    const [customFields, setCustomFields] = useState(initialCustomFields);

    // --- Backend Integration ---
    useEffect(() => {
        const fetchBackendData = async () => {
            try {
                const [empRes, deptRes, desigRes] = await Promise.all([
                    fetch('http://localhost:3001/api/employees'),
                    fetch('http://localhost:3001/api/departments'),
                    fetch('http://localhost:3001/api/designations')
                ]);

                if (empRes.ok) {
                    const rawEmps = await empRes.json();
                    console.log('✅ Backend employees loaded:', rawEmps.length);
                    setEmployees(rawEmps.map((e: any) => ({ ...e, dept: e.department, desig: e.designation })));
                }
                if (deptRes.ok) {
                    const rawDepts = await deptRes.json();
                    setDepts(rawDepts.map((d: any) => ({ ...d, count: d.count || Math.floor(Math.random() * 50) + 5 })));
                }
                if (desigRes.ok) {
                    const rawDesigs = await desigRes.json();
                    setDesignations(rawDesigs.map((d: any) => ({ ...d, dept: d.department })));
                }
            } catch (error) {
                console.error("Backend connection failed, using local data:", error);
            }
        };
        fetchBackendData();
    }, []);
    const [holidays, setHolidays] = useState([{ name: "Republic Day", date: "2026-01-26" }, { name: "Holi", date: "2026-03-14" }]);
    const [lifecycleLogs, setLifecycleLogs] = useState([{ emp: "Rahul Sharma", type: "Confirmation", date: "2024-04-12", notes: "Successfully completed probation." }]);

    const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
    const [manageLifecycle, setManageLifecycle] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    // Modal States
    const [modals, setModals] = useState<Record<string, boolean>>({});
    const toggleModal = (id: string, state: boolean) => setModals(m => ({ ...m, [id]: state }));
    const [editingLog, setEditingLog] = useState<any>(null);

    // --- Sidebar Config ---
    const sidebarItems: Record<string, any[]> = {
        "employee-management": [
            { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
            { id: "directory", label: "Employee Directory", icon: Users },
            { id: "add", label: "Add Employee", icon: UserPlus, action: () => toggleModal('addEmp', true) },
            { id: "org-chart", label: "Organization Chart", icon: Sliders },
            { id: "departments", label: "Departments", icon: Building2 },
            { id: "designations", label: "Designations", icon: Briefcase },
            { id: "lifecycle", label: "Employee Lifecycle", icon: Clock },
            { id: "access", label: "Access Control", icon: Shield },
            { id: "custom-fields", label: "Custom Fields", icon: Database },
            { id: "settings", label: "Settings", icon: Settings },
        ],
        "attendance-management": [
            { id: "overview", label: "Attendance Overview", icon: LayoutGrid },
            { id: "daily", label: "Daily Attendance", icon: ClipboardList },
            { id: "mark", label: "Mark Attendance", icon: CheckCircle2 },
            { id: "shifts", label: "Shift Management", icon: Timer },
            { id: "leaves", label: "Leave & Permissions", icon: Calendar },
            { id: "overtime", label: "Overtime Tracking", icon: Clock },
            { id: "timesheets", label: "Timesheets", icon: FileText },
            { id: "reports", label: "Reports", icon: BarChart3 },
            { id: "settings", label: "Settings", icon: Settings },
        ]
    };

    const navItems = sidebarItems[moduleId || "employee-management"] || [];

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-['Inter',_sans-serif] text-[#1e293b]">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-white flex flex-col shrink-0 fixed h-full z-20">
                <div className="h-16 border-b flex items-center px-6 gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[#6C3EFF] flex items-center justify-center shrink-0">
                        {moduleId === 'attendance-management' ? <Clock className="h-4 w-4 text-white" /> : <Users className="h-4 w-4 text-white" />}
                    </div>
                    <span className="font-bold text-lg tracking-tight">CHRO Admin</span>
                </div>
                <div className="p-4 flex-1 overflow-y-auto">
                    <button onClick={() => navigate("/people/core-hr")} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-[#6C3EFF] transition-colors mb-6 uppercase tracking-widest">
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to Core HR
                    </button>
                    <p className="px-4 mb-2 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{moduleId?.replace('-', ' ')}</p>
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (item.action) item.action();
                                    else {
                                        setSelectedEmp(null);
                                        setManageLifecycle(null);
                                        navigate(`/people/core-hr/${moduleId}/app/${item.id}`);
                                    }
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${(subTab === item.id || (item.id === 'directory' && !subTab)) && !selectedEmp && !manageLifecycle
                                    ? "bg-[#6C3EFF]/10 text-[#6C3EFF] font-bold"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 flex flex-col min-w-0">
                <header className="h-16 border-b bg-white flex items-center justify-between px-8 sticky top-0 z-10">
                    <div className="flex items-center gap-4 flex-1 max-w-xl">
                        <Search className="h-4 w-4 text-slate-400" />
                        <Input
                            value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search..." className="border-none bg-transparent h-10 shadow-none focus-visible:ring-0 text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-500 border border-slate-200">AD</div>
                            <div className="hidden md:block">
                                <p className="text-xs font-bold leading-none">Admin User</p>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase">HR Manager</p>
                            </div>
                        </div>
                        <Settings className="h-5 w-5 text-slate-400 cursor-pointer hover:text-slate-600" />
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <AnimatePresence mode="wait">
                        <motion.div key={moduleId + subTab + (selectedEmp ? 'prof' : '') + (manageLifecycle || '')} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                            {selectedEmp ? (
                                <EmployeeProfile employee={selectedEmp} onBack={() => setSelectedEmp(null)} />
                            ) : manageLifecycle ? (
                                <LifecycleDetailPage type={manageLifecycle} onBack={() => setManageLifecycle(null)} logs={lifecycleLogs.filter(l => l.type === manageLifecycle)} onAdd={() => toggleModal('addLifecycle', true)} />
                            ) : moduleId === 'attendance-management' ? (
                                // --- Attendance Management Views ---
                                <>
                                    {subTab === 'overview' && <AttendanceOverview />}
                                    {subTab === 'daily' && <DailyAttendance data={attendance} onEdit={(log) => { setEditingLog(log); toggleModal('editAtt', true); }} />}
                                    {subTab === 'mark' && <MarkAttendanceForm navigate={navigate} onSave={(log: any) => { setAttendance([...attendance, log]); toast.success("Attendance Recorded Successfully"); navigate(`/people/core-hr/${moduleId}/app/daily`); }} />}
                                    {subTab === 'shifts' && <ShiftManagementView data={[]} onAdd={() => toggleModal('addShift', true)} />}
                                    {subTab === 'leaves' && <LeavePermissionsView data={[]} onAdd={() => toggleModal('applyLeave', true)} />}
                                    {subTab === 'overtime' && <OvertimeView data={[]} onAdd={() => toggleModal('addOT', true)} />}
                                    {subTab === 'timesheets' && <TimesheetView data={[]} onAdd={() => toggleModal('submitTS', true)} />}
                                    {subTab === 'reports' && <ReportsView />}
                                    {subTab === 'settings' && <SettingsAttView holidays={holidays} onAdd={() => toggleModal('addHoliday', true)} />}
                                </>
                            ) : (
                                // --- Employee Management Views ---
                                <>
                                    {subTab === 'dashboard' || (!subTab && moduleId === 'employee-management') ? <EmployeeDashboard /> : null}
                                    {subTab === 'directory' && <EmployeeDirectory data={employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()))} onRowClick={setSelectedEmp} onAdd={() => toggleModal('addEmp', true)} />}
                                    {subTab === 'org-chart' && <OrgChart onAdd={() => toggleModal('addPosition', true)} />}
                                    {subTab === 'departments' && <DepartmentsView data={depts} onAdd={() => toggleModal('addDept', true)} />}
                                    {subTab === 'designations' && <DesignationsView data={designations} onAdd={() => toggleModal('addDesig', true)} />}
                                    {subTab === 'lifecycle' && <LifecycleOverview onManage={setManageLifecycle} />}
                                    {subTab === 'access' && <AccessControlView data={roles} onAdd={() => toggleModal('addRole', true)} />}
                                    {subTab === 'custom-fields' && <CustomFieldsView data={customFields} onAdd={() => toggleModal('addField', true)} />}
                                    {subTab === 'settings' && <CompanySettingsView />}
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* --- Modals --- */}
            <SimpleModal open={modals.addEmp} onOpenChange={(s) => toggleModal('addEmp', s)} title="Add Employee"
                fields={[{ n: 'First Name', p: 'Rahul', r: true }, { n: 'Last Name', p: 'Dev', r: true }, { n: 'Email', p: 'rahul@chro.com', t: 'email', r: true }, { n: 'Phone', p: '9876543210', r: true }, { n: 'Dept', p: 'Engineering', r: true }, { n: 'Designation', p: 'Web Dev', r: true }, { n: 'Joining Date', t: 'date', r: true }]}
                onSave={(v: any) => { setEmployees([...employees, { id: `EMP0${employees.length + 1}`, name: `${v[0]} ${v[1]}`, email: v[2], phone: v[3], dept: v[4], desig: v[5], joinDate: v[6], type: 'Full-time', status: 'Active', img: `https://i.pravatar.cc/150?u=${Math.random()}` }]); toast.success("Employee Added Successfully"); }}
            />
            <SimpleModal open={modals.addDept} onOpenChange={(s) => toggleModal('addDept', s)} title="Add Department"
                fields={[{ n: 'Department Name', p: 'Sales' }, { n: 'Department Head', p: 'Name' }, { n: 'Description', p: 'Details' }]}
                onSave={(v: any) => { setDepts([...depts, { name: v[0], head: v[1], count: 0 }]); toast.success("Department Added Successfully"); }}
            />
            <SimpleModal open={modals.addDesig} onOpenChange={(s) => toggleModal('addDesig', s)} title="Add Designation"
                fields={[{ n: 'Designation Title', p: 'Senior Lead' }, { n: 'Department', p: 'HR' }, { n: 'Level', p: 'Senior' }]}
                onSave={(v: any) => { setDesignations([...designations, { name: v[0], dept: v[1], level: v[2] }]); toast.success("Designation Added Successfully"); }}
            />
            <SimpleModal open={modals.addLifecycle} onOpenChange={(s) => toggleModal('addLifecycle', s)} title="Add Lifecycle Record"
                fields={[{ n: 'Employee Name', p: 'Rahul Sharma' }, { n: 'Action Type', p: 'Promotion' }, { n: 'Effective Date', t: 'date' }, { n: 'Notes', p: 'Details' }]}
                onSave={(v: any) => { setLifecycleLogs([...lifecycleLogs, { emp: v[0], type: manageLifecycle!, date: v[2], notes: v[3] }]); toast.success("Record Added Successfully"); }}
            />
            <SimpleModal open={modals.addRole} onOpenChange={(s) => toggleModal('addRole', s)} title="Create Role"
                fields={[{ n: 'Role Name', p: 'Manager' }, { n: 'Permissions', p: 'View, Edit' }, { n: 'Assign Employees', p: 'Select...' }]}
                onSave={(v: any) => { setRoles([...roles, { name: v[0], perms: v[1], count: 0 }]); toast.success("Role Created Successfully"); }}
            />
            <SimpleModal open={modals.addField} onOpenChange={(s) => toggleModal('addField', s)} title="Add Custom Field"
                fields={[{ n: 'Field Name', p: 'Blood Group' }, { n: 'Field Type', p: 'Dropdown' }, { n: 'Required', p: 'Yes' }]}
                onSave={(v: any) => { setCustomFields([...customFields, { name: v[0], type: v[1], req: v[2] }]); toast.success("Field Added Successfully"); }}
            />
            <SimpleModal open={modals.addPosition} onOpenChange={(s) => toggleModal('addPosition', s)} title="Add Position"
                fields={[{ n: 'Position Name', p: 'Tech Lead' }, { n: 'Reports To', p: 'CEO' }]}
                onSave={() => toast.success("Position Added Successfully")}
            />
            {/* Attendance Modals (same as before) */}
            <SimpleModal open={modals.editAtt} onOpenChange={(s) => toggleModal('editAtt', s)} title="Edit Attendance" fields={[{ n: 'Check-in', v: editingLog?.checkIn }, { n: 'Check-out', v: editingLog?.checkOut }, { n: 'Status', v: editingLog?.status }]} onSave={(v: any) => { setAttendance(attendance.map(a => a.id === editingLog.id ? { ...a, checkIn: v[0], checkOut: v[1], status: v[2] } : a)); toast.success("Updated Successfully"); }} />
            <SimpleModal open={modals.addHoliday} onOpenChange={(s) => toggleModal('addHoliday', s)} title="Add Holiday" fields={[{ n: 'Holiday Name' }, { n: 'Date', t: 'date' }]} onSave={(v: any) => { setHolidays([...holidays, { name: v[0], date: v[1] }]); toast.success("Holiday Added Successfully"); }} />
        </div>
    );
}

// --- Employee Management Components ---

function EmployeeDashboard() {
    const navigate = useNavigate();
    return (
        <div className="space-y-8 pb-12">
            {/* Welcome Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-2xl overflow-hidden border-2 border-white shadow-lg">
                        <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Good Morning, Admin!</h1>
                        <p className="text-sm text-slate-500 font-medium mt-1 italic opacity-80">"Efficiency is doing things right; effectiveness is doing the right things."</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="h-10 rounded-xl border-slate-200 text-slate-600 font-bold px-5 hover:bg-slate-50">
                        <Calendar className="h-4 w-4 mr-2" /> Planner
                    </Button>
                    <Button className="h-10 rounded-xl bg-[#6C3EFF] hover:bg-[#5a31d6] text-white font-bold px-5 shadow-lg shadow-[#6C3EFF]/20">
                        <Zap className="h-4 w-4 mr-2" /> Self Service
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Column (Main Widgets) */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <DashboardMiniStat label="Total Employees" val="542" icon={Users} trend="+4.5%" positive />
                        <DashboardMiniStat label="New Joiners" val="12" icon={UserPlus} trend="+12.2%" positive />
                        <DashboardMiniStat label="Open Jobs" val="08" icon={Briefcase} trend="-2.1%" />
                        <DashboardMiniStat label="Headcount Cost" val="$2.4M" icon={Database} trend="+0.8%" />
                    </div>

                    {/* Zoho Style Task & Hiring Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="p-8 rounded-[32px] border-slate-200/60 shadow-sm flex flex-col h-full bg-white">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-[#6C3EFF]" /> My Pending Tasks
                                </h3>
                                <span className="text-[10px] font-bold text-[#6C3EFF] bg-[#6C3EFF]/10 px-2 py-0.5 rounded-full">05 New</span>
                            </div>
                            <div className="space-y-4 flex-1">
                                {[
                                    { t: 'Approve Leave Request', d: 'Rahul Sharma • Sick Leave', p: 'High' },
                                    { t: 'Document Verification', d: 'New Hire: Priya Mani', p: 'Medium' },
                                    { t: 'Confirm Probation', d: 'Arjun Patel', p: 'High' },
                                ].map((task, i) => (
                                    <div key={i} className="flex items-start justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group cursor-pointer">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 h-2 w-2 rounded-full bg-[#6C3EFF]" />
                                            <div>
                                                <p className="text-sm font-bold text-slate-800 group-hover:text-[#6C3EFF] transition-colors">{task.t}</p>
                                                <p className="text-[10px] text-slate-400 mt-1">{task.d}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${task.p === 'High' ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'}`}>{task.p}</span>
                                    </div>
                                ))}
                            </div>
                            <Button variant="ghost" className="w-full mt-6 text-[#6C3EFF] font-bold text-xs uppercase tracking-widest hover:bg-[#6C3EFF]/5">View All Tasks</Button>
                        </Card>

                        <Card className="p-8 rounded-[32px] border-slate-200/60 shadow-sm bg-white">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-slate-800">Recruitment Pipeline</h3>
                                <BarChart3 className="h-4 w-4 text-slate-300" />
                            </div>
                            <div className="space-y-6">
                                {[
                                    { l: 'Applied', c: 145, pct: 100, color: 'bg-slate-200' },
                                    { l: 'Interview', c: 32, pct: 25, color: 'bg-amber-400' },
                                    { l: 'Selected', c: 14, pct: 12, color: 'bg-[#6C3EFF]' },
                                    { l: 'Offered', c: 8, pct: 8, color: 'bg-emerald-500' },
                                ].map(p => (
                                    <div key={p.l} className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                                            <span className="text-slate-500">{p.l}</span>
                                            <span className="text-slate-800">{p.c}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${p.pct}%` }} className={`h-full ${p.color}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div><p className="text-xs font-bold text-slate-800">Active Postings</p><p className="text-[10px] text-slate-400">08 Current openings</p></div>
                                <Button size="sm" className="bg-slate-900 text-white rounded-lg px-4 font-bold text-[10px]">Manage Jobs</Button>
                            </div>
                        </Card>
                    </div>

                    <Card className="p-8 rounded-[32px] border-slate-200/60 shadow-sm bg-white overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="font-bold text-slate-800">Attendance Today</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live Updates • 14 Feb 2026</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex flex-col items-end">
                                    <span className="text-xl font-black text-slate-900 leading-none">92%</span>
                                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-tight">On Track</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                                        <span className="text-slate-400">Status Distribution</span>
                                        <span className="text-[#6C3EFF]">542 Total</span>
                                    </div>
                                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                        <div className="h-full bg-[#6C3EFF]" style={{ width: '80%' }} />
                                        <div className="h-full bg-amber-400" style={{ width: '10%' }} />
                                        <div className="h-full bg-rose-400" style={{ width: '5%' }} />
                                        <div className="h-full bg-slate-300" style={{ width: '5%' }} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                        {[
                                            { l: 'Present', c: 432, cl: 'bg-[#6C3EFF]' },
                                            { l: 'Late', c: 54, cl: 'bg-amber-400' },
                                            { l: 'Absent', c: 28, cl: 'bg-rose-400' },
                                            { l: 'On Leave', c: 28, cl: 'bg-slate-300' },
                                        ].map(s => (
                                            <div key={s.l} className="flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.cl.split('-')[1] === 'amber' ? '#fbbf24' : s.cl.split('-')[1] === 'rose' ? '#f43f5e' : s.cl.split('-')[1] === 'slate' ? '#94a3b8' : '#6C3EFF' }} />
                                                <span className="text-[10px] font-bold text-slate-600">{s.l}</span>
                                                <span className="text-[10px] font-bold text-slate-400 ml-auto">{s.c}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-50">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Presence by Hour</h4>
                                    <div className="flex items-end justify-between h-20 gap-1.5">
                                        {[30, 45, 80, 70, 95, 85, 90, 80, 60, 40].map((val, i) => (
                                            <div key={i} className="flex-1 bg-slate-50 rounded-t-sm relative group">
                                                <motion.div initial={{ height: 0 }} animate={{ height: `${val}%` }} className="absolute bottom-0 w-full bg-[#6C3EFF]/10 group-hover:bg-[#6C3EFF] transition-colors" />
                                                <div className="absolute -bottom-4 left-0 w-full text-center text-[8px] font-bold text-slate-300">
                                                    {8 + i}h
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50/50 rounded-3xl p-6">
                                <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center justify-between">
                                    Recent Check-ins
                                    <span className="text-[8px] font-extrabold text-[#6C3EFF] cursor-pointer hover:underline">View All</span>
                                </h4>
                                <div className="space-y-4">
                                    {[
                                        { n: 'Rahul Sharma', t: '09:05 AM', s: 'At Office', m: 'ENG' },
                                        { n: 'Ananya Iyer', t: '09:12 AM', s: 'Remote', m: 'HR' },
                                        { n: 'Arjun Patel', t: '09:24 AM', s: 'At Office', m: 'FIN' },
                                        { n: 'Sid Malhotra', t: '09:30 AM', s: 'At Office', m: 'ENG' },
                                        { n: 'Vikram Singh', t: '09:45 AM', s: 'Late', m: 'MKT' },
                                    ].map((log, i) => (
                                        <div key={i} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                                                <div>
                                                    <p className="text-[11px] font-bold text-slate-800">{log.n}</p>
                                                    <p className="text-[9px] text-slate-400 font-medium">{log.m} • {log.s}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500 tabular-nums">{log.t}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column (Sidebar Style) */}
                <div className="space-y-8">
                    {/* Quick Links */}
                    <Card className="p-8 rounded-[32px] border-slate-200/60 shadow-sm bg-white">
                        <h3 className="font-bold text-sm mb-6 text-slate-800">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { l: 'Add New', icon: UserPlus, c: 'bg-indigo-50 text-indigo-600', tab: 'add', action: () => toggleModal('addEmp', true) },
                                { l: 'Directory', icon: Users, c: 'bg-emerald-50 text-emerald-600', tab: 'directory' },
                                { l: 'Org Chart', icon: Sliders, c: 'bg-amber-50 text-amber-600', tab: 'org-chart' },
                                { l: 'Policies', icon: Shield, c: 'bg-rose-50 text-rose-600', tab: 'access' },
                            ].map(link => (
                                <button
                                    key={link.l}
                                    onClick={() => link.action ? link.action() : navigate(`/people/core-hr/employee-management/app/${link.tab}`)}
                                    className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-50 hover:border-[#6C3EFF]/20 hover:bg-[#6C3EFF]/5 transition-all gap-2 group"
                                >
                                    <div className={`h-10 w-10 rounded-xl ${link.c} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <link.icon className="h-5 w-5" />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-[#6C3EFF] transition-colors">{link.l}</span>
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Celebrations Section */}
                    <Card className="p-8 rounded-[32px] border-slate-200/60 shadow-sm bg-white">
                        <h3 className="font-bold text-sm mb-6 text-slate-800 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-500 fill-amber-500" /> Celebrations
                        </h3>
                        <div className="space-y-5">
                            <div className="flex gap-4 items-center">
                                <div className="h-10 w-10 rounded-full border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                                    <img src="https://i.pravatar.cc/150?u=a" alt="" className="h-full w-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">Ananya Iyer</p>
                                    <p className="text-[10px] text-slate-400">Birthday • Today</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-center">
                                <div className="h-10 w-10 rounded-full border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                                    <img src="https://i.pravatar.cc/150?u=b" alt="" className="h-full w-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">Sid Malhotra</p>
                                    <p className="text-[10px] text-slate-400">2 Year Anniversary • 18 Feb</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Announcements */}
                    <Card className="p-8 rounded-[32px] border-slate-200/60 shadow-sm bg-indigo-600 text-white relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="font-bold text-sm mb-2">Announcement</h3>
                            <p className="text-xs text-indigo-100/90 leading-relaxed mb-6">"Quarterly town hall meeting scheduled for next Friday at 4:30 PM."</p>
                            <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold border rounded-lg px-4 h-8 text-[10px]">RSVP Now</Button>
                        </div>
                        <div className="absolute -bottom-6 -right-6 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    </Card>
                </div>
            </div>
        </div>
    );
}

function DashboardMiniStat({ label, val, icon: Icon, trend, positive }: any) {
    return (
        <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col gap-1">
            <div className="flex items-center justify-between mb-2">
                <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                    <Icon className="h-4 w-4" />
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>{trend}</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-800 leading-tight">{val}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        </div>
    );
}

function EmployeeDirectory({ data, onRowClick, onAdd }: any) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold tracking-tight">Employee Directory</h1><p className="text-sm text-slate-500 font-medium mt-1">Manage employees, structure, and lifecycle efficiently.</p></div>
                <Button onClick={onAdd} className="bg-[#6C3EFF] font-bold shadow-lg shadow-[#6C3EFF]/20 h-10 px-5"><Plus className="h-4 w-4 mr-2" /> Add Employee</Button>
            </div>
            <Card className="rounded-[24px] border-slate-200/60 overflow-hidden bg-white">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow><TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">ID</TableHead><TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Name</TableHead><TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Email</TableHead><TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Department</TableHead><TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Status</TableHead><TableHead /></TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((e: any) => (
                            <TableRow key={e.id} className="group cursor-pointer hover:bg-slate-50 border-slate-50" onClick={() => onRowClick(e)}>
                                <TableCell className="font-mono text-xs font-bold text-[#6C3EFF]">{e.id}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full overflow-hidden border border-slate-200">
                                            <img src={e.img} alt={e.name} className="h-full w-full object-cover" />
                                        </div>
                                        <span className="font-bold">{e.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm text-slate-500">{e.email}</TableCell><TableCell className="text-sm font-medium">{e.dept}</TableCell><TableCell><span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-[10px] font-bold">Active</span></TableCell>
                                <TableCell className="text-right"><ChevronRight className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

function OrgChart({ onAdd }: any) {
    return (
        <div className="space-y-12 flex flex-col items-center py-10">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Organization Chart</h1>
                <Button size="sm" onClick={onAdd} className="mt-4 border border-[#6C3EFF] text-[#6C3EFF] bg-white hover:bg-[#6C3EFF] hover:text-white font-bold transition-all"><Plus className="h-4 w-4 mr-2" /> Add Position</Button>
            </div>
            <OrgNode name="Rakesh Bansal" role="CEO & Founder" img="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop" />
            <div className="h-10 w-px bg-slate-200" />
            <div className="flex gap-16 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-slate-200" />
                <div className="flex flex-col items-center gap-6"><div className="h-6 w-px bg-slate-200" /><OrgNode name="Ananya Iyer" role="HR Head" img="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" /></div>
                <div className="flex flex-col items-center gap-6"><div className="h-6 w-px bg-slate-200" /><OrgNode name="Sid Malhotra" role="Tech Lead" img="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop" /></div>
            </div>
            <div className="flex gap-8 mt-4">
                <OrgNode name="Dev 1" role="Developer" img="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop" />
                <OrgNode name="Dev 2" role="Developer" img="https://i.pravatar.cc/150?u=dev2" />
            </div>
        </div>
    );
}

function OrgNode({ name, role, img }: { name: string, role: string, img?: string }) {
    return (
        <div className="bg-white border-2 border-slate-50 rounded-[28px] p-6 shadow-sm min-w-[180px] text-center">
            <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-white shadow-md mx-auto mb-3">
                {img ? (
                    <img src={img} alt={name} className="h-full w-full object-cover" />
                ) : (
                    <div className="h-full w-full bg-[#6C3EFF]/10 flex items-center justify-center text-sm font-bold text-[#6C3EFF]">
                        {name[0]}
                    </div>
                )}
            </div>
            <h4 className="font-extrabold text-sm">{name}</h4>
            <p className="text-[9px] uppercase font-bold text-[#6C3EFF] tracking-widest mt-1">{role}</p>
        </div>
    );
}

function DepartmentsView({ data, onAdd }: any) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between"><h1 className="text-2xl font-bold tracking-tight">Departments</h1><Button onClick={onAdd} className="bg-[#6C3EFF] font-bold h-10 px-5 shadow-lg shadow-[#6C3EFF]/20"><Plus className="h-4 w-4 mr-2" /> Add Department</Button></div>
            <Card className="rounded-[24px] border-slate-200/60 overflow-hidden"><Table><TableHeader className="bg-slate-50/50"><TableRow><TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Dept Name</TableHead><TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Head</TableHead><TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Employees</TableHead><TableHead /></TableRow></TableHeader>
                <TableBody>{data.map((d: any) => (<TableRow key={d.name} className="border-slate-50"><TableCell className="font-bold">{d.name}</TableCell><TableCell className="text-sm">{d.head}</TableCell><TableCell className="text-sm font-medium">{d.count}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" className="text-slate-300"><MoreHorizontal className="h-4 w-4" /></Button></TableCell></TableRow>))}</TableBody></Table></Card>
        </div>
    );
}

function DesignationsView({ data, onAdd }: any) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between"><h1 className="text-2xl font-bold tracking-tight">Designations</h1><Button onClick={onAdd} className="bg-[#6C3EFF] font-bold h-10 px-5 shadow-lg shadow-[#6C3EFF]/20"><Plus className="h-4 w-4 mr-2" /> Add Designation</Button></div>
            <Card className="rounded-[24px] border-slate-200/60 overflow-hidden"><Table><TableHeader className="bg-slate-50/50"><TableRow><TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Title</TableHead><TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Dept</TableHead><TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Level</TableHead><TableHead /></TableRow></TableHeader>
                <TableBody>{data.map((d: any) => (<TableRow key={d.name} className="border-slate-50"><TableCell className="font-bold">{d.name}</TableCell><TableCell className="text-sm">{d.dept}</TableCell><TableCell className="text-xs font-bold text-[#6C3EFF]">{d.level}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" className="text-slate-300"><MoreHorizontal className="h-4 w-4" /></Button></TableCell></TableRow>))}</TableBody></Table></Card>
        </div>
    );
}

function LifecycleOverview({ onManage }: any) {
    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold tracking-tight">Employee Lifecycle</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {["Onboarding", "Confirmation", "Promotion", "Transfer", "Exit"].map(type => (
                    <Card key={type} className="rounded-[32px] border-slate-200/60 p-6 group hover:shadow-md transition-shadow">
                        <div className="h-10 w-10 rounded-2xl bg-[#6C3EFF]/5 flex items-center justify-center text-[#6C3EFF] mb-4"><Zap className="h-5 w-5" /></div>
                        <h3 className="font-bold text-lg">{type}</h3>
                        <p className="text-xs text-slate-400 mt-1 mb-6">Manage all {type.toLowerCase()} workflows.</p>
                        <Button variant="ghost" className="w-full text-[#6C3EFF] font-bold bg-[#6C3EFF]/5 hover:bg-[#6C3EFF] hover:text-white transition-all" onClick={() => onManage(type)}>Manage</Button>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function LifecycleDetailPage({ type, onBack, logs, onAdd }: any) {
    return (
        <div className="space-y-8">
            <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-[#6C3EFF] transition-colors uppercase tracking-widest"><ArrowLeft className="h-4 w-4" /> Back</button>
            <div className="flex items-center justify-between"><h1 className="text-3xl font-extrabold tracking-tight">{type}</h1><Button onClick={onAdd} className="bg-[#6C3EFF] font-bold shadow-lg shadow-[#6C3EFF]/20 text-white"><Plus className="h-4 w-4 mr-2" /> Add Record</Button></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-8 rounded-[32px] border-slate-200/60"><h3 className="font-bold mb-6 text-amber-500 flex items-center gap-2"><AlertCircle className="h-5 w-5" /> Pending Actions</h3><div className="space-y-3">{["Verification", "IT Setup"].map(a => <div key={a} className="p-4 rounded-xl bg-slate-50 border flex justify-between items-center"><span className="text-sm font-bold">{a}</span><Button variant="ghost" size="sm" className="text-[#6C3EFF] font-bold">Done</Button></div>)}</div></Card>
                <Card className="p-8 rounded-[32px] border-slate-200/60"><h3 className="font-bold mb-6 text-emerald-500 flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /> Completed</h3><div className="space-y-4">{logs.length > 0 ? logs.map((l, i) => <div key={i} className="p-4 rounded-xl border italic text-xs text-slate-500"><p className="font-bold text-slate-800 not-italic mb-1">{l.emp}</p>{l.notes} • {l.date}</div>) : <p className="text-slate-300 italic text-sm">No records yet.</p>}</div></Card>
            </div>
        </div>
    );
}

function AccessControlView({ data, onAdd }: any) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between"><h1 className="text-2xl font-bold tracking-tight">Access Control</h1><Button onClick={onAdd} className="bg-[#6C3EFF] font-bold h-10 px-5 shadow-lg shadow-[#6C3EFF]/20 text-white"><Plus className="h-4 w-4 mr-2" /> Create Role</Button></div>
            <Card className="rounded-[24px] border-slate-200/60 overflow-hidden"><Table><TableHeader className="bg-slate-50/50"><TableRow><TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Role Name</TableHead><TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Permissions</TableHead><TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Assigned</TableHead><TableHead /></TableRow></TableHeader>
                <TableBody>{data.map((r: any) => (<TableRow key={r.name} className="border-slate-50"><TableCell className="font-bold">{r.name}</TableCell><TableCell className="text-sm text-slate-500">{r.perms}</TableCell><TableCell className="text-sm font-medium">{r.count} Emp</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" className="text-slate-300"><Settings className="h-4 w-4" /></Button></TableCell></TableRow>))}</TableBody></Table></Card>
        </div>
    );
}

function CustomFieldsView({ data, onAdd }: any) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between"><h1 className="text-2xl font-bold tracking-tight">Custom Fields</h1><Button onClick={onAdd} className="bg-[#6C3EFF] font-bold h-10 px-5 shadow-lg shadow-[#6C3EFF]/20 text-white"><Plus className="h-4 w-4 mr-2" /> Add Field</Button></div>
            <Card className="rounded-[24px] border-slate-200/60 overflow-hidden"><Table><TableHeader className="bg-slate-50/50"><TableRow><TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Field Name</TableHead><TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Type</TableHead><TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400">Required</TableHead><TableHead /></TableRow></TableHeader>
                <TableBody>{data.map((f: any) => (<TableRow key={f.name} className="border-slate-50"><TableCell className="font-bold">{f.name}</TableCell><TableCell className="text-sm text-slate-500">{f.type}</TableCell><TableCell className="text-xs font-bold text-amber-600">{f.req}</TableCell><TableCell className="text-right"><Button variant="ghost" size="icon" className="text-slate-300"><MoreHorizontal className="h-4 w-4" /></Button></TableCell></TableRow>))}</TableBody></Table></Card>
        </div>
    );
}

function CompanySettingsView() {
    return (
        <div className="space-y-8 max-w-4xl">
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            {["Company Info", "HR Preferences", "Policy Setup"].map(s => (
                <Card key={s} className="rounded-3xl border-slate-200/60 overflow-hidden shadow-sm bg-white">
                    <div className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
                        <div><h3 className="font-bold">{s}</h3><p className="text-xs text-slate-400 mt-1">Config global parameters.</p></div>
                        <ChevronRight className="h-4 w-4 text-slate-300" />
                    </div>
                    {s === 'Company Info' && (
                        <div className="p-8 pt-2 border-t space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Company Name</label><Input defaultValue="CHRO Enterprises" /></div>
                                <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Time Zone</label><Input defaultValue="IST (UTC+5:30)" /></div>
                            </div>
                            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase">Address</label><Input defaultValue="456 Tech Park, Bangalore" /></div>
                            <div className="h-32 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-slate-300 gap-2 font-bold cursor-pointer hover:bg-slate-50 transition-all"><Upload className="h-6 w-6" /><p className="text-xs tracking-tight uppercase">Upload Brand Logo</p></div>
                            <Button className="bg-[#6C3EFF] font-bold shadow-lg shadow-[#6C3EFF]/20 h-10 px-8 text-white" onClick={() => toast.success("Settings Saved")}>Save Changes</Button>
                        </div>
                    )}
                </Card>
            ))}
        </div>
    );
}

// --- Attendance Management Components ---

function AttendanceOverview() {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <StatCard title="Total Employees" value="352" icon={Users} color="text-blue-600" bg="bg-blue-50" />
                <StatCard title="Present Today" value="328" icon={Check} color="text-emerald-600" bg="bg-emerald-50" />
                <StatCard title="Absent Today" value="12" icon={X} color="text-rose-600" bg="bg-rose-50" />
                <StatCard title="On Leave" value="12" icon={Calendar} color="text-amber-600" bg="bg-amber-50" />
                <StatCard title="Late Check-ins" value="18" icon={Clock} color="text-orange-600" bg="bg-orange-50" />
            </div>
            <Card className="p-8 rounded-[32px] border-slate-200/60 shadow-sm">
                <h3 className="text-lg font-bold mb-8">Attendance Trends (Last 7 Days)</h3>
                <div className="flex items-end justify-between h-48 gap-4 px-4">
                    {[85, 92, 88, 76, 94, 91, 89].map((val, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-3">
                            <div className="w-full bg-slate-100 rounded-lg relative h-full flex items-end">
                                <motion.div initial={{ height: 0 }} animate={{ height: `${val}%` }} className="w-full bg-[#6C3EFF]/20 border-t-2 border-[#6C3EFF]" />
                                <span className="absolute top-2 w-full text-center text-[10px] font-bold text-[#6C3EFF]">{val}%</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">Day {i + 1}</span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

function DailyAttendance({ data, onEdit }: any) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between"><h1 className="text-2xl font-bold tracking-tight">Daily Attendance</h1><div className="flex gap-3"><Input type="date" className="h-10 w-40 font-bold" /><Button variant="outline" className="h-10 border-slate-200 font-bold">Export</Button></div></div>
            <Card className="rounded-[24px] border-slate-200/60 overflow-hidden"><Table><TableHeader className="bg-slate-50/50"><TableRow><TableHead className="font-bold text-[9px] uppercase text-slate-400">ID</TableHead><TableHead className="font-bold text-[9px] uppercase text-slate-400">Employee</TableHead><TableHead className="font-bold text-[9px] uppercase text-slate-400">IN/OUT</TableHead><TableHead className="font-bold text-[9px] uppercase text-slate-400">Total</TableHead><TableHead className="font-bold text-[9px] uppercase text-slate-400">Status</TableHead><TableHead /></TableRow></TableHeader>
                <TableBody>{data.map((log: any) => (<TableRow key={log.id} className="border-slate-50 hover:bg-slate-50/50"><TableCell className="font-mono text-xs font-bold text-[#6C3EFF]">{log.empId}</TableCell><TableCell className="font-bold">{log.name}</TableCell><TableCell className="text-sm">{log.checkIn} - {log.checkOut}</TableCell><TableCell className="text-xs font-medium text-slate-500">{log.totalHours}</TableCell><TableCell><span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${log.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{log.status}</span></TableCell><TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => onEdit(log)} className="text-[#6C3EFF] font-bold">Edit</Button></TableCell></TableRow>))}</TableBody></Table></Card>
        </div>
    );
}

function MarkAttendanceForm({ onSave, navigate }: any) {
    return (
        <div className="max-w-xl mx-auto space-y-8"><h1 className="text-2xl font-bold tracking-tight">Mark Attendance</h1><Card className="p-8 rounded-[32px] border-slate-200/60"><form onSubmit={(e: any) => { e.preventDefault(); onSave({ id: 'M' + Date.now(), empId: 'TEMP', name: e.target.name.value, date: e.target.date.value, checkIn: e.target.in.value, checkOut: e.target.out.value, totalHours: '8h', status: e.target.status.value }); }} className="space-y-6"><div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Employee Name</label><Input name="name" required placeholder="Select Employee" /></div><div className="grid grid-cols-2 gap-6"><div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date</label><Input name="date" type="date" required /></div><div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</label><select name="status" className="w-full h-11 px-4 rounded-xl border bg-white focus:outline-none"><option>Present</option><option>Late</option></select></div></div><div className="grid grid-cols-2 gap-6"><div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Check-in</label><Input name="in" placeholder="09:00 AM" /></div><div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Check-out</label><Input name="out" placeholder="06:00 PM" /></div></div><div className="flex gap-3 pt-4"><Button type="submit" className="flex-1 bg-[#6C3EFF] h-12 font-bold shadow-lg shadow-[#6C3EFF]/20 text-white">Mark Attendance</Button><Button type="button" variant="outline" className="h-12 px-8 font-bold border-slate-200" onClick={() => navigate(-1)}>Cancel</Button></div></form></Card></div>
    );
}

// Placeholder wrappers to avoid repetition (detailed implementation similar to above)
function ShiftManagementView({ data, onAdd }: any) { return <GenericSimView title="Shift Management" onAdd={onAdd} />; }
function LeavePermissionsView({ data, onAdd }: any) { return <GenericSimView title="Leave & Permissions" onAdd={onAdd} />; }
function OvertimeView({ data, onAdd }: any) { return <GenericSimView title="Overtime Tracking" onAdd={onAdd} />; }
function TimesheetView({ data, onAdd }: any) { return <GenericSimView title="Timesheets" onAdd={onAdd} />; }
function ReportsView() { return <div className="p-20 text-center text-slate-300 font-bold italic border-2 border-dashed rounded-[40px] bg-white">Reports Module Simulator...</div>; }
function SettingsAttView({ holidays, onAdd }: any) { return <div className="p-20 text-center text-slate-300 font-bold italic border-2 border-dashed rounded-[40px] bg-white">Attendance Settings Simulator...</div>; }
function GenericSimView({ title, onAdd }: any) { return <div className="flex flex-col items-center justify-center p-20 gap-6 bg-white rounded-[40px] border-2 border-dashed"><h2 className="text-2xl font-bold text-slate-400">{title} Simulator</h2><Button className="bg-[#6C3EFF] font-bold" onClick={onAdd}><Plus className="h-4 w-4 mr-2" /> Action Trigger</Button></div>; }

// --- Global UI Components ---

function EmployeeProfile({ employee, onBack }: any) {
    return (
        <div className="space-y-6">
            <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-[#6C3EFF] transition-colors uppercase tracking-widest"><ArrowLeft className="h-4 w-4" /> Back to Directory</button>
            <div className="bg-white rounded-[40px] border border-slate-200/60 p-12 shadow-sm flex flex-col md:flex-row gap-12 items-start relative overflow-hidden">
                <div className="h-40 w-40 rounded-[48px] overflow-hidden border-4 border-white shadow-2xl shrink-0">
                    <img src={employee.img} alt={employee.name} className="h-full w-full object-cover" />
                </div>
                <div className="space-y-8 flex-1">
                    <div><h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">{employee.name}</h1><p className="text-xl font-bold text-[#6C3EFF] mt-2">{employee.desig} • {employee.dept}</p></div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-10">
                        {[['Emp ID', employee.id], ['Join Date', employee.joinDate], ['Type', employee.type]].map(i => (
                            <div key={i[0]} className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-0">{i[0]}</p>
                                <p className="text-base font-extrabold text-slate-800 leading-tight">{i[1]}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
    return (
        <Card className="border-none shadow-sm rounded-2xl p-6 bg-white flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className={`h-12 w-12 rounded-2xl ${bg} flex items-center justify-center ${color} shrink-0`}><Icon className="h-6 w-6" /></div>
            <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{title}</p><p className="text-2xl font-extrabold text-slate-800 leading-none">{value}</p></div>
        </Card>
    );
}

function SimpleModal({ open, onOpenChange, title, fields, onSave }: any) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-[40px] p-0 overflow-hidden border-none shadow-2xl bg-white max-w-lg">
                <form onSubmit={(e: any) => { e.preventDefault(); onSave(fields.map((_: any, i: number) => e.target[i].value)); onOpenChange(false); }}>
                    <DialogHeader className="p-8 bg-slate-50 border-b"><DialogTitle className="text-xl font-bold">{title}</DialogTitle></DialogHeader>
                    <div className="p-8 space-y-5">
                        {fields.map((f: any) => (<div key={f.n} className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.n}</label><Input required={f.r} defaultValue={f.v} type={f.t || 'text'} placeholder={f.p} className="h-11 rounded-xl" /></div>))}
                    </div>
                    <DialogFooter className="p-8 bg-slate-50 border-t gap-3"><Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="px-6 h-12 font-bold border-slate-200">Cancel</Button><Button type="submit" className="px-10 h-12 font-bold bg-[#6C3EFF] text-white hover:bg-[#5a31d6] shadow-lg shadow-[#6C3EFF]/20">Save</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
