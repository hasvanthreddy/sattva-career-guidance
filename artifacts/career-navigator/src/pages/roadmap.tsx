import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Map as MapIcon, ChevronRight, BookOpen, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGenerateRoadmap, RoadmapGenerateResponse } from "@workspace/api-client-react";

export default function Roadmap() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<RoadmapGenerateResponse | null>(null);
  
  const generateMutation = useGenerateRoadmap();

  const handleGenerate = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query) return;
    
    generateMutation.mutate({
      data: { career: query, timeframe: "12 months" }
    }, {
      onSuccess: (res) => setData(res)
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <MapIcon className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Dynamic Career Roadmap</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Generate a step-by-step visual timeline to reach your target role.
        </p>
      </div>

      <Card className="glass-panel border-white/10 mb-12 max-w-3xl mx-auto">
        <CardContent className="p-6">
          <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Full Stack Developer, Product Manager..." 
                className="w-full pl-10 h-12 bg-background/50 border-white/20 text-lg"
              />
            </div>
            <Button 
              type="submit" 
              disabled={generateMutation.isPending || !query} 
              className="h-12 px-8 bg-primary hover:bg-primary/90 text-white"
            >
              {generateMutation.isPending ? "Generating..." : "Map It Out"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {generateMutation.isPending && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
          <h3 className="text-xl font-medium">Plotting your course...</h3>
        </div>
      )}

      {data && !generateMutation.isPending && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gradient mb-2">Roadmap to {query}</h2>
              <p className="text-muted-foreground">{data.summary}</p>
            </div>
            <div className="flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-lg font-medium shrink-0">
              <Calendar className="w-5 h-5" />
              Timeline: {data.totalTimeline}
            </div>
          </div>

          <div className="relative border-l-2 border-white/10 ml-4 md:ml-8 pl-8 py-4 space-y-12">
            {data.steps.map((step, idx) => (
              <div key={idx} className="relative">
                {/* Timeline Dot */}
                <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-background border-4 border-primary flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                
                <Card className="glass-panel border-white/10 hover:border-white/20 transition-colors">
                  <CardHeader className="pb-3 border-b border-white/5">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="text-primary text-sm font-bold uppercase tracking-wider mb-1">Step {step.step}</div>
                        <CardTitle className="text-xl">{step.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1 text-sm bg-white/5 px-3 py-1 rounded-full text-muted-foreground shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        {step.timeline}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-muted-foreground mb-6">
                      {step.description}
                    </p>
                    <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                      <div className="flex items-center gap-2 text-sm font-medium mb-2 text-white/80">
                        <BookOpen className="w-4 h-4" /> Recommended Resources
                      </div>
                      <p className="text-sm text-muted-foreground">{step.resources}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
