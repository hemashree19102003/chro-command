import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Briefcase, Wallet, Receipt,
  FileSignature, Clock, HardHat, Command, BarChart3,
  Settings, Bot, ChevronLeft, ChevronDown, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const hrApps = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Recruit", path: "/recruit", icon: Briefcase },
  { title: "People", path: "/people", icon: Users },
  { title: "Payroll", path: "/payroll", icon: Wallet },
  { title: "Expense", path: "/expense", icon: Receipt },
  { title: "Sign", path: "/sign", icon: FileSignature },
  { title: "Shifts", path: "/shifts", icon: Clock },
  { title: "Workerly", path: "/workerly", icon: HardHat },
  { title: "Analytics", path: "/analytics", icon: BarChart3 },
  { title: "Settings", path: "/settings", icon: Settings },
];

interface AppSidebarProps {
  open: boolean;
  onToggle: () => void;
}

export function AppSidebar({ open, onToggle }: AppSidebarProps) {
  const location = useLocation();
  const isHrRoute = location.pathname !== "/command-center" && location.pathname !== "/hr" && location.pathname !== "/";
  const [hrExpanded, setHrExpanded] = useState(isHrRoute);

  const isActive = (path: string) =>
    path === "/dashboard" ? location.pathname === "/dashboard" : location.pathname.startsWith(path);

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
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {/* HR Group */}
        <NavLink
          to="/hr"
          onClick={(e) => {
            if (location.pathname === "/hr") {
              e.preventDefault();
              setHrExpanded(!hrExpanded);
            } else {
              setHrExpanded(true);
            }
          }}
          className={cn(
            "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition-all",
            location.pathname === "/hr"
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : isHrRoute
                ? "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <div className="flex items-center gap-3">
            <Layers className="h-4.5 w-4.5 shrink-0" />
            {open && <span>HR</span>}
          </div>
          {open && (
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                hrExpanded && "rotate-180"
              )}
            />
          )}
        </NavLink>

        {/* HR Apps (expandable) */}
        {hrExpanded && open && (
          <div className="ml-2 space-y-0.5 border-l border-sidebar-border pl-2 pt-1">
            {hrApps.map((item) => {
              const active = isActive(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.title}</span>
                </NavLink>
              );
            })}
          </div>
        )}

        {/* Collapsed HR apps (icon only) */}
        {hrExpanded && !open && (
          <div className="space-y-0.5 pt-1">
            {hrApps.map((item) => {
              const active = isActive(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={item.title}
                  className={cn(
                    "flex items-center justify-center rounded-lg p-2.5 transition-all",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                </NavLink>
              );
            })}
          </div>
        )}

        {/* Divider */}
        <div className="my-2 border-t border-sidebar-border" />

        {/* Command Center */}
        <NavLink
          to="/command-center"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all",
            location.pathname === "/command-center"
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <Command className="h-4.5 w-4.5 shrink-0" />
          {open && <span>Command Center</span>}
        </NavLink>
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
