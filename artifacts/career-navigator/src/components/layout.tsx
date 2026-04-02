import { Link, useLocation } from "wouter";
import {
  Briefcase, Compass, Map, FileText, BookOpen, Building2, MessageSquare,
  Menu, Globe, Sun, Moon, X, LogIn, User, GraduationCap, Bell, CheckCircle2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/theme";
import { useLanguage } from "@/contexts/language";
import { useUser } from "@/contexts/user";
import type { Lang } from "@/contexts/language";
import { useToast } from "@/hooks/use-toast";

const NAV_ITEMS = [
  { href: "/", labelKey: "nav.home", icon: Briefcase },
  { href: "/careers", labelKey: "nav.careers", icon: Compass },
  { href: "/roadmap", labelKey: "nav.roadmap", icon: Map },
  { href: "/resume", labelKey: "nav.resume", icon: FileText },
  { href: "/courses", labelKey: "nav.courses", icon: BookOpen },
  { href: "/centers", labelKey: "nav.centers", icon: Building2 },
  { href: "/chat", labelKey: "nav.sattva", icon: MessageSquare },
];

const GRADES = [
  { key: "6", labelKey: "grade.6" },
  { key: "7", labelKey: "grade.7" },
  { key: "8", labelKey: "grade.8" },
  { key: "9", labelKey: "grade.9" },
  { key: "10", labelKey: "grade.10" },
  { key: "intermediate", labelKey: "grade.intermediate" },
  { key: "above", labelKey: "grade.above" },
];

const LANGUAGES = [
  { code: "en" as Lang, label: "English" },
  { code: "hi" as Lang, label: "हिंदी" },
  { code: "te" as Lang, label: "తెలుగు" },
  { code: "ta" as Lang, label: "தமிழ்" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [notifData, setNotifData] = useState({ lastPage: "", lastActiveIST: "" });
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const { user, sessionData, login, logout, setGrade, trackPage } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (user && location) {
      const pageName = NAV_ITEMS.find(n => n.href === location || (n.href !== "/" && location.startsWith(n.href)))?.labelKey || "";
      if (pageName) trackPage(pageName);
    }
  }, [location, user]);

  const handleGoogleLogin = () => {
    const mockUser = {
      name: "Student User",
      email: "student@example.com",
      picture: `https://ui-avatars.com/api/?name=Student+User&background=7c3aed&color=fff`,
    };
    const result = login(mockUser);
    setShowLogin(false);

    if (result.isReturning && result.lastPage && result.lastActiveIST) {
      setNotifData({ lastPage: result.lastPage, lastActiveIST: result.lastActiveIST });
      setShowNotif(true);
      setTimeout(() => setShowNotif(false), 7000);
    }

    const savedGrade = localStorage.getItem(`sattva_${mockUser.email.replace(/[^a-zA-Z0-9]/g, "_")}_grade`);
    if (!savedGrade) {
      setTimeout(() => setShowGradeModal(true), 300);
    }
  };

  const handleGuestLogin = () => {
    setShowLogin(false);
    toast({ title: "Continuing as Guest", description: "Sign in to save your progress and personalize your experience." });
  };

  const handleGradeConfirm = () => {
    if (!selectedGrade) return;
    setGrade(selectedGrade);
    setShowGradeModal(false);
    toast({
      title: "Profile Updated! 🎓",
      description: `Grade set to ${GRADES.find(g => g.key === selectedGrade)?.labelKey ? t(GRADES.find(g => g.key === selectedGrade)!.labelKey) : selectedGrade}. Personalizing your experience...`,
    });
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
          className={`gap-2 transition-all ${mobile ? "w-full justify-start" : ""} ${
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
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30 transition-colors duration-300">
      {showNotif && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-card border border-primary/30 rounded-xl shadow-xl p-4 flex gap-3 items-start animate-in slide-in-from-right-4 duration-300">
          <Bell className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{t("notification.welcome")}, {user?.name?.split(" ")[0]}! 👋</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("notification.lastVisited")} <span className="text-primary font-medium">{t(notifData.lastPage)}</span>
            </p>
            <p className="text-xs text-muted-foreground">{notifData.lastActiveIST} (IST)</p>
          </div>
          <button onClick={() => setShowNotif(false)} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
                <div className="absolute right-0 top-10 bg-background border border-border rounded-lg shadow-xl z-50 py-1 min-w-[140px]">
                  {LANGUAGES.map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setShowLangMenu(false); }}
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
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {user ? (
              <div className="flex items-center gap-2">
                {sessionData.grade && (
                  <span className="hidden sm:flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium">
                    <GraduationCap className="w-3 h-3" />
                    {t(`grade.${sessionData.grade}`) || sessionData.grade}
                  </span>
                )}
                <div className="relative group">
                  <img
                    src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=7c3aed&color=fff`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border-2 border-primary/30 cursor-pointer"
                    title={user.name}
                  />
                  <div className="absolute right-0 top-10 bg-background border border-border rounded-lg shadow-xl z-50 py-1 min-w-[160px] hidden group-hover:block">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => setShowGradeModal(true)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center gap-2"
                    >
                      <GraduationCap className="w-4 h-4 text-primary" /> Change Grade
                    </button>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-accent text-destructive"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
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
                {!user ? (
                  <div className="p-3 border-t border-border mt-2">
                    <Button className="w-full bg-primary text-white gap-2" onClick={() => { setIsOpen(false); setShowLogin(true); }}>
                      <LogIn className="w-4 h-4" /> {t("login.button")}
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 border-t border-border mt-2 space-y-2">
                    <p className="text-xs text-muted-foreground px-1">Signed in as {user.name}</p>
                    {sessionData.grade && (
                      <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {t(`grade.${sessionData.grade}`) || sessionData.grade}
                      </div>
                    )}
                    <Button variant="outline" className="w-full gap-2 text-sm" onClick={() => { setIsOpen(false); setShowGradeModal(true); }}>
                      <GraduationCap className="w-4 h-4" /> Change Grade
                    </Button>
                    <Button variant="ghost" className="w-full text-destructive hover:text-destructive" onClick={logout}>
                      Sign out
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
              Sign in to save your career profile, track progress, and personalize your experience.
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
              onClick={handleGuestLogin}
            >
              <User className="w-4 h-4" />
              {t("login.guest")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showGradeModal} onOpenChange={setShowGradeModal}>
        <DialogContent className="sm:max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold flex items-center justify-center gap-2">
              <GraduationCap className="w-6 h-6 text-primary" />
              {t("grade.title")}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <p className="text-center text-muted-foreground text-sm">{t("grade.subtitle")}</p>
            <div className="grid grid-cols-2 gap-2.5">
              {GRADES.map(g => (
                <button
                  key={g.key}
                  onClick={() => setSelectedGrade(g.key)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedGrade === g.key
                      ? "border-primary bg-primary/15 text-primary shadow-sm"
                      : "border-border bg-card hover:border-primary/40 hover:bg-accent text-foreground"
                  }`}
                >
                  {selectedGrade === g.key ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-current opacity-30 shrink-0" />
                  )}
                  {t(g.labelKey)}
                </button>
              ))}
            </div>
            <Button
              className="w-full h-11 bg-primary hover:bg-primary/90 text-white mt-2"
              disabled={!selectedGrade}
              onClick={handleGradeConfirm}
            >
              {t("grade.confirm")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
