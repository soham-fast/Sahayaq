import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { projectId, publicAnonKey } from "/utils/supabase/info";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-9805af2d`;

// ── Types ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  role: "volunteer" | "ngo";
  name: string;
  // NGO-specific
  orgName?: string;
  orgType?: string;
  regNumber?: string;
  contactName?: string;
  // Volunteer-specific
  skills?: string[];
  createdAt?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  role: "volunteer" | "ngo";
  // Volunteer
  name?: string;
  skills?: string[];
  // NGO
  orgName?: string;
  orgType?: string;
  regNumber?: string;
  contactName?: string;
}

interface AuthResult {
  error?: string;
  user?: AuthUser;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (data: SignUpData) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "sahayaq_token";
const USER_KEY = "sahayaq_user";

const apiHeaders = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${publicAnonKey}`,
};

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from sessionStorage on mount
  useEffect(() => {
    const savedToken = sessionStorage.getItem(TOKEN_KEY);
    const savedUser = sessionStorage.getItem(USER_KEY);

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as AuthUser;
        setToken(savedToken);
        setUser(parsedUser);
      } catch (e) {
        console.log("Error restoring session:", e);
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
        sessionStorage.removeItem("sahayaq_session");
      }
    }
    setLoading(false);
  }, []);

  // ── Sign In ─────────────────────────────────────────────────────────────────
  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const res = await fetch(`${API_BASE}/auth/signin`, {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        console.log("Sign in error response:", data.error);
        return { error: data.error || "Sign in failed. Please try again." };
      }

      const authUser = data.user as AuthUser;
      setToken(data.accessToken);
      setUser(authUser);
      sessionStorage.setItem(TOKEN_KEY, data.accessToken);
      sessionStorage.setItem(USER_KEY, JSON.stringify(authUser));
      sessionStorage.setItem("sahayaq_session", "1");

      return { user: authUser };
    } catch (e) {
      console.log("Sign in network error:", e);
      return { error: "Network error. Please check your connection and try again." };
    }
  };

  // ── Sign Up ─────────────────────────────────────────────────────────────────
  const signUp = async (signUpData: SignUpData): Promise<AuthResult> => {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: apiHeaders,
        body: JSON.stringify(signUpData),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        console.log("Sign up error response:", data.error);
        return { error: data.error || "Registration failed. Please try again." };
      }

      // Auto sign in after successful registration
      return await signIn(signUpData.email, signUpData.password);
    } catch (e) {
      console.log("Sign up network error:", e);
      return { error: "Network error. Please check your connection and try again." };
    }
  };

  // ── Sign Out ────────────────────────────────────────────────────────────────
  const signOut = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE}/auth/signout`, {
          method: "POST",
          headers: { ...apiHeaders, Authorization: `Bearer ${token}` },
        });
      }
    } catch (e) {
      console.log("Sign out error (non-critical):", e);
    } finally {
      setUser(null);
      setToken(null);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
      sessionStorage.removeItem("sahayaq_session");
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
