import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { AnalyzeResumeBody } from "@workspace/api-zod";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are an expert resume reviewer and career advisor specializing in Indian job market. Analyze resumes and provide actionable feedback. Always respond in valid JSON format only.`;

router.post("/analyze", async (req, res): Promise<void> => {
  const parsed = AnalyzeResumeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { resumeText, targetCareer } = parsed.data;

  const prompt = `Analyze this resume text and provide detailed feedback:

RESUME TEXT:
${resumeText.substring(0, 8000)}

Target Career: ${targetCareer || "not specified"}

Respond ONLY with this JSON (no markdown):
{
  "skillsFound": ["Skill 1", "Skill 2", "Skill 3"],
  "missingSkills": ["Missing Skill 1", "Missing Skill 2", "Missing Skill 3"],
  "suggestedCareer": "Best matching career based on resume",
  "improvements": [
    "Specific improvement suggestion 1",
    "Specific improvement suggestion 2",
    "Specific improvement suggestion 3",
    "Specific improvement suggestion 4"
  ],
  "overallScore": 72,
  "summary": "Overall assessment of the resume quality, strengths, and areas for improvement..."
}
overallScore should be 0-100. Be specific and actionable in improvements.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 4096,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
  });

  const text = response.choices[0]?.message?.content ?? "{}";
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const data = JSON.parse(cleaned);
  res.json(data);
});

export default router;
