import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { Bell, Bot, ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b bg-card px-4 enterprise-shadow">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-foreground">DemoCorp India Pvt Ltd</p>
              <p className="text-xs text-muted-foreground">CHRO Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5">
              <Bot className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-accent-foreground">AI Active</span>
              <span className="h-2 w-2 rounded-full bg-success agent-pulse" />
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </Button>
            <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5">
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">CA</span>
              </div>
              <span className="hidden text-sm font-medium sm:block">CHRO Admin</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
