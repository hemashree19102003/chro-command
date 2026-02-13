import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Briefcase, Wallet, Receipt,
  FileSignature, Clock, HardHat, Command, BarChart3,
  Settings, Bot, ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Recruit", path: "/recruit", icon: Briefcase },
  { title: "People", path: "/people", icon: Users },
  { title: "Payroll", path: "/payroll", icon: Wallet },
  { title: "Expense", path: "/expense", icon: Receipt },
  { title: "Sign", path: "/sign", icon: FileSignature },
  { title: "Shifts", path: "/shifts", icon: Clock },
  { title: "Workerly", path: "/workerly", icon: HardHat },
  { title: "Command Center", path: "/command-center", icon: Command },
  { title: "Analytics", path: "/analytics", icon: BarChart3 },
  { title: "Settings", path: "/settings", icon: Settings },
];

interface AppSidebarProps {
  open: boolean;
  onToggle: () => void;
}

export function AppSidebar({ open, onToggle }: AppSidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 border-r border-sidebar-border",
        open ? "w-60" : "w-0 lg:w-16",
        !open && "overflow-hidden lg:overflow-visible"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between px-4">
        {open && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
              <Bot className="h-4.5 w-4.5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold text-sidebar-primary-foreground">CHRO</p>
              <p className="text-[10px] text-sidebar-foreground/60">Cloud</p>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="hidden lg:flex h-6 w-6 items-center justify-center rounded-md hover:bg-sidebar-accent transition-colors"
        >
          <ChevronLeft className={cn("h-4 w-4 text-sidebar-foreground transition-transform", !open && "rotate-180")} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              {open && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      {open && (
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-2 text-xs text-sidebar-foreground/50">
            <Bot className="h-3.5 w-3.5" />
            <span>AI Agents: 4 Active</span>
          </div>
        </div>
      )}
    </aside>
  );
}
