import { cn } from "@/lib/utils";
import { Bot, Eye, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgentCardProps {
  name: string;
  status: "active" | "idle" | "processing";
  lastRun: string;
  confidence?: number;
  lastAction?: string;
  onTrigger?: () => void;
  onViewLogs?: () => void;
}

const statusConfig = {
  active: { label: "Active", color: "bg-agent-active" },
  idle: { label: "Idle", color: "bg-agent-idle" },
  processing: { label: "Processing", color: "bg-agent-processing agent-pulse" },
};

export function AgentCard({ name, status, lastRun, confidence, lastAction, onTrigger, onViewLogs }: AgentCardProps) {
  const { label, color } = statusConfig[status];

  return (
    <div className="rounded-xl border bg-card p-4 enterprise-shadow hover:enterprise-shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-primary/10 p-2">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{name}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className={cn("h-2 w-2 rounded-full", color)} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          </div>
        </div>
        {confidence && (
          <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-primary">
            {confidence}%
          </span>
        )}
      </div>
      <div className="mt-3 space-y-1 text-xs text-muted-foreground">
        <p>Last Run: {lastRun}</p>
        {lastAction && <p>Action: {lastAction}</p>}
      </div>
      <div className="mt-3 flex gap-2">
        {onTrigger && (
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onTrigger}>
            <Play className="mr-1 h-3 w-3" /> Trigger
          </Button>
        )}
        {onViewLogs && (
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onViewLogs}>
            <Eye className="mr-1 h-3 w-3" /> View Logs
          </Button>
        )}
      </div>
    </div>
  );
}
