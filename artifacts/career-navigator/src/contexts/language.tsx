import { createContext, useContext, useState } from "react";

type Lang = "en" | "hi";

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const translations: Record<Lang, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.careers": "Careers",
    "nav.roadmap": "Roadmap",
    "nav.resume": "Resume",
    "nav.courses": "Courses",
    "nav.centers": "Centers",
    "nav.sattva": "Sattva",
    "hero.badge": "Empowering India's Youth",
    "hero.title1": "Navigate Your Future with",
    "hero.title2": "AI Precision",
    "hero.subtitle": "Discover your perfect career, analyze your skills, and get a step-by-step roadmap to success. Your personal AI career counselor, available 24/7.",
    "hero.placeholder": "Search your dream career...",
    "hero.cta": "Get Started",
    "hero.stat1": "Careers Mapped",
    "hero.stat2": "Match Accuracy",
    "hero.stat3": "AI Guidance",
    "fields.title": "Explore Fields",
    "fields.subtitle": "Find your passion across emerging industries",
    "features.title": "A Complete Career Ecosystem",
    "features.subtitle": "Everything you need to chart your course from learning to earning.",
    "cta.title": "Ready to find your calling?",
    "cta.subtitle": "Join thousands of students mapping their future with AI Career Navigator.",
    "cta.button": "Start Free Assessment",
    "footer.credit": "Designed by Team Sattva | Ignite 2K26",
    "login.button": "Sign in",
    "login.title": "Sign in to AI Career Navigator",
    "login.google": "Continue with Google",
    "login.guest": "Continue as Guest",
  },
  hi: {
    "nav.home": "होम",
    "nav.careers": "करियर",
    "nav.roadmap": "रोडमैप",
    "nav.resume": "रेज़ुमे",
    "nav.courses": "कोर्स",
    "nav.centers": "केंद्र",
    "nav.sattva": "सत्त्व",
    "hero.badge": "भारत के युवाओं को सशक्त बनाना",
    "hero.title1": "अपने भविष्य को नेविगेट करें",
    "hero.title2": "AI की सटीकता से",
    "hero.subtitle": "अपना परफेक्ट करियर खोजें, अपनी स्किल्स का विश्लेषण करें और सफलता का स्टेप-बाय-स्टेप रोडमैप पाएं।",
    "hero.placeholder": "अपना सपनों का करियर खोजें...",
    "hero.cta": "शुरू करें",
    "hero.stat1": "करियर मैप्ड",
    "hero.stat2": "मैच सटीकता",
    "hero.stat3": "AI मार्गदर्शन",
    "fields.title": "क्षेत्र खोजें",
    "fields.subtitle": "उभरते उद्योगों में अपना जुनून खोजें",
    "features.title": "एक पूर्ण करियर इकोसिस्टम",
    "features.subtitle": "सीखने से कमाने तक का सब कुछ।",
    "cta.title": "अपनी पुकार खोजने के लिए तैयार हैं?",
    "cta.subtitle": "हजारों छात्रों के साथ जुड़ें जो AI Career Navigator से अपना भविष्य बना रहे हैं।",
    "cta.button": "मुफ्त मूल्यांकन शुरू करें",
    "footer.credit": "टीम सत्त्व द्वारा | Ignite 2K26",
    "login.button": "साइन इन",
    "login.title": "AI Career Navigator में साइन इन करें",
    "login.google": "Google से जारी रखें",
    "login.guest": "अतिथि के रूप में जारी रखें",
  }
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("lang") as Lang) || "en";
    }
    return "en";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  const t = (key: string) => translations[lang][key] || translations["en"][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
