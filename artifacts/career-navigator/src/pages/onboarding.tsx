import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/contexts/user";
import { useRecommendCareers } from "@workspace/api-client-react";

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"];
const PREFERENCES = ["Work-life balance", "High growth", "Flexible", "Remote-first", "High Impact"];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const { user, getUserData, setUserData, removeUserData, sessionData } = useUser();

  const storageKey = user ? `onboarding_${user.email}` : "career_onboarding";

  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem(
      user ? `sattva_${user.email.replace(/[^a-zA-Z0-9]/g, "_")}_onboarding` : "career_onboarding"
    );
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return { interests: "", skills: "", skillLevel: "", goals: "", workLifePreference: "" };
  });

  const saveAnswers = (newAnswers: typeof answers) => {
    setAnswers(newAnswers);
    const key = user
      ? `sattva_${user.email.replace(/[^a-zA-Z0-9]/g, "_")}_onboarding`
      : "career_onboarding";
    localStorage.setItem(key, JSON.stringify(newAnswers));
    if (user && newAnswers.interests) {
      setUserData("interests", newAnswers.interests);
    }
  };

  const recommendMutation = useRecommendCareers();

  const handleNext = () => {
    if (step < 4) setStep(s => s + 1);
    else submit();
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
  };

  const submit = () => {
    const recKey = user
      ? `sattva_${user.email.replace(/[^a-zA-Z0-9]/g, "_")}_career_recommendations`
      : "career_recommendations";
    localStorage.removeItem(recKey);
    localStorage.removeItem("selected_career");

    const payload = {
      ...answers,
      userStandard: sessionData.grade || undefined,
    };

    recommendMutation.mutate(
      { data: payload },
      {
        onSuccess: (data) => {
          localStorage.setItem(recKey, JSON.stringify(data));
          localStorage.setItem("career_recommendations", JSON.stringify(data));
          setLocation("/careers");
        }
      }
    );
  };

  const isStepValid = () => {
    if (step === 1) return answers.interests.length > 5;
    if (step === 2) return answers.skills.length > 5 && answers.skillLevel !== "";
    if (step === 3) return answers.goals.length > 5;
    if (step === 4) return answers.workLifePreference !== "";
    return false;
  };

  if (recommendMutation.isPending) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full mb-8"
        />
        <h2 className="text-2xl font-bold text-gradient mb-2">🤖 AI is analyzing your profile...</h2>
        <p className="text-muted-foreground text-center max-w-md">
          We're matching your skills, interests, and goals against thousands of career paths to find your perfect fit.
          {sessionData.grade && (
            <span className="block mt-2 text-primary font-medium">
              ✨ Personalizing for {sessionData.grade === "intermediate" ? "Intermediate" : `Class ${sessionData.grade}`} students
            </span>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12 relative">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>

      <div className="w-full max-w-2xl">
        <div className="mb-8 flex justify-between items-center">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={`h-2 w-12 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-white/10"}`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground font-medium">Step {step} of 4</span>
        </div>

        <Card className="glass-panel overflow-hidden border-white/10 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-teal-400"></div>

          <div className="p-8 md:p-12">
            {sessionData.grade && (
              <div className="mb-6 inline-flex items-center gap-2 text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full font-medium">
                🎓 Personalizing for {sessionData.grade === "intermediate" ? "Intermediate (11-12)" : `Class ${sessionData.grade}`}
              </div>
            )}

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-3xl font-bold mb-2">What are you passionate about? 🌟</h2>
                    <p className="text-muted-foreground">Tell us what you enjoy doing, subjects you love, or hobbies you spend time on.</p>
                  </div>
                  <Textarea
                    value={answers.interests}
                    onChange={(e) => saveAnswers({ ...answers, interests: e.target.value })}
                    placeholder="e.g. I love solving puzzles, designing user interfaces, helping people, or analyzing data..."
                    className="min-h-[150px] text-lg p-4 bg-background/50 border-white/20 focus-visible:ring-primary"
                  />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-3xl font-bold mb-2">What are your current skills? 🛠️</h2>
                    <p className="text-muted-foreground">List tools, languages, or soft skills you currently possess.</p>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base text-foreground/80">List your skills</Label>
                    <Textarea
                      value={answers.skills}
                      onChange={(e) => saveAnswers({ ...answers, skills: e.target.value })}
                      placeholder="e.g. Python, Figma, public speaking, Excel, project management..."
                      className="min-h-[100px] text-lg bg-background/50 border-white/20 focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-base text-foreground/80">Overall skill level</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {SKILL_LEVELS.map(level => (
                        <button
                          key={level}
                          onClick={() => saveAnswers({ ...answers, skillLevel: level })}
                          className={`p-4 rounded-xl border text-center transition-all ${
                            answers.skillLevel === level
                              ? "border-primary bg-primary/20 text-white shadow-[0_0_15px_rgba(147,51,234,0.2)]"
                              : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:border-white/20"
                          }`}
                        >
                          <span className="font-medium">{level}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-3xl font-bold mb-2">What are your career goals? 🚀</h2>
                    <p className="text-muted-foreground">Where do you see yourself in 5 years? What kind of impact do you want to make?</p>
                  </div>
                  <Textarea
                    value={answers.goals}
                    onChange={(e) => saveAnswers({ ...answers, goals: e.target.value })}
                    placeholder="e.g. I want to build products that millions use, become a CTO, or run my own agency..."
                    className="min-h-[150px] text-lg p-4 bg-background/50 border-white/20 focus-visible:ring-primary"
                  />
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-3xl font-bold mb-2">How do you prefer to work? ⚡</h2>
                    <p className="text-muted-foreground">Select the lifestyle that best suits you.</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {PREFERENCES.map(pref => (
                      <button
                        key={pref}
                        onClick={() => saveAnswers({ ...answers, workLifePreference: pref })}
                        className={`p-5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                          answers.workLifePreference === pref
                            ? "border-primary bg-primary/20 text-white shadow-[0_0_15px_rgba(147,51,234,0.2)]"
                            : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className={`mt-0.5 rounded-full p-1 ${answers.workLifePreference === pref ? "bg-primary text-white" : "bg-white/10 text-transparent"}`}>
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-lg">{pref}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-10 flex justify-between pt-6 border-t border-white/10">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={step === 1}
                className="text-muted-foreground hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="bg-white text-primary hover:bg-white/90 px-8"
              >
                {step === 4 ? (
                  <>Discover Careers <Brain className="w-4 h-4 ml-2" /></>
                ) : (
                  <>Next <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
