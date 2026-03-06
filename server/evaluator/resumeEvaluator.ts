import { AIService } from '../utils/ai.js';
import logger from '../utils/logger.js';

export class ResumeEvaluator {
  static async evaluateResume(jobDescription: string, resumeText: string, jobTitle: string, candidateName: string): Promise<string> {
    logger.info(`Evaluating resume for ${candidateName} against JD: ${jobTitle}`);

    const systemPrompt = `You are a panel of 7 senior hiring specialists reviewing a resume. Each specialist speaks in first person, using direct and professional language — like a real human reviewer, not an AI. Keep each agent's note under 2 sentences. Avoid generic phrases like "the candidate demonstrates" or "this individual showcases". Be honest, specific, and crisp.`;

    const prompt = `ROLE: ${jobTitle}
JOB REQUIREMENTS:
${jobDescription}

CANDIDATE: ${candidateName}
RESUME:
${resumeText}

---
Each agent below must review their specific domain and write a short 1-2 sentence note (max 30 words), followed by a score out of 100. Sound like a real recruiter giving a quick verbal opinion. Do NOT use passive voice or AI-sounding phrasing.

AGENT WEIGHTS:
- Skill Match (30%), Experience (20%), Education (10%), Resume Quality (10%), Soft Skills (10%), Risk (10%), Culture Fit (10%)

CALCULATE: Final Score = weighted average. Then decide: Strong Hire (85+), Hire (70-84), Hold (55-69), Reject (<55)

RETURN THIS EXACT FORMAT:

================================================
CANDIDATE EVALUATION REPORT
================================================
Role: ${jobTitle}
Candidate: ${candidateName}

------------------------------------------------
AGENT VERDICTS
------------------------------------------------

[Skill Match Agent — 30%]
Score: XX/100
Verdict: <1-2 sentences — specific skills found or missing vs job requirements>

[Experience Agent — 20%]
Score: XX/100
Verdict: <1-2 sentences — years, domain fit, project scale>

[Education Agent — 10%]
Score: XX/100
Verdict: <1-2 sentences — degree relevance, any certifications>

[Resume Quality Agent — 10%]
Score: XX/100
Verdict: <1-2 sentences — structure, clarity, keyword presence>

[Soft Skills Agent — 10%]
Score: XX/100
Verdict: <1-2 sentences — leadership, communication, teamwork signals>

[Risk Agent — 10%]
Score: XX/100
Verdict: <1-2 sentences — gaps, short tenures, inconsistencies>

[Culture Fit Agent — 10%]
Score: XX/100
Verdict: <1-2 sentences — mindset, adaptability, role alignment>

------------------------------------------------
KEY STRENGTHS
------------------------------------------------
• <Strength 1 — specific, factual>
• <Strength 2>
• <Strength 3>

------------------------------------------------
GAPS & CONCERNS
------------------------------------------------
• <Gap 1 — specific skill or experience missing>
• <Gap 2>

------------------------------------------------
FINAL SCORE
------------------------------------------------
XX / 100  →  <Confidence Level>

------------------------------------------------
HIRING DECISION
------------------------------------------------
Decision: [<Strong Hire / Hire / Hold / Reject>]

Justification: <2 crisp sentences max — tell HR exactly why this candidate is or isn't right for the role right now>

------------------------------------------------
IMPROVEMENT SUGGESTIONS
------------------------------------------------
• <Actionable tip 1>
• <Actionable tip 2>
================================================`;

    try {
      const response = await AIService.callLLM(prompt, systemPrompt);
      return response;
    } catch (error: any) {
      logger.error(`Resume evaluation failed: ${error.message}`);
      throw new Error(`Failed to generate resume evaluation: ${error.message}`);
    }
  }
}
