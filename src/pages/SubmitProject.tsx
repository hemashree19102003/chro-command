import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, Github, Clock } from "lucide-react";

export default function SubmitProject() {
    const [params] = useSearchParams();
    const hackathonId = params.get("hackathon") ?? "";

    const [hackathon, setHackathon] = useState<any>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [githubUrl, setGithubUrl] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submissionId, setSubmissionId] = useState<string | null>(null);
    const [evalStatus, setEvalStatus] = useState<"pending" | "evaluated" | "error">("pending");
    const [error, setError] = useState("");

    // Load hackathon info
    useEffect(() => {
        if (!hackathonId) return;
        fetch(`/api/submission/hackathon/${hackathonId}`)
            .then(r => r.json())
            .then(d => { if (d.success) setHackathon(d.data); })
            .catch(() => { });
    }, [hackathonId]);

    // Poll evaluation status after submit
    useEffect(() => {
        if (!submissionId) return;
        let cancelled = false;
        const poll = async () => {
            try {
                const r = await fetch(`/api/submission/status/${submissionId}`);
                const d = await r.json();
                if (d.success) {
                    if (d.data.status === "evaluated") { if (!cancelled) setEvalStatus("evaluated"); return; }
                    if (d.data.status === "error") { if (!cancelled) setEvalStatus("error"); return; }
                }
            } catch { }
            if (!cancelled) setTimeout(poll, 3000);
        };
        poll();
        return () => { cancelled = true; };
    }, [submissionId]);

    const submit = async () => {
        setError("");
        if (!name || !email || !githubUrl) { setError("All fields are required."); return; }
        if (!hackathonId) { setError("No hackathon ID in URL."); return; }
        setSubmitting(true);
        try {
            const r = await fetch("/api/submission/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hackathonId, name, email, githubUrl }),
            });
            const d = await r.json();
            if (d.success) {
                setSubmissionId(d.data.submissionId);
            } else {
                setError(d.error ?? "Submission failed.");
            }
        } catch {
            setError("Network error. Please try again.");
        }
        setSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Nav */}
            <nav className="h-14 bg-white border-b border-gray-200 flex items-center px-6 sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-violet-600" />
                    <span className="font-bold text-sm text-gray-900">CHRO Command</span>
                </div>
            </nav>

            <main className="flex-1 flex items-start justify-center px-6 py-12">
                <div className="w-full max-w-[480px]">

                    {/* Hackathon banner */}
                    {hackathon && (
                        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-6">
                            <p className="text-sm font-semibold text-violet-700 mb-1">{hackathon.title}</p>
                            {hackathon.description && (
                                <p className="text-xs text-violet-600 mb-2">{hackathon.description}</p>
                            )}
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                                <Clock className="h-3 w-3" />
                                Deadline: {new Date(hackathon.deadline).toLocaleString()}
                            </span>
                        </div>
                    )}

                    {!hackathonId && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
                            No hackathon ID found in URL. Use the link provided by the HR team.
                        </div>
                    )}

                    {/* Success state */}
                    {submissionId ? (
                        <div className="bg-white border border-gray-200 rounded-xl p-7 shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mb-5">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Submission received</h2>
                            <p className="text-sm text-gray-500 leading-relaxed mb-5">
                                Your project has been queued for AI evaluation. Results are usually ready within a few minutes.
                            </p>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-600">
                                {evalStatus === "evaluated" ? (
                                    <>
                                        <span className="w-2 h-2 rounded-full bg-green-500" />
                                        Evaluation complete — under HR review
                                    </>
                                ) : evalStatus === "error" ? (
                                    <>
                                        <span className="w-2 h-2 rounded-full bg-red-500" />
                                        Evaluation issue — HR has been notified
                                    </>
                                ) : (
                                    <>
                                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                        Evaluation in progress…
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Page header */}
                            <div className="mb-8">
                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1.5">Submit your project</h1>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Your submission will be evaluated by AI agents. Results are usually ready within a few minutes.
                                </p>
                            </div>

                            {/* Form */}
                            <div className="bg-white border border-gray-200 rounded-xl p-7 shadow-sm">
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                                    <input
                                        type="text"
                                        placeholder="Jane Doe"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                                    />
                                </div>
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                                    <input
                                        type="email"
                                        placeholder="jane@example.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                                    />
                                </div>
                                <div className="h-px bg-gray-100 my-5" />
                                <div className="mb-1.5">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">GitHub repository URL</label>
                                    <div className="relative">
                                        <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="url"
                                            placeholder="https://github.com/user/repo"
                                            value={githubUrl}
                                            onChange={e => setGithubUrl(e.target.value)}
                                            className="w-full h-10 pl-9 pr-3 border border-gray-300 rounded-md text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                                        />
                                    </div>
                                </div>

                                {error && <p className="text-xs text-red-600 mt-2 mb-1">{error}</p>}

                                <button
                                    onClick={submit}
                                    disabled={submitting || !hackathonId}
                                    className="mt-5 w-full h-10 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-md text-sm font-medium flex items-center justify-center gap-2 transition"
                                >
                                    {submitting ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                                    ) : "Submit project"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <footer className="text-center py-5 text-xs text-gray-400 border-t border-gray-200 bg-white">
                © 2026 CHRO Command — Autonomous Talent Intelligence
            </footer>
        </div>
    );
}
