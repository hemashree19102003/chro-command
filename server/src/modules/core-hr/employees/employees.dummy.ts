
// server/src/modules/core-hr/employees/employees.dummy.ts
export type Employee = {
    id: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    designation: string;
    joinDate: string;
    status: 'Active' | 'Inactive';
    type: string;
    managerId?: string;
    img?: string;
};

export const employees: Employee[] = [
    { id: "EMP001", name: "Rahul Sharma", email: "rahul@chro.com", phone: "9876543210", department: "Engineering", designation: "Senior Developer", joinDate: "2024-01-12", type: "Full-time", status: "Active", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop" },
    { id: "EMP002", name: "Ananya Iyer", email: "ananya@chro.com", phone: "9876543211", department: "HR", designation: "HR Head", joinDate: "2024-02-15", type: "Full-time", status: "Active", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" },
    { id: "EMP003", name: "Arjun Patel", email: "arjun@chro.com", phone: "9876543212", department: "Finance", designation: "Accountant", joinDate: "2023-11-05", type: "Full-time", status: "Active", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop" },
    { id: "EMP004", name: "Siddharth Malhotra", email: "sid@chro.com", phone: "9876543213", department: "Engineering", designation: "Tech Lead", joinDate: "2023-09-20", type: "Full-time", status: "Active", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop" },
    { id: "EMP005", name: "Vikram Singh", email: "marketing@chro.com", phone: "9876543214", department: "Marketing", designation: "Marketing Head", joinDate: "2024-03-01", type: "Full-time", status: "Active", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop" },
    { id: "EMP999", name: "Backend Test User", email: "test@chro.com", phone: "0000000000", department: "Engineering", designation: "QA Engineer", joinDate: "2024-03-15", type: "Full-time", status: "Active", img: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop" },
];
