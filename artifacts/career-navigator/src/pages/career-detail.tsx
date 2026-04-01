import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import { 
  Briefcase, Activity, AlertTriangle, Target, Calendar, BarChart, CheckCircle2, TrendingUp, IndianRupee 
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import {
  useExplainCareer,
  useSimulateCareer,
  useSurvivalAnalysis,
  useAnalyzeSkillGap,
  useGetJobRoles,
  useGetDailyPlan
} from "@workspace/api-client-react";

export default function CareerDetail() {
  const { name } = useParams();
  const decodedName = decodeURIComponent(name || "");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch all necessary data
  const { mutate: fetchExplain, data: explainData, isPending: isExplainLoading } = useExplainCareer();
  const { mutate: fetchSimulate, data: simulateData } = useSimulateCareer();
  const { mutate: fetchSurvival, data: survivalData } = useSurvivalAnalysis();
  const { mutate: fetchSkillGap, data: skillGapData } = useAnalyzeSkillGap();
  const { mutate: fetchJobRoles, data: jobRolesData } = useGetJobRoles();
  const { mutate: fetchDailyPlan, data: dailyPlanData } = useGetDailyPlan();

  useEffect(() => {
    if (decodedName) {
      // Basic user profile info from localStorage could be sent
      const profile = localStorage.getItem("career_onboarding");
      let profileStr = "";
      if (profile) {
        try {
          const p = JSON.parse(profile);
          profileStr = `Interests: ${p.interests}, Skills: ${p.skills}`;
        } catch(e) {}
      }

      fetchExplain({ data: { career: decodedName, userProfile: profileStr } });
      fetchSimulate({ data: { career: decodedName, userProfile: profileStr } });
      fetchSurvival({ data: { career: decodedName, stressLevel: "Medium" } });
      fetchSkillGap({ data: { career: decodedName, currentSkills: profileStr } });
      fetchJobRoles({ data: { career: decodedName } });
      fetchDailyPlan({ data: { career: decodedName } });
    }
  }, [decodedName]);

  // Mock data for the salary chart if API doesn't provide structured array
  const salaryChartData = [
    { year: "Year 1", salary: 4 },
    { year: "Year 3", salary: 7 },
    { year: "Year 5", salary: 12 },
    { year: "Year 7", salary: 18 },
    { year: "Year 10", salary: 28 },
  ];

  if (isExplainLoading && !explainData) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary mb-4 uppercase tracking-wider">
          Career Profile
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{decodedName}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-4 scrollbar-none">
          <TabsList className="bg-black/20 border border-white/10 p-1 w-max">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary">Overview</TabsTrigger>
            <TabsTrigger value="simulation" className="data-[state=active]:bg-primary">Simulation</TabsTrigger>
            <TabsTrigger value="survival" className="data-[state=active]:bg-primary">Survival Analysis</TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-primary">Skill Gap</TabsTrigger>
            <TabsTrigger value="roles" className="data-[state=active]:bg-primary">Job Roles</TabsTrigger>
            <TabsTrigger value="daily" className="data-[state=active]:bg-primary">Daily Plan</TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-8">
          <TabsContent value="overview" className="mt-0">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass-panel border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-primary" /> Why it suits you</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{explainData?.whySuitable}</p>
                </CardContent>
              </Card>

              <Card className="glass-panel border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-emerald-400" /> What to expect</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{explainData?.whatToExpect}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="simulation" className="mt-0 space-y-6">
            {simulateData && (
              <>
                <Card className="glass-panel border-white/10 border-t-4 border-t-purple-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-purple-400" /> Day in the Life</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{simulateData.dayInLife}</p>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="glass-panel border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-400" /> Salary Growth Trajectory</CardTitle>
                      <CardDescription>Estimated progression (LPA)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={salaryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.5}/>
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Area type="monotone" dataKey="salary" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorSalary)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="glass-panel border-white/10 bg-rose-500/5 border-rose-500/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-rose-400"><AlertTriangle className="w-5 h-5" /> Reality Check</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{simulateData.realityCheck}</p>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="survival" className="mt-0">
            {survivalData && (
              <div className="grid md:grid-cols-12 gap-6">
                <div className="md:col-span-4">
                  <Card className="glass-panel border-white/10 h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="relative w-40 h-40 mb-6">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle className="text-white/10 stroke-current" strokeWidth="6" cx="50" cy="50" r="45" fill="transparent"></circle>
                        <circle 
                          className={`${survivalData.survivalScore > 70 ? 'text-emerald-500' : survivalData.survivalScore > 40 ? 'text-amber-500' : 'text-rose-500'} stroke-current transition-all duration-1000 ease-out`}
                          strokeWidth="6" 
                          strokeLinecap="round" 
                          cx="50" cy="50" r="45" fill="transparent" 
                          strokeDasharray="282.7" 
                          strokeDashoffset={282.7 - (282.7 * survivalData.survivalScore) / 100}
                          transform="rotate(-90 50 50)"
                        ></circle>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-4xl font-bold">{survivalData.survivalScore}</span>
                        <span className="text-xs uppercase tracking-wider text-muted-foreground mt-1">Score</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-xl mb-2">Survival Score</h3>
                    <p className="text-sm text-muted-foreground">How likely you are to thrive and avoid burnout in this role based on your profile.</p>
                  </Card>
                </div>

                <div className="md:col-span-8 space-y-6">
                  <Card className="glass-panel border-white/10">
                    <CardContent className="p-6">
                      <h4 className="font-bold text-lg mb-2">Feedback</h4>
                      <p className="text-muted-foreground">{survivalData.feedback}</p>
                    </CardContent>
                  </Card>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Card className="glass-panel border-white/10 bg-white/5">
                      <CardContent className="p-5">
                        <div className="text-sm font-bold text-primary uppercase mb-2">Lifestyle Match</div>
                        <p className="text-sm text-muted-foreground">{survivalData.lifestyleMatch}</p>
                      </CardContent>
                    </Card>
                    <Card className="glass-panel border-white/10 bg-white/5">
                      <CardContent className="p-5">
                        <div className="text-sm font-bold text-rose-400 uppercase mb-2">Stress Compatibility</div>
                        <p className="text-sm text-muted-foreground">{survivalData.stressCompatibility}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="skills" className="mt-0">
            {skillGapData && (
              <div className="space-y-8">
                <Card className="glass-panel border-white/10">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="w-full md:w-1/3">
                        <h3 className="text-2xl font-bold mb-2">Overall Progress</h3>
                        <p className="text-muted-foreground mb-4">Your current skill alignment with role requirements.</p>
                        <div className="flex items-end gap-2 mb-2">
                          <span className="text-4xl font-bold text-primary">{skillGapData.progressPercent}%</span>
                          <span className="text-muted-foreground mb-1">Ready</span>
                        </div>
                        <Progress value={skillGapData.progressPercent} className="h-3 bg-white/10" />
                      </div>
                      <div className="hidden md:block w-px h-24 bg-white/10"></div>
                      <div className="flex-1">
                        <p className="text-lg leading-relaxed text-muted-foreground">
                          {skillGapData.summary}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" /> Skills You Have
                    </h3>
                    <div className="space-y-3">
                      {skillGapData.skills.filter(s => s.have).map((skill, i) => (
                        <div key={i} className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <div className="font-semibold text-emerald-300 mb-1">{skill.name}</div>
                          <div className="text-xs text-emerald-400/70 capitalize">Importance: {skill.importance}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-rose-400">
                      <AlertTriangle className="w-5 h-5" /> Skills To Acquire
                    </h3>
                    <div className="space-y-3">
                      {skillGapData.skills.filter(s => !s.have).map((skill, i) => (
                        <div key={i} className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20">
                          <div className="font-semibold text-rose-300 mb-1">{skill.name}</div>
                          <div className="text-xs text-rose-400/70 capitalize">Importance: {skill.importance}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="roles" className="mt-0">
            {jobRolesData && (
              <div className="grid gap-4">
                {jobRolesData.roles.map((role, i) => (
                  <Card key={i} className="glass-panel border-white/10 hover:border-primary/50 transition-colors group">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">{role.level}</div>
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{role.title}</h3>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg border border-white/10 shrink-0">
                          <IndianRupee className="w-4 h-4 text-emerald-400" />
                          <span className="font-medium">{role.salary}</span>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-white/5">
                        <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-2">Role Description</h4>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white/70 mb-2">Key Requirements</h4>
                          <p className="text-sm text-muted-foreground">{role.requirements}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="daily" className="mt-0">
            {dailyPlanData && (
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Today's Action Plan</h2>
                  <p className="text-muted-foreground italic">"{dailyPlanData.motivation}"</p>
                </div>
                
                <div className="space-y-4">
                  {dailyPlanData.tasks.map((task, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-xl glass-panel border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full border-2 border-white/30 shrink-0"></div>
                      <div className="flex-1">
                        <div className="font-medium">{task.task}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{task.category}</div>
                      </div>
                      <div className="text-sm font-medium bg-primary/20 text-primary px-3 py-1 rounded-full shrink-0">
                        {task.duration}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
