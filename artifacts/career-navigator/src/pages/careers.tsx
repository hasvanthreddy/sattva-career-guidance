import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, Star, Shield, Zap, ArrowRight, Activity, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CareerRecommendResponse, CareerOption } from "@workspace/api-client-react";

export default function Careers() {
  const [, setLocation] = useLocation();
  const [data, setData] = useState<CareerRecommendResponse | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("career_recommendations");
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch(e) {}
    } else {
      // If no data, redirect to onboarding
      setLocation("/onboarding");
    }
  }, [setLocation]);

  const selectCareer = (name: string) => {
    localStorage.setItem("selected_career", name);
    setLocation(`/career/${encodeURIComponent(name)}`);
  };

  if (!data) return null;

  const categories = [
    { 
      key: 'safeCareer', 
      label: 'Safe Bet', 
      desc: 'Highly aligned with your current skills. Easy transition.',
      icon: Shield,
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-cyan-400',
      border: 'border-cyan-500/30'
    },
    { 
      key: 'balancedCareer', 
      label: 'Balanced Growth', 
      desc: 'Perfect mix of comfort and challenge. Great long-term value.',
      icon: Activity,
      color: 'from-emerald-500 to-green-500',
      textColor: 'text-emerald-400',
      border: 'border-emerald-500/30'
    },
    { 
      key: 'dreamCareer', 
      label: 'Dream Reach', 
      desc: 'Ambitious goal requiring upskilling, but massive rewards.',
      icon: Star,
      color: 'from-purple-500 to-pink-500',
      textColor: 'text-purple-400',
      border: 'border-purple-500/30'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Your AI Career Matches</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Based on your profile, we've mapped out three distinct paths for your future.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {categories.map((cat, idx) => {
          const career = data[cat.key as keyof CareerRecommendResponse] as CareerOption;
          if (!career) return null;
          
          return (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              className="flex"
            >
              <Card className={`w-full flex flex-col glass-panel overflow-hidden border-t-4 relative hover:-translate-y-2 transition-transform duration-300 ${cat.border}`}>
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${cat.color}`}></div>
                <CardContent className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-2 ${cat.textColor}`}>
                        <cat.icon className="w-4 h-4" />
                        {cat.label}
                      </div>
                      <h2 className="text-2xl font-bold leading-tight">{career.name}</h2>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-col shrink-0 shadow-inner">
                      <span className="text-lg font-bold text-white">{career.matchPercent}%</span>
                      <span className="text-[10px] text-muted-foreground -mt-1">Match</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mb-6 flex-1">
                    {career.whySuitable}
                  </p>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-green-400">
                        <IndianRupee className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Expected Salary</div>
                        <div className="font-semibold">{career.salary}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-amber-400">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Market Demand</div>
                        <div className="font-semibold">{career.demand}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-auto">
                    <Button 
                      className={`w-full bg-gradient-to-r ${cat.color} hover:opacity-90 text-white border-0`}
                      onClick={() => selectCareer(career.name)}
                    >
                      Explore Career <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-16 text-center">
        <Link href="/onboarding">
          <Button variant="outline" className="border-white/20 hover:bg-white/10">
            Retake Assessment
          </Button>
        </Link>
      </div>
    </div>
  );
}
