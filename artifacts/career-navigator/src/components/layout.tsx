import { Link, useLocation } from "wouter";
import { Briefcase, Compass, Map, FileText, BookOpen, Building2, MessageSquare, Menu, Globe, Sun, Moon, X, LogIn, User } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/theme";
import { useLanguage } from "@/contexts/language";

const NAV_ITEMS = [
  { href: "/", labelKey: "nav.home", icon: Briefcase },
  { href: "/careers", labelKey: "nav.careers", icon: Compass },
  { href: "/roadmap", labelKey: "nav.roadmap", icon: Map },
  { href: "/resume", labelKey: "nav.resume", icon: FileText },
  { href: "/courses", labelKey: "nav.courses", icon: BookOpen },
  { href: "/centers", labelKey: "nav.centers", icon: Building2 },
  { href: "/chat", labelKey: "nav.sattva", icon: MessageSquare },
];

interface UserProfile {
  name: string;
  email: string;
  picture?: string;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();

  useEffect(() => {
    const saved = localStorage.getItem("sattva_user");
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
  }, []);

  const handleGoogleLogin = () => {
    const mockUser: UserProfile = {
      name: "Student User",
      email: "student@example.com",
      picture: "https://ui-avatars.com/api/?name=Student+User&background=7c3aed&color=fff",
    };
    localStorage.setItem("sattva_user", JSON.stringify(mockUser));
    setUser(mockUser);
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("sattva_user");
    setUser(null);
  };

  const isDark = theme === "dark";

  const NavLink = ({ item, mobile = false }: { item: typeof NAV_ITEMS[0]; mobile?: boolean }) => {
    const Icon = item.icon;
    const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
    return (
      <Link href={item.href} onClick={() => mobile && setIsOpen(false)}>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          size={mobile ? "default" : "sm"}
          className={`gap-2 transition-all ${
            mobile ? "w-full justify-start" : ""
          } ${
            isActive
              ? "bg-primary/20 text-primary border border-primary/30"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <Icon className="w-4 h-4" />
          {t(item.labelKey)}
        </Button>
      </Link>
    );
  };

  return (
    <div className={`min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30 transition-colors duration-300`}>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-teal-400 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20">
              S
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:block text-gradient">Sattva</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setShowLangMenu(v => !v)}
                title="Select Language"
              >
                <Globe className="w-4 h-4" />
              </Button>
              {showLangMenu && (
                <div className="absolute right-0 top-10 bg-background border border-border rounded-lg shadow-xl z-50 py-1 min-w-[130px]">
                  {[
                    { code: "en", label: "English" },
                    { code: "hi", label: "हिंदी" },
                  ].map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code as "en" | "hi"); setShowLangMenu(false); }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-accent ${lang === l.code ? "text-primary font-semibold" : "text-foreground"}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {user ? (
              <div className="flex items-center gap-2">
                <img
                  src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=7c3aed&color=fff`}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border-2 border-primary/30 cursor-pointer"
                  onClick={handleLogout}
                  title={`${user.name} — click to sign out`}
                />
              </div>
            ) : (
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white gap-1.5 hidden sm:flex"
                onClick={() => setShowLogin(true)}
              >
                <LogIn className="w-3.5 h-3.5" />
                {t("login.button")}
              </Button>
            )}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background border-border w-72 p-0">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <span className="font-bold text-lg text-gradient">Sattva Navigator</span>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-col p-3 gap-1">
                  {NAV_ITEMS.map((item) => (
                    <NavLink key={item.href} item={item} mobile />
                  ))}
                </div>
                {!user && (
                  <div className="p-3 border-t border-border mt-2">
                    <Button className="w-full bg-primary text-white gap-2" onClick={() => { setIsOpen(false); setShowLogin(true); }}>
                      <LogIn className="w-4 h-4" /> {t("login.button")}
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t border-border py-8 bg-background">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-primary to-teal-400 flex items-center justify-center text-white font-bold text-xs">
              S
            </div>
            <span className="font-semibold text-sm">AI Career Navigator</span>
          </div>
          <div className="text-sm text-muted-foreground text-center font-medium">
            {t("footer.credit")}
          </div>
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} All rights reserved.
          </div>
        </div>
      </footer>

      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="sm:max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">{t("login.title")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <p className="text-center text-muted-foreground text-sm">
              Sign in to save your career profile and personalize your experience.
            </p>
            <Button
              className="w-full h-12 gap-3 bg-white text-gray-800 hover:bg-gray-50 border border-gray-200 shadow-sm dark:bg-white dark:text-gray-800"
              onClick={handleGoogleLogin}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              {t("login.google")}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full h-12 gap-3 border-border hover:bg-accent"
              onClick={() => setShowLogin(false)}
            >
              <User className="w-4 h-4" />
              {t("login.guest")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
