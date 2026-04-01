import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Star, Shield, Zap, ArrowRight, Activity, IndianRupee, X, TrendingUp, Users, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CareerRecommendResponse, CareerOption } from "@workspace/api-client-react";

const CAREER_IMAGES: Record<string, string[]> = {
  default: [
    "https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
  ],
  tech: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&w=800&q=80",
  ],
  design: [
    "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80",
  ],
};

function getImages(careerName: string): string[] {
  const name = careerName.toLowerCase();
  if (name.includes("software") || name.includes("data") || name.includes("engineer") || name.includes("developer")) return CAREER_IMAGES.tech;
  if (name.includes("design") || name.includes("ui") || name.includes("ux")) return CAREER_IMAGES.design;
  return CAREER_IMAGES.default;
}

export default function Careers() {
  const [, setLocation] = useLocation();
  const [data, setData] = useState<CareerRecommendResponse | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<{ career: CareerOption; cat: typeof categories[0] } | null>(null);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("career_recommendations");
    if (saved) {
      try { setData(JSON.parse(saved)); } catch {}
    } else {
      setLocation("/onboarding");
    }
  }, [setLocation]);

  const categories = [
    {
      key: 'safeCareer',
      label: 'Safe Bet',
      desc: 'Highly aligned with your current skills. Easy transition.',
      icon: Shield,
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-cyan-600 dark:text-cyan-400',
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-500/5',
    },
    {
      key: 'balancedCareer',
      label: 'Balanced Growth',
      desc: 'Perfect mix of comfort and challenge. Great long-term value.',
      icon: Activity,
      color: 'from-emerald-500 to-green-500',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/5',
    },
    {
      key: 'dreamCareer',
      label: 'Dream Reach',
      desc: 'Ambitious goal requiring upskilling, but massive rewards.',
      icon: Star,
      color: 'from-purple-500 to-pink-500',
      textColor: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500/30',
      bg: 'bg-purple-500/5',
    }
  ];

  const exploreCareer = (name: string) => {
    localStorage.setItem("selected_career", name);
    setLocation(`/career/${encodeURIComponent(name)}`);
  };

  if (!data) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-4">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
          AI Matched For You
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Your Career Matches</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Based on your profile, Sattva has mapped out three distinct paths for your future.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {categories.map((cat, idx) => {
          const career = data[cat.key as keyof CareerRecommendResponse] as CareerOption;
          if (!career) return null;
          const images = getImages(career.name);

          return (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15, type: "spring", stiffness: 100 }}
              className="flex"
            >
              <Card className={`w-full flex flex-col overflow-hidden group hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-300 border-border border-t-4 ${cat.border}`}>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={images[idx % images.length]}
                    alt={career.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-60 mix-blend-multiply`}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                    <div>
                      <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1 ${cat.textColor}`}>
                        <cat.icon className="w-3.5 h-3.5" />
                        {cat.label}
                      </div>
                      <h2 className="text-xl font-bold text-white leading-tight">{career.name}</h2>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-col shrink-0">
                      <span className="text-sm font-bold text-white">{career.matchPercent}%</span>
                      <span className="text-[9px] text-white/70">Match</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-5 flex-1 flex flex-col">
                  <p className="text-muted-foreground text-sm mb-5 flex-1 line-clamp-3">
                    {career.whySuitable}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className={`flex items-center gap-2 text-sm p-2.5 rounded-lg ${cat.bg} border ${cat.border}`}>
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <div>
                        <div className="text-xs text-muted-foreground">Salary</div>
                        <div className="font-semibold text-xs">{career.salary}</div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 text-sm p-2.5 rounded-lg ${cat.bg} border ${cat.border}`}>
                      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <div>
                        <div className="text-xs text-muted-foreground">Demand</div>
                        <div className="font-semibold text-xs">{career.demand}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-auto">
                    <Button
                      className={`w-full bg-gradient-to-r ${cat.color} hover:opacity-90 text-white border-0 transition-all`}
                      onClick={() => exploreCareer(career.name)}
                    >
                      Explore Career <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-muted-foreground hover:text-foreground hover:bg-accent"
                      onClick={() => setSelectedCareer({ career, cat })}
                    >
                      View Details
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
          <Button variant="outline" className="border-border hover:bg-accent gap-2">
            Retake Assessment
          </Button>
        </Link>
      </div>

      <AnimatePresence>
        {selectedCareer && (
          <Dialog open={!!selectedCareer} onOpenChange={() => setSelectedCareer(null)}>
            <DialogContent className="sm:max-w-2xl bg-background border-border max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{selectedCareer.career.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div className="relative h-48 rounded-xl overflow-hidden">
                  {getImages(selectedCareer.career.name).map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${imgIndex % getImages(selectedCareer.career.name).length === i ? 'opacity-100' : 'opacity-0'}`}
                    />
                  ))}
                  <div className={`absolute inset-0 bg-gradient-to-t ${selectedCareer.cat.color} opacity-50 mix-blend-multiply`}></div>
                  <div className="absolute bottom-3 right-3 flex gap-1.5">
                    {getImages(selectedCareer.career.name).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setImgIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${imgIndex % getImages(selectedCareer.career.name).length === i ? 'bg-white scale-125' : 'bg-white/40'}`}
                      />
                    ))}
                  </div>
                  <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-black/40 backdrop-blur-sm`}>
                    <selectedCareer.cat.icon className="w-3.5 h-3.5" />
                    {selectedCareer.cat.label}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: IndianRupee, label: "Salary", value: selectedCareer.career.salary, color: "text-emerald-500" },
                    { icon: TrendingUp, label: "Market Demand", value: selectedCareer.career.demand, color: "text-amber-500" },
                    { icon: CheckCircle2, label: "Match Score", value: `${selectedCareer.career.matchPercent}%`, color: "text-primary" },
                  ].map(stat => (
                    <div key={stat.label} className="text-center p-4 rounded-xl bg-card border border-border">
                      <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                      <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
                      <div className="font-bold text-sm">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Why It Suits You</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{selectedCareer.career.whySuitable}</p>
                </div>

                <Button
                  className={`w-full h-12 bg-gradient-to-r ${selectedCareer.cat.color} text-white hover:opacity-90 transition-all`}
                  onClick={() => { setSelectedCareer(null); exploreCareer(selectedCareer.career.name); }}
                >
                  Explore Full Career Path <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
