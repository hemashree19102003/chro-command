import { Layout } from "@/components/Layout";
import { useState } from "react";
import { Bot, Send, CheckCircle2, Loader2, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const exampleCommands = [
  "Start AI Interview for Rahul",
  "Run Payroll Compliance Check",
  "Analyze Employee Exit Risk",
  "Generate Offer Letter for Candidate",
];

interface ExecutionStep {
  label: string;
  status: "pending" | "active" | "done";
}

interface CommandResult {
  command: string;
  module: string;
  agent: string;
  steps: ExecutionStep[];
  output: string;
}

const mockResults: Record<string, CommandResult> = {
  "Start AI Interview for Rahul": {
    command: "Start AI Interview for Rahul",
    module: "Recruit",
    agent: "AI Interview Agent",
    steps: [
      { label: "Triggered", status: "done" },
      { label: "Processing", status: "done" },
      { label: "Guardrail Check", status: "done" },
      { label: "Completed", status: "done" },
    ],
    output: "AI Interview Agent completed.\nRecommendation: Hire\nConfidence: 88%\nKey Strengths: Problem solving, React expertise",
  },
  "Run Payroll Compliance Check": {
    command: "Run Payroll Compliance Check",
    module: "Payroll",
    agent: "Compliance Agent",
    steps: [
      { label: "Triggered", status: "done" },
      { label: "Processing", status: "done" },
      { label: "Guardrail Check", status: "done" },
      { label: "Completed", status: "done" },
    ],
    output: "Compliance check completed.\n2 issues found:\n- Missing attendance: Arjun Menon\n- Missing attendance: Vikram Patel",
  },
  "Analyze Employee Exit Risk": {
    command: "Analyze Employee Exit Risk",
    module: "People",
    agent: "Exit Risk Predictor",
    steps: [
      { label: "Triggered", status: "done" },
      { label: "Processing", status: "done" },
      { label: "Guardrail Check", status: "done" },
      { label: "Completed", status: "done" },
    ],
    output: "Exit risk analysis completed.\nHigh Risk: 2 employees\n- Arjun Menon (Engineering) – 78% risk\n- Vikram Patel (Product) – 65% risk",
  },
  "Generate Offer Letter for Candidate": {
    command: "Generate Offer Letter for Candidate",
    module: "Sign",
    agent: "Offer Draft Agent",
    steps: [
      { label: "Triggered", status: "done" },
      { label: "Processing", status: "done" },
      { label: "Guardrail Check", status: "done" },
      { label: "Completed", status: "done" },
    ],
    output: "Offer letter generated for Rahul Sharma.\nRole: Software Developer – Chennai\nCTC: ₹8.5 LPA\nStatus: Pending HR approval",
  },
};

export default function CommandCenter() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<CommandResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [animStep, setAnimStep] = useState(-1);

  const executeCommand = (cmd: string) => {
    const mockResult = mockResults[cmd];
    if (!mockResult) return;

    setIsProcessing(true);
    setResult({ ...mockResult, steps: mockResult.steps.map(s => ({ ...s, status: "pending" as const })) });
    setAnimStep(0);

    // Animate steps
    mockResult.steps.forEach((_, i) => {
      setTimeout(() => {
        setAnimStep(i);
        setResult(prev => prev ? {
          ...prev,
          steps: prev.steps.map((s, si) => ({
            ...s,
            status: si < i ? "done" : si === i ? "active" : "pending"
          }))
        } : null);
      }, (i + 1) * 600);
    });

    setTimeout(() => {
      setResult(mockResult);
      setIsProcessing(false);
      setAnimStep(-1);
    }, (mockResult.steps.length + 1) * 600);
  };

  const handleSubmit = () => {
    if (!input.trim()) return;
    const matched = Object.keys(mockResults).find(k => k.toLowerCase().includes(input.toLowerCase()));
    if (matched) executeCommand(matched);
    setInput("");
  };

  return (
    <Layout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-3">
            <Bot className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">CHRO AI Command Center</h1>
          <p className="mt-1 text-sm text-muted-foreground">Execute HR operations with natural language commands</p>
        </div>

        {/* Command Input */}
        <div className="rounded-xl border bg-card p-6 enterprise-shadow-md">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Type a command..."
              className="flex-1"
            />
            <Button onClick={handleSubmit} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>

          {/* Example commands */}
          <div className="mt-3 flex flex-wrap gap-2">
            {exampleCommands.map((cmd) => (
              <button
                key={cmd}
                onClick={() => { setInput(cmd); executeCommand(cmd); }}
                disabled={isProcessing}
                className="rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Module & Agent */}
              <div className="rounded-xl border bg-card p-5 enterprise-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{result.agent}</p>
                    <p className="text-xs text-muted-foreground">Module: {result.module}</p>
                  </div>
                </div>

                {/* Execution Timeline */}
                <div className="flex items-center gap-1 mb-4">
                  {result.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className={cn(
                        "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all",
                        step.status === "done" ? "bg-success/10 text-success" :
                        step.status === "active" ? "bg-primary/10 text-primary agent-pulse" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {step.status === "done" && <CheckCircle2 className="h-3 w-3" />}
                        {step.status === "active" && <Loader2 className="h-3 w-3 animate-spin" />}
                        {step.label}
                      </div>
                      {i < result.steps.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  ))}
                </div>

                {/* Output */}
                {result.steps.every(s => s.status === "done") && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-lg bg-background border p-4"
                  >
                    <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">{result.output}</pre>
                  </motion.div>
                )}
              </div>

              {/* HR Approval */}
              <div className="flex items-center gap-2 rounded-lg border bg-accent p-3">
                <Shield className="h-4 w-4 text-primary" />
                <p className="text-xs font-medium text-accent-foreground">HR Final Approval Required — No agent can make final legal decisions</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
