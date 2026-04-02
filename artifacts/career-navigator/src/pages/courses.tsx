import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, BookOpen, Star, Clock, ExternalLink, PlayCircle, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useListCourses } from "@workspace/api-client-react";
import { SiCoursera, SiUdemy, SiEdx, SiUdacity, SiYoutube } from "react-icons/si";
import { useUser } from "@/contexts/user";

export default function Courses() {
  const { user, getUserData, sessionData } = useUser();
  const [query, setQuery] = useState("");
  const [targetCareer, setTargetCareer] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const selectedCareer = localStorage.getItem("selected_career");
    const userInterest = user ? getUserData("interests") : null;

    if (selectedCareer) {
      setTargetCareer(selectedCareer);
      setQuery(selectedCareer);
    } else if (userInterest) {
      const firstInterest = userInterest.split(",")[0]?.trim() || userInterest.trim();
      const career = firstInterest.length > 3 ? firstInterest : "Software Developer";
      setTargetCareer(career);
      setQuery(career);
    } else {
      setTargetCareer("Software Developer");
      setQuery("Software Developer");
    }
  }, [user]);

  const coursesMutation = useListCourses();

  useEffect(() => {
    if (targetCareer) {
      coursesMutation.mutate({ data: { career: targetCareer } });
    }
  }, [targetCareer]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setTargetCareer(query.trim());
      setSearched(true);
    }
  };

  const getProviderIcon = (provider: string) => {
    const p = provider.toLowerCase();
    if (p.includes("coursera")) return <SiCoursera className="w-5 h-5 text-blue-500" />;
    if (p.includes("udemy")) return <SiUdemy className="w-5 h-5 text-purple-500" />;
    if (p.includes("edx")) return <SiEdx className="w-5 h-5 text-red-500" />;
    if (p.includes("udacity")) return <SiUdacity className="w-5 h-5 text-cyan-500" />;
    if (p.includes("youtube")) return <SiYoutube className="w-5 h-5 text-red-600" />;
    return <PlayCircle className="w-5 h-5 text-primary" />;
  };

  const renderCourses = (courses: any[]) => {
    if (!courses || courses.length === 0) {
      return (
        <div className="py-12 text-center text-muted-foreground">
          No courses found for this role. Try a different search.
        </div>
      );
    }

    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className="border-border h-full flex flex-col hover:border-primary/40 hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-muted rounded-lg border border-border">
                    {getProviderIcon(course.provider)}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {course.duration}
                  </div>
                </div>

                <div className="text-xs text-primary font-bold uppercase tracking-wider mb-2">{course.provider}</div>
                <h3 className="font-bold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">{course.name}</h3>

                {course.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-medium text-amber-500">{course.rating}</span>
                  </div>
                )}

                <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">{course.description}</p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                  <Badge variant="secondary" className="text-xs">{course.level}</Badge>
                  <a
                    href={course.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors gap-1"
                  >
                    {course.provider?.toLowerCase().includes("youtube") ? (
                      <><Youtube className="w-4 h-4" /> Watch</>
                    ) : (
                      <><ExternalLink className="w-4 h-4" /> Enroll</>
                    )}
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2">📚 Learning Hub</h1>
          <p className="text-xl text-muted-foreground">Master the skills needed for your dream career.</p>
          {sessionData.grade && (
            <p className="text-sm text-primary mt-1 font-medium">
              🎓 Showing courses suitable for {sessionData.grade === "intermediate" ? "Intermediate (11-12)" : `Class ${sessionData.grade}`} students
            </p>
          )}
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-80 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses for a role..."
              className="w-full pl-9 bg-card border-border"
            />
          </div>
          <Button type="submit" className="bg-primary text-white hover:bg-primary/90 shrink-0">
            Search
          </Button>
        </form>
      </div>

      {coursesMutation.isPending && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">🔍 Curating the best courses for you...</p>
        </div>
      )}

      {coursesMutation.data && !coursesMutation.isPending && (
        <Tabs defaultValue="free" className="w-full">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-3">
            <TabsList className="bg-muted border border-border p-1">
              <TabsTrigger value="free" className="data-[state=active]:bg-primary data-[state=active]:text-white gap-2">
                🆓 Free Courses
              </TabsTrigger>
              <TabsTrigger value="paid" className="data-[state=active]:bg-primary data-[state=active]:text-white gap-2">
                💎 Premium Courses
              </TabsTrigger>
            </TabsList>

            <div className="text-sm text-muted-foreground">
              Results for <span className="font-bold text-foreground">"{targetCareer}"</span>
            </div>
          </div>

          <TabsContent value="free" className="mt-0">
            {renderCourses(coursesMutation.data.freeCourses)}
          </TabsContent>
          <TabsContent value="paid" className="mt-0">
            {renderCourses(coursesMutation.data.paidCourses)}
          </TabsContent>
        </Tabs>
      )}

      {!coursesMutation.data && !coursesMutation.isPending && (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Find Your Courses</h3>
          <p className="text-muted-foreground max-w-sm mx-auto text-sm">
            Search for courses by career or role to get AI-curated recommendations with free and premium options.
          </p>
        </div>
      )}
    </div>
  );
}
