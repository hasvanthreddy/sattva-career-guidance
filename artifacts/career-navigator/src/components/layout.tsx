import { Link, useLocation } from "wouter";
import { Briefcase, Compass, Map, FileText, BookOpen, Building2, MessageSquare, Menu, Globe } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Briefcase },
  { href: "/careers", label: "Careers", icon: Compass },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/centers", label: "Centers", icon: Building2 },
  { href: "/chat", label: "AI Mentor", icon: MessageSquare },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-teal-400 flex items-center justify-center text-white font-bold text-xl">
                N
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block text-gradient">AI Career Navigator</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href}>
                  <Button 
                    variant={isActive ? "secondary" : "ghost"} 
                    size="sm" 
                    className={`gap-2 ${isActive ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white" title="Select Language">
              <Globe className="w-5 h-5" />
            </Button>
            
            {/* Mobile Nav Toggle */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background border-white/10 w-64 p-0">
                <div className="p-4 border-b border-white/10">
                  <span className="font-bold text-lg text-gradient">AI Career Navigator</span>
                </div>
                <div className="flex flex-col p-2 gap-1">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                        <Button 
                          variant={isActive ? "secondary" : "ghost"} 
                          className={`w-full justify-start gap-3 ${isActive ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
                        >
                          <Icon className="w-5 h-5" />
                          {item.label}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t border-white/10 py-8 bg-black/40">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-primary to-teal-400 flex items-center justify-center text-white font-bold text-xs">
              N
            </div>
            <span className="font-semibold text-sm">AI Career Navigator</span>
          </div>
          <div className="text-sm text-muted-foreground text-center">
            Designed by Team Sathva | Ignite 2K26
          </div>
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
