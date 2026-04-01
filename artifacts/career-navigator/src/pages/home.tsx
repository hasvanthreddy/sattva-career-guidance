import { Link } from "wouter";
import { motion } from "framer-motion";
import { Search, Code, Palette, HeartPulse, HardHat, Briefcase, ChevronRight, ArrowRight, Compass, Target, BrainCircuit, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/language";

const FIELDS = [
  { name: "Technology", icon: Code, color: "from-blue-500 to-cyan-400", bg: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80" },
  { name: "Design", icon: Palette, color: "from-purple-500 to-pink-500", bg: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80" },
  { name: "Healthcare", icon: HeartPulse, color: "from-red-500 to-orange-500", bg: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80" },
  { name: "Core Eng", icon: HardHat, color: "from-amber-500 to-yellow-400", bg: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=800&q=80" },
  { name: "Business", icon: Briefcase, color: "from-emerald-500 to-green-400", bg: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80" },
];

export default function Home() {
  const { t } = useLanguage();

  const FEATURES = [
    { title: "AI Path Mapping", desc: "Discover careers matched precisely to your unique skills and interests.", icon: Compass },
    { title: "Skill Gap Analysis", desc: "Know exactly what to learn next to bridge the gap to your dream role.", icon: Target },
    { title: "Sattva Mentor", desc: "Get 24/7 personalized career guidance from Sattva, your AI counselor.", icon: BrainCircuit },
    { title: "Dynamic Roadmaps", desc: "Actionable 30/90 day plans to accelerate your career growth.", icon: Rocket },
  ];

  return (
    <div className="flex flex-col min-h-full">
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
        <div className="absolute inset-0 -z-10 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80')] opacity-5 mix-blend-overlay bg-cover"></div>

        <div className="container mx-auto px-4 text-center max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              {t("hero.badge")}
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              {t("hero.title1")} <br className="hidden md:block" />
              <span className="text-gradient animate-gradient bg-[length:200%_auto]">{t("hero.title2")}</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto mb-16">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  className="w-full h-14 pl-10 pr-4 text-lg rounded-full"
                  placeholder={t("hero.placeholder")}
                />
              </div>
              <Link href="/onboarding" className="w-full sm:w-auto shrink-0">
                <Button
                  size="lg"
                  className="w-full h-14 rounded-full px-8 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all duration-300"
                >
                  {t("hero.cta")} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-muted-foreground font-medium">
              {[
                { value: "10,000+", key: "hero.stat1" },
                { value: "98%", key: "hero.stat2" },
                { value: "24/7", key: "hero.stat3" },
              ].map(stat => (
                <div key={stat.key} className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-foreground mb-1">{stat.value}</span>
                  <span className="text-sm uppercase tracking-wider">{t(stat.key)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">{t("fields.title")}</h2>
              <p className="text-muted-foreground">{t("fields.subtitle")}</p>
            </div>
            <Button variant="ghost" className="hidden sm:flex text-primary hover:text-primary/80">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {FIELDS.map((field, i) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Link href="/onboarding">
                  <div className="group relative h-44 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url(${field.bg})` }}></div>
                    <div className={`absolute inset-0 bg-gradient-to-t ${field.color} opacity-70 mix-blend-multiply transition-opacity group-hover:opacity-80`}></div>
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-300"></div>
                    <div className="absolute inset-0 p-4 flex flex-col items-center justify-center text-white text-center">
                      <field.icon className="w-9 h-9 mb-3 opacity-90 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg" />
                      <span className="font-bold text-lg tracking-wide drop-shadow">{field.name}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("features.title")}</h2>
            <p className="text-muted-foreground text-lg">{t("features.subtitle")}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 border border-primary/20">
                      <feat.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
                    <p className="text-muted-foreground">{feat.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden bg-muted/20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">{t("cta.title")}</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              {t("cta.subtitle")}
            </p>
            <Link href="/onboarding">
              <Button
                size="lg"
                className="rounded-full px-10 h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
              >
                {t("cta.button")} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
