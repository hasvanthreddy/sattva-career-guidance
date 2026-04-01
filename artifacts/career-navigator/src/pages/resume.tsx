import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Target, Lightbulb, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useAnalyzeResume, ResumeAnalyzeResponse } from "@workspace/api-client-react";

export default function Resume() {
  const [method, setMethod] = useState<"upload" | "paste">("upload");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [data, setData] = useState<ResumeAnalyzeResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const analyzeMutation = useAnalyzeResume();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setText(content);
    };
    reader.readAsText(file);
  };

  const handleAnalyze = () => {
    if (!text) return;
    const targetCareer = localStorage.getItem("selected_career") || undefined;
    
    analyzeMutation.mutate({
      data: { resumeText: text, targetCareer }
    }, {
      onSuccess: (res) => setData(res)
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Resume Intelligence</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get AI-powered feedback on your resume. See what skills you're missing for your target career.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-5 space-y-6">
          <Card className="glass-panel border-white/10">
            <CardHeader>
              <CardTitle>Input Your Resume</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex bg-black/20 p-1 rounded-lg">
                <button 
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${method === 'upload' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-white'}`}
                  onClick={() => setMethod('upload')}
                >
                  Upload File
                </button>
                <button 
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${method === 'paste' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-white'}`}
                  onClick={() => setMethod('paste')}
                >
                  Paste Text
                </button>
              </div>

              {method === 'upload' ? (
                <div 
                  className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-white/5"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".txt,.pdf"
                    onChange={handleFileUpload}
                  />
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm font-medium mb-1">Click to upload your resume</p>
                  <p className="text-xs text-muted-foreground mb-4">PDF or TXT (Max 5MB)</p>
                  
                  {fileName && (
                    <div className="flex items-center justify-center gap-2 text-primary bg-primary/10 py-2 px-4 rounded-full text-sm font-medium inline-flex">
                      <File className="w-4 h-4" />
                      {fileName}
                    </div>
                  )}
                </div>
              ) : (
                <Textarea 
                  placeholder="Paste your resume text here..."
                  className="min-h-[200px] bg-white/5 border-white/10"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              )}

              <Button 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white" 
                disabled={!text || analyzeMutation.isPending}
                onClick={handleAnalyze}
              >
                {analyzeMutation.isPending ? "Analyzing..." : "Analyze Resume"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-7">
          {analyzeMutation.isPending && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-white/10 rounded-xl bg-white/5">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground">Extracting skills and evaluating match...</p>
            </div>
          )}

          {!analyzeMutation.isPending && !data && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-white/10 border-dashed rounded-xl bg-white/5 text-center p-8">
              <Target className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-medium mb-2 text-white/50">Awaiting Resume</h3>
              <p className="text-muted-foreground max-w-sm">Upload your resume to see your ATS score, skill gaps, and AI-powered improvement suggestions.</p>
            </div>
          )}

          {data && !analyzeMutation.isPending && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <Card className="glass-panel border-white/10">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                    <div className="relative w-24 h-24 mb-4">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle className="text-white/10 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                        <circle 
                          className="text-primary stroke-current transition-all duration-1000 ease-out" 
                          strokeWidth="8" 
                          strokeLinecap="round" 
                          cx="50" cy="50" r="40" fill="transparent" 
                          strokeDasharray="251.2" 
                          strokeDashoffset={251.2 - (251.2 * data.overallScore) / 100}
                          transform="rotate(-90 50 50)"
                        ></circle>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-2xl font-bold">{data.overallScore}</span>
                      </div>
                    </div>
                    <div className="font-medium">ATS Score</div>
                    <div className="text-xs text-muted-foreground">Overall match quality</div>
                  </CardContent>
                </Card>

                <Card className="glass-panel border-white/10 bg-primary/10 border-primary/20">
                  <CardContent className="p-6 flex flex-col justify-center h-full">
                    <div className="text-sm text-primary mb-1 font-bold uppercase tracking-wider">Suggested Path</div>
                    <div className="text-xl font-bold mb-2">{data.suggestedCareer}</div>
                    <p className="text-xs text-muted-foreground">Based on your existing skill composition</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="glass-panel border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg">Skill Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Skills Found
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {data.skillsFound.map(skill => (
                        <span key={skill} className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-rose-500" /> Missing Core Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {data.missingSkills.map(skill => (
                        <span key={skill} className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-panel border-white/10">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-400" /> Improvement Areas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {data.improvements.map((imp, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
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
