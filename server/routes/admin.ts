import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/index.js';
import { authMiddleware, generateToken } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import { EmailService } from '../email/emailService.js';
import { FileParser } from '../parser/fileParser.js';
import { InformationExtractor } from '../extractor/informationExtractor.js';
import { CsvWriter } from '../utils/csvWriter.js';
import { EvaluationEngine } from '../evaluator/index.js';
import { config } from '../config/index.js';
import type { Candidate } from '../types/index.js';
import logger from '../utils/logger.js';
import fs from 'fs-extra';
import path from 'path';

const router = Router();

/**
 * Helper to perform invitations for a specific hackathon.
 * Only invites candidates who haven't been invited to this hackathon yet.
 */
async function performInvitations(
    hackathonId: string,
    req: any,
    mode: string = 'ALL',
    smtpConfig?: { user: string; pass: string }
) {
    const db = getDatabase();
    const hackathon = db.prepare('SELECT * FROM hackathons WHERE id = ?').get(hackathonId) as any;
    if (!hackathon) throw new Error('Hackathon not found');

    // Get candidates NOT yet invited to THIS hackathon
    // Filter by shortlisted status if mode === 'SHORTLISTED'
    let query = `
        SELECT DISTINCT c.email, c.name 
        FROM candidates c
        LEFT JOIN invitations i ON c.email = i.candidate_email AND i.hackathon_id = ?
        WHERE c.email != ? AND i.id IS NULL
    `;

    if (mode === 'SHORTLISTED') {
        query += ` AND c.status = 'shortlisted'`;
    }

    const candidates = db.prepare(query).all(hackathonId, 'N/A') as Array<{ email: string; name: string }>;

    if (candidates.length === 0) {
        return { sent: 0, failed: 0, total: 0, message: 'No new candidates to invite for the selected mode.', error: undefined };
    }

    const emailService = new EmailService(smtpConfig);

    // Verify SMTP config
    const smtpOk = await emailService.verifyConnection();
    if (!smtpOk) {
        throw new Error('SMTP connection failed. Check your App Password and Email ID, or ensure Port 587 is unblocked.');
    }

    // Robust URL detection for local development
    let baseUrl = config.appUrl;
    const host = req.get('host') || '';
    if (!baseUrl || baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1') || !baseUrl.startsWith('http')) {
        const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
        baseUrl = `${protocol}://${host || 'localhost:3000'}`;
    }
    const submissionUrl = `${baseUrl.replace(/\/$/, '')}/submit?hackathon=${hackathonId}`;

    const result = await emailService.sendInvitations(candidates, {
        hackathonTitle: hackathon.title,
        hackathonDescription: hackathon.description,
        deadline: hackathon.deadline,
        submissionUrl,
        candidateName: '',
    });

    // Record invitations in database
    for (const candidate of candidates) {
        db.prepare(`
            INSERT OR IGNORE INTO invitations (id, hackathon_id, candidate_email, candidate_name, sent_at, status)
            VALUES (?, ?, ?, ?, datetime('now'), 'sent')
        `).run(uuidv4(), hackathonId, candidate.email, candidate.name);
    }

    return result;
}

// ─── Login ────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ success: false, error: 'Username and password required' });
            return;
        }

        const db = getDatabase();
        const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username) as any;

        if (!user || !bcrypt.compareSync(password, user.password_hash)) {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
            return;
        }

        const token = generateToken({ id: user.id, username: user.username, role: user.role });
        res.cookie('auth_token', token, { httpOnly: true, maxAge: 86400000 });
        res.json({ success: true, data: { token, user: { id: user.id, username: user.username, role: user.role } } });
    } catch (error: any) {
        logger.error(`Login error: ${error.message}`);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

router.post('/logout', (_req, res) => {
    res.clearCookie('auth_token');
    res.json({ success: true, message: 'Logged out' });
});

// ─── Resume File Management ───────────────────────────────────
router.get('/resume-files', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const resumesDir = path.resolve(config.resumesDir);
        await fs.ensureDir(resumesDir);

        async function getFiles(dir: string): Promise<string[]> {
            const dirents = await fs.readdir(dir, { withFileTypes: true });
            const files = await Promise.all(dirents.map((dirent) => {
                const res = path.resolve(dir, dirent.name);
                return dirent.isDirectory() ? getFiles(res) : res;
            }));
            return Array.prototype.concat(...files);
        }

        const allFiles = await getFiles(resumesDir);
        const resumeFiles = allFiles.map(f => path.relative(resumesDir, f));

        res.json({ success: true, data: resumeFiles });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/upload-resume', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { filename, content } = req.body;
        if (!filename || !content) {
            res.status(400).json({ success: false, error: 'Filename and content are required' });
            return;
        }

        const resumesDir = path.resolve(config.resumesDir);
        const filePath = path.join(resumesDir, filename);

        logger.info(`Incoming upload: ${filename} (approx ${Math.round(content.length * 0.75 / 1024)} KB)`);

        // Ensure subdirectories exist if filename contains a path
        await fs.ensureDir(path.dirname(filePath));

        const buffer = Buffer.from(content, 'base64');
        await fs.writeFile(filePath, buffer);
        logger.info(`File uploaded: ${filename}`);

        res.json({ success: true, message: 'File uploaded successfully' });
    } catch (error: any) {
        logger.error(`Upload error: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/resume-file', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const filename = String(req.query['filename'] || '');
        if (!filename) {
            res.status(400).json({ success: false, error: 'Filename is required' });
            return;
        }
        const resumesDir = path.resolve(config.resumesDir);
        const filePath = path.join(resumesDir, filename);

        if (await fs.pathExists(filePath)) {
            await fs.remove(filePath);
            res.json({ success: true, message: 'File deleted' });
        } else {
            res.status(404).json({ success: false, error: 'File not found' });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─── Resume Scanning ──────────────────────────────────────────
router.post('/scan-resumes', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const resumesDir = path.resolve(config.resumesDir);
        if (!await fs.pathExists(resumesDir)) {
            res.status(404).json({ success: false, error: 'Resumes directory not found' });
            return;
        }

        // Recursive file finding
        async function getFiles(dir: string): Promise<string[]> {
            const dirents = await fs.readdir(dir, { withFileTypes: true });
            const files = await Promise.all(dirents.map((dirent) => {
                const res = path.resolve(dir, dirent.name);
                return dirent.isDirectory() ? getFiles(res) : res;
            }));
            return Array.prototype.concat(...files);
        }

        const allFiles = await getFiles(resumesDir);
        logger.info(`Scan Resumes triggered. Found ${allFiles.length} files total.`);
        const supportedExtensions = ['.pdf', '.docx', '.doc', '.txt'];
        const resumeFiles = allFiles.filter(f => supportedExtensions.includes(path.extname(f).toLowerCase()));

        if (resumeFiles.length === 0) {
            res.status(404).json({ success: false, error: 'No supported resume files found' });
            return;
        }

        const candidates: Candidate[] = [];
        const processedHashes = new Set<string>();
        const errors: string[] = [];
        const db = getDatabase();

        for (const filePath of resumeFiles) {
            const fileName = path.relative(resumesDir, filePath);
            try {
                const rawText = await FileParser.parseFile(filePath);
                const cleanedText = FileParser.cleanText(rawText);

                const contentSnippet = cleanedText.substring(0, 200);
                if (processedHashes.has(contentSnippet)) {
                    logger.warn(`Duplicate content detected: ${fileName}`);
                    continue;
                }
                processedHashes.add(contentSnippet);

                const candidate = await InformationExtractor.extract(cleanedText, fileName);
                logger.info(`Extracted candidate for ${fileName}: ${candidate.name} (${candidate.email})`);
                candidates.push(candidate);

                // Store in database
                db.prepare(`
          INSERT OR REPLACE INTO candidates (file_name, name, email, phone, skills, education, experience)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(fileName, candidate.name, candidate.email, candidate.phone,
                    candidate.skills.join(', '), candidate.education, candidate.experience);

            } catch (error: any) {
                errors.push(`${fileName}: ${error.message}`);
                logger.error(`Failed to process ${fileName}: ${error.message}`);
            }
        }

        // Write CSV
        if (candidates.length > 0) {
            await CsvWriter.write(candidates, config.csvOutput);
        }

        res.json({
            success: true,
            data: {
                totalFiles: resumeFiles.length,
                processed: candidates.length,
                duplicatesSkipped: resumeFiles.length - candidates.length - errors.length,
                errors: errors.length,
                errorDetails: errors,
                candidates: candidates.map(c => ({ name: c.name, email: c.email, phone: c.phone, experience: c.experience })),
            },
        });
    } catch (error: any) {
        logger.error(`Scan error: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─── Resume Evaluation (AI HR Agent) ──────────────────────────
router.post('/evaluate-resume', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { candidateEmail, hackathonId, jobTitle, jobDescription } = req.body;
        if (!candidateEmail) {
            res.status(400).json({ success: false, error: 'candidateEmail is required' });
            return;
        }

        const db = getDatabase();
        const candidate = db.prepare('SELECT * FROM candidates WHERE email = ?').get(candidateEmail) as any;
        if (!candidate) {
            res.status(404).json({ success: false, error: 'Candidate not found' });
            return;
        }

        let finalTitle = jobTitle;
        let finalDescription = jobDescription;

        if (hackathonId && (!jobTitle || !jobDescription)) {
            const hackathon = db.prepare('SELECT title, description FROM hackathons WHERE id = ?').get(hackathonId) as any;
            if (hackathon) {
                finalTitle = hackathon.title;
                finalDescription = hackathon.description;
            }
        }

        if (!finalTitle || !finalDescription) {
            res.status(400).json({ success: false, error: 'jobTitle and jobDescription (or valid hackathonId) are required' });
            return;
        }

        // Parse resume text
        const resumesDir = path.resolve(config.resumesDir);
        const filePath = path.join(resumesDir, candidate.file_name);

        let resumeText = '';
        if (await fs.pathExists(filePath)) {
            const rawText = await FileParser.parseFile(filePath);
            resumeText = FileParser.cleanText(rawText);
        } else {
            // Fallback to basic candidate info
            resumeText = `Name: ${candidate.name}\nEmail: ${candidate.email}\nSkills: ${candidate.skills}\nExperience: ${candidate.experience}\nEducation: ${candidate.education}`;
        }

        // Import dynamically to avoid circular dependencies if any
        const { ResumeEvaluator } = await import('../evaluator/resumeEvaluator.js');
        const report = await ResumeEvaluator.evaluateResume(finalDescription, resumeText, finalTitle, candidate.name);

        res.json({ success: true, data: { report } });

    } catch (error: any) {
        logger.error(`Resume Evaluation error: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/evaluate-all-resumes', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { hackathonId, jobTitle, jobDescription, filterByJob, filterByShortlisted } = req.body;

        const db = getDatabase();
        let query = 'SELECT * FROM candidates WHERE 1=1';
        let params: any[] = [];

        if (filterByJob && hackathonId) {
            query += ' AND job_id = ?';
            params.push(hackathonId);
        }

        if (filterByShortlisted) {
            query += " AND status = 'shortlisted'";
        }

        const candidates = db.prepare(query).all(...params) as any[];

        if (!candidates || candidates.length === 0) {
            res.status(404).json({ success: false, error: 'No candidates found for the selected criteria' });
            return;
        }

        let finalTitle = jobTitle;
        let finalDescription = jobDescription;

        if (hackathonId && (!jobTitle || !jobDescription)) {
            const hackathon = db.prepare('SELECT title, description FROM hackathons WHERE id = ?').get(hackathonId) as any;
            if (hackathon) {
                finalTitle = hackathon.title;
                finalDescription = hackathon.description;
            }
        }

        if (!finalTitle || !finalDescription) {
            res.status(400).json({ success: false, error: 'jobTitle and jobDescription (or valid hackathonId) are required' });
            return;
        }

        const resumesDir = path.resolve(config.resumesDir);
        const { ResumeEvaluator } = await import('../evaluator/resumeEvaluator.js');

        const results = [];

        for (const candidate of candidates) {
            try {
                const filePath = path.join(resumesDir, candidate.file_name);
                let resumeText = '';
                if (await fs.pathExists(filePath)) {
                    const rawText = await FileParser.parseFile(filePath);
                    resumeText = FileParser.cleanText(rawText);
                } else {
                    resumeText = `Name: ${candidate.name}\nEmail: ${candidate.email}\nSkills: ${candidate.skills}\nExperience: ${candidate.experience}\nEducation: ${candidate.education}`;
                }

                const report = await ResumeEvaluator.evaluateResume(finalDescription, resumeText, finalTitle, candidate.name);

                // Robust extraction with multiple fallbacks
                let confidenceScore: string = '0';
                let decision: string = 'Hold';
                let reasoning: string = 'No justification provided.';

                // 1. Try label-based score
                const scoreMatch = report.match(/(?:FINAL SCORE|Overall Score|Total Score)[\s\S]*?(\d+)(?:\s*\/\s*100)?/i);
                if (scoreMatch && scoreMatch[1]) {
                    confidenceScore = scoreMatch[1];
                } else {
                    // Fallback: search for any XX/100
                    const anyScore = report.match(/(\d+)\s*\/\s*100/);
                    if (anyScore && anyScore[1]) {
                        confidenceScore = anyScore[1];
                    }
                }

                // 2. Try label-based decision
                const decisionMatch = report.match(/(?:HIRING DECISION|Decision|Verdict):?\s*\[?(\w[\w ]+)\]?/i);
                if (decisionMatch && decisionMatch[1]) {
                    const d = decisionMatch[1].trim();
                    if (/Strong Hire/i.test(d)) decision = 'Strong Hire';
                    else if (/Hire/i.test(d)) decision = 'Hire';
                    else if (/Hold/i.test(d)) decision = 'Hold';
                    else if (/Reject/i.test(d)) decision = 'Reject';
                    else decision = d.length > 20 ? d.substring(0, 20) : d;
                } else {
                    // Fallback search in the whole text if label missing
                    if (/Strong Hire/i.test(report)) decision = 'Strong Hire';
                    else if (/Reject/i.test(report)) decision = 'Reject';
                    else if (/Strong Hire/i.test(report)) decision = 'Strong Hire';
                    else if (/Hire/i.test(report)) decision = 'Hire';
                    else if (/Hold/i.test(report)) decision = 'Hold';
                }

                // 3. Justification
                const justMatch = report.match(/(?:Justification|Verdict|Reasoning):\s*(.+?)(?=\n-{3,}|\n={3,}|\n\n|$)/is);
                if (justMatch?.[1]) reasoning = justMatch[1].trim().replace(/\n/g, ' ').substring(0, 300);

                // Build a crisp agent-verdict summary from the 7 agents
                const agentSummary: string[] = [];
                const agentPattern = /\[(\w[\w &]+Agent[^\]]*)\][^\n]*\nScore: \d+\/100\nVerdict:\s*(.+?)(?=\n\n|\[|\n-{3,})/gis;
                let m: RegExpExecArray | null;
                while ((m = agentPattern.exec(report)) !== null) {
                    const agentName = m[1]?.trim();
                    const verdict = m[2]?.trim().replace(/\n/g, ' ').substring(0, 80);
                    if (agentName && verdict) agentSummary.push(`[${agentName}] ${verdict}`);
                }

                results.push({
                    candidateName: candidate.name,
                    candidateEmail: candidate.email,
                    confidenceScore,
                    decision,
                    reasoning,
                    agentSummary,
                    fullReport: report
                });
            } catch (err: any) {
                logger.error(`Failed to evaluate ${candidate.email}: ${err.message}`);
                results.push({
                    candidateName: candidate.name,
                    candidateEmail: candidate.email,
                    error: err.message
                });
            }
        }

        res.json({ success: true, data: { results } });
    } catch (error: any) {
        logger.error(`Batch Resume Evaluation error: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─── Hackathon Management ─────────────────────────────────────
router.post('/hackathons', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { title, description, deadline, type, department, employment_type, experience_required, skills_required, location, salary_range, hiring_manager } = req.body;
        if (!title || !deadline) {
            res.status(400).json({ success: false, error: 'Title and deadline are required' });
            return;
        }

        const id = uuidv4();
        const db = getDatabase();
        db.prepare(`
      INSERT INTO hackathons(id, title, description, deadline, created_by, type, department, employment_type, experience_required, skills_required, location, salary_range, hiring_manager) 
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
            id,
            title,
            description || '',
            deadline,
            req.user?.id || 'system',
            type || 'hackathon',
            department || 'Engineering',
            employment_type || 'Full-time',
            experience_required || '',
            JSON.stringify(skills_required || []),
            location || 'Remote',
            salary_range || '',
            hiring_manager || ''
        );

        logger.info(`${type === 'job' ? 'Job' : 'Hackathon'} created: ${title}(${id})`);
        res.json({ success: true, data: { id, title, description, deadline, status: 'active', type: type || 'hackathon' } });
    } catch (error: any) {
        logger.error(`Hackathon creation error: ${error.message} `);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/hackathons', authMiddleware, async (req, res) => {
    try {
        const type = req.query['type'];
        const db = getDatabase();
        let hackathons;
        if (type) {
            hackathons = db.prepare('SELECT * FROM hackathons WHERE type = ? ORDER BY created_at DESC').all(type);
        } else {
            hackathons = db.prepare('SELECT * FROM hackathons ORDER BY created_at DESC').all();
        }
        res.json({ success: true, data: hackathons });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/hackathons/:id', authMiddleware, async (req, res) => {
    try {
        const db = getDatabase();
        const hackathon = db.prepare('SELECT * FROM hackathons WHERE id = ?').get(String(req.params['id']));
        if (!hackathon) { res.status(404).json({ success: false, error: 'Hackathon not found' }); return; }
        res.json({ success: true, data: hackathon });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─── Send Invitations ─────────────────────────────────────────
router.post('/hackathons/:id/send-invitations', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const hackathonId = String(req.params['id']);
        const { mode, smtpConfig } = req.body || {};
        const result = await performInvitations(hackathonId, req, mode || 'ALL', smtpConfig);

        if (result.sent === 0 && result.failed > 0) {
            res.json({ success: false, error: `All ${result.failed} emails failed. Error: ${result.error || 'Unknown SMTP error. Check credentials or server logs.'} ` });
        } else {
            res.json({ success: true, data: result });
        }
    } catch (error: any) {
        logger.error(`Invitation error: ${error.message} `);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─── Test SMTP ─────────────────────────────────────────────────
router.get('/test-smtp', async (_req, res) => {
    try {
        const emailService = new EmailService();
        const ok = await emailService.verifyConnection();
        if (ok) {
            res.json({ success: true, message: 'Email provider ready.' });
        } else {
            res.json({ success: false, error: `SMTP connection failed.Config: host = ${config.smtp.host}, port = ${config.smtp.port}, user = ${config.smtp.user} ` });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─── Invitation Preview (manual fallback) ──────────────────────
router.get('/hackathons/:id/invitation-preview', authMiddleware, async (req, res) => {
    try {
        const hackathonId = String(req.params['id']);
        const db = getDatabase();
        const hackathon = db.prepare('SELECT * FROM hackathons WHERE id = ?').get(hackathonId) as any;
        if (!hackathon) { res.status(404).json({ success: false, error: 'Hackathon not found' }); return; }

        const candidates = db.prepare('SELECT DISTINCT email, name FROM candidates WHERE email != ?').all('N/A') as Array<{ email: string; name: string }>;

        // Robust URL detection for production
        let baseUrl = config.appUrl;
        const host = req.get('host') || '';
        if (!baseUrl || baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1') || !baseUrl.startsWith('http')) {
            const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
            baseUrl = `${protocol}://${host || 'vanguard-ai.railway.app'}`;
        }
        const submissionUrl = `${baseUrl.replace(/\/$/, '')}/submit?hackathon=${hackathonId}`;
        const emailBody = `Hi [Candidate Name],\n\nYou are invited to participate in: ${hackathon.title}\n\n${hackathon.description ? hackathon.description + '\n\n' : ''}Deadline: ${new Date(hackathon.deadline).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}\n\nSubmit your project here:\n${submissionUrl}\n\nGood luck!\n— Vanguard HR Team`;

        res.json({ success: true, data: { hackathonTitle: hackathon.title, candidates, emailBody, submissionUrl } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─── Submissions & Evaluations ────────────────────────────────
router.get('/hackathons/:id/submissions', authMiddleware, async (req, res) => {
    try {
        const db = getDatabase();
        const submissions = db.prepare(`
      SELECT s.*, 
             e.overall_score, 
             e.rank,
             e.code_quality_score,
             e.readme_clarity_score,
             e.project_structure_score,
             e.innovation_score,
             e.technical_score,
             e.feedback_json,
             e.ai_recommendation
      FROM submissions s 
      LEFT JOIN evaluations e ON s.evaluation_id = e.id
      WHERE s.hackathon_id = ?
      ORDER BY e.overall_score DESC NULLS LAST
    `).all(String(req.params['id']));
        res.json({ success: true, data: submissions });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/hackathons/:id/evaluate-all', authMiddleware, async (req, res) => {
    try {
        const hackathonId = String(req.params['id'] || '');
        const db = getDatabase();
        const submissions = db.prepare(`
      SELECT * FROM submissions WHERE hackathon_id = ? AND status = 'pending'
    `).all(hackathonId) as Array<{ id: string; github_repo_url: string; candidate_email: string }>;

        if (submissions.length === 0) {
            res.json({ success: true, message: 'No pending submissions to evaluate' });
            return;
        }

        const results = [];
        for (const sub of submissions) {
            try {
                db.prepare(`UPDATE submissions SET status = 'evaluating' WHERE id = ?`).run(sub.id);
                const report = await EvaluationEngine.evaluate(sub.id, sub.github_repo_url, hackathonId, sub.candidate_email);
                results.push({ email: sub.candidate_email, score: report.overallScore, status: 'evaluated' });
            } catch (error: any) {
                db.prepare(`UPDATE submissions SET status = 'error' WHERE id = ?`).run(sub.id);
                results.push({ email: sub.candidate_email, status: 'error', error: error.message });
                logger.error(`Evaluation failed for ${sub.candidate_email}: ${error.message}`);
            }
        }

        EvaluationEngine.updateRankings(hackathonId);
        res.json({ success: true, data: { evaluated: results.filter(r => r.status === 'evaluated').length, errors: results.filter(r => r.status === 'error').length, results } });
    } catch (error: any) {
        logger.error(`Evaluation error: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─── Rankings / Leaderboard ───────────────────────────────────
router.get('/hackathons/:id/rankings', authMiddleware, async (req, res) => {
    try {
        const db = getDatabase();
        const rankings = db.prepare(`
      SELECT e.*, s.github_repo_url, s.candidate_name
      FROM evaluations e
      JOIN submissions s ON e.submission_id = s.id
      WHERE e.hackathon_id = ?
      ORDER BY e.overall_score DESC
    `).all(String(req.params['id']));
        res.json({ success: true, data: rankings });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─── Regenerate Recommendations (for existing evals) ──────────
router.post('/hackathons/:id/regenerate-recommendations', authMiddleware, async (req, res) => {
    try {
        const hackathonId = String(req.params['id']);
        const updated = EvaluationEngine.regenerateRecommendations(hackathonId);
        res.json({ success: true, data: { updated }, message: `Regenerated recommendations for ${updated} evaluations` });
    } catch (error: any) {
        logger.error(`Regenerate error: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─── Re-evaluate a specific submission (with alignment) ───────
router.post('/evaluations/:id/re-evaluate', authMiddleware, async (req, res) => {
    try {
        const evalId = String(req.params['id']);
        const db = getDatabase();

        // Get the old evaluation to find the submission
        const oldEval = db.prepare(`
      SELECT e.submission_id, s.github_repo_url, e.hackathon_id, e.candidate_email
      FROM evaluations e JOIN submissions s ON e.submission_id = s.id
      WHERE e.id = ?
    `).get(evalId) as any;

        if (!oldEval) {
            res.status(404).json({ success: false, error: 'Evaluation not found' });
            return;
        }

        // Delete old evaluation
        db.prepare('DELETE FROM evaluations WHERE id = ?').run(evalId);
        db.prepare(`UPDATE submissions SET status = 'pending', evaluation_id = NULL WHERE id = ?`).run(oldEval.submission_id);

        // Re-run evaluation with alignment check
        const report = await EvaluationEngine.evaluate(
            oldEval.submission_id, oldEval.github_repo_url,
            oldEval.hackathon_id, oldEval.candidate_email
        );
        EvaluationEngine.updateRankings(oldEval.hackathon_id);

        res.json({ success: true, message: 'Re-evaluation complete', data: { newEvalId: report.id, score: report.overallScore } });
    } catch (error: any) {
        logger.error(`Re-evaluation error: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─── Candidates ───────────────────────────────────────────────
router.get('/candidates', authMiddleware, async (_req, res) => {
    try {
        const db = getDatabase();
        const candidates = db.prepare(`
            SELECT c.*, h.title as job_title 
            FROM candidates c
            LEFT JOIN hackathons h ON c.job_id = h.id
            ORDER BY c.extracted_at DESC
        `).all();
        res.json({ success: true, data: candidates });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/candidates/status', authMiddleware, async (req, res) => {
    try {
        const { emails, status } = req.body;
        if (!emails || !Array.isArray(emails)) {
            res.status(400).json({ success: false, error: 'emails array required' });
            return;
        }
        if (!status) {
            res.status(400).json({ success: false, error: 'status is required' });
            return;
        }

        const db = getDatabase();
        const stmt = db.prepare(`UPDATE candidates SET status = ? WHERE email = ?`);

        let updateCount = 0;
        const transaction = db.transaction((emailsArray, statusValue) => {
            for (const email of emailsArray) {
                const info = stmt.run(statusValue, email);
                updateCount += info.changes;
            }
        });
        transaction(emails, status);

        res.json({ success: true, data: { updated: updateCount } });
    } catch (error: any) {
        logger.error(`Status update error: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─── Evaluation Detail (for HR review) ────────────────────────
router.get('/evaluations/:id', authMiddleware, async (req, res) => {
    try {
        const db = getDatabase();
        const evaluation = db.prepare(`
      SELECT e.*, s.github_repo_url, s.candidate_name, s.candidate_email, s.submitted_at
      FROM evaluations e
      JOIN submissions s ON e.submission_id = s.id
      WHERE e.id = ?
    `).get(String(req.params['id'])) as any;

        if (!evaluation) {
            res.status(404).json({ success: false, error: 'Evaluation not found' });
            return;
        }

        // Parse feedback JSON
        try {
            evaluation.feedback = JSON.parse(evaluation.feedback_json || '{}');
        } catch { evaluation.feedback = {}; }

        res.json({ success: true, data: evaluation });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─── Approve / Reject Candidate ───────────────────────────────
router.post('/evaluations/:id/approve', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const evalId = String(req.params['id']);
        const { action, notes } = req.body;

        if (!action || !['approved', 'rejected'].includes(action)) {
            res.status(400).json({ success: false, error: 'Action must be "approved" or "rejected"' });
            return;
        }

        const db = getDatabase();
        const evaluation = db.prepare('SELECT id FROM evaluations WHERE id = ?').get(evalId);
        if (!evaluation) {
            res.status(404).json({ success: false, error: 'Evaluation not found' });
            return;
        }

        db.prepare(`
      UPDATE evaluations 
      SET approval_status = ?, hr_notes = ?, approved_by = ?, approved_at = datetime('now')
      WHERE id = ?
    `).run(action, notes || '', req.user?.username || 'admin', evalId);

        logger.info(`Evaluation ${evalId} ${action} by ${req.user?.username}`);
        res.json({ success: true, message: `Candidate ${action} successfully`, data: { id: evalId, approval_status: action } });
    } catch (error: any) {
        logger.error(`Approval error: ${error.message}`);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Overview stats (derived from candidates + hackathons)
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const db = getDatabase();
        const candidates = db.prepare('SELECT status, ai_match_score FROM candidates').all() as any[];
        const hackathons = db.prepare('SELECT type FROM hackathons').all() as any[];
        const interviews = db.prepare('SELECT id FROM interviews').all() as any[];
        const offers = db.prepare('SELECT status FROM offers').all() as any[];

        res.json({
            success: true,
            data: {
                totalApplicants: candidates.length,
                aiScreened: candidates.filter(c => c.ai_match_score > 0).length,
                shortlisted: candidates.filter(c => c.status === 'shortlisted').length,
                hackathonParticipants: (db.prepare('SELECT COUNT(DISTINCT candidate_email) as count FROM submissions').get() as any).count,
                interviewCandidates: interviews.length,
                offersSent: offers.length,
                hires: offers.filter(o => o.status === 'accepted').length,
                totalJobs: hackathons.filter(h => h.type === 'job').length,
                totalHackathons: hackathons.filter(h => h.type === 'hackathon').length
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Interview Management
router.get('/interviews', authMiddleware, async (req, res) => {
    const db = getDatabase();
    const data = db.prepare(`
            SELECT i.*, c.name as candidate_name, j.title as job_title 
            FROM interviews i
            JOIN candidates c ON i.candidate_id = c.id
            JOIN hackathons j ON i.job_id = j.id
            ORDER BY i.scheduled_at ASC
        `).all();
    res.json({ success: true, data });
});

router.post('/interviews', authMiddleware, async (req, res) => {
    try {
        const { candidate_id, job_id, round_name, scheduled_at, notes, smtpConfig } = req.body;
        const id = uuidv4();
        const db = getDatabase();
        db.prepare(`
                INSERT INTO interviews (id, candidate_id, job_id, round_name, scheduled_at, notes)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(id, candidate_id, job_id, round_name, scheduled_at, notes || '');

        // Send interview confirmation email (fire-and-forget, don't block response)
        try {
            const candidate = db.prepare('SELECT * FROM candidates WHERE id = ?').get(candidate_id) as any;
            const job = db.prepare('SELECT * FROM hackathons WHERE id = ?').get(job_id) as any;
            if (candidate?.email && job?.title) {
                const emailService = new EmailService(smtpConfig);
                await emailService.sendInterviewConfirmation(candidate.email, {
                    candidateName: candidate.name,
                    jobTitle: job.title,
                    roundName: round_name,
                    scheduledAt: scheduled_at,
                    notes: notes || '',
                });
                logger.info(`Interview confirmation sent to ${candidate.email}`);
            }
        } catch (emailErr: any) {
            logger.warn(`Interview email failed (non-critical): ${emailErr.message}`);
        }

        res.json({ success: true, data: { id } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.put('/interviews/:id/status', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;
        const db = getDatabase();
        db.prepare('UPDATE interviews SET status = ? WHERE id = ?').run(status, id);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.put('/interviews/:id/notes', authMiddleware, async (req, res) => {
    try {
        const { notes } = req.body;
        const { id } = req.params;
        const db = getDatabase();
        db.prepare('UPDATE interviews SET notes = ? WHERE id = ?').run(notes, id);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Offer Management
router.get('/offers', authMiddleware, async (req, res) => {
    const db = getDatabase();
    const data = db.prepare(`
            SELECT o.*, c.name as candidate_name, j.title as job_title 
            FROM offers o
            JOIN candidates c ON o.candidate_id = c.id
            JOIN hackathons j ON o.job_id = j.id
            ORDER BY o.created_at DESC
        `).all();
    res.json({ success: true, data });
});

router.post('/offers', authMiddleware, async (req, res) => {
    try {
        const { candidate_id, job_id, salary, joining_date, manager, smtpConfig } = req.body;
        const id = uuidv4();
        const db = getDatabase();
        db.prepare(`
                INSERT INTO offers (id, candidate_id, job_id, salary, joining_date, manager)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(id, candidate_id, job_id, salary, joining_date, manager || '');

        // Update candidate status to 'offered'
        db.prepare("UPDATE candidates SET status = 'offered' WHERE id = ?").run(candidate_id);

        // Send offer letter email
        try {
            const candidate = db.prepare('SELECT * FROM candidates WHERE id = ?').get(candidate_id) as any;
            const job = db.prepare('SELECT * FROM hackathons WHERE id = ?').get(job_id) as any;
            if (candidate?.email && job?.title) {
                const emailService = new EmailService(smtpConfig);
                await emailService.sendOfferLetter(candidate.email, {
                    candidateName: candidate.name,
                    jobTitle: job.title,
                    salary: salary || 'As discussed',
                    joiningDate: joining_date,
                    manager: manager,
                });
                logger.info(`Offer letter sent to ${candidate.email}`);
            }
        } catch (emailErr: any) {
            logger.warn(`Offer email failed (non-critical): ${emailErr.message}`);
        }

        res.json({ success: true, data: { id } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/offers/:id/send', authMiddleware, async (req, res) => {
    try {
        const { smtpConfig } = req.body;
        const { id } = req.params;
        const db = getDatabase();
        const offer = db.prepare(`
            SELECT o.*, c.name as candidate_name, c.email as candidate_email, j.title as job_title
            FROM offers o
            JOIN candidates c ON o.candidate_id = c.id
            JOIN hackathons j ON o.job_id = j.id
            WHERE o.id = ?
        `).get(id) as any;

        if (!offer) { res.status(404).json({ success: false, error: 'Offer not found' }); return; }

        const emailService = new EmailService(smtpConfig);
        await emailService.sendOfferLetter(offer.candidate_email, {
            candidateName: offer.candidate_name,
            jobTitle: offer.job_title,
            salary: offer.salary || 'As discussed',
            joiningDate: offer.joining_date,
            manager: offer.manager,
        });
        res.json({ success: true, message: `Offer letter re-sent to ${offer.candidate_email}` });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/offers/:id/status', authMiddleware, async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    const db = getDatabase();
    db.prepare('UPDATE offers SET status = ? WHERE id = ?').run(status, id);
    res.json({ success: true });
});

export default router;
