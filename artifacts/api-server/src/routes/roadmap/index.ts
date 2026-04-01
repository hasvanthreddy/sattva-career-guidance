import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GenerateRoadmapBody } from "@workspace/api-zod";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are an expert career coach helping students in India with precise, actionable career roadmaps. Always respond in valid JSON format only.`;

router.post("/generate", async (req, res): Promise<void> => {
  const parsed = GenerateRoadmapBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { career, currentLevel, timeframe } = parsed.data;

  const prompt = `Create a detailed step-by-step career roadmap for: ${career}
Current Level: ${currentLevel || "Beginner"}
Timeframe: ${timeframe || "6-12 months"}

Respond ONLY with this JSON (no markdown):
{
  "steps": [
    {
      "step": 1,
      "title": "Step Title",
      "description": "What to do and why this step matters...",
      "timeline": "Week 1-4",
      "resources": "Specific resources: books, courses, platforms to use..."
    },
    {
      "step": 2,
      "title": "Step Title",
      "description": "Details...",
      "timeline": "Week 5-8",
      "resources": "Resources..."
    }
  ],
  "totalTimeline": "6 months",
  "summary": "Brief overview of the complete journey from beginner to job-ready..."
}
Include 6-8 steps. Make them specific and actionable with real resources.`;

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
