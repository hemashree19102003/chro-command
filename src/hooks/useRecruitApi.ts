/**
 * Recruit API client — all autonomous backend endpoints wired up.
 * Auto-logs in with dev credentials on first use.
 */

const BASE = '/api/admin';
let authToken: string | null = null;

async function ensureLoggedIn(): Promise<string> {
    if (authToken) return authToken;
    const res = await fetch(`${BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: 'admin', password: 'admin123' }),
    });
    if (!res.ok) throw new Error('Auto-login failed');
    const data = await res.json();
    authToken = data.data?.token ?? null;
    if (!authToken) throw new Error('No token returned');
    return authToken;
}

async function apiFetch(path: string, options: RequestInit = {}) {
    const token = await ensureLoggedIn();
    const res = await fetch(`${BASE}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...(options.headers ?? {}),
        },
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error ?? 'API error');
    return json.data;
}

// ─── Types ─────────────────────────────────────────────────────
export type Candidate = {
    id: number;
    file_name?: string;
    resume_path?: string;
    name: string;
    email: string;
    phone: string;
    linkedin_url?: string;
    portfolio_url?: string;
    skills: string;
    education: string;
    experience: string;
    experience_years?: number;
    status: string;
    ai_match_score?: number;
    ai_screening_report?: string;
    job_id?: string;
    job_title?: string;
    extracted_at: string;
    applied_at?: string;
};

export type Hackathon = {
    id: string;
    title: string;
    description: string;
    department?: string;
    employment_type?: string;
    experience_required?: string;
    skills_required?: string; // JSON string or string array
    location?: string;
    salary_range?: string;
    hiring_manager?: string;
    deadline: string;
    status: string;
    type: 'job' | 'hackathon';
    created_at: string;
};

export type Interview = {
    id: string;
    candidate_id: number;
    job_id: string;
    round_name: string;
    status: 'scheduled' | 'completed';
    notes: string;
    scheduled_at: string;
    candidate_name?: string;
    job_title?: string;
};

export type Offer = {
    id: string;
    candidate_id: number;
    job_id: string;
    salary: string;
    joining_date: string;
    status: 'sent' | 'accepted' | 'declined';
    manager: string;
    candidate_name?: string;
    job_title?: string;
};

export type Submission = {
    id: string;
    hackathon_id: string;
    candidate_email: string;
    candidate_name: string;
    github_repo_url: string;
    submitted_at: string;
    status: string;
    overall_score?: number;
    rank?: number;
    code_quality_score?: number;
    readme_clarity_score?: number;
    project_structure_score?: number;
    innovation_score?: number;
    technical_score?: number;
    feedback_json?: string;
    ai_recommendation?: string;
};

export type Ranking = {
    id: string;
    candidate_email: string;
    candidate_name: string;
    overall_score: number;
    rank: number;
    ai_recommendation: string;
    confidence_level: number;
    approval_status: string;
    hr_notes: string;
    github_repo_url: string;
    code_quality_score: number;
    readme_clarity_score: number;
    project_structure_score: number;
    innovation_score: number;
    technical_score: number;
    feedback_json: string;
};

// ─── API Surface ───────────────────────────────────────────────
export const recruitApi = {
    // Overview stats (derived from candidates + hackathons)
    // Overview stats
    getStats: (): Promise<any> => apiFetch('/stats'),

    // Candidates
    getCandidates: (): Promise<Candidate[]> => apiFetch('/candidates'),
    updateStatus: (emails: string[], status: string) =>
        apiFetch('/candidates/status', {
            method: 'POST',
            body: JSON.stringify({ emails, status }),
        }),

    // Resume files
    getResumeFiles: (): Promise<string[]> => apiFetch('/resume-files'),
    uploadResume: (filename: string, content: string) =>
        apiFetch('/upload-resume', {
            method: 'POST',
            body: JSON.stringify({ filename, content }),
        }),
    deleteResumeFile: (filename: string) =>
        apiFetch(`/resume-file?filename=${encodeURIComponent(filename)}`, { method: 'DELETE' }),
    scanResumes: (): Promise<any> => apiFetch('/scan-resumes', { method: 'POST' }),

    // Hackathons & Jobs
    getJobs: (type?: 'job' | 'hackathon'): Promise<Hackathon[]> =>
        apiFetch(`/hackathons${type ? `?type=${type}` : ''}`),
    createJob: (data: Partial<Hackathon>) =>
        apiFetch('/hackathons', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    sendInvitations: (hackathonId: string, mode: 'ALL' | 'SHORTLISTED' = 'ALL', smtpConfig?: { user: string; pass: string }) =>
        apiFetch(`/hackathons/${hackathonId}/send-invitations`, {
            method: 'POST',
            body: JSON.stringify({ mode, smtpConfig }),
        }),

    // Submissions
    getSubmissions: (hackathonId: string): Promise<Submission[]> =>
        apiFetch(`/hackathons/${hackathonId}/submissions`),
    evaluateAllSubmissions: (hackathonId: string) =>
        apiFetch(`/hackathons/${hackathonId}/evaluate-all`, { method: 'POST' }),

    // Rankings / Leaderboard
    getRankings: (hackathonId: string): Promise<Ranking[]> =>
        apiFetch(`/hackathons/${hackathonId}/rankings`),
    regenerateRecs: (hackathonId: string) =>
        apiFetch(`/hackathons/${hackathonId}/regenerate-recommendations`, { method: 'POST' }),
    getEvalDetail: (evalId: string) =>
        apiFetch(`/evaluations/${evalId}`),
    approveEval: (evalId: string, action: 'approved' | 'rejected', notes: string) =>
        apiFetch(`/evaluations/${evalId}/approve`, {
            method: 'POST',
            body: JSON.stringify({ action, notes }),
        }),
    reEvaluate: (evalId: string) =>
        apiFetch(`/evaluations/${evalId}/re-evaluate`, { method: 'POST' }),
    reEvaluateAll: (hackathonId: string, rankings: { id: string }[]) =>
        Promise.all(rankings.map(r => apiFetch(`/evaluations/${r.id}/re-evaluate`, { method: 'POST' }))),

    // AI Screening (single candidate against JD)
    evaluateResume: (candidateEmail: string, jobTitle: string, jobDescription: string, hackathonId?: string) =>
        apiFetch('/evaluate-resume', {
            method: 'POST',
            body: JSON.stringify({ candidateEmail, jobTitle, jobDescription, hackathonId }),
        }),
    evaluateAll: (jobTitle: string, jobDescription: string, hackathonId?: string, filterByJob?: boolean, filterByShortlisted?: boolean): Promise<any> =>
        apiFetch('/evaluate-all-resumes', {
            method: 'POST',
            body: JSON.stringify({ jobTitle, jobDescription, hackathonId, filterByJob, filterByShortlisted }),
        }),

    // Interviews
    getInterviews: (): Promise<Interview[]> => apiFetch('/interviews'),
    scheduleInterview: (data: Partial<Interview>, smtpConfig?: { user: string; pass: string }) =>
        apiFetch('/interviews', {
            method: 'POST',
            body: JSON.stringify({ ...data, smtpConfig })
        }),
    updateInterviewStatus: (id: string, status: string) =>
        apiFetch(`/interviews/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        }),
    updateInterviewNotes: (id: string, notes: string) =>
        apiFetch(`/interviews/${id}/notes`, {
            method: 'PUT',
            body: JSON.stringify({ notes })
        }),

    // Offers
    getOffers: (): Promise<Offer[]> => apiFetch('/offers'),
    createOffer: (data: { candidate_id: number; job_id: string; salary: string; joining_date?: string; manager?: string }, smtpConfig?: { user: string; pass: string }) =>
        apiFetch('/offers', {
            method: 'POST',
            body: JSON.stringify({ ...data, smtpConfig })
        }),
    resendOffer: (id: string, smtpConfig?: { user: string; pass: string }) =>
        apiFetch(`/offers/${id}/send`, {
            method: 'POST',
            body: JSON.stringify({ smtpConfig })
        }),
    updateOfferStatus: (id: string, status: string) =>
        apiFetch(`/offers/${id}/status`, {
            method: 'POST',
            body: JSON.stringify({ status })
        }),
};
