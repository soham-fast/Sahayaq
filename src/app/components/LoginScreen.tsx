import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  Eye, EyeOff, Mail, Lock, User, Building2, Phone,
  ArrowRight, Check, AlertCircle, ChevronDown, X,
} from "lucide-react";
import logoImg from "figma:asset/3767293c23c9049c04651dc9d3779a80df70aba6.png";
import { useAuth, type SignUpData } from "../context/AuthContext";

// ── Types ─────────────────────────────────────────────────────────────────────
type Role = "volunteer" | "ngo";
type Mode = "signin" | "signup";

// ── Static data ───────────────────────────────────────────────────────────────
const VOLUNTEER_FEATURES = [
  { icon: "🗺️", title: "Find nearby needs",    desc: "See what your community needs right now" },
  { icon: "🤝", title: "Join a team instantly", desc: "Get matched with a role that fits you"    },
  { icon: "💙", title: "Track your impact",     desc: "See every life you've touched"            },
];

const NGO_FEATURES = [
  { icon: "📋", title: "Post tasks & needs",    desc: "Broadcast requests to nearby volunteers" },
  { icon: "👥", title: "Manage volunteer teams", desc: "Coordinate, assign, and communicate"     },
  { icon: "📊", title: "Measure real impact",   desc: "Live dashboards & detailed reports"      },
];

const VOLUNTEER_SKILLS = [
  { id: "first-aid",   label: "🚑 First Aid"   },
  { id: "cooking",     label: "🍳 Cooking"      },
  { id: "driving",     label: "🚗 Driving"      },
  { id: "logistics",   label: "📦 Logistics"    },
  { id: "childcare",   label: "👶 Childcare"    },
  { id: "translation", label: "🌐 Translation"  },
  { id: "tech",        label: "💻 Tech"         },
  { id: "counseling",  label: "💬 Counseling"   },
];

const NGO_TYPES = [
  "NGO / Non-Profit",
  "Government Agency",
  "Corporate Foundation",
  "Community Group",
  "Religious Organization",
  "Hospital / Healthcare",
  "Educational Institution",
  "Other",
];

// ── Role panel config ─────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  volunteer: {
    gradient: "linear-gradient(155deg, #0f766e 0%, #0d9488 40%, #0891b2 100%)",
    accentColor: "#0f766e",
    lightColor: "#ccfbf1",
    headline: "Real help,\nreal people,\nright now.",
    sub: "Sahayaq connects volunteers with the communities that need them most — simply, clearly, and quickly.",
    features: VOLUNTEER_FEATURES,
    proof: { count: "4,200+", label: "volunteers joined", initials: ["AK","DM","SR","LT","MO"] },
  },
  ngo: {
    gradient: "linear-gradient(155deg, #1e40af 0%, #2563eb 40%, #0284c7 100%)",
    accentColor: "#2563eb",
    lightColor: "#dbeafe",
    headline: "Coordinate help.\nAmplify impact.",
    sub: "Sahayaq gives your organization the tools to mobilize volunteers, post needs, and measure real community impact.",
    features: NGO_FEATURES,
    proof: { count: "380+", label: "organizations active", initials: ["WH","RC","IM","UN","CW"] },
  },
};

// ── Component ─────────────────────────────────────────────────────────────────
export function LoginScreen() {
  const navigate   = useNavigate();
  const { signIn, signUp } = useAuth();

  const [role,     setRole]     = useState<Role>("volunteer");
  const [mode,     setMode]     = useState<Mode>("signin");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);
  const [agreed,   setAgreed]   = useState(false);
  const [error,    setError]    = useState("");
  const [skills,   setSkills]   = useState<string[]>([]);
  const [orgType,  setOrgType]  = useState("");
  const [orgTypeOpen, setOrgTypeOpen] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", password: "",
    orgName: "", contactName: "", regNumber: "",
  });

  const cfg = ROLE_CONFIG[role];

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(p => ({ ...p, [k]: e.target.value }));
      if (error) setError("");
    };

  const toggleSkill = (id: string) =>
    setSkills(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id]);

  const switchRole = (r: Role) => {
    setRole(r);
    setError("");
    setDone(false);
    setForm({ name: "", email: "", password: "", orgName: "", contactName: "", regNumber: "" });
    setSkills([]);
    setOrgType("");
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError("");
    setDone(false);
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup" && !agreed) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }
    if (mode === "signup" && role === "ngo" && !orgType) {
      setError("Please select your organisation type.");
      return;
    }

    setLoading(true);
    setError("");

    let result: { error?: string; user?: { role: string } };

    if (mode === "signin") {
      result = await signIn(form.email, form.password);
    } else {
      const payload: SignUpData = {
        email: form.email,
        password: form.password,
        role,
        ...(role === "volunteer"
          ? { name: form.name, skills }
          : { orgName: form.orgName, contactName: form.contactName, orgType, regNumber: form.regNumber }),
      };
      result = await signUp(payload);
    }

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setDone(true);
    const destination = result.user?.role === "ngo" ? "/control" : "/volunteer";
    setTimeout(() => navigate(destination), 900);
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--bg)", fontFamily: "var(--font)" }}
    >
      {/* ── Left panel (desktop only) ───────────────────────────────────── */}
      <motion.div
        key={role}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="hidden lg:flex flex-col justify-between w-5/12 xl:w-1/2 p-12 relative overflow-hidden"
        style={{ background: cfg.gradient }}
      >
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { size: 420, top: "-80px",  right: "-100px", opacity: 0.08 },
            { size: 260, top: "30%",    left:  "-60px",  opacity: 0.07 },
            { size: 200, bottom: "5%",  right: "10%",    opacity: 0.09 },
            { size: 100, top: "20%",    right: "15%",    opacity: 0.12 },
          ].map((c, i) => (
            <div
              key={i}
              className="rounded-full absolute"
              style={{
                width: c.size, height: c.size,
                top: c.top, left: c.left, right: c.right, bottom: c.bottom,
                background: `rgba(255,255,255,${c.opacity})`,
              }}
            />
          ))}
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <div
              className="rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(12px)",
                border: "1.5px solid rgba(255,255,255,0.25)",
                padding: "10px",
              }}
            >
              <img
                src={logoImg}
                alt="Sahayaq logo"
                style={{ height: "48px", width: "48px", objectFit: "contain", filter: "brightness(0) invert(1)" }}
              />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: "28px", color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                Sahayaq
              </div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginTop: "3px" }}>
                Where help finds you
              </div>
            </div>
          </motion.div>
        </div>

        {/* Headline + features */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.55 }}
          >
            <h1 style={{ fontWeight: 900, fontSize: "38px", lineHeight: 1.2, color: "#fff", letterSpacing: "-0.02em", marginBottom: "16px", whiteSpace: "pre-line" }}>
              {cfg.headline}
            </h1>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.75)", fontWeight: 500, lineHeight: 1.65, maxWidth: "340px" }}>
              {cfg.sub}
            </p>
          </motion.div>

          <div className="mt-10 space-y-5">
            {cfg.features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-4"
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
                >
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: "#fff" }}>{f.title}</div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="mt-10 flex items-center gap-3"
          >
            <div className="flex -space-x-2">
              {cfg.proof.initials.map((init, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: `rgba(255,255,255,${0.15 + i * 0.04})`,
                    border: "2px solid rgba(255,255,255,0.3)",
                    fontSize: "9px", fontWeight: 800, color: "#fff", zIndex: 5 - i,
                  }}
                >
                  {init}
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "13px", color: "#fff" }}>
                {cfg.proof.count} {cfg.proof.label}
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>
                making a difference every day
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Right panel (form) ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 lg:py-8 overflow-y-auto">

        {/* Mobile logo */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="lg:hidden flex flex-col items-center mb-8 gap-3"
        >
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-2xl"
            style={{ background: "var(--teal-light)", border: "1.5px solid #99f6e4", boxShadow: "0 4px 20px rgba(13,148,136,0.12)" }}
          >
            <img src={logoImg} alt="Sahayaq logo" style={{ height: "44px", width: "44px", objectFit: "contain" }} />
            <div>
              <div style={{ fontWeight: 900, fontSize: "22px", color: "var(--text)", letterSpacing: "-0.03em", lineHeight: 1.1 }}>Sahayaq</div>
              <div style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 600, letterSpacing: "0.03em", textTransform: "uppercase" }}>Where help finds you</div>
            </div>
          </div>
        </motion.div>

        <div className="w-full max-w-sm">

          {/* ── Role Selector ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px", textAlign: "center" }}>
              I am joining as
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(["volunteer", "ngo"] as Role[]).map(r => {
                const isActive = role === r;
                const rc = ROLE_CONFIG[r];
                return (
                  <motion.button
                    key={r}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => switchRole(r)}
                    className="flex flex-col items-center gap-2 py-4 px-3 rounded-2xl relative overflow-hidden"
                    style={{
                      background: isActive ? `${rc.accentColor}10` : "var(--surface)",
                      border: isActive ? `2px solid ${rc.accentColor}` : "2px solid var(--border)",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="roleCheck"
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: rc.accentColor }}
                      >
                        <Check size={11} color="#fff" strokeWidth={3} />
                      </motion.div>
                    )}
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl"
                      style={{
                        background: isActive ? `${rc.accentColor}18` : "var(--surface-2)",
                        border: isActive ? `1.5px solid ${rc.accentColor}30` : "1.5px solid var(--border)",
                      }}
                    >
                      {r === "volunteer" ? "🤝" : "🏢"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "13px", color: isActive ? rc.accentColor : "var(--text)", textAlign: "center" }}>
                        {r === "volunteer" ? "Volunteer" : "NGO / Org"}
                      </div>
                      <div style={{ fontSize: "10px", color: "var(--text-3)", fontWeight: 500, textAlign: "center", marginTop: "2px" }}>
                        {r === "volunteer" ? "I want to help" : "We coordinate help"}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* ── Sign in / Sign up tabs ─────────────────────────────────────── */}
          <div
            className="flex gap-1 p-1 rounded-2xl mb-6"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            {(["signin", "signup"] as Mode[]).map(m => (
              <motion.button
                key={m}
                whileTap={{ scale: 0.95 }}
                onClick={() => switchMode(m)}
                className="flex-1 py-2.5 rounded-xl"
                style={{
                  background: mode === m ? cfg.accentColor : "transparent",
                  color: mode === m ? "#fff" : "var(--text-3)",
                  fontWeight: 700, fontSize: "13px", fontFamily: "var(--font)",
                  boxShadow: mode === m ? `0 2px 8px ${cfg.accentColor}40` : "none",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                {m === "signin" ? "Sign in" : "Sign up"}
              </motion.button>
            ))}
          </div>

          {/* ── Heading ────────────────────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${role}-${mode}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <h2 style={{ fontWeight: 800, fontSize: "22px", color: "var(--text)", marginBottom: "4px", letterSpacing: "-0.01em" }}>
                {mode === "signin"
                  ? (role === "volunteer" ? "Welcome back, helper 👋" : "Welcome back, team 👋")
                  : (role === "volunteer" ? "Join as a Volunteer" : "Register your Organisation")}
              </h2>
              <p style={{ fontSize: "13px", color: "var(--text-3)", fontWeight: 500, marginBottom: "20px" }}>
                {mode === "signin"
                  ? "Sign in to continue making a difference."
                  : role === "volunteer"
                    ? "Create your account and start helping today."
                    : "Set up your org account and mobilise volunteers."}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* ── Error Banner ───────────────────────────────────────────────── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                className="flex items-start gap-3 p-3 rounded-xl mb-4"
                style={{ background: "#fef2f2", border: "1.5px solid #fecaca" }}
              >
                <AlertCircle size={15} style={{ color: "#dc2626", flexShrink: 0, marginTop: "2px" }} />
                <span style={{ fontSize: "12px", color: "#b91c1c", fontWeight: 500, lineHeight: 1.5 }}>{error}</span>
                <button onClick={() => setError("")} className="ml-auto flex-shrink-0">
                  <X size={13} style={{ color: "#b91c1c" }} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Form ───────────────────────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            <motion.form
              key={`form-${role}-${mode}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* ── VOLUNTEER SIGNUP FIELDS ── */}
              {mode === "signup" && role === "volunteer" && (
                <Field label="Full name" icon={<User size={14} style={{ color: "var(--text-4)" }} />}>
                  <input
                    type="text" placeholder="Your name"
                    value={form.name} onChange={set("name")}
                    className="w-full pl-10 pr-4 py-3 rounded-xl outline-none"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = cfg.accentColor)}
                    onBlur={e => (e.target.style.borderColor = "var(--border)")}
                    required
                  />
                </Field>
              )}

              {/* ── NGO SIGNUP FIELDS ── */}
              {mode === "signup" && role === "ngo" && (
                <>
                  <Field label="Organisation name" icon={<Building2 size={14} style={{ color: "var(--text-4)" }} />}>
                    <input
                      type="text" placeholder="Your organisation's name"
                      value={form.orgName} onChange={set("orgName")}
                      className="w-full pl-10 pr-4 py-3 rounded-xl outline-none"
                      style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = cfg.accentColor)}
                      onBlur={e => (e.target.style.borderColor = "var(--border)")}
                      required
                    />
                  </Field>

                  <Field label="Contact person name" icon={<User size={14} style={{ color: "var(--text-4)" }} />}>
                    <input
                      type="text" placeholder="Coordinator's name"
                      value={form.contactName} onChange={set("contactName")}
                      className="w-full pl-10 pr-4 py-3 rounded-xl outline-none"
                      style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = cfg.accentColor)}
                      onBlur={e => (e.target.style.borderColor = "var(--border)")}
                      required
                    />
                  </Field>

                  {/* Org Type Dropdown */}
                  <div>
                    <label style={labelStyle}>Organisation type</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setOrgTypeOpen(p => !p)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl"
                        style={{
                          ...inputStyle,
                          paddingLeft: "16px",
                          borderColor: orgTypeOpen ? cfg.accentColor : "var(--border)",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <span style={{ fontSize: "14px", color: orgType ? "var(--text)" : "var(--text-4)", fontFamily: "var(--font)" }}>
                          {orgType || "Select org type…"}
                        </span>
                        <motion.span animate={{ rotate: orgTypeOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown size={15} style={{ color: "var(--text-3)" }} />
                        </motion.span>
                      </button>
                      <AnimatePresence>
                        {orgTypeOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.98 }}
                            className="absolute left-0 right-0 top-full mt-1 rounded-xl overflow-hidden z-20"
                            style={{ background: "var(--surface)", border: "1.5px solid var(--border)", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
                          >
                            {NGO_TYPES.map(t => (
                              <button
                                key={t} type="button"
                                onClick={() => { setOrgType(t); setOrgTypeOpen(false); if (error) setError(""); }}
                                className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors"
                                style={{ fontSize: "13px", color: orgType === t ? cfg.accentColor : "var(--text)", fontWeight: orgType === t ? 700 : 500, fontFamily: "var(--font)" }}
                              >
                                {t}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Reg number (optional) */}
                  <div>
                    <label style={labelStyle}>Registration number <span style={{ color: "var(--text-4)", fontWeight: 400 }}>(optional)</span></label>
                    <input
                      type="text" placeholder="e.g. 80G / FCRA / Trust Deed No."
                      value={form.regNumber} onChange={set("regNumber")}
                      className="w-full px-4 py-3 rounded-xl outline-none"
                      style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = cfg.accentColor)}
                      onBlur={e => (e.target.style.borderColor = "var(--border)")}
                    />
                  </div>
                </>
              )}

              {/* ── EMAIL (both modes, both roles) ── */}
              <Field label="Email address" icon={<Mail size={14} style={{ color: "var(--text-4)" }} />}>
                <input
                  type="email" placeholder="you@example.com"
                  value={form.email} onChange={set("email")}
                  className="w-full pl-10 pr-4 py-3 rounded-xl outline-none"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = cfg.accentColor)}
                  onBlur={e => (e.target.style.borderColor = "var(--border)")}
                  required
                />
              </Field>

              {/* ── PASSWORD ── */}
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: "7px" }}>
                  <label style={labelStyle}>Password</label>
                  {mode === "signin" && (
                    <button type="button" style={{ fontSize: "12px", color: cfg.accentColor, fontWeight: 600, fontFamily: "var(--font)" }}>
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-4)" }} />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder={mode === "signup" ? "Create a strong password" : "Enter your password"}
                    value={form.password} onChange={set("password")}
                    className="w-full pl-10 pr-12 py-3 rounded-xl outline-none"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = cfg.accentColor)}
                    onBlur={e => (e.target.style.borderColor = "var(--border)")}
                    required
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    {showPass
                      ? <EyeOff size={14} style={{ color: "var(--text-3)" }} />
                      : <Eye    size={14} style={{ color: "var(--text-3)" }} />}
                  </button>
                </div>
                {mode === "signup" && form.password.length > 0 && (
                  <PasswordStrength password={form.password} />
                )}
              </div>

              {/* ── VOLUNTEER SKILLS (optional, signup only) ── */}
              {mode === "signup" && role === "volunteer" && (
                <div>
                  <label style={{ ...labelStyle, marginBottom: "8px", display: "block" }}>
                    Skills <span style={{ color: "var(--text-4)", fontWeight: 400 }}>(optional)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {VOLUNTEER_SKILLS.map(s => {
                      const active = skills.includes(s.id);
                      return (
                        <motion.button
                          key={s.id} type="button"
                          whileTap={{ scale: 0.93 }}
                          onClick={() => toggleSkill(s.id)}
                          className="px-3 py-1.5 rounded-full"
                          style={{
                            fontSize: "12px", fontWeight: 600,
                            background: active ? `${cfg.accentColor}14` : "var(--surface)",
                            border: `1.5px solid ${active ? cfg.accentColor : "var(--border)"}`,
                            color: active ? cfg.accentColor : "var(--text-2)",
                            fontFamily: "var(--font)", cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          {s.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── TERMS (signup only) ── */}
              {mode === "signup" && (
                <label className="flex items-start gap-3 cursor-pointer">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setAgreed(p => !p)}
                    className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: agreed ? cfg.accentColor : "var(--surface)",
                      border: `2px solid ${agreed ? cfg.accentColor : "var(--border)"}`,
                      transition: "all 0.18s",
                    }}
                  >
                    {agreed && <Check size={11} color="#fff" strokeWidth={3} />}
                  </motion.button>
                  <span style={{ fontSize: "12px", color: "var(--text-3)", lineHeight: 1.55 }}>
                    I agree to Sahayaq's{" "}
                    <span style={{ color: cfg.accentColor, fontWeight: 600 }}>Terms of Service</span>
                    {" "}and{" "}
                    <span style={{ color: cfg.accentColor, fontWeight: 600 }}>Privacy Policy</span>
                  </span>
                </label>
              )}

              {/* ── Submit button ── */}
              <SubmitButton
                loading={loading}
                done={done}
                accentColor={cfg.accentColor}
                label={
                  mode === "signin"
                    ? (role === "volunteer" ? "Sign in as Volunteer" : "Sign in as Organisation")
                    : (role === "volunteer" ? "Create Volunteer Account" : "Register Organisation")
                }
              />
            </motion.form>
          </AnimatePresence>

          {/* ── Switch mode link ────────────────────────────────────────────── */}
          <p className="text-center mt-5" style={{ fontSize: "13px", color: "var(--text-3)", fontWeight: 500 }}>
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
              style={{ color: cfg.accentColor, fontWeight: 700, fontFamily: "var(--font)" }}
            >
              {mode === "signin" ? "Join Sahayaq" : "Sign in"}
            </button>
          </p>

          {/* ── Guest link ──────────────────────────────────────────────────── */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              sessionStorage.setItem("sahayaq_session", "1");
              navigate("/");
            }}
            className="w-full mt-3 py-3 rounded-xl flex items-center justify-center gap-2"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              fontSize: "13px", fontWeight: 600, color: "var(--text-3)",
              fontFamily: "var(--font)", cursor: "pointer",
            }}
          >
            Continue exploring as guest <ArrowRight size={14} />
          </motion.button>

          {/* ── Divider ─────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span style={{ fontSize: "11px", color: "var(--text-4)", fontWeight: 500 }}>or sign in with</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          {/* ── Social buttons ───────────────────────────────────────────────── */}
          <div className="flex gap-3">
            <SocialBtn label="Google" icon={
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            } />
            <SocialBtn label="Phone" icon={<Phone size={15} style={{ color: "var(--text-2)" }} />} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1.5px solid var(--border)",
  fontSize: "14px",
  color: "var(--text)",
  fontFamily: "var(--font)",
  transition: "border-color 0.2s",
  width: "100%",
};

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 700,
  color: "var(--text-2)",
  display: "block",
  marginBottom: "7px",
};

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2">{icon}</span>
        {children}
      </div>
    </div>
  );
}

function SocialBtn({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}
      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl"
      style={{
        background: "var(--surface)",
        border: "1.5px solid var(--border)",
        boxShadow: "var(--shadow-xs)",
        fontSize: "13px", fontWeight: 600,
        color: "var(--text-2)", fontFamily: "var(--font)",
        cursor: "pointer",
      }}
    >
      {icon} {label}
    </motion.button>
  );
}

function SubmitButton({ loading, done, label, accentColor }: {
  loading: boolean; done: boolean; label: string; accentColor: string;
}) {
  return (
    <motion.button
      type="submit"
      whileHover={!loading && !done ? { scale: 1.02 } : {}}
      whileTap={{ scale: 0.97 }}
      className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 mt-1"
      style={{
        background: done ? "#059669" : accentColor,
        color: "#fff",
        fontWeight: 700, fontSize: "15px", fontFamily: "var(--font)",
        boxShadow: `0 3px 14px ${accentColor}45`,
        transition: "background 0.3s",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.85 : 1,
      }}
    >
      <AnimatePresence mode="wait">
        {done ? (
          <motion.span key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
            <Check size={18} strokeWidth={2.5} /> All set! Redirecting…
          </motion.span>
        ) : loading ? (
          <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
            <motion.svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </motion.svg>
            Just a moment…
          </motion.span>
        ) : (
          <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const colors = ["#e11d48", "#b45309", "#2563eb", "#059669"];
  const labels = ["Too short", "Weak", "Good", "Strong"];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map(i => (
          <motion.div
            key={i}
            className="flex-1 rounded-full"
            style={{ height: "4px", background: i < score ? colors[score - 1] : "var(--border-light)", transition: "background 0.3s" }}
          />
        ))}
      </div>
      {score > 0 && (
        <span style={{ fontSize: "11px", color: colors[score - 1], fontWeight: 600 }}>
          {labels[score - 1]}
        </span>
      )}
    </div>
  );
}