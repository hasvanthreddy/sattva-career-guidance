import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  RecommendCareersBody,
  SimulateCareerBody,
  SurvivalAnalysisBody,
  AnalyzeSkillGapBody,
  GetJobRolesBody,
  GetDailyPlanBody,
  ExplainCareerBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

const CAREER_SYSTEM_PROMPT = `You are an expert AI career mentor helping students and professionals in India make smart career decisions. Always respond in JSON format as instructed. Be specific, realistic, and encouraging. Include Indian context where relevant (salary in INR/LPA, Indian companies, etc.).`;

async function askAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 4096,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });
  return response.choices[0]?.message?.content ?? "{}";
}

function parseJSON(text: string): unknown {
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

router.post("/recommend", async (req, res): Promise<void> => {
  const parsed = RecommendCareersBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { interests, skills, skillLevel, goals, workLifePreference, field } = parsed.data;

  const prompt = `Based on this user profile, suggest 3 career paths (safe, balanced, dream):
Interests: ${interests}
Current Skills: ${skills}
Skill Level: ${skillLevel || "Beginner"}
Career Goals: ${goals}
Work-Life Preference: ${workLifePreference || "balanced"}
Field: ${field || "any"}

Respond ONLY with this JSON (no markdown, no extra text):
{
  "safeCareer": {
    "name": "...",
    "type": "safe",
    "matchPercent": 85,
    "salary": "6-10 LPA",
    "demand": "High",
    "whySuitable": "Brief explanation..."
  },
  "balancedCareer": {
    "name": "...",
    "type": "balanced",
    "matchPercent": 78,
    "salary": "8-15 LPA",
    "demand": "Medium",
    "whySuitable": "Brief explanation..."
  },
  "dreamCareer": {
    "name": "...",
    "type": "dream",
    "matchPercent": 65,
    "salary": "15-30 LPA",
    "demand": "Growing",
    "whySuitable": "Brief explanation..."
  }
}`;

  const text = await askAI(CAREER_SYSTEM_PROMPT, prompt);
  const data = parseJSON(text);
  res.json(data);
});

router.post("/simulate", async (req, res): Promise<void> => {
  const parsed = SimulateCareerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { career, userProfile } = parsed.data;

  const prompt = `Create a career simulation for: ${career}
User Profile: ${userProfile || "general student"}

Respond ONLY with this JSON:
{
  "dayInLife": "Detailed paragraph about a typical day in this career (morning to evening, tasks, meetings, challenges)...",
  "salaryGrowth": "Salary progression: Year 1: X LPA, Year 3: X LPA, Year 5: X LPA, Year 10: X LPA. Include growth factors.",
  "realityCheck": "Honest paragraph about the challenges, downsides, competition, work pressure, and what people don't tell you about this career..."
}`;

  const text = await askAI(CAREER_SYSTEM_PROMPT, prompt);
  const data = parseJSON(text);
  res.json(data);
});

router.post("/survival", async (req, res): Promise<void> => {
  const parsed = SurvivalAnalysisBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { career, lifestyle, stressLevel, workHoursPreference } = parsed.data;

  const prompt = `Analyze survival fitness for career: ${career}
Lifestyle: ${lifestyle || "balanced"}
Stress Tolerance: ${stressLevel || "medium"}
Work Hours Preference: ${workHoursPreference || "8-9 hours"}

Respond ONLY with this JSON:
{
  "survivalScore": 72,
  "lifestyleMatch": "How well this career fits their lifestyle preference...",
  "stressCompatibility": "Assessment of stress levels in this career vs their tolerance...",
  "workHoursAnalysis": "Typical work hours in this career and how it matches their preference...",
  "feedback": "Overall honest feedback about whether this person will thrive or struggle in this career...",
  "alternatives": ["Alternative Career 1", "Alternative Career 2", "Alternative Career 3"]
}`;

  const text = await askAI(CAREER_SYSTEM_PROMPT, prompt);
  const data = parseJSON(text);
  res.json(data);
});

router.post("/skill-gap", async (req, res): Promise<void> => {
  const parsed = AnalyzeSkillGapBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { career, currentSkills } = parsed.data;

  const prompt = `Analyze skill gap for career: ${career}
Current Skills: ${currentSkills}

Respond ONLY with this JSON:
{
  "skills": [
    {"name": "Skill Name", "have": true, "importance": "Critical"},
    {"name": "Skill Name", "have": false, "importance": "High"},
    {"name": "Skill Name", "have": true, "importance": "Medium"},
    {"name": "Skill Name", "have": false, "importance": "Critical"},
    {"name": "Skill Name", "have": false, "importance": "High"}
  ],
  "progressPercent": 45,
  "summary": "Summary of skill readiness and what to focus on first..."
}
Include 8-12 relevant skills. importance must be one of: Critical, High, Medium, Nice-to-have`;

  const text = await askAI(CAREER_SYSTEM_PROMPT, prompt);
  const data = parseJSON(text);
  res.json(data);
});

router.post("/job-roles", async (req, res): Promise<void> => {
  const parsed = GetJobRolesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { career } = parsed.data;

  const prompt = `List job roles progression for career: ${career}

Respond ONLY with this JSON:
{
  "roles": [
    {
      "level": "Intern",
      "title": "Specific Job Title",
      "salary": "3-5 LPA",
      "description": "What this role does...",
      "requirements": "Key requirements..."
    },
    {
      "level": "Junior",
      "title": "Specific Job Title",
      "salary": "5-8 LPA",
      "description": "What this role does...",
      "requirements": "Key requirements..."
    },
    {
      "level": "Mid-level",
      "title": "Specific Job Title",
      "salary": "8-15 LPA",
      "description": "What this role does...",
      "requirements": "Key requirements..."
    },
    {
      "level": "Senior",
      "title": "Specific Job Title",
      "salary": "15-30 LPA",
      "description": "What this role does...",
      "requirements": "Key requirements..."
    },
    {
      "level": "Lead/Manager",
      "title": "Specific Job Title",
      "salary": "25-50+ LPA",
      "description": "What this role does...",
      "requirements": "Key requirements..."
    }
  ]
}`;

  const text = await askAI(CAREER_SYSTEM_PROMPT, prompt);
  const data = parseJSON(text);
  res.json(data);
});

router.post("/daily-plan", async (req, res): Promise<void> => {
  const parsed = GetDailyPlanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { career, currentLevel } = parsed.data;

  const prompt = `Create a daily action plan for someone pursuing: ${career}
Current Level: ${currentLevel || "Beginner"}

Respond ONLY with this JSON:
{
  "tasks": [
    {"task": "Specific actionable task description", "duration": "30 mins", "category": "Learning"},
    {"task": "Task description", "duration": "1 hour", "category": "Practice"},
    {"task": "Task description", "duration": "20 mins", "category": "Networking"},
    {"task": "Task description", "duration": "45 mins", "category": "Project"},
    {"task": "Task description", "duration": "15 mins", "category": "Research"}
  ],
  "motivation": "An inspiring quote or motivational message specific to this career journey..."
}
Include 6-8 tasks. Categories: Learning, Practice, Networking, Project, Research, Application, Reading`;

  const text = await askAI(CAREER_SYSTEM_PROMPT, prompt);
  const data = parseJSON(text);
  res.json(data);
});

router.post("/explain", async (req, res): Promise<void> => {
  const parsed = ExplainCareerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { career, userProfile } = parsed.data;

  const prompt = `Explain career: ${career} for this user profile: ${userProfile}

Respond ONLY with this JSON:
{
  "whySuitable": "Detailed explanation of why this career suits this specific user based on their profile, interests, and goals...",
  "whatToExpect": "What they can realistically expect in terms of growth, challenges, rewards, work culture, and career trajectory..."
}`;

  const text = await askAI(CAREER_SYSTEM_PROMPT, prompt);
  const data = parseJSON(text);
  res.json(data);
});

export default router;
