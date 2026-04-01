import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Search, Building2, Phone, Navigation, GraduationCap, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useListLearningCenters } from "@workspace/api-client-react";

export default function Centers() {
  const [location, setLocation] = useState("Bangalore");
  const [career, setCareer] = useState("");
  
  useEffect(() => {
    const saved = localStorage.getItem("selected_career");
    if (saved) {
      setCareer(saved);
    }
  }, []);

  const centersMutation = useListLearningCenters();

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    centersMutation.mutate({
      data: { location, career }
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8 items-center bg-gradient-to-r from-primary/20 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-8 mb-12 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
          <svg width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        
        <div className="flex-1 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-emerald-400 mb-4">
            <CheckCircle className="w-3 h-3" /> Skill India Inspired
          </div>
          <h1 className="text-4xl font-bold mb-4">Find Physical Training Centers</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Locate government and private skill development centers near you. Get hands-on training for real-world jobs.
          </p>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or PIN code..." 
                className="w-full pl-10 h-12 bg-black/40 border-white/20"
              />
            </div>
            <div className="relative flex-1 hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                value={career}
                onChange={(e) => setCareer(e.target.value)}
                placeholder="Domain (optional)..." 
                className="w-full pl-10 h-12 bg-black/40 border-white/20"
              />
            </div>
            <Button type="submit" disabled={centersMutation.isPending} className="h-12 px-8 bg-primary hover:bg-primary/90">
              Search
            </Button>
          </form>
        </div>
      </div>

      {centersMutation.isPending && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Locating centers near you...</p>
        </div>
      )}

      {centersMutation.data && !centersMutation.isPending && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {centersMutation.data.centers.map((center, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass-panel border-white/10 h-full flex flex-col hover:border-primary/30 transition-colors">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                      {center.type === 'Government' ? <Building2 className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
                    </div>
                    <Badge variant="outline" className={center.isPaid ? 'border-amber-500/50 text-amber-400' : 'border-emerald-500/50 text-emerald-400'}>
                      {center.isPaid ? 'Paid Training' : 'Free Training'}
                    </Badge>
                  </div>
                  
                  <h3 className="font-bold text-xl mb-1">{center.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                    <MapPin className="w-3.5 h-3.5" /> {center.location}
                  </div>
                  
                  <p className="text-sm text-white/70 mb-6 flex-1">
                    {center.description}
                  </p>
                  
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" /> {center.contact}
                    </div>
                    <Button variant="secondary" className="w-full gap-2 bg-white/5 hover:bg-white/10 text-white border-0">
                      <Navigation className="w-4 h-4" /> Get Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
