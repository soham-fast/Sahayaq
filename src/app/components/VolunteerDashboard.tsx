import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin, CheckCircle2, Users, Zap, ChevronRight,
  Star, TrendingUp, Clock, Bell, Award, Phone, X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import { toast } from "sonner";

// ── Static mock data ──────────────────────────────────────────────────────────
const MY_TASK = {
  title: "Food Distribution – Sector 7",
  icon: "🍽️",
  location: "Sector 7 Community Hall",
  urgency: "Critical",
  teamSize: 8,
  lead: "Anika S.",
  checkIn: "10:30 AM",
  progress: 44,
  totalNeeded: 18,
};

const NEARBY_TASKS = [
  { id: 2, title: "Water Purification",    icon: "💧", location: "South Zone",    urgency: "Critical", cat: "Water",     dist: "0.8 km", needed: 4 },
  { id: 3, title: "Learning Support",       icon: "📖", location: "North Quarter", urgency: "Normal",   cat: "Education", dist: "1.2 km", needed: 7 },
  { id: 4, title: "Shelter Repair – West", icon: "🏠", location: "West Camp",     urgency: "High",     cat: "Shelter",   dist: "2.1 km", needed: 6 },
];

const ACTIVITY = [
  { id: 1, name: "Chen W.",   action: "checked in for Medical Aid",   time: "5m ago",  icon: "🏥" },
  { id: 2, name: "Anika S.",  action: "completed food run #3",         time: "18m ago", icon: "✅" },
  { id: 3, name: "Priya N.",  action: "joined Learning Support",       time: "32m ago", icon: "📖" },
  { id: 4, name: "Leena T.",  action: "delivered 40 food packets",     time: "1h ago",  icon: "🍽️" },
];

const BADGES = [
  { icon: "🥇", name: "Food Friend", earned: true,  color: "#0f766e" },
  { icon: "🔥", name: "7-Day Streak",earned: true,  color: "#b45309" },
  { icon: "🤝", name: "Team Player", earned: true,  color: "#2563eb" },
  { icon: "💙", name: "Life Changer",earned: false, pct: 68, color: "#7c3aed" },
];

const URGENCY = {
  Critical: { color: "#e11d48", bg: "#fff1f2",           border: "#fecaca" },
  High:     { color: "#b45309", bg: "var(--amber-light)", border: "#fde68a" },
  Normal:   { color: "#059669", bg: "var(--green-light)", border: "#bbf7d0" },
};

const XP = 7820, XP_NEXT = 10000, LEVEL = 14;

// ── Component ─────────────────────────────────────────────────────────────────
export function VolunteerDashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const firstName = (user?.name || user?.email || "Volunteer").split(/\s+/)[0];
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const [checkedIn,  setCheckedIn]  = useState(false);
  const [joined,     setJoined]     = useState<number | null>(null);
  const [activeTab,  setActiveTab]  = useState<"overview" | "tasks" | "impact">("overview");
  const [showLogTime, setShowLogTime] = useState(false);
  const [loggedHrs,   setLoggedHrs]   = useState<string | null>(null);

  return (
    <div className="h-full overflow-y-auto" style={{ background: "var(--bg)", fontFamily: "var(--font)" }}>

      {/* ── Sticky greeting header ─────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-10 px-4 py-4"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p style={{ fontSize: "11px", color: "var(--teal)", fontWeight: 700, letterSpacing: "0.02em" }}>
              {greeting} 👋
            </p>
            <h1 style={{ fontWeight: 900, fontSize: "20px", color: "var(--text)", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
              {firstName}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
              style={{ background: "var(--amber-light)", border: "1px solid #fde68a" }}>
              <span style={{ fontSize: "13px" }}>🔥</span>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#b45309" }}>7-day streak</span>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { toast.info("🔔 Checking notifications…"); }}
              className="w-9 h-9 rounded-xl flex items-center justify-center gs-card cursor-pointer"
            >
              <Bell size={15} style={{ color: "var(--text-3)" }} />
            </motion.button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
          {([
            { id: "overview", label: "Overview", icon: "🏠" },
            { id: "tasks",    label: "Tasks",    icon: "📋" },
            { id: "impact",   label: "Impact",   icon: "💙" },
          ] as const).map(t => (
            <motion.button
              key={t.id}
              whileTap={{ scale: 0.94 }}
              onClick={() => setActiveTab(t.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl"
              style={{
                background:  activeTab === t.id ? "var(--surface)" : "transparent",
                boxShadow:   activeTab === t.id ? "var(--shadow-sm)" : "none",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: "12px" }}>{t.icon}</span>
              <span style={{ fontSize: "11px", fontWeight: 700, color: activeTab === t.id ? "var(--text)" : "var(--text-3)" }}>
                {t.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Tab content ────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          className="p-4 space-y-4"
        >

          {/* ──────────────── OVERVIEW ──────────────── */}
          {activeTab === "overview" && (
            <>
              {/* XP / Level card */}
              <div className="gs-card p-4"
                style={{ background: "linear-gradient(135deg, var(--teal-pale), var(--surface))", border: "1.5px solid #99f6e4" }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span style={{ fontWeight: 900, fontSize: "32px", color: "var(--teal)", lineHeight: 1 }}>Lv.{LEVEL}</span>
                    <p style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 600, marginTop: "3px" }}>
                      Community Volunteer
                    </p>
                  </div>
                  <div className="text-right">
                    <div style={{ fontWeight: 900, fontSize: "28px", color: "var(--teal)", lineHeight: 1 }}>342</div>
                    <div style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 600 }}>people helped</div>
                  </div>
                </div>
                <div className="mb-1.5">
                  <div className="flex justify-between mb-1">
                    <span style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 600 }}>
                      Progress to Level {LEVEL + 1}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--teal)", fontWeight: 800 }}>
                      {XP.toLocaleString()} / {XP_NEXT.toLocaleString()} pts
                    </span>
                  </div>
                  <div className="gs-progress" style={{ height: "8px" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(XP / XP_NEXT) * 100}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="gs-progress-fill"
                      style={{ background: "linear-gradient(90deg, var(--teal), #2dd4bf)" }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="gs-chip gs-chip-teal"  style={{ fontSize: "10px" }}>⭐ Top 5%</span>
                  <span className="gs-chip gs-chip-green" style={{ fontSize: "10px" }}>29 missions</span>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Hours today",  value: "4.5", icon: "⏱️", color: "#0f766e" },
                  { label: "Tasks done",   value: "3",   icon: "✅", color: "#059669" },
                  { label: "XP earned",    value: "+350",icon: "⭐", color: "#b45309" },
                ].map(s => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="gs-card p-3 flex flex-col items-center gap-1"
                  >
                    <span style={{ fontSize: "18px" }}>{s.icon}</span>
                    <span style={{ fontWeight: 900, fontSize: "20px", color: s.color, lineHeight: 1 }}>{s.value}</span>
                    <span style={{ fontSize: "10px", color: "var(--text-3)", fontWeight: 600, textAlign: "center" }}>
                      {s.label}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Active task summary */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontWeight: 800, fontSize: "14px", color: "var(--text)" }}>Your Active Task</span>
                  <span className="gs-chip gs-chip-rose" style={{ fontSize: "10px" }}>🔴 Critical</span>
                </div>
                <div className="gs-card p-4" style={{ border: "1.5px solid #fecaca" }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: "#fff1f2", border: "1px solid #fecaca" }}>
                      {MY_TASK.icon}
                    </div>
                    <div className="flex-1">
                      <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>{MY_TASK.title}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <MapPin size={11} style={{ color: "var(--text-4)" }} />
                        <span style={{ fontSize: "11px", color: "var(--text-3)" }}>{MY_TASK.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                      { label: "Team lead", value: `👤 ${MY_TASK.lead}` },
                      { label: "Check-in",  value: `⏰ ${MY_TASK.checkIn}` },
                    ].map(item => (
                      <div key={item.label} className="p-2 rounded-xl"
                        style={{ background: "var(--surface-2)", border: "1px solid var(--border-light)" }}>
                        <div style={{ fontSize: "10px", color: "var(--text-3)", fontWeight: 600 }}>{item.label}</div>
                        <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text)", marginTop: "2px" }}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span style={{ fontSize: "11px", color: "var(--text-2)", fontWeight: 600 }}>
                        <Users size={11} className="inline mr-1" />
                        {MY_TASK.teamSize} / {MY_TASK.totalNeeded} volunteers
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: "#e11d48" }}>
                        {MY_TASK.progress}%
                      </span>
                    </div>
                    <div className="gs-progress" style={{ height: "7px" }}>
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${MY_TASK.progress}%` }}
                        transition={{ duration: 0.8 }}
                        className="gs-progress-fill"
                        style={{ background: "#e11d48" }}
                      />
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      if (user?.role === "ngo") {
                        toast.info("NGO accounts manage tasks — switch to volunteer to check in.");
                        return;
                      }
                      setCheckedIn(p => !p);
                      if (!checkedIn) toast.success("✅ Checked in! Your team has been notified.");
                      else toast.info("Check-in removed.");
                    }}
                    className="w-full py-3 rounded-2xl flex items-center justify-center gap-2"
                    style={{
                      background:  checkedIn ? "#059669" : "var(--teal)",
                      color: "#fff", fontWeight: 800, fontSize: "14px",
                      fontFamily: "var(--font)", cursor: "pointer",
                      boxShadow: checkedIn
                        ? "0 4px 16px rgba(5,150,105,0.30)"
                        : "0 4px 16px rgba(15,118,110,0.30)",
                      transition: "background 0.3s",
                    }}
                  >
                    {checkedIn
                      ? <><CheckCircle2 size={16} /> Checked in ✓</>
                      : <><Zap size={16} /> Check in to task</>}
                  </motion.button>
                </div>
              </div>

              {/* Badges preview */}
              <div className="gs-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Award size={14} style={{ color: "#b45309" }} />
                    <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>Your Badges</span>
                  </div>
                  <button
                    onClick={() => setActiveTab("impact")}
                    className="flex items-center gap-1"
                    style={{ fontSize: "12px", color: "var(--teal)", fontWeight: 600, fontFamily: "var(--font)", cursor: "pointer" }}
                  >
                    See all <ChevronRight size={13} />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {BADGES.map((b, i) => (
                    <motion.div
                      key={b.name}
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ delay: i * 0.07, type: "spring", stiffness: 300 }}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl relative"
                        style={{
                          background: b.earned ? "var(--teal-light)" : "var(--surface-2)",
                          border: b.earned ? "1.5px solid #99f6e4" : "1.5px solid var(--border)",
                          opacity: b.earned ? 1 : 0.55,
                        }}
                      >
                        {b.icon}
                        {!b.earned && b.pct && (
                          <div className="absolute -bottom-1 -right-1 px-1 rounded-full"
                            style={{ background: b.color, fontSize: "8px", color: "#fff", fontWeight: 800 }}>
                            {b.pct}%
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: "9px", fontWeight: 700, color: b.earned ? b.color : "var(--text-4)", textAlign: "center" }}>
                        {b.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Team activity */}
              <div className="gs-card overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3.5"
                  style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <div className="flex items-center gap-2">
                    <Users size={14} style={{ color: "var(--blue)" }} />
                    <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>Team Activity</span>
                  </div>
                  <span className="gs-dot gs-dot-green gs-soft-pulse" />
                </div>
                {ACTIVITY.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ borderBottom: i < ACTIVITY.length - 1 ? "1px solid var(--border-light)" : "none" }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                      {a.icon}
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: "12px", color: "var(--text-2)", fontWeight: 500 }}>
                        <span style={{ fontWeight: 700, color: "var(--text)" }}>{a.name}</span> {a.action}
                      </p>
                      <p style={{ fontSize: "10px", color: "var(--text-4)", marginTop: "1px" }}>{a.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* ──────────────── TASKS ──────────────── */}
          {activeTab === "tasks" && (
            <>
              {/* Current task (full view) */}
              <div>
                <p style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "10px" }}>
                  Currently Assigned
                </p>
                <div className="gs-card p-5" style={{ border: "1.5px solid #fecaca" }}>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: "#fff1f2", border: "1px solid #fecaca" }}>
                      {MY_TASK.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "15px", color: "var(--text)" }}>{MY_TASK.title}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin size={11} style={{ color: "var(--text-4)" }} />
                        <span style={{ fontSize: "11px", color: "var(--text-3)" }}>{MY_TASK.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { label: "Team size",  val: `${MY_TASK.teamSize} volunteers`, icon: "👥" },
                      { label: "Check-in",   val: MY_TASK.checkIn,                  icon: "⏰" },
                      { label: "Team lead",  val: MY_TASK.lead,                     icon: "👤" },
                      { label: "Urgency",    val: MY_TASK.urgency,                  icon: "🚨" },
                    ].map(item => (
                      <div key={item.label} className="p-2.5 rounded-xl"
                        style={{ background: "var(--surface-2)", border: "1px solid var(--border-light)" }}>
                        <div style={{ fontSize: "10px", color: "var(--text-3)", fontWeight: 600 }}>{item.label}</div>
                        <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text)", marginTop: "3px" }}>
                          {item.icon} {item.val}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span style={{ fontSize: "12px", color: "var(--text-2)", fontWeight: 700 }}>Mission progress</span>
                      <span style={{ fontSize: "12px", fontWeight: 900, color: "#e11d48" }}>{MY_TASK.progress}%</span>
                    </div>
                    <div className="gs-progress" style={{ height: "8px" }}>
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${MY_TASK.progress}%` }}
                        transition={{ duration: 0.8 }}
                        className="gs-progress-fill"
                        style={{ background: "linear-gradient(90deg, #e11d48, #fb7185)" }}
                      />
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "5px" }}>
                      {MY_TASK.teamSize} of {MY_TASK.totalNeeded} volunteers assigned
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        if (user?.role === "ngo") {
                          toast.info("NGO accounts manage tasks — switch to volunteer to check in.");
                          return;
                        }
                        setCheckedIn(p => !p);
                        if (!checkedIn) toast.success("✅ Checked in! Your team has been notified.");
                        else toast.info("Check-in removed.");
                      }}
                      className="flex-1 py-3 rounded-2xl flex items-center justify-center gap-2"
                      style={{
                        background:  checkedIn ? "#059669" : "var(--teal)",
                        color: "#fff", fontWeight: 800, fontSize: "13px",
                        fontFamily: "var(--font)", cursor: "pointer",
                        transition: "background 0.3s",
                      }}
                    >
                      {checkedIn ? <><CheckCircle2 size={15}/> Checked in</> : <><Zap size={15}/> Check in</>}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowLogTime(true);
                      }}
                      className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
                      style={{
                        background: "var(--surface-2)", border: "1px solid var(--border)",
                        fontWeight: 700, fontSize: "13px", color: "var(--text-2)",
                        fontFamily: "var(--font)", cursor: "pointer",
                      }}
                    >
                      <Clock size={14} /> Log time
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Available nearby */}
              <div>
                <p style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "10px" }}>
                  Available Nearby
                </p>
                <div className="space-y-3">
                  {NEARBY_TASKS.map((t, i) => {
                    const uc = URGENCY[t.urgency as keyof typeof URGENCY];
                    const isJoined = joined === t.id;
                    return (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="gs-card p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                            style={{ background: uc.bg, border: `1px solid ${uc.border}` }}>
                            {t.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text)" }}>{t.title}</div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span style={{ fontSize: "10px", color: "var(--text-3)" }}>📍 {t.dist}</span>
                              <span style={{ fontSize: "10px", color: "var(--text-3)" }}>· {t.needed} needed</span>
                              <span className="px-1.5 py-0.5 rounded-full"
                                style={{ fontSize: "9px", fontWeight: 700, background: uc.bg, color: uc.color, border: `1px solid ${uc.border}` }}>
                                {t.urgency}
                              </span>
                            </div>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.92 }}
                            onClick={() => {
                              if (joined === t.id) { setJoined(null); toast.info(`Left ${t.title}`); }
                              else { setJoined(t.id); toast.success(`✅ Joined ${t.title}! Check your tasks.`); }
                            }}
                            className="px-3 py-2 rounded-xl flex-shrink-0"
                            style={{
                              background: isJoined ? "var(--green-light)" : "var(--teal-light)",
                              color:      isJoined ? "var(--green)"      : "var(--teal)",
                              border:     `1px solid ${isJoined ? "#bbf7d0" : "#99f6e4"}`,
                              fontSize: "11px", fontWeight: 700, fontFamily: "var(--font)", cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                          >
                            {isJoined ? "✓ Joined" : "Join"}
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ──────────────── IMPACT ──────────────── */}
          {activeTab === "impact" && (
            <>
              {/* Hero impact card */}
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="gs-card p-5 text-center"
                style={{ border: "1.5px solid #99f6e4", background: "linear-gradient(135deg, var(--teal-pale), var(--surface))" }}
              >
                <div style={{ fontSize: "36px", marginBottom: "8px" }}>💙</div>
                <div style={{ fontWeight: 900, fontSize: "22px", color: "var(--text)", marginBottom: "4px" }}>
                  You helped 342 people!
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-3)", fontWeight: 500, lineHeight: 1.5 }}>
                  Every hour you give makes a real difference to your community. Thank you for showing up.
                </div>
              </motion.div>

              {/* Impact stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "People helped",  value: "342",   icon: "💙", color: "var(--teal)",  note: "+80 today" },
                  { label: "Missions done",  value: "29",    icon: "✅", color: "var(--green)", note: "+3 this week" },
                  { label: "Points earned",  value: "7,820", icon: "⭐", color: "#b45309",      note: "+350 today" },
                  { label: "Day streak",     value: "7",     icon: "🔥", color: "#e11d48",      note: "Personal best!" },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="gs-card p-4"
                  >
                    <div style={{ fontSize: "22px", marginBottom: "6px" }}>{s.icon}</div>
                    <div style={{ fontWeight: 900, fontSize: "24px", color: s.color, lineHeight: 1, marginBottom: "2px" }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 500 }}>{s.label}</div>
                    <div style={{ fontSize: "10px", color: "var(--green)", fontWeight: 600, marginTop: "3px" }}>
                      ↑ {s.note}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Impact bars */}
              <div className="gs-card p-4">
                <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text)", marginBottom: "14px" }}>
                  Your impact this month
                </div>
                <div className="space-y-3">
                  {[
                    { label: "People received food",       value: 203, max: 300, color: "var(--teal)" },
                    { label: "Medical needs supported",    value: 87,  max: 150, color: "var(--blue)" },
                    { label: "Children with learning aid", value: 52,  max: 80,  color: "#7c3aed"      },
                  ].map((r, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-1.5">
                        <span style={{ fontSize: "12px", color: "var(--text-2)", fontWeight: 600 }}>{r.label}</span>
                        <span style={{ fontSize: "12px", color: r.color, fontWeight: 800 }}>{r.value}</span>
                      </div>
                      <div className="gs-progress" style={{ height: "7px" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(r.value / r.max) * 100}%` }}
                          transition={{ delay: 0.2 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                          className="gs-progress-fill"
                          style={{ background: r.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badges */}
              <div className="gs-card p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Star size={14} style={{ color: "#b45309" }} />
                  <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>All Badges</span>
                  <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--teal)", fontWeight: 700 }}>
                    {BADGES.filter(b => b.earned).length}/{BADGES.length} earned
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {BADGES.map((b, i) => (
                    <motion.div
                      key={b.name}
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ delay: i * 0.08, type: "spring", stiffness: 280 }}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl relative"
                        style={{
                          background: b.earned ? "var(--teal-light)" : "var(--surface-2)",
                          border: b.earned ? "1.5px solid #99f6e4" : "1.5px solid var(--border)",
                          opacity: b.earned ? 1 : 0.5,
                        }}
                      >
                        {b.icon}
                        {!b.earned && b.pct && (
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 rounded-full"
                            style={{ background: b.color, fontSize: "8px", color: "#fff", fontWeight: 800, whiteSpace: "nowrap" }}>
                            {b.pct}%
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: "9px", fontWeight: 700, color: b.earned ? b.color : "var(--text-4)", textAlign: "center", lineHeight: 1.3 }}>
                        {b.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Leaderboard top 3 */}
              <div className="gs-card overflow-hidden">
                <div className="px-4 py-3.5" style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} style={{ color: "var(--teal)" }} />
                    <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>This Month's Rankings</span>
                  </div>
                </div>
                {[
                  { rank: 1, name: "Anika S.",  xp: 12450, missions: 48, emoji: "🥇", isMe: false },
                  { rank: 2, name: "Chen W.",   xp: 11200, missions: 43, emoji: "🥈", isMe: false },
                  { rank: 5, name: "You",       xp: 7820,  missions: 29, emoji: "⭐", isMe: true  },
                ].map((p, i) => (
                  <div key={p.rank} className="flex items-center gap-3 px-4 py-3"
                    style={{
                      borderBottom: i < 2 ? "1px solid var(--border-light)" : "none",
                      background:   p.isMe ? "var(--teal-pale)" : "transparent",
                      borderLeft:   p.isMe ? "3px solid var(--teal)" : "3px solid transparent",
                    }}>
                    <span style={{ fontWeight: 800, fontSize: "14px", color: p.isMe ? "var(--teal)" : "var(--text-4)", width: 20 }}>
                      {p.rank}
                    </span>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: "var(--teal-light)", border: "2px solid #99f6e4", fontSize: "10px", fontWeight: 800, color: "var(--teal)" }}>
                      {p.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1">
                      <div style={{ fontWeight: 700, fontSize: "13px", color: p.isMe ? "var(--teal)" : "var(--text)" }}>
                        {p.name} {p.emoji}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-3)" }}>{p.missions} missions</div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: "13px", color: "var(--teal)" }}>
                      {p.xp.toLocaleString()} pts
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Log time modal */}
      {showLogTime && (
        <motion.div
          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background:"rgba(15,23,42,0.45)", backdropFilter:"blur(4px)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowLogTime(false); }}
        >
          <motion.div
            initial={{ y:80 }} animate={{ y:0 }} exit={{ y:80 }}
            className="w-full max-w-md rounded-t-3xl p-6"
            style={{ background:"var(--surface)", fontFamily:"var(--font)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontWeight:800, fontSize:"17px", color:"var(--text)" }}>Log Volunteer Time</h3>
              <button onClick={() => setShowLogTime(false)} className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background:"var(--surface-2)", border:"1px solid var(--border)", cursor:"pointer" }}>
                <X size={14} style={{ color:"var(--text-3)" }} />
              </button>
            </div>
            <p style={{ fontSize:"13px", color:"var(--text-3)", marginBottom:"16px" }}>
              How many hours did you volunteer for Food Distribution – Sector 7?
            </p>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {["0.5h","1h","1.5h","2h","2.5h","3h+"].map(h => (
                <motion.button
                  key={h} whileTap={{ scale:0.95 }}
                  onClick={() => {
                    setLoggedHrs(h);
                    toast.success(`⏱️ ${h} of volunteer time logged!`);
                    setShowLogTime(false);
                  }}
                  className="py-3 rounded-2xl text-center"
                  style={{
                    background: loggedHrs === h ? "var(--teal)" : "var(--surface-2)",
                    border: `1.5px solid ${loggedHrs === h ? "var(--teal)" : "var(--border)"}`,
                    fontWeight:700, fontSize:"14px",
                    color: loggedHrs === h ? "#fff" : "var(--text)",
                    fontFamily:"var(--font)", cursor:"pointer",
                  }}
                >
                  {h}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}