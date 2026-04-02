import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { AnalyzeResumeBody } from "@workspace/api-zod";
import multer from "multer";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const SYSTEM_PROMPT = `You are an expert resume reviewer and career advisor specializing in Indian job market. Analyze resumes and provide actionable feedback. Always respond in valid JSON format only.`;

router.post("/extract-text", upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const { originalname, buffer, mimetype } = req.file;

  try {
    let text = "";
    const nameLower = originalname.toLowerCase();

    if (mimetype === "application/pdf" || nameLower.endsWith(".pdf")) {
      const pdfParse = (await import("pdf-parse")).default;
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;
    } else if (
      mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      nameLower.endsWith(".docx") || nameLower.endsWith(".doc")
    ) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      text = buffer.toString("utf-8");
    }

    const cleaned = text
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    res.json({ text: cleaned, filename: originalname, length: cleaned.length });
  } catch (error) {
    console.error("Text extraction error:", error);
    res.status(500).json({ error: "Failed to extract text from file. Please try pasting your resume text directly." });
  }
});

router.post("/analyze", async (req, res): Promise<void> => {
  const parsed = AnalyzeResumeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { resumeText, targetCareer, userStandard } = parsed.data;

  const standardContext = userStandard
    ? `\nStudent Standard/Level: ${userStandard}. Tailor advice accordingly (e.g., if intermediate/below, focus on foundation skills and entrance exam prep).`
    : "";

  const prompt = `Analyze this resume text and provide detailed feedback:

RESUME TEXT:
${resumeText.substring(0, 8000)}

Target Career: ${targetCareer || "not specified"}${standardContext}

Respond ONLY with this JSON (no markdown):
{
  "name": "Candidate's name if found, else null",
  "email": "Email if found, else null",
  "phone": "Phone if found, else null",
  "education": "Education details if found, else null",
  "experience": "Work experience summary if found, else null",
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
overallScore should be 0-100. Extract all available personal info. Be specific and actionable in improvements.`;

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
