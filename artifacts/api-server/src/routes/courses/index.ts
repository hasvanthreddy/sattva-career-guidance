import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { ListCoursesBody, ListLearningCentersBody } from "@workspace/api-zod";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are an expert educational advisor for Indian students. Provide real, relevant course and learning center recommendations. Always respond in valid JSON format only.`;

router.post("/list", async (req, res): Promise<void> => {
  const parsed = ListCoursesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { career, level } = parsed.data;

  const prompt = `List the best courses for someone pursuing: ${career}
Skill Level: ${level || "Beginner"}

Respond ONLY with this JSON:
{
  "freeCourses": [
    {
      "name": "Course Name",
      "provider": "Coursera",
      "url": "https://coursera.org",
      "isPaid": false,
      "duration": "4 weeks",
      "level": "Beginner",
      "description": "What you'll learn..."
    }
  ],
  "paidCourses": [
    {
      "name": "Course Name",
      "provider": "Udemy",
      "url": "https://udemy.com",
      "isPaid": true,
      "duration": "8 weeks",
      "level": "Intermediate",
      "description": "What you'll learn..."
    }
  ]
}
Include 4-5 free courses and 4-5 paid courses. Use real, well-known platforms like Coursera, edX, Udemy, NPTEL, Swayam, LinkedIn Learning, Google, etc.`;

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

router.post("/centers", async (req, res): Promise<void> => {
  const parsed = ListLearningCentersBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { location, career } = parsed.data;

  const prompt = `List learning centers and institutes in/near: ${location} for career: ${career || "general skills"}

Respond ONLY with this JSON:
{
  "centers": [
    {
      "name": "Institute Name",
      "location": "City, State",
      "type": "Government/Private/NGO",
      "isPaid": false,
      "description": "What they offer...",
      "contact": "website or phone"
    }
  ]
}
Include 6-8 centers. Include Skill India centers, government institutes (ITIs, polytechnics), and reputed private training centers. Mix of free and paid.`;

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
