import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Users, Clock, Calendar, FileText, BarChart3,
    HeadphonesIcon, LogOut, Timer, ClipboardList,
    Search, Filter, Plus, ArrowLeft, Settings,
    UserPlus, Sliders, Database, LayoutGrid,
    CheckCircle2, X, MoreHorizontal, Mail, Phone,
    MapPin, Building2, Briefcase, ChevronRight, Upload,
    AlertCircle, Check, MapPinIcon, Shield, Zap, Info
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
type Employee = {
    id: string; name: string; email: string; phone: string;
    dept: string; desig: string; joinDate: string;
    type: string; status: 'Active' | 'Inactive'; img: string;
};

type AttendanceLog = {
    id: string; empId: string; name: string; date: string;
    checkIn: string; checkOut: string; totalHours: string;
    status: 'Present' | 'Absent' | 'Late' | 'Leave';
};

// --- Mock Initial Data ---
const initialEmployees: Employee[] = [
    { id: "EMP001", name: "Rahul Sharma", email: "rahul@chro.com", phone: "9876543210", dept: "Engineering", desig: "Senior Developer", joinDate: "2024-01-12", type: "Full-time", status: "Active", img: "RS" },
    { id: "EMP002", name: "Ananya Iyer", email: "ananya@chro.com", phone: "9876543211", dept: "HR", desig: "HR Head", joinDate: "2024-02-15", type: "Full-time", status: "Active", img: "AI" },
    { id: "EMP003", name: "Arjun Patel", email: "arjun@chro.com", phone: "9876543212", dept: "Finance", desig: "Accountant", joinDate: "2023-11-05", type: "Full-time", status: "Active", img: "AP" },
    { id: "EMP004", name: "Siddharth Malhotra", email: "sid@chro.com", phone: "9876543213", dept: "Engineering", desig: "Tech Lead", joinDate: "2023-09-20", type: "Full-time", status: "Active", img: "SM" },
    { id: "EMP005", name: "Vikram Singh", email: "vikram@chro.com", phone: "9876543214", dept: "Marketing", desig: "Marketing Head", joinDate: "2024-03-01", type: "Full-time", status: "Active", img: "VS" },
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

export default function CoreHROperational() {
    const { moduleId, subTab = "directory" } = useParams();
    const navigate = useNavigate();

    // --- States ---
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const [attendance, setAttendance] = useState<AttendanceLog[]>(initialAttendance);
    const [depts, setDepts] = useState(initialDepts);
    const [designations, setDesignations] = useState(initialDesigs);
    const [lifecycleLogs, setLifecycleLogs] = useState([
        { name: "Rahul Sharma", type: "Confirmation", date: "2024-04-12", notes: "Successfully completed probation." }
    ]);
    const [roles, setRoles] = useState([
        { name: "Super Admin", perms: "Full Access", count: 2 },
        { name: "HR Manager", perms: "View, Edit, Approve", count: 5 }
    ]);
    const [customFields, setCustomFields] = useState([
        { name: "Blood Group", type: "Dropdown", req: "Yes" },
        { name: "LinkedIn Profile", type: "Text", req: "No" }
    ]);
    const [companyInfo, setCompanyInfo] = useState({ name: "CHRO Enterprises", addr: "456 Tech Park, Bangalore", tz: "IST (UTC+5:30)" });

    // Modal States
    const [isAddEmpOpen, setIsAddEmpOpen] = useState(false);
    const [isEditAttOpen, setIsEditAttOpen] = useState(false);
    const [editingAtt, setEditingAtt] = useState<AttendanceLog | null>(null);
    const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
    const [isAddDesisOpen, setIsAddDesisOpen] = useState(false);
    const [isAddLifeOpen, setIsAddLifeOpen] = useState(false);
    const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
    const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
    const [isAddPosOpen, setIsAddPosOpen] = useState(false);

    const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
    const [manageLifecycle, setManageLifecycle] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [deptFilter, setDeptFilter] = useState("All");

    // --- Handlers ---
    const handleAddEmployee = (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newEmp: Employee = {
            id: `EMP00${employees.length + 1}`,
            name: `${formData.get('fname')} ${formData.get('lname')}`,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            dept: formData.get('dept') as string,
            desig: formData.get('desig') as string,
            joinDate: formData.get('joinDate') as string,
            type: formData.get('type') as string,
            status: formData.get('status') as any || 'Active',
            img: (formData.get('fname') as string)?.[0] + (formData.get('lname') as string)?.[0]
        };
        setEmployees([...employees, newEmp]);
        setIsAddEmpOpen(false);
        toast.success("Employee Added Successfully");
    };

    const handleEditAtt = (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const updated = attendance.map(a => a.id === editingAtt?.id ? {
            ...a,
            checkIn: formData.get('checkIn') as string,
            checkOut: formData.get('checkOut') as string,
            status: formData.get('status') as any
        } : a);
        setAttendance(updated);
        setIsEditAttOpen(false);
        toast.success("Attendance Updated Successfully");
    };

    const filteredEmployees = useMemo(() => {
        return employees.filter(e => {
            const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase());
            const matchesDept = deptFilter === "All" || e.dept === deptFilter;
            return matchesSearch && matchesDept;
        });
    }, [employees, search, deptFilter]);

    // --- Sidebar Configs ---
    const sidebarConfigs: Record<string, { label: string; items: any[] }> = {
        "employee-management": {
            label: "Employee Management",
            items: [
                { id: "directory", label: "Employee Directory", icon: Users },
                { id: "add", label: "Add Employee", icon: UserPlus, action: () => setIsAddEmpOpen(true) },
                { id: "org-chart", label: "Organization Chart", icon: LayoutGrid },
                { id: "departments", label: "Departments", icon: Building2 },
                { id: "designations", label: "Designations", icon: Briefcase },
                { id: "lifecycle", label: "Employee Lifecycle", icon: Clock },
                { id: "access", label: "Access Control", icon: Sliders },
                { id: "custom-fields", label: "Custom Fields", icon: Database },
                { id: "settings", label: "Settings", icon: Settings },
            ]
        },
        "attendance-management": {
            label: "Attendance Management",
            items: [
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
        }
    };

    const currentConfig = sidebarConfigs[moduleId || "employee-management"];

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-['Inter',_sans-serif] text-[#1e293b]">
            {/* Sidebar */}
            <aside className="w-64 border-r bg-white flex flex-col shrink-0 fixed h-full z-20">
                <div className="h-16 border-b flex items-center px-6 gap-3">
                    <div className="h-8 w-8 rounded-lg bg-[#6C3EFF] flex items-center justify-center shrink-0">
                        {moduleId === 'employee-management' ? <Users className="h-4 w-4 text-white" /> : <Clock className="h-4 w-4 text-white" />}
                    </div>
                    <span className="font-bold text-lg tracking-tight">CHRO Admin</span>
                </div>
                <div className="p-4 flex-1 overflow-y-auto">
                    <button onClick={() => navigate("/people/core-hr")} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-[#6C3EFF] transition-colors mb-6 uppercase tracking-widest">
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to Core HR
                    </button>
                    <p className="px-4 mb-2 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{currentConfig?.label}</p>
                    <nav className="space-y-1">
                        {currentConfig?.items.map((item) => (
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
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${subTab === item.id && !selectedEmp && !manageLifecycle
                                        ? "bg-[#6C3EFF]/10 text-[#6C3EFF] font-bold"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                            >
                                <item.icon className={`h-4 w-4 ${subTab === item.id ? "text-[#6C3EFF]" : "text-slate-400"}`} />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 flex flex-col min-w-0 ml-64">
                {/* Header */}
                <header className="h-16 border-b bg-white flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-4 flex-1 max-w-xl">
                        <Search className="h-4 w-4 text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={`Search in ${currentConfig?.label}...`}
                            className="border-none bg-transparent h-10 shadow-none focus-visible:ring-0 text-sm"
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

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={moduleId + subTab + (selectedEmp ? 'profile' : '') + (manageLifecycle || '')}
                            initial={{ opacity: 0, x: 5 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -5 }}
                            transition={{ duration: 0.15 }}
                        >
                            {selectedEmp ? (
                                <EmployeeProfile employee={selectedEmp} onClose={() => setSelectedEmp(null)} />
                            ) : manageLifecycle ? (
                                <LifecyclePage type={manageLifecycle} logs={lifecycleLogs.filter(l => l.type === manageLifecycle)} onBack={() => setManageLifecycle(null)} onAdd={() => setIsAddLifeOpen(true)} />
                            ) : (
                                <>
                                    {/* --- Employee Management Modules --- */}
                                    {moduleId === "employee-management" && (
                                        <>
                                            {subTab === "directory" && (
                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h1 className="text-2xl font-bold tracking-tight">Employee Directory</h1>
                                                            <p className="text-sm text-slate-500 font-medium">Manage your workforce efficiently.</p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <select
                                                                value={deptFilter}
                                                                onChange={(e) => setDeptFilter(e.target.value)}
                                                                className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 focus:outline-none"
                                                            >
                                                                <option value="All">All Departments</option>
                                                                {depts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                                                            </select>
                                                            <Button onClick={() => setIsAddEmpOpen(true)} className="bg-[#6C3EFF] hover:bg-[#5a31d6] text-white font-bold h-10 shadow-lg shadow-[#6C3EFF]/20">
                                                                <Plus className="h-4 w-4 mr-2" /> Add Employee
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <Card className="border-slate-200/60 shadow-sm overflow-hidden rounded-[24px]">
                                                        <Table>
                                                            <TableHeader className="bg-slate-50/50">
                                                                <TableRow className="border-slate-100">
                                                                    <TableHead className="w-[120px] font-bold text-slate-400 uppercase tracking-widest text-[9px]">Emp ID</TableHead>
                                                                    <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Name</TableHead>
                                                                    <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Email</TableHead>
                                                                    <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Department</TableHead>
                                                                    <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Designation</TableHead>
                                                                    <TableHead className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Status</TableHead>
                                                                    <TableHead className="w-[100px]"></TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {filteredEmployees.map((emp) => (
                                                                    <TableRow key={emp.id} className="group cursor-pointer hover:bg-slate-50 border-slate-50" onClick={() => setSelectedEmp(emp)}>
                                                                        <TableCell className="font-mono text-xs font-bold text-[#6C3EFF]">{emp.id}</TableCell>
                                                                        <TableCell className="font-bold text-slate-800">{emp.name}</TableCell>
                                                                        <TableCell className="text-sm text-slate-500">{emp.email}</TableCell>
                                                                        <TableCell className="text-sm font-medium text-slate-600">{emp.dept}</TableCell>
                                                                        <TableCell className="text-sm text-slate-500">{emp.desig}</TableCell>
                                                                        <TableCell><span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${emp.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{emp.status}</span></TableCell>
                                                                        <TableCell><Button variant="ghost" size="sm" className="text-[#6C3EFF] font-bold opacity-0 group-hover:opacity-100 transition-opacity">View</Button></TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </Card>
                                                </div>
                                            )}

                                            {subTab === "org-chart" && <OrgChart onAddPosition={() => setIsAddPosOpen(true)} />}

                                            {subTab === "departments" && (
                                                <GenericListView
                                                    title="Departments"
                                                    columns={["Department Name", "Head of Department", "No. of Employees"]}
                                                    data={depts.map(d => [d.name, d.head, String(d.count)])}
                                                    onAdd={() => setIsAddDeptOpen(true)}
                                                />
                                            )}

                                            {subTab === "designations" && (
                                                <GenericListView
                                                    title="Designations"
                                                    columns={["Designation Name", "Department", "Level"]}
                                                    data={designations.map(d => [d.name, d.dept, d.level])}
                                                    onAdd={() => setIsAddDesisOpen(true)}
                                                />
                                            )}

                                            {subTab === "lifecycle" && (
                                                <div className="space-y-8">
                                                    <h1 className="text-2xl font-bold tracking-tight">Employee Lifecycle</h1>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                        {["Onboarding", "Confirmation", "Promotion", "Transfer", "Exit"].map(type => (
                                                            <Card key={type} className="border-slate-200/60 shadow-sm rounded-3xl hover:shadow-md transition-all group">
                                                                <CardHeader className="flex flex-row items-center justify-between">
                                                                    <div className="h-10 w-10 rounded-2xl bg-[#6C3EFF]/5 flex items-center justify-center text-[#6C3EFF]"><Zap className="h-5 w-5" /></div>
                                                                    <Button variant="ghost" size="sm" onClick={() => setManageLifecycle(type)} className="text-[#6C3EFF] font-bold hover:bg-[#6C3EFF]/5">Manage</Button>
                                                                </CardHeader>
                                                                <CardContent>
                                                                    <h3 className="font-bold text-lg">{type}</h3>
                                                                    <p className="text-xs text-slate-400 mt-1">Manage all {type.toLowerCase()} workflows and records.</p>
                                                                </CardContent>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {subTab === "access" && (
                                                <GenericListView
                                                    title="Access Control"
                                                    columns={["Role Name", "Permissions", "Assigned Employees"]}
                                                    data={roles.map(r => [r.name, r.perms, String(r.count)])}
                                                    onAdd={() => setIsAddRoleOpen(true)}
                                                />
                                            )}

                                            {subTab === "custom-fields" && (
                                                <GenericListView
                                                    title="Custom Fields"
                                                    columns={["Field Name", "Field Type", "Required"]}
                                                    data={customFields.map(f => [f.name, f.type, f.req])}
                                                    onAdd={() => setIsAddFieldOpen(true)}
                                                />
                                            )}

                                            {subTab === "settings" && <SettingsView info={companyInfo} onSave={(v: any) => { setCompanyInfo(v); toast.success("Settings Saved Successfully"); }} />}
                                        </>
                                    )}

                                    {/* --- Attendance Management (Keeping it connected) --- */}
                                    {moduleId === "attendance-management" && <AttendanceApp subTab={subTab} />}
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* --- Global Modals --- */}
            <Dialog open={isAddEmpOpen} onOpenChange={setIsAddEmpOpen}>
                <DialogContent className="max-w-2xl rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
                    <form onSubmit={handleAddEmployee}>
                        <DialogHeader className="p-8 bg-slate-50 border-b"><DialogTitle className="text-xl font-bold">Add New Employee</DialogTitle></DialogHeader>
                        <div className="p-8 grid grid-cols-2 gap-6 items-end">
                            <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">First Name</label><Input name="fname" required placeholder="John" /></div>
                            <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Name</label><Input name="lname" required placeholder="Doe" /></div>
                            <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label><Input name="email" required type="email" placeholder="john.doe@chro.com" /></div>
                            <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</label><Input name="phone" required placeholder="+91 9876543210" /></div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</label>
                                <select name="dept" required className="w-full h-11 px-4 rounded-xl border bg-white text-sm focus:outline-none">
                                    {depts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Designation</label>
                                <select name="desig" required className="w-full h-11 px-4 rounded-xl border bg-white text-sm focus:outline-none">
                                    {designations.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date of Joining</label><Input name="joinDate" required type="date" /></div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employment Type</label>
                                <select name="type" required className="w-full h-11 px-4 rounded-xl border bg-white text-sm focus:outline-none">
                                    <option>Full-time</option><option>Intern</option><option>Contract</option>
                                </select>
                            </div>
                        </div>
                        <DialogFooter className="p-8 bg-slate-50 border-t gap-3">
                            <Button type="button" variant="outline" onClick={() => setIsAddEmpOpen(false)} className="px-8 font-bold border-slate-200">Cancel</Button>
                            <Button type="submit" className="px-10 font-bold bg-[#6C3EFF] hover:bg-[#5a31d6]">Save Employee</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <SimpleModal open={isAddDeptOpen} onOpenChange={setIsAddDeptOpen} title="Add Department" fields={[{ n: "Department Name", p: "e.g. Sales" }, { n: "Department Head", p: "Name" }, { n: "Description", p: "Brief info..." }]} onSave={(v: any) => { setDepts([...depts, { name: v[0], head: v[1], count: 0 }]); toast.success("Department Added Successfully"); }} />
            <SimpleModal open={isAddDesisOpen} onOpenChange={setIsAddDesisOpen} title="Add Designation" fields={[{ n: "Designation Title", p: "Lead Designer" }, { n: "Department", p: "Design" }, { n: "Level", p: "Mid / Senior" }]} onSave={(v: any) => { setDesignations([...designations, { name: v[0], dept: v[1], level: v[2] }]); toast.success("Designation Added Successfully"); }} />
            <SimpleModal open={isAddLifeOpen} onOpenChange={setIsAddLifeOpen} title="Add Record" fields={[{ n: "Employee Name", p: "Full Name" }, { n: "Action Type", p: "Promotion" }, { n: "Effective Date", p: "", t: "date" }, { n: "Notes", p: "Details" }]} onSave={(v: any) => { setLifecycleLogs([...lifecycleLogs, { name: v[0], type: v[1], date: v[2], notes: v[3] }]); toast.success("Record Added Successfully"); }} />
            <SimpleModal open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen} title="Create Role" fields={[{ n: "Role Name", p: "Manager" }, { n: "Permissions", p: "View, Edit (Checkboxes mock)" }, { n: "Assign Employees", p: "Multi select mock" }]} onSave={(v: any) => { setRoles([...roles, { name: v[0], perms: v[1], count: 0 }]); toast.success("Role Created Successfully"); }} />
            <SimpleModal open={isAddFieldOpen} onOpenChange={setIsAddFieldOpen} title="Add Custom Field" fields={[{ n: "Field Name", p: "Blood Group" }, { n: "Field Type", p: "Dropdown" }, { n: "Required", p: "Yes/No" }]} onSave={(v: any) => { setCustomFields([...customFields, { name: v[0], type: v[1], req: v[2] }]); toast.success("Field Added Successfully"); }} />
            <SimpleModal open={isAddPosOpen} onOpenChange={setIsAddPosOpen} title="Add Position" fields={[{ n: "Position Name", p: "Product Lead" }, { n: "Reports To", p: "CEO" }]} onSave={() => toast.success("Position Added Successfully")} />
        </div>
    );
}

// --- Component Fragments ---

function GenericListView({ title, columns, data, onAdd }: any) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                <Button onClick={onAdd} className="bg-[#6C3EFF] font-bold shadow-lg shadow-[#6C3EFF]/20 h-10"><Plus className="h-4 w-4 mr-2" /> Add {title.slice(0, -1)}</Button>
            </div>
            <Card className="rounded-[24px] border-slate-200/60 shadow-sm overflow-hidden bg-white">
                <Table>
                    <TableHeader className="bg-slate-50/50"><TableRow>{columns.map((c: string) => <TableHead key={c} className="font-bold text-slate-400 text-[9px] uppercase tracking-widest">{c}</TableHead>)}<TableHead /></TableRow></TableHeader>
                    <TableBody>
                        {data.map((row: string[], i: number) => (
                            <TableRow key={i} className="group hover:bg-slate-50 border-slate-50">
                                {row.map((cell, j) => <TableCell key={j} className={j === 0 ? "font-bold text-slate-800" : "text-sm text-slate-500"}>{cell}</TableCell>)}
                                <TableCell className="text-right"><Button variant="ghost" size="icon" className="text-slate-300 group-hover:text-slate-600 transition-colors"><MoreHorizontal className="h-4 w-4" /></Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

function OrgChart({ onAddPosition }: any) {
    return (
        <div className="space-y-12 flex flex-col items-center py-10">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Organization Chart</h1>
                <Button size="sm" onClick={onAddPosition} className="mt-4 border border-[#6C3EFF] text-[#6C3EFF] bg-white hover:bg-[#6C3EFF] hover:text-white font-bold transition-all"><Plus className="h-4 w-4 mr-2" /> Add Position</Button>
            </div>
            <OrgNode name="Rakesh Bansal" role="CEO & Founder" />
            <div className="h-12 w-px bg-slate-200" />
            <div className="flex gap-16 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-slate-200" />
                <div className="flex flex-col items-center gap-6"><div className="h-6 w-px bg-slate-200" /><OrgNode name="Ananya Iyer" role="HR Manager" /></div>
                <div className="flex flex-col items-center gap-6"><div className="h-6 w-px bg-slate-200" /><OrgNode name="Sid Malhotra" role="Tech Lead" /></div>
            </div>
            <div className="flex gap-8 mt-4">
                <OrgNode name="Dev 1" role="Developer" /><OrgNode name="Dev 2" role="Developer" />
            </div>
        </div>
    );
}

function OrgNode({ name, role }: { name: string; role: string }) {
    return (
        <div className="bg-white border-2 border-slate-50 rounded-[28px] p-6 shadow-sm min-w-[200px] text-center hover:border-[#6C3EFF]/30 transition-all group">
            <div className="h-14 w-14 rounded-full bg-[#6C3EFF]/10 flex items-center justify-center text-sm font-extrabold text-[#6C3EFF] mx-auto mb-4 border-2 border-white shadow-md group-hover:scale-110 transition-transform">{name.split(" ").map(n => n[0]).join("")}</div>
            <h4 className="font-extrabold text-slate-900">{name}</h4>
            <p className="text-[9px] uppercase font-bold text-[#6C3EFF] tracking-widest mt-1">{role}</p>
        </div>
    );
}

function LifecyclePage({ type, logs, onBack, onAdd }: any) {
    return (
        <div className="space-y-8">
            <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-[#6C3EFF] transition-colors uppercase tracking-[0.2em]"><ArrowLeft className="h-4 w-4" /> Back to Lifecycle</button>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-extrabold tracking-tight">{type} Dashboard</h1>
                <Button onClick={onAdd} className="bg-[#6C3EFF] font-bold shadow-lg shadow-[#6C3EFF]/20"><Plus className="h-4 w-4 mr-2" /> Add Record</Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="rounded-[32px] border-slate-200/60 p-8">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-amber-500"><AlertCircle className="h-5 w-5" /> Pending Actions</h3>
                    <div className="space-y-4">
                        {["Verification of docs", "Asset allocation"].map(a => (
                            <div key={a} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-700">{a}</span>
                                <Button size="sm" variant="ghost" className="text-[#6C3EFF] font-bold">Complete</Button>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card className="rounded-[32px] border-slate-200/60 p-8">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-emerald-500"><CheckCircle2 className="h-5 w-5" /> Completed Actions</h3>
                    <div className="space-y-4">
                        {logs.length > 0 ? logs.map((l, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 italic text-[11px] text-slate-500">
                                <p className="font-bold text-slate-800 not-italic mb-1">{l.name}</p>
                                {l.notes} • {l.date}
                            </div>
                        )) : <p className="text-slate-400 text-sm italic">No completed records yet.</p>}
                    </div>
                </Card>
            </div>
        </div>
    );
}

function SettingsView({ info, onSave }: any) {
    const [data, setData] = useState(info);
    return (
        <div className="space-y-8 max-w-4xl">
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            {["Company Info", "HR Preferences", "Leave Policy Setup"].map(s => (
                <Card key={s} className="rounded-3xl border-slate-200/60 overflow-hidden bg-white shadow-sm">
                    <div className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
                        <div><h3 className="font-bold">{s}</h3><p className="text-xs text-slate-400 mt-0.5">Configuration for your CHRO account.</p></div>
                        <ChevronRight className="h-4 w-4 text-slate-300" />
                    </div>
                    {s === "Company Info" && (
                        <div className="p-8 pt-2 border-t space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company Name</label><Input value={data.name} onChange={e => setData({ ...data, name: e.target.value })} /></div>
                                <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time Zone</label><Input value={data.tz} onChange={e => setData({ ...data, tz: e.target.value })} /></div>
                            </div>
                            <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Address</label><Input value={data.addr} onChange={e => setData({ ...data, addr: e.target.value })} /></div>
                            <div className="flex flex-col items-center gap-4 p-12 rounded-[32px] border-2 border-dashed bg-slate-50/50">
                                <Upload className="h-8 w-8 text-slate-300" /><p className="text-xs font-bold text-slate-400">Drag & Drop or Click to upload Logo</p>
                            </div>
                            <Button onClick={() => onSave(data)} className="bg-[#6C3EFF] font-bold shadow-lg shadow-[#6C3EFF]/20 h-12 px-10">Save Changes</Button>
                        </div>
                    )}
                </Card>
            ))}
        </div>
    );
}

function AttendanceApp({ subTab }: { subTab: string }) {
    // Simple wrapper for attendance sub-modules to keep them functional
    return <div className="p-20 text-center text-slate-300 font-bold italic border-2 border-dashed rounded-[40px] bg-white">Attendance Module {subTab} View Simulator...</div>;
}

function SimpleModal({ open, onOpenChange, title, fields, onSave }: any) {
    const handleS = (e: any) => { e.preventDefault(); const v = fields.map((_: any, i: number) => e.target[i].value); onSave(v); onOpenChange(false); };
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-[32px] p-0 overflow-hidden border-none shadow-2xl bg-white">
                <form onSubmit={handleS}>
                    <DialogHeader className="p-8 bg-slate-50 border-b"><DialogTitle className="text-xl font-bold">{title}</DialogTitle></DialogHeader>
                    <div className="p-8 space-y-6">
                        {fields.map((f: any) => (
                            <div key={f.n} className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.n}</label><Input required type={f.t || "text"} placeholder={f.p} className="h-11 rounded-xl" /></div>
                        ))}
                    </div>
                    <DialogFooter className="p-8 bg-slate-50 border-t gap-3">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="px-6 h-12 font-bold border-slate-200">Cancel</Button>
                        <Button type="submit" className="px-10 h-12 font-bold bg-[#6C3EFF] hover:bg-[#5a31d6] shadow-lg shadow-[#6C3EFF]/20 text-white">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EmployeeProfile({ employee, onClose }: any) {
    return (
        <div className="space-y-6">
            <button onClick={onClose} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-[#6C3EFF] transition-colors uppercase tracking-[0.2em]"><ArrowLeft className="h-4 w-4" /> Back to Directory</button>
            <div className="bg-white rounded-[40px] border border-slate-200/60 p-12 shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row gap-12 items-start relative z-10">
                    <div className="h-48 w-48 rounded-[48px] bg-[#6C3EFF]/10 flex items-center justify-center text-6xl font-extrabold text-[#6C3EFF] border-4 border-white shadow-2xl shrink-0">{employee.img}</div>
                    <div className="flex-1 space-y-8">
                        <div><h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">{employee.name}</h1><p className="text-xl font-bold text-[#6C3EFF] mt-2">{employee.desig} • {employee.dept}</p></div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
                            <InfoBlock label="Emp ID" value={employee.id} /><InfoBlock label="Join Date" value={employee.joinDate} /><InfoBlock label="Type" value={employee.type} /><div className="space-y-1"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Status</p><span className="inline-flex px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold border border-emerald-100">Active</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
    return <div className="space-y-1"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p><p className="text-base font-extrabold text-slate-800">{value}</p></div>;
}
