import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2, CheckCircle2, FileText, User, Mail, Phone, Linkedin, Globe, Briefcase } from "lucide-react";

export default function ApplyJob() {
    const { jobId } = useParams();
    const [job, setJob] = useState<any>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [portfolio, setPortfolio] = useState("");
    const [experienceYears, setExperienceYears] = useState("");
    const [resume, setResume] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!jobId) return;
        fetch(`/api/submission/hackathon/${jobId}`)
            .then(r => r.json())
            .then(d => { if (d.success) setJob(d.data); })
            .catch(() => { });
    }, [jobId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setResume(e.target.files[0]);
    };

    const submit = async () => {
        setError("");
        if (!name || !email || !resume) { setError("Name, Email and Resume are required."); return; }
        setSubmitting(true);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(resume);
            reader.onload = async () => {
                const base64 = (reader.result as string).split(",")[1];
                const r = await fetch("/api/submission/apply", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        jobId,
                        name,
                        email,
                        phone,
                        linkedin,
                        portfolio,
                        experienceYears: parseInt(experienceYears) || 0,
                        resumeContent: base64,
                        resumeFilename: resume.name
                    }),
                });
                const d = await r.json();
                if (d.success) {
                    setSubmitted(true);
                } else {
                    setError(d.error || "Submission failed.");
                }
                setSubmitting(false);
            };
        } catch {
            setError("Network error. Please try again.");
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <nav className="h-14 bg-white border-b border-gray-200 flex items-center px-6 sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-violet-600" />
                    <span className="font-bold text-sm text-gray-900">CHRO Command Careers</span>
                </div>
            </nav>

            <main className="flex-1 flex items-start justify-center px-6 py-12">
                <div className="w-full max-w-[540px]">
                    {submitted ? (
                        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm text-center">
                            <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">Application Received!</h2>
                            <p className="text-gray-500 mb-8">
                                Thank you for applying for the <strong>{job?.title || "position"}</strong>. Our recruitment team will review your profile and get back to you soon.
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2.5 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition"
                            >
                                Submit another application
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="mb-10">
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                                    {job?.title || "Application Form"}
                                </h1>
                                <p className="text-gray-500">
                                    {job?.description || "Join our team and help us build the future of autonomous talent architecture."}
                                </p>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-400" /> Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500/20 outline-none border-gray-200 text-sm"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-gray-400" /> Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500/20 outline-none border-gray-200 text-sm"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-gray-400" /> Phone Number
                                            </label>
                                            <input
                                                type="text"
                                                value={phone}
                                                onChange={e => setPhone(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500/20 outline-none border-gray-200 text-sm"
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                <Briefcase className="h-4 w-4 text-gray-400" /> Years of Experience
                                            </label>
                                            <input
                                                type="number"
                                                value={experienceYears}
                                                onChange={e => setExperienceYears(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500/20 outline-none border-gray-200 text-sm"
                                                placeholder="3"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <Linkedin className="h-4 w-4 text-gray-400" /> LinkedIn Profile
                                        </label>
                                        <input
                                            type="url"
                                            value={linkedin}
                                            onChange={e => setLinkedin(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500/20 outline-none border-gray-200 text-sm"
                                            placeholder="https://linkedin.com/in/johndoe"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-gray-400" /> Portfolio / Website
                                        </label>
                                        <input
                                            type="url"
                                            value={portfolio}
                                            onChange={e => setPortfolio(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500/20 outline-none border-gray-200 text-sm"
                                            placeholder="https://johndoe.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-gray-400" /> Resume / CV (PDF) *
                                        </label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-violet-500 transition cursor-pointer relative">
                                            <div className="space-y-1 text-center">
                                                <FileText className="mx-auto h-10 w-10 text-gray-400" />
                                                <div className="flex text-sm text-gray-600">
                                                    <span className="relative cursor-pointer rounded-md font-medium text-violet-600 hover:text-violet-500 focus-within:outline-none">
                                                        {resume ? resume.name : "Upload a file"}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500">PDF, DOCX up to 10MB</p>
                                            </div>
                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} accept=".pdf,.docx,.doc" />
                                        </div>
                                    </div>

                                    {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

                                    <button
                                        onClick={submit}
                                        disabled={submitting}
                                        className="w-full py-3 bg-violet-600 text-white rounded-lg font-bold shadow-lg shadow-violet-200 hover:bg-violet-700 disabled:bg-gray-400 transition flex items-center justify-center gap-2"
                                    >
                                        {submitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Submitting Application...</> : "Submit Application"}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <footer className="text-center py-6 text-sm text-gray-400 border-t border-gray-100 bg-white">
                © 2026 CHRO Command — Powered by Autonomous Talent Intelligence
            </footer>
        </div>
    );
}
