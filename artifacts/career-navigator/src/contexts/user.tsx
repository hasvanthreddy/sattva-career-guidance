import { createContext, useContext, useState, useCallback } from "react";

export interface UserProfile {
  name: string;
  email: string;
  picture?: string;
}

export interface UserSessionData {
  grade: string;
  interests: string;
  lastPage: string;
  lastActiveIST: string;
  needsGradeSelection: boolean;
}

interface UserContextType {
  user: UserProfile | null;
  sessionData: UserSessionData;
  login: (profile: UserProfile) => { isReturning: boolean; lastPage: string; lastActiveIST: string };
  logout: () => void;
  setGrade: (grade: string) => void;
  setInterests: (interests: string) => void;
  trackPage: (page: string) => void;
  setUserData: (key: string, value: string) => void;
  getUserData: (key: string) => string | null;
  removeUserData: (key: string) => void;
}

function userKey(email: string, key: string) {
  return `sattva_${email.replace(/[^a-zA-Z0-9]/g, "_")}_${key}`;
}

function getIST(): string {
  return new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: true });
}

function loadSessionData(email: string): UserSessionData {
  const grade = localStorage.getItem(userKey(email, "grade")) || "";
  const interests = localStorage.getItem(userKey(email, "interests")) || "";
  const lastPage = localStorage.getItem(userKey(email, "lastPage")) || "";
  const lastActiveIST = localStorage.getItem(userKey(email, "lastActiveIST")) || "";
  return { grade, interests, lastPage, lastActiveIST, needsGradeSelection: !grade };
}

const defaultSession: UserSessionData = {
  grade: "",
  interests: "",
  lastPage: "",
  lastActiveIST: "",
  needsGradeSelection: false,
};

const UserContext = createContext<UserContextType>({
  user: null,
  sessionData: defaultSession,
  login: () => ({ isReturning: false, lastPage: "", lastActiveIST: "" }),
  logout: () => {},
  setGrade: () => {},
  setInterests: () => {},
  trackPage: () => {},
  setUserData: () => {},
  getUserData: () => null,
  removeUserData: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("sattva_user");
    if (saved) { try { return JSON.parse(saved); } catch {} }
    return null;
  });

  const [sessionData, setSessionData] = useState<UserSessionData>(() => {
    const saved = localStorage.getItem("sattva_user");
    if (saved) {
      try {
        const u = JSON.parse(saved) as UserProfile;
        return loadSessionData(u.email);
      } catch {}
    }
    return defaultSession;
  });

  const login = useCallback((profile: UserProfile) => {
    const existing = localStorage.getItem(userKey(profile.email, "lastActiveIST"));
    const isReturning = !!existing;
    const lastPage = localStorage.getItem(userKey(profile.email, "lastPage")) || "";
    const lastActiveIST = existing || "";

    localStorage.setItem("sattva_user", JSON.stringify(profile));
    setUser(profile);
    setSessionData(loadSessionData(profile.email));

    return { isReturning, lastPage, lastActiveIST };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("sattva_user");
    setUser(null);
    setSessionData(defaultSession);
  }, []);

  const setGrade = useCallback((grade: string) => {
    if (!user) return;
    localStorage.setItem(userKey(user.email, "grade"), grade);
    setSessionData(prev => ({ ...prev, grade, needsGradeSelection: false }));
  }, [user]);

  const setInterests = useCallback((interests: string) => {
    if (!user) return;
    localStorage.setItem(userKey(user.email, "interests"), interests);
    setSessionData(prev => ({ ...prev, interests }));
  }, [user]);

  const trackPage = useCallback((page: string) => {
    if (!user) return;
    const ist = getIST();
    localStorage.setItem(userKey(user.email, "lastPage"), page);
    localStorage.setItem(userKey(user.email, "lastActiveIST"), ist);
    setSessionData(prev => ({ ...prev, lastPage: page, lastActiveIST: ist }));
  }, [user]);

  const setUserData = useCallback((key: string, value: string) => {
    const k = user ? userKey(user.email, key) : `sattva_guest_${key}`;
    localStorage.setItem(k, value);
  }, [user]);

  const getUserData = useCallback((key: string) => {
    const k = user ? userKey(user.email, key) : `sattva_guest_${key}`;
    return localStorage.getItem(k);
  }, [user]);

  const removeUserData = useCallback((key: string) => {
    const k = user ? userKey(user.email, key) : `sattva_guest_${key}`;
    localStorage.removeItem(k);
  }, [user]);

  return (
    <UserContext.Provider value={{
      user, sessionData, login, logout, setGrade, setInterests,
      trackPage, setUserData, getUserData, removeUserData,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
