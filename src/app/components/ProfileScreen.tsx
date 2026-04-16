/**
 * ProfileScreen – Volunteer profile with skills, availability, location, stats
 * Covers spec: Volunteer System – profile with skills, availability, location
 */
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User, MapPin, Edit3, Check, X, Navigation, Star,
  Clock, Award, Shield, Phone, Mail, Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";

const ALL_SKILLS = [
  "First Aid", "Driving", "Cooking", "Teaching", "Logistics",
  "Medical", "Counseling", "Translation", "Tech/IT", "Childcare",
  "Sanitation", "Construction", "Fundraising", "Event Planning", "Photography",
];

const DAYS    = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIMES   = ["Morning (6–12)", "Afternoon (12–18)", "Evening (18–22)"];
const LOCATIONS = ["Sector 7", "East Side", "North Quarter", "West Camp", "South Zone", "Central Hub", "Anywhere"];

interface Profile {
  name:       string;
  email:      string;
  phone:      string;
  location:   string;
  bio:        string;
  skills:     string[];
  days:       string[];
  times:      string[];
  emergency:  boolean;
}

const LEVEL_THRESHOLDS = [0, 500, 1500, 3000, 5000, 8000, 12000];
function levelForXP(xp: number) {
  let lv = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) lv = i + 1;
  }
  return lv;
}

export function ProfileScreen() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const defaultName = user?.name || user?.email?.split("@")[0] || "Volunteer";

  const [editing, setEditing] = useState(false);
  const [saved,   setSaved]   = useState(false);

  const [profile, setProfile] = useState<Profile>({
    name:      defaultName,
    email:     user?.email || "",
    phone:     "+91 98765 43000",
    location:  "Sector 7",
    bio:       "I'm passionate about community service and love helping people in need. Available most weekdays and weekends.",
    skills:    ["First Aid", "Cooking", "Driving"],
    days:      ["Sat", "Sun"],
    times:     ["Morning (6–12)", "Afternoon (12–18)"],
    emergency: true,
  });

  const [draft, setDraft] = useState<Profile>({ ...profile });

  const XP = 7820, MISSIONS = 29, STREAK = 7, RATING = 4.8;
  const level = levelForXP(XP);
  const nextThreshold = LEVEL_THRESHOLDS[Math.min(level, LEVEL_THRESHOLDS.length - 1)] || 10000;
  const prevThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const xpPct = ((XP - prevThreshold) / (nextThreshold - prevThreshold)) * 100;

  const toggleSkill = (skill: string) => {
    setDraft(p => ({
      ...p,
      skills: p.skills.includes(skill)
        ? p.skills.filter(s => s !== skill)
        : [...p.skills, skill],
    }));
  };

  const toggleDay  = (day: string)  => setDraft(p => ({
    ...p, days: p.days.includes(day) ? p.days.filter(d => d !== day) : [...p.days, day],
  }));

  const toggleTime = (time: string) => setDraft(p => ({
    ...p, times: p.times.includes(time) ? p.times.filter(t => t !== time) : [...p.times, time],
  }));

  const handleSave = () => {
    if (!draft.name.trim()) { toast.error("Name cannot be empty."); return; }
    if (draft.skills.length === 0) { toast.error("Please select at least one skill."); return; }
    setProfile({ ...draft });
    setEditing(false);
    setSaved(true);
    toast.success("✅ Profile saved! Matching updated.");
    setTimeout(() => setSaved(false), 3000);
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported."); return; }
    toast.info("📍 Getting your location…");
    navigator.geolocation.getCurrentPosition(
      () => {
        setDraft(p => ({ ...p, location: "Your Current Location" }));
        toast.success("📍 Location updated!");
      },
      () => toast.error("Could not get location. Please enter manually."),
    );
  };

  const cur = editing ? draft : profile;
  const initials = cur.name.split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="h-full overflow-y-auto" style={{ background: "var(--bg)", fontFamily: "var(--font)" }}>
      <div className="p-4 space-y-4">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <h1 style={{ fontWeight: 900, fontSize: "20px", color: "var(--text)", letterSpacing: "-0.02em" }}>
            My Profile
          </h1>
          {!editing ? (
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => { setDraft({ ...profile }); setEditing(true); }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl"
              style={{ background: "var(--teal-light)", border: "1px solid #99f6e4", cursor: "pointer" }}
            >
              <Edit3 size={13} style={{ color: "var(--teal)" }} />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--teal)" }}>Edit</span>
            </motion.button>
          ) : (
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => setEditing(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", cursor: "pointer" }}
              >
                <X size={14} style={{ color: "var(--text-3)" }} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl"
                style={{ background: "var(--teal)", cursor: "pointer" }}
              >
                <Check size={13} style={{ color: "#fff" }} />
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>Save</span>
              </motion.button>
            </div>
          )}
        </div>

        {/* ── Avatar + Level ── */}
        <div className="gs-card p-5" style={{ background: "linear-gradient(135deg, var(--teal-pale), var(--surface))", border: "1.5px solid #99f6e4" }}>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, var(--teal), #2563eb)", border: "3px solid #99f6e4" }}
              >
                <span style={{ fontWeight: 900, fontSize: "28px", color: "#fff" }}>{initials}</span>
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: "var(--amber-light)", border: "2px solid #fff" }}
              >
                <span style={{ fontSize: "12px", fontWeight: 900, color: "#b45309" }}>{level}</span>
              </div>
            </div>

            <div className="flex-1">
              {editing ? (
                <input
                  className="w-full px-3 py-2 rounded-xl outline-none mb-1"
                  style={{ background: "var(--surface)", border: "1.5px solid var(--teal)", fontSize: "16px", fontWeight: 800, color: "var(--text)", fontFamily: "var(--font)" }}
                  value={draft.name}
                  onChange={e => setDraft(p => ({ ...p, name: e.target.value }))}
                />
              ) : (
                <div style={{ fontWeight: 900, fontSize: "18px", color: "var(--text)", lineHeight: 1.1 }}>
                  {cur.name}
                </div>
              )}
              <div style={{ fontSize: "12px", color: "var(--teal)", fontWeight: 600, marginTop: "3px" }}>
                Community Volunteer · Level {level}
              </div>

              <div className="mt-3">
                <div className="flex justify-between mb-1">
                  <span style={{ fontSize: "10px", color: "var(--text-3)", fontWeight: 600 }}>XP Progress</span>
                  <span style={{ fontSize: "10px", color: "var(--teal)", fontWeight: 800 }}>
                    {XP.toLocaleString()} / {nextThreshold.toLocaleString()} pts
                  </span>
                </div>
                <div className="gs-progress" style={{ height: "6px" }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${xpPct}%` }}
                    transition={{ duration: 1.2 }}
                    className="gs-progress-fill"
                    style={{ background: "linear-gradient(90deg, var(--teal), #2dd4bf)" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-4 pt-4" style={{ borderTop: "1px solid #99f6e4" }}>
            {[
              { label: "Missions", value: MISSIONS, icon: "✅" },
              { label: "Streak",   value: `${STREAK}d`, icon: "🔥" },
              { label: "Rating",   value: RATING, icon: "⭐" },
              { label: "Points",   value: `${(XP / 1000).toFixed(1)}K`, icon: "💎" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div style={{ fontSize: "16px", marginBottom: "2px" }}>{s.icon}</div>
                <div style={{ fontWeight: 900, fontSize: "16px", color: "var(--text)", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "9px", color: "var(--text-3)", fontWeight: 600, marginTop: "2px" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Contact info ── */}
        <div className="gs-card p-4 space-y-3">
          <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text)", marginBottom: "4px" }}>Contact Info</div>
          {[
            { icon: <Mail size={14} style={{ color: "var(--blue)" }} />,   label: "Email",   field: "email" as const,  placeholder: "your@email.com" },
            { icon: <Phone size={14} style={{ color: "var(--green)" }} />, label: "Phone",   field: "phone" as const,  placeholder: "+91 98765 43000" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                {item.icon}
              </div>
              <div className="flex-1">
                <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)" }}>{item.label.toUpperCase()}</div>
                {editing ? (
                  <input
                    className="w-full outline-none"
                    style={{ background: "transparent", border: "none", fontSize: "13px", fontWeight: 600, color: "var(--text)", fontFamily: "var(--font)", marginTop: "2px" }}
                    value={draft[item.field]}
                    onChange={e => setDraft(p => ({ ...p, [item.field]: e.target.value }))}
                    placeholder={item.placeholder}
                  />
                ) : (
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", marginTop: "2px" }}>{cur[item.field] || "—"}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Location ── */}
        <div className="gs-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={14} style={{ color: "var(--teal)" }} />
            <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>Location</span>
          </div>
          {editing ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {LOCATIONS.map(loc => (
                  <motion.button
                    key={loc} whileTap={{ scale: 0.93 }}
                    onClick={() => setDraft(p => ({ ...p, location: loc }))}
                    className="px-3 py-1.5 rounded-full"
                    style={{
                      background: draft.location === loc ? "var(--teal)" : "var(--surface-2)",
                      color:      draft.location === loc ? "#fff"        : "var(--text-2)",
                      border:     `1px solid ${draft.location === loc ? "var(--teal)" : "var(--border)"}`,
                      fontSize: "11px", fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    {loc}
                  </motion.button>
                ))}
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleUseLocation}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
                style={{ background: "var(--blue-light)", border: "1px solid #bfdbfe", cursor: "pointer" }}
              >
                <Navigation size={12} style={{ color: "var(--blue)" }} />
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--blue)", fontFamily: "var(--font)" }}>
                  Use my current location
                </span>
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-full"
                style={{ background: "var(--teal-light)", color: "var(--teal)", border: "1px solid #99f6e4", fontSize: "13px", fontWeight: 700 }}>
                📍 {cur.location}
              </span>
            </div>
          )}
        </div>

        {/* ── Bio ── */}
        <div className="gs-card p-4">
          <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text)", marginBottom: "10px" }}>About Me</div>
          {editing ? (
            <textarea
              rows={3}
              className="w-full px-4 py-3 rounded-xl outline-none resize-none"
              style={{ background: "var(--surface-2)", border: "1.5px solid var(--border)", fontSize: "13px", color: "var(--text)", fontFamily: "var(--font)", lineHeight: 1.6 }}
              value={draft.bio}
              onChange={e => setDraft(p => ({ ...p, bio: e.target.value }))}
              placeholder="Tell other volunteers a bit about yourself…"
            />
          ) : (
            <p style={{ fontSize: "13px", color: "var(--text-2)", fontWeight: 500, lineHeight: 1.6 }}>{cur.bio || "No bio added yet."}</p>
          )}
        </div>

        {/* ── Skills ── */}
        <div className="gs-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} style={{ color: "var(--blue)" }} />
            <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>Skills</span>
            <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--teal)", fontWeight: 700 }}>
              {cur.skills.length} selected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_SKILLS.map(skill => {
              const active = cur.skills.includes(skill);
              return (
                <motion.button
                  key={skill} whileTap={{ scale: 0.93 }}
                  onClick={() => editing && toggleSkill(skill)}
                  className="px-3 py-1.5 rounded-full"
                  style={{
                    background: active ? "var(--teal)" : "var(--surface-2)",
                    color:      active ? "#fff"        : "var(--text-2)",
                    border:     `1px solid ${active ? "var(--teal)" : "var(--border)"}`,
                    fontSize: "11px", fontWeight: 700,
                    cursor: editing ? "pointer" : "default",
                    opacity: !editing && !active ? 0.45 : 1,
                  }}
                >
                  {skill}
                </motion.button>
              );
            })}
          </div>
          {editing && (
            <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "10px" }}>
              Tap to toggle skills. These are used by the AI matching engine.
            </p>
          )}
        </div>

        {/* ── Availability ── */}
        <div className="gs-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={14} style={{ color: "#7c3aed" }} />
            <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>Availability</span>
          </div>

          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-3)", marginBottom: "8px" }}>DAYS</div>
          <div className="flex gap-2 flex-wrap mb-4">
            {DAYS.map(day => {
              const active = cur.days.includes(day);
              return (
                <motion.button
                  key={day} whileTap={{ scale: 0.9 }}
                  onClick={() => editing && toggleDay(day)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: active ? "#7c3aed" : "var(--surface-2)",
                    color:      active ? "#fff"    : "var(--text-3)",
                    border:     `1.5px solid ${active ? "#7c3aed" : "var(--border)"}`,
                    fontSize: "11px", fontWeight: 800, cursor: editing ? "pointer" : "default",
                    opacity: !editing && !active ? 0.4 : 1,
                  }}
                >
                  {day.slice(0, 2)}
                </motion.button>
              );
            })}
          </div>

          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-3)", marginBottom: "8px" }}>TIMES</div>
          <div className="space-y-2">
            {TIMES.map(time => {
              const active = cur.times.includes(time);
              return (
                <motion.button
                  key={time} whileTap={{ scale: 0.97 }}
                  onClick={() => editing && toggleTime(time)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: active ? "var(--lavender-light)" : "var(--surface-2)",
                    border: `1.5px solid ${active ? "#ddd6fe" : "var(--border)"}`,
                    cursor: editing ? "pointer" : "default", transition: "all 0.2s",
                    opacity: !editing && !active ? 0.4 : 1,
                  }}
                >
                  <Clock size={14} style={{ color: active ? "#7c3aed" : "var(--text-4)", flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, fontSize: "13px", color: active ? "#7c3aed" : "var(--text-2)" }}>
                    {time}
                  </span>
                  {active && <Check size={13} style={{ color: "#7c3aed", marginLeft: "auto" }} />}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Emergency availability ── */}
        <div className="gs-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: "#fff1f2", border: "1px solid #fecaca" }}>
                🚨
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>Emergency Response</div>
                <div style={{ fontSize: "11px", color: "var(--text-3)" }}>Available for urgent calls 24/7</div>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (!editing) { toast.info("Edit your profile to change settings."); return; }
                setDraft(p => ({ ...p, emergency: !p.emergency }));
              }}
              className="w-12 h-7 rounded-full relative flex-shrink-0"
              style={{
                background: cur.emergency ? "#e11d48" : "var(--border)",
                cursor: editing ? "pointer" : "default",
                transition: "background 0.3s",
              }}
            >
              <motion.div
                animate={{ x: cur.emergency ? 20 : 2 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="absolute top-1 w-5 h-5 rounded-full"
                style={{ background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.25)" }}
              />
            </motion.button>
          </div>
        </div>

        {/* ── Save confirmation ── */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="gs-card p-4 flex items-center gap-3"
              style={{ border: "1.5px solid #bbf7d0" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--green-light)" }}>
                <Check size={18} style={{ color: "var(--green)" }} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "14px", color: "var(--text)" }}>Profile updated!</div>
                <div style={{ fontSize: "12px", color: "var(--text-3)" }}>
                  AI matching will use your new skills and availability.
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Quick actions ── */}
        {!editing && (
          <div className="space-y-2 pb-4">
            {[
              { label: "View my impact stats",  icon: "💙", action: () => navigate("/impact"),    color: "var(--teal)" },
              { label: "Browse nearby tasks",    icon: "🗺️", action: () => navigate("/"),          color: "var(--blue)" },
              { label: "See my teams",           icon: "👥", action: () => navigate("/swarm"),     color: "#7c3aed"      },
            ].map(item => (
              <motion.button
                key={item.label} whileTap={{ scale: 0.97 }}
                onClick={item.action}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer" }}
              >
                <span style={{ fontSize: "18px" }}>{item.icon}</span>
                <span style={{ fontWeight: 600, fontSize: "13px", color: "var(--text)", flex: 1, textAlign: "left" }}>
                  {item.label}
                </span>
                <span style={{ fontSize: "11px", color: item.color, fontWeight: 700 }}>→</span>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
