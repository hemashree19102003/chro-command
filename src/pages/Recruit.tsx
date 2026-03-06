import { Layout } from "@/components/Layout";
import { AgentCard } from "@/components/AgentCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bot, Eye, RefreshCw, Loader2, CheckCircle2, XCircle, Upload,
  Sparkles, FileText, Star, BarChart2, Users, Briefcase, Trash2,
  Mail, Send, FolderOpen, AlertTriangle, Link, Copy, Linkedin, Globe,
  UserPlus, Clock, MoreHorizontal, Trophy, Search, Cpu,
  X, BrainCircuit, Code2, Github,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  recruitApi,
  type Candidate, type Hackathon, type Submission, type Ranking, type Interview,
} from "@/hooks/useRecruitApi";
import { toast } from "sonner";

// ─── Helpers ───────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  extracted: "bg-blue-100 text-blue-700",
  shortlisted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  hired: "bg-purple-100 text-purple-700",
  hold: "bg-yellow-100 text-yellow-700",
};

const INTERVIEW_STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  offered: "bg-purple-100 text-purple-700 border-purple-200"
};

const REC_COLORS: Record<string, string> = {
  STRONGLY_RECOMMEND: "bg-green-100 text-green-700",
  RECOMMEND: "bg-blue-100 text-blue-700",
  NEEDS_REVIEW: "bg-yellow-100 text-yellow-700",
  NOT_RECOMMENDED: "bg-red-100 text-red-700",
};

const APPROVAL_COLORS: Record<string, string> = {
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  pending_review: "bg-yellow-100 text-yellow-700",
};

const recruitAgents = [
  { name: "JD Generator Agent", status: "active" as const, lastRun: "10 min ago", confidence: 95 },
  { name: "JD Compliance Guardrail Agent", status: "active" as const, lastRun: "10 min ago", confidence: 98 },
  { name: "Resume Screening Agent", status: "active" as const, lastRun: "12 min ago", confidence: 92 },
  { name: "AI Interview Agent", status: "idle" as const, lastRun: "2 hrs ago", confidence: 88 },
  { name: "Offer Draft Agent", status: "idle" as const, lastRun: "1 day ago", confidence: 90 },
];

// ─────────────────────────────────────────────────────────────────
export default function Recruit() {
  // Data states
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [jobs, setJobs] = useState<Hackathon[]>([]);
  const [resumeFiles, setResumeFiles] = useState<string[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalApplicants: 0, aiScreened: 0, shortlisted: 0, hackathonParticipants: 0, interviewCandidates: 0, offersSent: 0, hires: 0, totalJobs: 0, totalHackathons: 0 });

  // Loading states
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);
  const [evaluatingAll, setEvaluatingAll] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Filter/selection
  const [candFilter, setCandFilter] = useState<'all' | 'shortlisted' | 'hold' | 'rejected'>('all');
  const [candJobFilter, setCandJobFilter] = useState<string>('all');
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [selectedHackathon, setSelectedHackathon] = useState('');
  const [rankHackathon, setRankHackathon] = useState('');

  // Job Creation (Step 1)
  const [jobForm, setJobForm] = useState<Partial<Hackathon>>({
    title: '',
    description: '',
    department: 'Engineering',
    employment_type: 'Full-time',
    experience_required: '',
    skills_required: '',
    location: 'Remote',
    salary_range: '',
    hiring_manager: '',
    deadline: '',
    type: 'job'
  });

  // Hackathon creation (Step 6)
  const [hackTitle, setHackTitle] = useState('');
  const [hackDesc, setHackDesc] = useState('');
  const [hackDeadline, setHackDeadline] = useState('');

  // AI Screening (Step 5)
  const [screenCandidate, setScreenCandidate] = useState('');
  const [screenHackathon, setScreenHackathon] = useState('');
  const [screenJobTitle, setScreenJobTitle] = useState('');
  const [screenJobDesc, setScreenJobDesc] = useState('');
  const [filterByApplied, setFilterByApplied] = useState(false);
  const [screeningResult, setScreeningResult] = useState<any>(null);
  const [screeningRunning, setScreeningRunning] = useState(false);
  const [evalAllResults, setEvalAllResults] = useState<any[]>([]);
  const [topK, setTopK] = useState(5);

  // Automated Outreach
  const [outreachHackathon, setOutreachHackathon] = useState('');
  const [outreachType, setOutreachType] = useState<'ALL' | 'SHORTLISTED'>('ALL');
  const [senderEmail, setSenderEmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [sendingMails, setSendingMails] = useState(false);

  const [approveModal, setApproveModal] = useState<{ id: string; name: string } | null>(null);
  const [evalDetail, setEvalDetail] = useState<Ranking | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [approveNotes, setApproveNotes] = useState('');

  // Submissions Modal State
  const [submissionModal, setSubmissionModal] = useState<Submission | null>(null);

  // Interview Pipeline State
  const [scheduleModal, setScheduleModal] = useState<boolean>(false);
  const [interviewForm, setInterviewForm] = useState<Partial<Interview>>({
    candidate_id: 0,
    job_id: '',
    round_name: 'Technical Round 1',
    scheduled_at: '',
    notes: ''
  });
  const [interviewActionModal, setInterviewActionModal] = useState<Interview | null>(null);
  const [interviewNotesModal, setInterviewNotesModal] = useState<Interview | null>(null);

  // Offer Issue state
  const [offerModal, setOfferModal] = useState<{ candidate: Candidate; jobId: string } | null>(null);
  const [offerForm, setOfferForm] = useState({ salary: '', joining_date: '', manager: '' });
  const [offerSmtpEmail, setOfferSmtpEmail] = useState('');
  const [offerSmtpPass, setOfferSmtpPass] = useState('');
  const [issuingOffer, setIssuingOffer] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Data loaders ───────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cands, allItems, files, s, ints, offs] = await Promise.all([
        recruitApi.getCandidates(),
        recruitApi.getJobs(),
        recruitApi.getResumeFiles(),
        recruitApi.getStats(),
        recruitApi.getInterviews(),
        recruitApi.getOffers(),
      ]);
      setCandidates(cands);
      setHackathons(allItems.filter(i => i.type === 'hackathon'));
      setJobs(allItems.filter(i => i.type === 'job'));
      setResumeFiles(files);
      setStats(s);
      setInterviews(ints);
      setOffers(offs);
    } catch (err: any) {
      toast.error(`Failed to load: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const loadSubmissions = useCallback(async (hackId: string) => {
    if (!hackId) return;
    try {
      const subs = await recruitApi.getSubmissions(hackId);
      setSubmissions(subs);
    } catch (err: any) { toast.error(err.message); }
  }, []);

  const loadRankings = useCallback(async (hackId: string) => {
    if (!hackId) return;
    try {
      const r = await recruitApi.getRankings(hackId);
      setRankings(r);
    } catch (err: any) { toast.error(err.message); }
  }, []);

  // ─── Resume Scanner ─────────────────────────────────────────
  const handleScanResumes = async () => {
    setScanning(true);
    try {
      const r = await recruitApi.scanResumes();
      setScanResults(r);
      toast.success(`Scanned ${r.totalFiles} files → ${r.processed} candidates extracted`);
      await loadAll();
    } catch (err: any) { toast.error(`Scan failed: ${err.message}`); }
    finally { setScanning(false); }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    let ok = 0;
    for (const file of Array.from(files)) {
      try {
        const content = await new Promise<string>((res, rej) => {
          const fr = new FileReader();
          fr.onload = () => res((fr.result as string).split(',')[1] ?? '');
          fr.onerror = rej;
          fr.readAsDataURL(file);
        });
        await recruitApi.uploadResume(file.name, content);
        ok++;
      } catch (err: any) { toast.error(`${file.name}: ${err.message}`); }
    }
    if (ok > 0) toast.success(`Uploaded ${ok} file(s)`);
    setUploading(false);
    const updated = await recruitApi.getResumeFiles();
    setResumeFiles(updated);
  };

  const deleteFile = async (filename: string) => {
    try {
      await recruitApi.deleteResumeFile(filename);
      toast.success('File deleted');
      setResumeFiles(prev => prev.filter(f => f !== filename));
    } catch (err: any) { toast.error(err.message); }
  };

  // ─── Job Postings ─────────────────────────────────────────────
  const handleCreateJob = async (type: 'job' | 'hackathon' = 'job') => {
    if (!jobForm.title || !jobForm.deadline) { toast.warning('Title and deadline required'); return; }
    try {
      await recruitApi.createJob({ ...jobForm, type });
      toast.success(`${type === 'job' ? 'Job' : 'Hackathon'} created`);
      setJobForm({
        title: '',
        description: '',
        department: 'Engineering',
        employment_type: 'Full-time',
        experience_required: '',
        skills_required: '',
        location: 'Remote',
        salary_range: '',
        hiring_manager: '',
        deadline: '',
        type: 'job'
      });
      await loadAll();
    } catch (err: any) { toast.error(err.message); }
  };

  const sendInvitations = async (hackId: string, mode: 'ALL' | 'SHORTLISTED') => {
    try {
      await recruitApi.sendInvitations(hackId, mode);
      toast.success(`Invitations sent (${mode})`);
    } catch (err: any) { toast.error(`Invite failed: ${err.message}`); }
  };

  const handleAutomatedOutreach = async () => {
    if (!outreachHackathon) { toast.warning('Select a job/hackathon first'); return; }
    if (!senderEmail || !appPassword) { toast.warning('Sender Email and App Password are required'); return; }

    setSendingMails(true);
    try {
      const res = await recruitApi.sendInvitations(outreachHackathon, outreachType, { user: senderEmail, pass: appPassword });
      toast.success(`Outreach Complete! Sent: ${res.sent}, Failed: ${res.failed}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSendingMails(false);
    }
  };

  // ─── Candidates ─────────────────────────────────────────────
  const toggleSelect = (email: string) =>
    setSelectedEmails(prev => { const n = new Set(prev); n.has(email) ? n.delete(email) : n.add(email); return n; });

  const bulkStatus = async (status: string) => {
    if (selectedEmails.size === 0) { toast.warning('Select candidates first'); return; }
    try {
      await recruitApi.updateStatus([...selectedEmails], status);
      toast.success(`${selectedEmails.size} candidate(s) → ${status}`);
      setSelectedEmails(new Set());
      await loadAll();
    } catch (err: any) { toast.error(err.message); }
  };


  // ─── Submissions ────────────────────────────────────────────
  const evaluateAllSubs = async () => {
    if (!selectedHackathon) { toast.warning('Select a hackathon first'); return; }
    setEvaluatingAll(true);
    try {
      const r = await recruitApi.evaluateAllSubmissions(selectedHackathon);
      toast.success(`Evaluated: ${r.evaluated ?? 0} | Errors: ${r.errors ?? 0}`);
      await loadSubmissions(selectedHackathon);
    } catch (err: any) { toast.error(err.message); }
    finally { setEvaluatingAll(false); }
  };

  // ─── Rankings ───────────────────────────────────────────────
  const regenRecs = async () => {
    if (!rankHackathon) return;
    try {
      const r = await recruitApi.regenerateRecs(rankHackathon);
      toast.success(`Regenerated for ${r.updated} evaluations`);
      await loadRankings(rankHackathon);
    } catch (err: any) { toast.error(err.message); }
  };

  const handleApprove = async (action: 'approved' | 'rejected') => {
    if (!approveModal) return;
    try {
      await recruitApi.approveEval(approveModal.id, action, approveNotes);
      toast.success(`${approveModal.name} ${action}`);
      setApproveModal(null); setApproveNotes('');
      await loadRankings(rankHackathon);
    } catch (err: any) { toast.error(err.message); }
  };

  const reEvaluateOne = async (evalId: string) => {
    try {
      toast.info('Re-evaluating submission...');
      const r = await recruitApi.reEvaluate(evalId);
      toast.success(`Re-evaluation complete! New score: ${r.score}/100`);
      await loadRankings(rankHackathon);
      if (approveModal?.id === evalId) {
        // Refresh modal data if open
        const d = await recruitApi.getEvalDetail(evalId);
        setEvalDetail(d);
      }
    } catch (err: any) { toast.error(err.message); }
  };

  const reEvaluateAll = async () => {
    if (!rankHackathon) return;
    if (!confirm('Re-evaluate ALL submissions with alignment checking? This will re-clone repos and recalculate all scores.')) return;
    try {
      toast.info('Re-evaluating all submissions...');
      await recruitApi.reEvaluateAll(rankHackathon, rankings);
      toast.success('Batch re-evaluation triggered');
      await loadRankings(rankHackathon);
    } catch (err: any) { toast.error(err.message); }
  };

  const copyLink = (hackathonId: string) => {
    const url = `${window.location.origin}/submit?hackathon=${hackathonId}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Submission link copied to clipboard!');
    }).catch(() => toast.error('Failed to copy link'));
  };

  const openEvalDetail = async (r: Ranking) => {
    setApproveModal({ id: r.id, name: r.candidate_name });
    setLoadingDetail(true);
    setEvalDetail(null);
    try {
      const d = await recruitApi.getEvalDetail(r.id);
      setEvalDetail(d);
    } catch (err: any) {
      toast.error(`Failed to load details: ${err.message}`);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ─── AI Screening ────────────────────────────────────────────
  const runScreening = async () => {
    if (!screenCandidate) { toast.warning('Select a candidate'); return; }
    if (!screenJobTitle || !screenJobDesc) { toast.warning('Job title and description required'); return; }
    setScreeningRunning(true);
    setScreeningResult(null);
    try {
      const r = await recruitApi.evaluateResume(
        screenCandidate, screenJobTitle, screenJobDesc,
        screenHackathon || undefined
      );
      setScreeningResult(r);
    } catch (err: any) { toast.error(err.message); }
    finally { setScreeningRunning(false); }
  };

  const runEvalAll = async () => {
    if (!screenJobTitle || !screenJobDesc) { toast.warning('Fill Job title and description first'); return; }
    setEvaluatingAll(true);
    try {
      const r = await recruitApi.evaluateAll(screenJobTitle, screenJobDesc, screenHackathon || undefined, filterByApplied);
      setEvalAllResults(r.results ?? []);
      toast.success(`Evaluated ${r.results?.length ?? 0} candidates`);
    } catch (err: any) { toast.error(err.message); }
    finally { setEvaluatingAll(false); }
  };

  const bulkShortlistTopK = async () => {
    const top = evalAllResults
      .filter(r => !r.error)
      .sort((a, b) => Number(b.confidenceScore) - Number(a.confidenceScore))
      .slice(0, topK)
      .map(r => r.candidateEmail);
    await recruitApi.updateStatus(top, 'shortlisted');
    toast.success(`Shortlisted top ${top.length} candidates`);
    await loadAll();
  };

  // ─── Interviews ───────────────────────────────────────────────
  const handleScheduleInterview = async () => {
    if (!interviewForm.candidate_id || !interviewForm.job_id || !interviewForm.scheduled_at) {
      toast.warning('Candidate, Job, and Schedule Time are required');
      return;
    }
    try {
      await recruitApi.scheduleInterview(interviewForm);
      toast.success('Interview scheduled successfully');
      setScheduleModal(false);
      setInterviewForm({ candidate_id: 0, job_id: '', round_name: 'Technical Round 1', scheduled_at: '', notes: '' });
      await loadAll();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleUpdateInterviewStatus = async (id: string, status: string) => {
    try {
      await recruitApi.updateInterviewStatus(id, status);
      toast.success(`Interview marked as ${status}`);
      setInterviewActionModal(null);
      await loadAll();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleUpdateInterviewNotes = async (id: string, notes: string) => {
    try {
      await recruitApi.updateInterviewNotes(id, notes);
      toast.success('Notes updated');
      setInterviewNotesModal(null);
      await loadAll();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleIssueOffer = async () => {
    if (!offerModal || !offerForm.salary) { toast.warning('Candidate and Salary are required'); return; }
    setIssuingOffer(true);
    try {
      const smtpConfig = offerSmtpEmail && offerSmtpPass ? { user: offerSmtpEmail, pass: offerSmtpPass } : undefined;
      await recruitApi.createOffer(
        {
          candidate_id: Number(offerModal.candidate.id),
          job_id: offerModal.jobId,
          salary: offerForm.salary,
          joining_date: offerForm.joining_date || undefined,
          manager: offerForm.manager || undefined,
        },
        smtpConfig
      );
      toast.success(`Offer issued and email sent to ${offerModal.candidate.email}`);
      setOfferModal(null);
      setOfferForm({ salary: '', joining_date: '', manager: '' });
      await loadAll();
    } catch (err: any) { toast.error(err.message); }
    finally { setIssuingOffer(false); }
  };

  // ─── Overview tab ────────────────────────────────────────────  // Filters
  const filteredCandidates = candidates.filter(c => {
    if (candFilter !== 'all' && c.status !== candFilter) return false;
    if (candJobFilter !== 'all' && c.job_id !== candJobFilter) return false;
    return true;
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Recruit</h1>
            <p className="text-sm text-muted-foreground">
              Autonomous AI-powered talent intelligence
              {!loading && <span className="ml-2 text-primary font-medium">· {candidates.length} candidates</span>}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadAll} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        {/* ─── Stats Row ─────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { label: 'Applicants', value: stats.totalApplicants, color: 'text-blue-600', icon: Users },
            { label: 'AI Screened', value: stats.aiScreened, color: 'text-green-600', icon: Sparkles },
            { label: 'Hackathon', value: stats.hackathonParticipants, color: 'text-indigo-600', icon: Send },
            { label: 'Interviews', value: stats.interviewCandidates, color: 'text-amber-600', icon: Bot },
            { label: 'Offers Sent', value: stats.offersSent, color: 'text-violet-600', icon: Mail },
            { label: 'Hires', value: stats.hires, color: 'text-emerald-600', icon: CheckCircle2 },
          ].map(s => (
            <div key={s.label} className="rounded-xl border bg-card p-4 enterprise-shadow">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">{s.label}</p>
              <div className="flex items-end justify-between">
                <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
                <s.icon className={`h-5 w-5 opacity-30 ${s.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* ─── Main Tabs ─────────────────────────────────── */}
        <Tabs defaultValue="jobs">
          <TabsList className="flex-wrap h-auto bg-muted/50 p-1">
            <TabsTrigger value="jobs" className="text-xs"><Briefcase className="h-3 w-3 mr-1" />Job Postings</TabsTrigger>
            <TabsTrigger value="links" className="text-xs"><Link className="h-3 w-3 mr-1" />Application Links</TabsTrigger>
            <TabsTrigger value="candidates" className="text-xs"><Users className="h-3 w-3 mr-1" />Candidates</TabsTrigger>
            <TabsTrigger value="scanner" className="text-xs"><FileText className="h-3 w-3 mr-1" />Resume Collection</TabsTrigger>
            <TabsTrigger value="screening" className="text-xs"><Sparkles className="h-3 w-3 mr-1" />AI Screening</TabsTrigger>
            <TabsTrigger value="assessments" className="text-xs"><Star className="h-3 w-3 mr-1" />Hackathon / Assessment</TabsTrigger>
            <TabsTrigger value="submissions" className="text-xs"><Send className="h-3 w-3 mr-1" />Submissions</TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-xs"><BarChart2 className="h-3 w-3 mr-1" />Leaderboard</TabsTrigger>
            <TabsTrigger value="interviews" className="text-xs"><Bot className="h-3 w-3 mr-1" />Interview Pipeline</TabsTrigger>
            <TabsTrigger value="offers" className="text-xs"><Mail className="h-3 w-3 mr-1" />Offers</TabsTrigger>
            <TabsTrigger value="agents" className="text-xs"><Bot className="h-3 w-3 mr-1" />AI Agents</TabsTrigger>
          </TabsList>

          {/* ══════════ 1. JOB POSTINGS ══════════ */}
          <TabsContent value="jobs" className="mt-4 space-y-4">
            <div className="rounded-xl border bg-card p-6 enterprise-shadow">
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-violet-600" /> Post New Job
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Column 1 */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Job Title *</label>
                    <input
                      className="w-full px-4 py-2.5 text-sm border rounded-xl bg-background focus:ring-2 focus:ring-violet-500/20 transition-all outline-none"
                      placeholder="e.g. Senior AI Engineer"
                      value={jobForm.title}
                      onChange={e => setJobForm({ ...jobForm, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Department</label>
                    <input
                      className="w-full px-4 py-2.5 text-sm border rounded-xl bg-background focus:ring-2 focus:ring-violet-500/20 transition-all outline-none"
                      placeholder="e.g. Engineering"
                      value={jobForm.department}
                      onChange={e => setJobForm({ ...jobForm, department: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Location</label>
                    <input
                      className="w-full px-4 py-2.5 text-sm border rounded-xl bg-background focus:ring-2 focus:ring-violet-500/20 transition-all outline-none"
                      placeholder="e.g. Remote / Bangalore"
                      value={jobForm.location}
                      onChange={e => setJobForm({ ...jobForm, location: e.target.value })}
                    />
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Employment Type</label>
                      <select
                        className="w-full px-4 py-2.5 text-sm border rounded-xl bg-background focus:ring-2 focus:ring-violet-500/20 transition-all outline-none"
                        value={jobForm.employment_type}
                        onChange={e => setJobForm({ ...jobForm, employment_type: e.target.value as any })}
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Internship">Internship</option>
                        <option value="Contract">Contract</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Experience</label>
                      <input
                        className="w-full px-4 py-2.5 text-sm border rounded-xl bg-background focus:ring-2 focus:ring-violet-500/20 transition-all outline-none"
                        placeholder="e.g. 5+ years"
                        value={jobForm.experience_required}
                        onChange={e => setJobForm({ ...jobForm, experience_required: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Skills (comma separated)</label>
                    <input
                      className="w-full px-4 py-2.5 text-sm border rounded-xl bg-background focus:ring-2 focus:ring-violet-500/20 transition-all outline-none"
                      placeholder="e.g. React, Python, LLMs"
                      value={jobForm.skills_required}
                      onChange={e => setJobForm({ ...jobForm, skills_required: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Salary Range</label>
                      <input
                        className="w-full px-4 py-2.5 text-sm border rounded-xl bg-background focus:ring-2 focus:ring-violet-500/20 transition-all outline-none"
                        placeholder="e.g. $120k - $160k"
                        value={jobForm.salary_range}
                        onChange={e => setJobForm({ ...jobForm, salary_range: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Hiring Manager</label>
                      <input
                        className="w-full px-4 py-2.5 text-sm border rounded-xl bg-background focus:ring-2 focus:ring-violet-500/20 transition-all outline-none"
                        placeholder="e.g. John Doe"
                        value={jobForm.hiring_manager}
                        onChange={e => setJobForm({ ...jobForm, hiring_manager: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Application Deadline *</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 text-sm border rounded-xl bg-background focus:ring-2 focus:ring-violet-500/20 transition-all outline-none"
                      value={jobForm.deadline}
                      onChange={e => setJobForm({ ...jobForm, deadline: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Job Description</label>
                    <textarea
                      rows={5}
                      className="w-full px-4 py-2.5 text-sm border rounded-xl bg-background focus:ring-2 focus:ring-violet-500/20 transition-all outline-none resize-none"
                      placeholder="Describe the role and responsibilities..."
                      value={jobForm.description}
                      onChange={e => setJobForm({ ...jobForm, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t pt-6">
                <Button variant="outline" className="rounded-xl px-6" onClick={() => setJobForm({
                  title: '', description: '', department: 'Engineering', employment_type: 'Full-time',
                  experience_required: '', skills_required: '', location: 'Remote',
                  salary_range: '', hiring_manager: '', deadline: '', type: 'job'
                })}>Reset Form</Button>
                <Button onClick={() => handleCreateJob('job')} className="bg-violet-600 hover:bg-violet-700 font-bold px-8 rounded-xl shadow-lg shadow-violet-200">
                  Publish Job Posting
                </Button>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6 enterprise-shadow">
              <h4 className="text-lg font-bold mb-4">Active Postings ({jobs.length})</h4>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {jobs.map(j => (
                  <div key={j.id} className="border rounded-xl p-4 flex flex-col hover:border-violet-300 transition-colors bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-bold text-sm truncate">{j.title}</h5>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-violet-600 bg-violet-50 border-violet-200">
                        {j.department}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                      {j.description}
                    </p>
                    <div className="pt-3 border-t flex justify-between items-center mt-auto">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">Ends: {j.deadline?.split('T')[0] || 'N/A'}</span>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600 hover:bg-red-50">Archive</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>


          {/* ══════════ 2. APPLICATION LINKS ══════════ */}
          <TabsContent value="links" className="mt-4 space-y-4">
            <div className="rounded-xl border bg-card p-6 enterprise-shadow">
              <h4 className="text-lg font-bold mb-1">Live Application Links</h4>
              <p className="text-sm text-muted-foreground mb-6">Generated landing pages for your job postings.</p>

              <div className="grid gap-4">
                {[...jobs, ...hackathons].map(j => {
                  const applyUrl = `${window.location.protocol}//${window.location.host}/apply/${j.id}`;
                  return (
                    <div key={j.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-colors group bg-white">
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-sm">{j.title}</span>
                          <span className="text-[10px] text-muted-foreground">/apply/{j.id.slice(0, 8)}</span>
                        </div>
                        <div className="bg-muted px-2 py-1 rounded text-[11px] text-muted-foreground font-mono truncate">
                          {applyUrl}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 gap-2" onClick={() => {
                          navigator.clipboard.writeText(applyUrl);
                          toast.success('Link copied!');
                        }}>
                          <Copy className="h-3.5 w-3.5" /> Copy
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 gap-2" onClick={() => window.open(applyUrl, '_blank')}>
                          <Eye className="h-3.5 w-3.5" /> View
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* ══════════ 3. CANDIDATES ══════════ */}
          <TabsContent value="candidates" className="mt-4">
            <div className="rounded-xl border bg-card p-6 enterprise-shadow">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h4 className="text-lg font-bold">Applicants Repository</h4>
                <div className="flex gap-2">
                  <select
                    className="h-9 px-3 py-1 text-sm border rounded-lg bg-background font-medium focus:ring-2 focus:ring-violet-500/20 outline-none"
                    value={candJobFilter}
                    onChange={e => setCandJobFilter(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                    {hackathons.map(h => <option key={h.id} value={h.id}>{h.title}</option>)}
                  </select>
                  <Button
                    variant={candFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    className={candFilter === 'all' ? 'bg-violet-600' : ''}
                    onClick={() => setCandFilter('all')}
                  >
                    All ({candidates.length})
                  </Button>
                  <Button
                    variant={candFilter === 'shortlisted' ? 'default' : 'outline'}
                    size="sm"
                    className={candFilter === 'shortlisted' ? 'bg-green-600 border-green-200' : ''}
                    onClick={() => setCandFilter('shortlisted')}
                  >
                    Shortlisted
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 border-b">
                    <tr className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="p-4">Candidate</th>
                      <th className="p-4">Applied For</th>
                      <th className="p-4">Experience</th>
                      <th className="p-4">Socials</th>
                      <th className="p-4">AI Score</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.length === 0 ? (
                      <tr><td colSpan={6} className="p-12 text-center text-muted-foreground italic">No candidates found for the selected filters.</td></tr>
                    ) : (
                      filteredCandidates.map(c => (
                        <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20 bg-white">
                          <td className="p-4">
                            <p className="font-bold">{c.name}</p>
                            <p className="text-[10px] text-muted-foreground">{c.email}</p>
                            <Badge className={`mt-1 text-[9px] uppercase ${STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-600'}`}>{c.status}</Badge>
                          </td>
                          <td className="p-4">
                            {c.job_title ? (
                              <Badge variant="outline" className="text-[10px] bg-violet-50 text-violet-700 border-violet-100 uppercase font-bold">
                                {c.job_title}
                              </Badge>
                            ) : (
                              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Direct Upload</span>
                            )}
                          </td>
                          <td className="p-4 text-xs">{c.experience_years} Years</td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              {c.linkedin_url && <a href={c.linkedin_url} target="_blank"><Linkedin className="h-4 w-4 text-blue-600" /></a>}
                              {c.portfolio_url && <a href={c.portfolio_url} target="_blank"><Globe className="h-4 w-4 text-slate-600" /></a>}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={c.ai_match_score > 70 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                              {c.ai_match_score ?? 'N/A'}%
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1.5">
                              {c.status === 'shortlisted' && (
                                <Button size="sm" className="h-7 text-xs px-3 bg-blue-600 hover:bg-blue-700 font-semibold"
                                  onClick={() => {
                                    setInterviewForm(f => ({ ...f, candidate_id: Number(c.id), job_id: c.job_id || '' }));
                                    setScheduleModal(true);
                                  }}>
                                  <UserPlus className="h-3 w-3 mr-1" /> Schedule
                                </Button>
                              )}
                              {(c.status === 'shortlisted' || c.status === 'offered') && (
                                <Button size="sm" variant="outline" className="h-7 text-xs px-3 border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-semibold"
                                  onClick={() => setOfferModal({ candidate: c, jobId: c.job_id || (jobs[0]?.id ?? '') })}>
                                  <Send className="h-3 w-3 mr-1" /> Offer
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ══════════ 4. RESUME COLLECTION ══════════ */}
          <TabsContent value="scanner" className="mt-4">
            <div className="rounded-xl border bg-card p-6 enterprise-shadow bg-white">
              <h4 className="text-lg font-bold mb-4">Autonomous Resume Screening</h4>
              <p className="text-sm text-muted-foreground mb-6">Drop folders of resumes for AI parsing and initial filtering.</p>
              <div
                className="border-2 border-dashed rounded-3xl p-12 text-center hover:bg-muted/30 transition-all cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-violet-400 group-hover:scale-110 transition-transform" />
                <p className="font-bold text-violet-600">Click to upload or drag resumes</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, DOCX supported • Max 50 files per batch</p>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                  onChange={e => {
                    if (e.target.files) handleFileUpload(e.target.files);
                  }}
                />
              </div>
            </div>
          </TabsContent>
          {/* ══════════ 5. AI SCREENING ══════════ */}
          <TabsContent value="screening" className="mt-4 space-y-4">
            <div className="rounded-xl border bg-card p-5 enterprise-shadow bg-white">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-600" /> AI Resume Screening
              </h4>
              <div className="grid sm:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Candidate</label>
                  <select
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-background"
                    value={screenCandidate}
                    onChange={e => setScreenCandidate(e.target.value)}
                  >
                    <option value="">— Select candidate —</option>
                    {candidates.map(c => <option key={c.email} value={c.email}>{c.name} ({c.email})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Job Posting (optional)</label>
                  <select
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-background"
                    value={screenHackathon}
                    onChange={e => {
                      setScreenHackathon(e.target.value);
                      const job = jobs.find(j => j.id === e.target.value);
                      if (job) { setScreenJobTitle(job.title); setScreenJobDesc(job.description); }
                    }}
                  >
                    <option value="">Use custom JD below</option>
                    <optgroup label="Standard Jobs">
                      {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                    </optgroup>
                    <optgroup label="Hackathons">
                      {hackathons.map(h => <option key={h.id} value={h.id}>{h.title}</option>)}
                    </optgroup>
                  </select>
                  {screenHackathon && (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        id="filterByApplied"
                        className="rounded border-gray-300 text-violet-600 focus:ring-violet-500 h-4 w-4"
                        checked={filterByApplied}
                        onChange={e => setFilterByApplied(e.target.checked)}
                      />
                      <label htmlFor="filterByApplied" className="text-xs font-medium text-muted-foreground cursor-pointer">
                        Screen only applicants for this role
                      </label>
                    </div>
                  )}
                </div>
              </div>
              <div className="mb-3">
                <label className="text-sm font-medium block mb-1">Job Title</label>
                <input
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background"
                  placeholder="e.g. Senior AI Engineer"
                  value={screenJobTitle}
                  onChange={e => setScreenJobTitle(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="text-sm font-medium block mb-1">Job Description</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background resize-none"
                  placeholder="Paste the JD or key requirements…"
                  value={screenJobDesc}
                  onChange={e => setScreenJobDesc(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={runScreening} disabled={screeningRunning} className="bg-violet-600 hover:bg-violet-700 font-bold">
                  {screeningRunning ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1 h-4 w-4" />}
                  Run AI Screening
                </Button>
                <Button variant="outline" onClick={runEvalAll} disabled={evaluatingAll} className="font-bold">
                  {evaluatingAll ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Users className="mr-1 h-4 w-4" />}
                  Evaluate All Candidates
                </Button>
              </div>
            </div>

            {/* Single screening result */}
            {screeningResult && (
              <div className="rounded-xl border bg-card p-5 enterprise-shadow bg-white">
                <h4 className="font-semibold mb-3">Screening Report</h4>
                <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-80">
                  {screeningResult.report ?? JSON.stringify(screeningResult, null, 2)}
                </pre>
              </div>
            )}

            {/* Batch results */}
            {evalAllResults.length > 0 && (
              <div className="rounded-xl border bg-card p-5 enterprise-shadow bg-white">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h4 className="font-semibold">Batch Results — {evalAllResults.length} candidates</h4>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground">Top K:</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={topK}
                      onChange={e => setTopK(Number(e.target.value))}
                      className="w-16 px-2 py-1 text-sm border rounded-lg bg-background"
                    />
                    <Button size="sm" className="bg-green-600 hover:bg-green-700"
                      onClick={bulkShortlistTopK}>
                      <Star className="mr-1 h-3.5 w-3.5" /> Shortlist Top {topK}
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs text-muted-foreground text-left">
                        <th className="p-3">Candidate</th>
                        <th className="p-3">AI Score</th>
                        <th className="p-3">Decision</th>
                        <th className="p-3">Reasoning</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evalAllResults
                        .sort((a, b) => Number(b.confidenceScore) - Number(a.confidenceScore))
                        .map((r, i) => (
                          <tr key={i} className={`border-b hover:bg-muted/30 ${i < topK ? 'bg-green-50/40' : ''}`}>
                            <td className="p-3">
                              <p className="font-medium">{r.candidateName}</p>
                              <p className="text-xs text-muted-foreground">{r.candidateEmail}</p>
                            </td>
                            <td className="p-3 font-bold text-primary">
                              {r.error ? <span className="text-red-500 text-xs">Error</span> : `${r.confidenceScore}/100`}
                            </td>
                            <td className="p-3">
                              <Badge variant="secondary"
                                className={
                                  r.decision === 'Strong Hire' || r.decision === 'Hire'
                                    ? 'bg-green-100 text-green-700'
                                    : r.decision === 'Reject'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                }>
                                {r.decision ?? '—'}
                              </Badge>
                            </td>
                            <td className="p-3 text-xs text-muted-foreground max-w-xs">
                              {r.reasoning ?? r.error ?? '—'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>
          {/* ══════════ 6. HACKATHON / ASSESSMENT ══════════ */}
          <TabsContent value="assessments" className="mt-4 space-y-4">
            <div className="rounded-xl border bg-card p-6 enterprise-shadow bg-white">
              <h4 className="text-lg font-bold mb-4 text-indigo-700 flex items-center gap-2">
                <Sparkles className="h-5 w-5" /> Host New Hackathon
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Challenge Title *</label>
                    <input
                      className="w-full px-4 py-2 text-sm border rounded-xl bg-background outline-none hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                      placeholder="e.g. GenAI Innovation Hackathon"
                      value={hackTitle}
                      onChange={e => setHackTitle(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Deadline *</label>
                      <input
                        type="datetime-local"
                        className="w-full px-4 py-2 text-sm border rounded-xl bg-background outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                        value={hackDeadline}
                        onChange={e => setHackDeadline(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Mode</label>
                      <select
                        className="w-full px-4 py-2 text-sm border rounded-xl bg-background outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                        value={jobForm.type === 'hackathon' ? jobForm.location : 'Online'}
                        onChange={e => setJobForm({ ...jobForm, location: e.target.value })}
                      >
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Rewards / Incentives</label>
                    <input
                      className="w-full px-4 py-2 text-sm border rounded-xl bg-background outline-none hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                      placeholder="e.g. $1000 + Internship Offer"
                      value={jobForm.salary_range}
                      onChange={e => setJobForm({ ...jobForm, salary_range: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Technical Brief / JD</label>
                    <textarea
                      rows={2}
                      className="w-full px-4 py-2 text-sm border rounded-xl bg-background resize-none outline-none hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                      placeholder="Specify the technical challenge..."
                      value={hackDesc}
                      onChange={e => setHackDesc(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-col justify-end">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 font-bold h-12 shadow-lg shadow-indigo-100 rounded-xl" onClick={() => handleCreateJob('hackathon')}>
                    Launch Challenge
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6 enterprise-shadow bg-white mt-6">
              <h4 className="text-lg font-bold mb-4">Active Challenges</h4>
              <div className="grid gap-4">
                {hackathons.map(h => (
                  <div key={h.id} className="border rounded-xl p-4 flex items-start justify-between bg-indigo-50/20 border-indigo-100">
                    <div>
                      <p className="font-bold text-sm text-indigo-700">{h.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{h.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs bg-white text-indigo-600"
                      onClick={() => {
                        const url = `${window.location.protocol}//${window.location.host}/apply/${h.id}`;
                        navigator.clipboard.writeText(url);
                        toast.success('Link copied!');
                      }}
                    >
                      <Copy className="mr-1 h-3 w-3" /> Get Invite Link
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6 enterprise-shadow bg-white mt-6 border-violet-200">
              <div className="flex items-center gap-2 mb-4">
                <Send className="h-5 w-5 text-violet-600" />
                <h4 className="text-lg font-bold text-violet-700">Automated Email Outreach</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Send automated assessment links or interview workflow emails to your applicants via your own provider.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Target Role *</label>
                  <select
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-violet-500/20"
                    value={outreachHackathon}
                    onChange={e => setOutreachHackathon(e.target.value)}
                  >
                    <option value="">— Select Job/Hackathon —</option>
                    <optgroup label="Standard Jobs">
                      {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                    </optgroup>
                    <optgroup label="Hackathons">
                      {hackathons.map(h => <option key={h.id} value={h.id}>{h.title}</option>)}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Recipients *</label>
                  <select
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-violet-500/20"
                    value={outreachType}
                    onChange={e => setOutreachType(e.target.value as 'ALL' | 'SHORTLISTED')}
                  >
                    <option value="ALL">All Applicants (New)</option>
                    <option value="SHORTLISTED">Only Shortlisted</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Sender Email (SMTP) *</label>
                  <input
                    type="email"
                    placeholder="hr@company.com"
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-violet-500/20"
                    value={senderEmail}
                    onChange={e => setSenderEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">App Password *</label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••"
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-background outline-none focus:ring-2 focus:ring-violet-500/20"
                    value={appPassword}
                    onChange={e => setAppPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end pr-1">
                <Button
                  className="bg-violet-600 hover:bg-violet-700 min-w-[150px]"
                  disabled={sendingMails}
                  onClick={handleAutomatedOutreach}
                >
                  {sendingMails ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  {sendingMails ? 'Sending...' : 'Send Automatically'}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-4 italic">* Requires Gmail App Password (2FA enabled). Check Google Account settings. Does not email already invited candidates.</p>
            </div>
          </TabsContent>

          {/* ══════════ SUBMISSIONS ══════════ */}
          <TabsContent value="submissions" className="mt-4">
            <div className="rounded-xl border bg-card p-6 enterprise-shadow">
              <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
                <div className="flex-1 min-w-[240px]">
                  <h4 className="text-lg font-bold">Project Submissions</h4>
                  <select
                    className="mt-2 w-full max-w-sm px-4 py-2 text-sm border rounded-lg bg-background"
                    value={selectedHackathon}
                    onChange={e => { setSelectedHackathon(e.target.value); loadSubmissions(e.target.value); }}
                  >
                    <option value="">Select Activity</option>
                    {[...jobs, ...hackathons].map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                  </select>
                </div>
                <Button onClick={evaluateAllSubs} disabled={evaluatingAll || !selectedHackathon} className="bg-violet-600">
                  {evaluatingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Evaluate All
                </Button>
              </div>

              {!selectedHackathon ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">Select a job above to view entries.</div>
              ) : (
                <div className="overflow-x-auto rounded-xl border">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 border-b">
                      <tr className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="p-4">Candidate</th>
                        <th className="p-4">Repo</th>
                        <th className="p-4">AI Score</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map(s => (
                        <tr key={s.id} className="border-b last:border-0 hover:bg-muted/20">
                          <td className="p-4">
                            <p className="font-bold">{s.candidate_name}</p>
                            <p className="text-[10px] text-muted-foreground">{s.candidate_email}</p>
                          </td>
                          <td className="p-4 font-mono text-xs">
                            <a href={s.github_repo_url} target="_blank" className="text-blue-600 truncate block max-w-[200px]" rel="noreferrer">{s.github_repo_url}</a>
                          </td>
                          <td className="p-4">
                            {s.overall_score ? <Badge className="bg-green-100 text-green-700">{s.overall_score}</Badge> : '—'}
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="text-[9px] uppercase">{s.status}</Badge>
                          </td>
                          <td className="p-4">
                            {s.overall_score ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs flex items-center gap-1 text-violet-600 border-violet-200 hover:bg-violet-50"
                                onClick={() => setSubmissionModal(s)}
                              >
                                <Eye className="h-3 w-3" /> View Reasoning
                              </Button>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ══════════ 8. LEADERBOARD ══════════ */}
          <TabsContent value="leaderboard" className="mt-4">
            <div className="rounded-xl border bg-card p-6 enterprise-shadow bg-white">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-bold flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" /> Talent Leaderboard
                </h4>
                <select
                  className="px-4 py-2 text-sm border rounded-xl bg-background"
                  value={selectedHackathon}
                  onChange={e => { setSelectedHackathon(e.target.value); loadSubmissions(e.target.value); }}
                >
                  <option value="">Select Assessment</option>
                  {hackathons.map(h => <option key={h.id} value={h.id}>{h.title}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                {submissions.sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0)).map((s, idx) => (
                  <div key={s.id} className="flex items-center justify-between p-4 border rounded-2xl hover:border-amber-200 transition-all bg-white shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-slate-100 text-slate-700' : 'bg-orange-50 text-orange-700'}`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{s.candidate_name}</p>
                        <p className="text-[10px] text-muted-foreground">{s.candidate_email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-amber-600">{s.overall_score || 0}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ══════════ 9. INTERVIEW PIPELINE ══════════ */}
          <TabsContent value="interviews" className="mt-4">
            <div className="rounded-xl border bg-card p-6 enterprise-shadow bg-white">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h4 className="text-lg font-bold">Interview Workflow</h4>
                  <p className="text-sm text-muted-foreground">Track candidate progress through technical and HR rounds.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-100" onClick={() => setScheduleModal(true)}>
                  <UserPlus className="mr-2 h-4 w-4" /> Schedule Interview
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {(['scheduled', 'completed', 'cancelled', 'offered'] as const).map(status => (
                  <div key={status} className="flex flex-col gap-4">
                    <h5 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground px-2">
                      <span className={`w-2 h-2 rounded-full ${INTERVIEW_STATUS_COLORS[status]?.split(' ')[0]}`} />
                      {status}
                    </h5>
                    <div className="bg-slate-50 border border-dashed rounded-3xl p-3 min-h-[500px] space-y-3">
                      {interviews.filter(i => i.status === status).map(i => (
                        <div key={i.id} className="bg-white border hover:border-blue-300 transition-all rounded-2xl p-4 shadow-sm group cursor-pointer" onClick={() => setInterviewActionModal(i)}>
                          <Badge variant="outline" className={`text-[9px] uppercase font-bold mb-2 ${INTERVIEW_STATUS_COLORS[status] || ''}`}>{i.round_name}</Badge>
                          <p className="font-bold text-sm mb-1 truncate">{i.candidate_name || `Candidate #${i.candidate_id}`}</p>
                          <p className="text-xs text-muted-foreground truncate mb-3">{i.job_title || `Job ID: ${i.job_id}`}</p>
                          <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {(i.scheduled_at || '').split('T')[0] || 'N/A'}</span>
                            <span className="hover:text-blue-600 cursor-pointer" onClick={(e) => { e.stopPropagation(); setInterviewNotesModal(i); }}>Notes</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ══════════ 10. OFFERS ══════════ */}
          <TabsContent value="offers" className="mt-4">
            <div className="rounded-xl border bg-card p-6 enterprise-shadow bg-white">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="text-lg font-bold text-emerald-700 flex items-center gap-2"><Send className="h-5 w-5" /> Offer Letters</h4>
                  <p className="text-sm text-muted-foreground">Track offer status and resend letters to candidates.</p>
                </div>
              </div>
              <div className="rounded-2xl border overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b">
                    <tr className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      <th className="p-4">Candidate</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Package</th>
                      <th className="p-4">Joining Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.length === 0 ? (
                      <tr><td colSpan={6} className="p-16 text-center text-muted-foreground italic">No offers issued yet. Schedule interviews and mark candidates as 'offered' from the Interview Pipeline.</td></tr>
                    ) : (
                      offers.map(o => (
                        <tr key={o.id} className="border-b last:border-0 bg-white hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-sm">{o.candidate_name || `Candidate #${o.candidate_id}`}</p>
                          </td>
                          <td className="p-4 text-xs text-muted-foreground font-medium">{o.job_title || '—'}</td>
                          <td className="p-4 font-bold text-emerald-700">{o.salary}</td>
                          <td className="p-4 text-xs">{o.joining_date ? new Date(o.joining_date).toLocaleDateString('en-IN') : '—'}</td>
                          <td className="p-4">
                            <Badge className={
                              o.status === 'accepted' ? 'bg-emerald-100 text-emerald-700 font-bold' :
                                o.status === 'declined' ? 'bg-red-100 text-red-700 font-bold' :
                                  'bg-amber-100 text-amber-700 font-bold'
                            }>{o.status.toUpperCase()}</Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2 flex-wrap">
                              {o.status === 'sent' && (
                                <>
                                  <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700" onClick={async () => {
                                    await recruitApi.updateOfferStatus(o.id, 'accepted');
                                    await loadAll();
                                    toast.success('Offer marked as accepted!');
                                  }}>Accept</Button>
                                  <Button size="sm" variant="outline" className="h-7 text-xs border-red-200 text-red-700 hover:bg-red-50" onClick={async () => {
                                    await recruitApi.updateOfferStatus(o.id, 'declined');
                                    await loadAll();
                                    toast.info('Offer declined.');
                                  }}>Decline</Button>
                                </>
                              )}
                              <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-600 hover:bg-blue-50" onClick={async () => {
                                toast.info('Resending offer letter...');
                                await recruitApi.resendOffer(o.id);
                                toast.success('Offer letter resent!');
                              }}>
                                <Mail className="h-3 w-3 mr-1" /> Resend
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>


          {/* ══════════ 11. AI AGENTS ══════════ */}
          <TabsContent value="agents" className="mt-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                { name: 'Talent Scout', desc: 'Sourcing candidates from LinkedIn & GitHub.', status: 'Active' },
                { name: 'Screening Bot', desc: 'Autonomous resume parsing and AI match score.', status: 'Active' },
                { name: 'Interview Scheduler', desc: 'Auto-syncs manager calendars for rounds.', status: 'On Standby' },
                { name: 'Offer Agent', desc: 'Autonomous offer generation and compliance tracking.', status: 'Active' }
              ].map(agent => (
                <div key={agent.name} className="bg-white border rounded-3xl p-8 enterprise-shadow relative group hover:border-violet-400 transition-all">
                  <Bot className="h-10 w-10 text-violet-600 mb-4" />
                  <h5 className="font-bold text-sm mb-1">{agent.name}</h5>
                  <p className="text-xs text-muted-foreground mb-6 h-10 line-clamp-2">{agent.desc}</p>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{agent.status}</span>
                    <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold">CONFIG</Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Detailed Evaluation Modal */}
        {approveModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-card border rounded-3xl overflow-hidden w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
              <div className="p-6 border-b bg-muted/20 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-violet-600" /> AI Talent Insights
                  </h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { setApproveModal(null); setEvalDetail(null); }}>
                  <XCircle className="h-6 w-6" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-8">
                {loadingDetail ? (
                  <div className="py-20 text-center">
                    <Loader2 className="mx-auto h-10 w-10 animate-spin text-violet-600 mb-6" />
                    <p className="text-muted-foreground font-medium">Processing semantic analysis...</p>
                  </div>
                ) : evalDetail ? (
                  <div className="space-y-8">
                    <div className="bg-slate-50 p-6 rounded-2xl border">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Overall Match Score</p>
                      <p className="text-3xl font-black text-violet-600">{evalDetail.overall_score || 0}%</p>
                    </div>
                    <div className="space-y-4">
                      <h6 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Analysis Summary</h6>
                      <div className="bg-violet-50/30 border border-violet-100 rounded-2xl p-6 italic text-sm">
                        "{evalDetail.ai_recommendation || evalDetail.feedback_json || 'No analysis provided.'}"
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-muted-foreground">No data found.</div>
                )}
              </div>
              <div className="p-6 border-t bg-slate-50 flex gap-3">
                <Button className="flex-1 bg-violet-600 hover:bg-violet-700 font-bold h-12 rounded-2xl" onClick={() => setApproveModal(null)}>ADVANCE TO INTERVIEW</Button>
              </div>
            </div>
          </div>
        )}

        {/* ─── MODAL: Submission Reasoning ─── */}
        {submissionModal && (() => {
          const relatedJob = [...jobs, ...hackathons].find(h => h.id === submissionModal.hackathon_id);

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b bg-slate-50">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-indigo-600" /> AI Evaluation Reasoning
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">{submissionModal.candidate_name} ({submissionModal.candidate_email})</p>
                  </div>
                  <button className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600" onClick={() => setSubmissionModal(null)}>
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
                  {/* Problem Statement Alignment Visualization */}
                  {relatedJob && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-3">
                        <Briefcase className="h-4 w-4 text-emerald-500" /> Problem Statement (PS) Alignment
                      </h4>
                      <div className="grid md:grid-cols-2 gap-6 items-start">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Original PS / Requirements</div>
                          <p className="text-sm text-slate-700 italic line-clamp-4">"{relatedJob.description}"</p>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Alignment Score</div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${submissionModal.overall_score || 0}%` }}
                              ></div>
                            </div>
                            <span className="font-bold text-emerald-700">{submissionModal.overall_score || 0}% Match</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                            <span className="font-semibold text-slate-700">Agent Analysis:</span> Based on structural patterns and logical implementation, this submission successfully serves {submissionModal.overall_score || 0}% of the mandated technical constraints.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Score Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center transform transition-transform hover:scale-105">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 md:h-8 flex items-center justify-center">Code Quality</div>
                      <div className="text-2xl font-bold text-slate-800">{submissionModal.code_quality_score || 0}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center transform transition-transform hover:scale-105">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 md:h-8 flex items-center justify-center">Architecture</div>
                      <div className="text-2xl font-bold text-slate-800">{submissionModal.project_structure_score || 0}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center transform transition-transform hover:scale-105">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 md:h-8 flex items-center justify-center">Execution</div>
                      <div className="text-2xl font-bold text-slate-800">{submissionModal.technical_score || 0}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center transform transition-transform hover:scale-105">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 md:h-8 flex items-center justify-center">Innovation</div>
                      <div className="text-2xl font-bold text-slate-800">{submissionModal.innovation_score || 0}</div>
                    </div>
                    <div className="p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50 shadow-sm text-center transform transition-transform hover:scale-105 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-200 to-transparent opacity-20 transform rotate-45 translate-x-4 -translate-y-4"></div>
                      <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest mb-1 md:h-8 flex items-center justify-center z-10 relative">Overall Match</div>
                      <div className="text-3xl font-black text-indigo-700 z-10 relative">{submissionModal.overall_score || 0}%</div>
                    </div>
                  </div>

                  {/* Main Recommendation */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-3">
                      <BrainCircuit className="h-4 w-4 text-indigo-500" /> AI Agent Executive Summary
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      {submissionModal.ai_recommendation ? (
                        <span className="italic"> "{submissionModal.ai_recommendation}" </span>
                      ) : (
                        <span className="text-slate-500">Analysis pending execution.</span>
                      )}
                    </p>
                  </div>

                  {/* JSON Feedback Dropdown (For Developers/Auditors) */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <details className="group cursor-pointer">
                      <summary className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 outline-none list-none">
                        <Code2 className="h-4 w-4 text-slate-500" />
                        <span>Granular Agent Feedback</span>
                        <span className="text-xs text-slate-400 font-normal ml-auto transition-transform group-open:rotate-180">(Click to view raw JSON metrics)</span>
                      </summary>
                      <div className="mt-4 bg-[#0d1117] border border-slate-800 rounded-lg p-4 max-h-64 overflow-y-auto w-full custom-scrollbar">
                        <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap break-words leading-relaxed">
                          {submissionModal.feedback_json ? (
                            (() => {
                              try {
                                return JSON.stringify(JSON.parse(submissionModal.feedback_json), null, 2);
                              } catch {
                                return submissionModal.feedback_json;
                              }
                            })()
                          ) : (
                            '{\n  "status": "No raw metrics available in this layer."\n}'
                          )}
                        </pre>
                      </div>
                    </details>
                  </div>
                </div>

                <div className="p-6 border-t bg-white flex justify-between items-center shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-3">
                    <a
                      href={submissionModal.github_repo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      <Github className="h-4 w-4" /> Source Code
                    </a>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="px-6 border-slate-300" onClick={() => setSubmissionModal(null)}>Close</Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Schedule Interview Modal */}
        {scheduleModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
              <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" /> Schedule Interview
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Select Candidate</label>
                  <select className="w-full px-4 py-2 text-sm border rounded-xl" value={interviewForm.candidate_id || ''} onChange={e => setInterviewForm({ ...interviewForm, candidate_id: Number(e.target.value) })}>
                    <option value="">Select Candidate...</option>
                    {candidates.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Link to Job / Hackathon</label>
                  <select className="w-full px-4 py-2 text-sm border rounded-xl" value={interviewForm.job_id || ''} onChange={e => setInterviewForm({ ...interviewForm, job_id: e.target.value })}>
                    <option value="">Select Job/Assessment...</option>
                    {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                    {hackathons.map(h => <option key={h.id} value={h.id}>{h.title} (Assessment)</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Round Name</label>
                  <input type="text" className="w-full px-4 py-2 text-sm border rounded-xl" placeholder="e.g. Technical Round 1" value={interviewForm.round_name} onChange={e => setInterviewForm({ ...interviewForm, round_name: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Date & Time</label>
                  <input type="datetime-local" className="w-full px-4 py-2 text-sm border rounded-xl" value={interviewForm.scheduled_at} onChange={e => setInterviewForm({ ...interviewForm, scheduled_at: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Notes (Optional)</label>
                  <textarea rows={2} className="w-full px-4 py-2 text-sm border rounded-xl" placeholder="Meeting link or requirements..." value={interviewForm.notes} onChange={e => setInterviewForm({ ...interviewForm, notes: e.target.value })} />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setScheduleModal(false)}>Cancel</Button>
                <Button onClick={handleScheduleInterview} className="bg-blue-600 hover:bg-blue-700 font-bold">Schedule</Button>
              </div>
            </div>
          </div>
        )}

        {/* Interview Action (Status) Modal */}
        {interviewActionModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200">
              <h4 className="text-xl font-bold mb-4">Update Interview Status</h4>
              <p className="text-sm text-slate-600 mb-6">Change stage for <strong>{interviewActionModal.candidate_name || `Candidate #${interviewActionModal.candidate_id}`}</strong>'s <strong>{interviewActionModal.round_name}</strong>.</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => handleUpdateInterviewStatus(interviewActionModal.id, 'completed')}>Mark Completed</Button>
                <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50" onClick={() => handleUpdateInterviewStatus(interviewActionModal.id, 'cancelled')}>Mark Cancelled</Button>
                <Button variant="outline" className="col-span-2 border-purple-200 text-purple-700 hover:bg-purple-50" onClick={() => handleUpdateInterviewStatus(interviewActionModal.id, 'offered')}>Move to Offers</Button>
              </div>
              <div className="flex justify-end">
                <Button variant="ghost" onClick={() => setInterviewActionModal(null)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}

        {/* Interview Notes Modal */}
        {interviewNotesModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
              <h4 className="text-xl font-bold mb-4">Interview Notes</h4>
              <textarea
                rows={4}
                className="w-full px-4 py-2 text-sm border rounded-xl bg-slate-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Add feedback or recruiter notes..."
                defaultValue={interviewNotesModal.notes}
                id="interview-notes-field"
              />
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setInterviewNotesModal(null)}>Cancel</Button>
                <Button onClick={() => {
                  const val = (document.getElementById('interview-notes-field') as HTMLTextAreaElement).value;
                  handleUpdateInterviewNotes(interviewNotesModal.id, val);
                }} className="bg-blue-600 hover:bg-blue-700 font-bold">Save Notes</Button>
              </div>
            </div>
          </div>
        )}

        {/* Issue Offer Letter Modal */}
        {offerModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200">
              <h4 className="text-xl font-bold mb-1 flex items-center gap-2">
                <Send className="h-5 w-5 text-emerald-600" /> Issue Offer Letter
              </h4>
              <p className="text-sm text-muted-foreground mb-5">
                Candidate: <strong>{offerModal.candidate.name}</strong>
              </p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Link to Job *</label>
                  <select className="w-full px-4 py-2 text-sm border rounded-xl" value={offerModal.jobId} onChange={e => setOfferModal({ ...offerModal, jobId: e.target.value })}>
                    {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                    {hackathons.map(h => <option key={h.id} value={h.id}>{h.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Salary / Package *</label>
                  <input type="text" className="w-full px-4 py-2 text-sm border rounded-xl" placeholder="e.g. ₹18 LPA or $90,000/yr" value={offerForm.salary} onChange={e => setOfferForm({ ...offerForm, salary: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Expected Joining Date</label>
                  <input type="date" className="w-full px-4 py-2 text-sm border rounded-xl" value={offerForm.joining_date} onChange={e => setOfferForm({ ...offerForm, joining_date: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-1 block">Hiring Manager</label>
                  <input type="text" className="w-full px-4 py-2 text-sm border rounded-xl" placeholder="e.g. Priya Sharma" value={offerForm.manager} onChange={e => setOfferForm({ ...offerForm, manager: e.target.value })} />
                </div>
                <div className="bg-slate-50 border rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Mail className="h-3 w-3" /> Email Delivery (SMTP)</p>
                  <input type="email" className="w-full px-4 py-2 text-sm border rounded-xl" placeholder="Sender Gmail ID" value={offerSmtpEmail} onChange={e => setOfferSmtpEmail(e.target.value)} />
                  <input type="password" className="w-full px-4 py-2 text-sm border rounded-xl" placeholder="App Password" value={offerSmtpPass} onChange={e => setOfferSmtpPass(e.target.value)} />
                  <p className="text-[10px] text-muted-foreground">Leave blank to use server default SMTP credentials.</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setOfferModal(null)}>Cancel</Button>
                <Button onClick={handleIssueOffer} disabled={issuingOffer} className="bg-emerald-600 hover:bg-emerald-700 font-bold">
                  {issuingOffer ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Send Offer Letter
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout >
  );
}
