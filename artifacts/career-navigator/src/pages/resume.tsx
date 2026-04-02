import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, CheckCircle2, XCircle, AlertTriangle, Target,
  Lightbulb, Loader2, Info, User, Mail, Phone, BookOpen, Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAnalyzeResume, ResumeAnalyzeResponse } from "@workspace/api-client-react";
import { useUser } from "@/contexts/user";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface ExtendedResumeData extends ResumeAnalyzeResponse {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  education?: string | null;
  experience?: string | null;
}

export default function Resume() {
  const [method, setMethod] = useState<"upload" | "paste">("upload");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [data, setData] = useState<ExtendedResumeData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sessionData } = useUser();

  const analyzeMutation = useAnalyzeResume();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError("");
    setFileName(file.name);
    setText("");

    if (file.size > 10 * 1024 * 1024) {
      setFileError("File size exceeds 10MB. Please use a smaller file.");
      return;
    }

    const nameLower = file.name.toLowerCase();
    const isPDF = nameLower.endsWith(".pdf");
    const isDOCX = nameLower.endsWith(".docx") || nameLower.endsWith(".doc");
    const isTXT = nameLower.endsWith(".txt");

    if (!isPDF && !isDOCX && !isTXT) {
      setFileError("Unsupported file type. Please upload a PDF, DOCX, DOC, or TXT file.");
      return;
    }

    if (isTXT) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (!content || content.trim().length < 50) {
          setFileError("File appears empty or too short. Please paste your resume text directly.");
        } else {
          setText(content);
        }
      };
      reader.onerror = () => setFileError("Failed to read file. Please paste your resume text directly.");
      reader.readAsText(file, "utf-8");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${BASE}/api/resume/extract-text`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || "Failed to extract text");
      }

      const result = await response.json();
      if (!result.text || result.text.length < 30) {
        setFileError("Could not extract enough text from the file. Please paste your resume text directly.");
      } else {
        setText(result.text);
        setFileError("");
      }
    } catch (err: any) {
      setFileError(err.message || "Failed to process file. Please paste your resume text directly.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInputRef.current.files = dt.files;
      const event = new Event("change", { bubbles: true });
      fileInputRef.current.dispatchEvent(event);
      handleFileUpload({ target: { files: dt.files } } as any);
    }
  };

  const handleAnalyze = () => {
    if (!text.trim()) return;
    setData(null);
    analyzeMutation.mutate({
      data: {
        resumeText: text.trim(),
        userStandard: sessionData.grade || undefined,
      } as any
    }, {
      onSuccess: (res) => setData(res as ExtendedResumeData)
    });
  };

  const canAnalyze = text.trim().length > 30 && !analyzeMutation.isPending && !uploading;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4 border border-primary/20">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Resume Intelligence</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Upload your PDF or DOCX resume and get AI-powered feedback, skill gap analysis, and personalized improvement suggestions.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-5 space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Input Your Resume</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex bg-muted p-1 rounded-lg">
                {(["upload", "paste"] as const).map(m => (
                  <button
                    key={m}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                      method === m
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => { setMethod(m); setFileError(""); }}
                  >
                    {m === "upload" ? "📄 Upload File" : "✏️ Paste Text"}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {method === "upload" ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                  >
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                        fileError
                          ? "border-destructive/50 bg-destructive/5"
                          : text
                          ? "border-primary/50 bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-accent/50"
                      }`}
                      onClick={() => !uploading && fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".txt,.pdf,.doc,.docx"
                        onChange={handleFileUpload}
                      />
                      {uploading ? (
                        <div className="flex flex-col items-center gap-3 text-primary">
                          <Loader2 className="w-10 h-10 animate-spin" />
                          <div className="font-semibold">Extracting text from {fileName}...</div>
                          <div className="text-xs text-muted-foreground">Parsing your PDF/DOCX file</div>
                        </div>
                      ) : text && !fileError ? (
                        <div className="flex flex-col items-center gap-2 text-primary">
                          <CheckCircle2 className="w-10 h-10" />
                          <div className="font-semibold">{fileName}</div>
                          <div className="text-xs text-muted-foreground">{text.length.toLocaleString()} characters extracted ✅</div>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm font-medium mb-1">Drop your resume here or click to browse</p>
                          <p className="text-xs text-muted-foreground">Supports PDF, DOCX, DOC, TXT (Max 10MB)</p>
                        </>
                      )}
                    </div>

                    {fileError && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 flex gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3"
                      >
                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{fileError}</span>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="paste"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <Textarea
                      placeholder="Paste your resume text here... Include all sections: work experience, skills, education, projects."
                      className="min-h-[220px] bg-card border-border focus-visible:ring-primary resize-none text-sm"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                    {text && (
                      <p className="text-xs text-muted-foreground mt-1.5 text-right">{text.length} characters</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                disabled={!canAnalyze}
                onClick={handleAnalyze}
              >
                {analyzeMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing with AI...</>
                ) : (
                  "🔍 Analyze Resume"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-7">
          {analyzeMutation.isPending && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-border rounded-xl bg-card">
              <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute inset-0"></div>
              </div>
              <p className="font-medium mb-1">🤖 Sattva is analyzing your resume...</p>
              <p className="text-sm text-muted-foreground">Extracting skills and evaluating your profile</p>
            </div>
          )}

          {!analyzeMutation.isPending && !data && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-dashed border-border rounded-xl bg-card/50 text-center p-8">
              <Target className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-medium mb-2">Awaiting Resume</h3>
              <p className="text-muted-foreground max-w-sm text-sm">
                Upload your PDF/DOCX or paste your resume to get your ATS score, extracted details, skill gaps, and AI-powered improvement suggestions.
              </p>
            </div>
          )}

          {data && !analyzeMutation.isPending && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {(data.name || data.email || data.phone || data.education || data.experience) && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" /> Extracted Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {data.name && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="font-medium">Name:</span> <span>{data.name}</span>
                      </div>
                    )}
                    {data.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="font-medium">Email:</span> <span>{data.email}</span>
                      </div>
                    )}
                    {data.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="font-medium">Phone:</span> <span>{data.phone}</span>
                      </div>
                    )}
                    {data.education && (
                      <div className="flex items-start gap-2 text-sm">
                        <BookOpen className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="font-medium shrink-0">Education:</span> <span className="text-muted-foreground">{data.education}</span>
                      </div>
                    )}
                    {data.experience && (
                      <div className="flex items-start gap-2 text-sm">
                        <Briefcase className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="font-medium shrink-0">Experience:</span> <span className="text-muted-foreground">{data.experience}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Card className="border-border">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                    <div className="relative w-24 h-24 mb-4">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle className="text-border stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" />
                        <circle
                          className="text-primary stroke-current transition-all duration-1000 ease-out"
                          strokeWidth="8"
                          strokeLinecap="round"
                          cx="50" cy="50" r="40" fill="transparent"
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 - (251.2 * Math.min(data.overallScore, 100)) / 100}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-2xl font-bold">{data.overallScore}</span>
                        <span className="text-xs text-muted-foreground">/ 100</span>
                      </div>
                    </div>
                    <div className="font-semibold">ATS Score</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {data.overallScore >= 80 ? "🟢 Excellent" : data.overallScore >= 60 ? "🟡 Good" : "🔴 Needs Work"}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-6 flex flex-col justify-center h-full">
                    <div className="text-xs text-primary mb-1 font-bold uppercase tracking-wider">🎯 Best Career Match</div>
                    <div className="text-xl font-bold mb-2">{data.suggestedCareer}</div>
                    <p className="text-xs text-muted-foreground">Based on your existing skill composition</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">📊 Skill Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {data.skillsFound && data.skillsFound.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" /> ✅ Skills Found
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {data.skillsFound.map(skill => (
                          <span key={skill} className="px-3 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {data.missingSkills && data.missingSkills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-rose-600 dark:text-rose-400">
                        <XCircle className="w-4 h-4" /> ❌ Missing Core Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {data.missingSkills.map(skill => (
                          <span key={skill} className="px-3 py-1 bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {data.summary && (
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">📝 Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{data.summary}</p>
                  </CardContent>
                </Card>
              )}

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" /> 💡 Sattva's Improvement Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {data.improvements.map((imp, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{imp}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
