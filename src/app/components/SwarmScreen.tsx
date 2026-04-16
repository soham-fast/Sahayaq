import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, ChevronRight, Check, X, MessageSquare, Phone, Clock, Send, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

// ── Types ────────────────────────────────────────────────────────────────────
interface TeamMember { name: string; initials: string; role: string; status: string; color: string; }
interface Team {
  id: number; name: string; icon: string; count: number;
  color: string; bg: string; border: string;
  members: TeamMember[];
  task: string; progress: number;
  phone: string;
}
interface ChatMsg { from: string; msg: string; time: string; initials: string; color: string; isMe?: boolean; }

const TEAMS: Team[] = [
  {
    id: 1, name: "Cooking Team", icon: "🍳", count: 2, color: "#0f766e", bg: "var(--teal-light)", border: "#99f6e4",
    phone: "+91 98765 43210",
    members: [
      { name: "Aria K.",  initials: "AK", role: "Lead cook",   status: "active", color: "#0f766e" },
      { name: "Lena T.",  initials: "LT", role: "Prep & serve",status: "active", color: "#0f766e" },
    ],
    task: "Prepare and serve hot meals at Sector 7 station",
    progress: 65,
  },
  {
    id: 2, name: "Delivery Team", icon: "🚐", count: 3, color: "#2563eb", bg: "var(--blue-light)", border: "#bfdbfe",
    phone: "+91 98765 43211",
    members: [
      { name: "Dev M.",   initials: "DM", role: "Driver",    status: "active",   color: "#2563eb" },
      { name: "Sofia R.", initials: "SR", role: "Co-pilot",  status: "en-route", color: "#2563eb" },
    ],
    task: "Transport supplies from depot to distribution point",
    progress: 40,
  },
  {
    id: 3, name: "Support Team", icon: "📞", count: 2, color: "#7c3aed", bg: "var(--lavender-light)", border: "#ddd6fe",
    phone: "+91 98765 43212",
    members: [
      { name: "Marcus O.", initials: "MO", role: "Coordinator", status: "active", color: "#7c3aed" },
      { name: "Priya N.",  initials: "PN", role: "Comms",        status: "active", color: "#7c3aed" },
    ],
    task: "Coordinate logistics and volunteer communication",
    progress: 80,
  },
];

const SCHEDULE_SLOTS = [
  { day: "Today",     time: "2:00 PM – 6:00 PM",   spots: 2 },
  { day: "Tomorrow",  time: "9:00 AM – 1:00 PM",   spots: 5 },
  { day: "Sat Apr 11",time: "10:00 AM – 2:00 PM",  spots: 3 },
  { day: "Sun Apr 12",time: "8:00 AM – 12:00 PM",  spots: 8 },
];

function Avatar({ initials, color, size = 36 }: { initials: string; color: string; size?: number }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: `${color}14`, border: `2px solid ${color}35`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size > 36 ? "15px" : "11px", fontWeight: 800,
        color, fontFamily: "var(--font)", flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    "active":   { label: "Active",   className: "gs-chip gs-chip-green" },
    "en-route": { label: "En route", className: "gs-chip gs-chip-blue"  },
    "offline":  { label: "Offline",  className: "gs-chip gs-chip-amber" },
  };
  const c = map[status] || map["offline"];
  return <span className={c.className} style={{ fontSize: "10px" }}>{c.label}</span>;
}

// ── Team Chat Panel ──────────────────────────────────────────────────────────
function ChatPanel({ team, onClose, userInitials }: { team: Team; onClose: () => void; userInitials: string }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { from: team.members[0]?.name || "Team",  msg: "Hey team, we're all set here!", time: "5m", initials: team.members[0]?.initials || "?", color: team.color },
    { from: "Team Lead", msg: "Great work everyone — keep it up!", time: "10m", initials: "TL", color: team.color },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = () => {
    if (!input.trim()) return;
    setMsgs(p => [...p, { from: "You", msg: input.trim(), time: "now", initials: userInitials, color: "#2563eb", isMe: true }]);
    setInput("");
    toast.success("Message sent to team!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "var(--bg)", fontFamily: "var(--font)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}>
        <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
          <X size={14} style={{ color: "var(--text-3)" }} />
        </button>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: team.bg, border: `1.5px solid ${team.border}` }}>
          {team.icon}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: "15px", color: "var(--text)" }}>{team.name}</div>
          <div style={{ fontSize: "11px", color: "var(--text-3)" }}>{team.members.length} members online</div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { window.open(`tel:${team.phone}`); toast.info(`Calling ${team.name}…`); }}
          className="ml-auto w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "var(--green-light)", border: "1px solid #bbf7d0" }}
          title={team.phone}
        >
          <Phone size={15} style={{ color: "var(--green)" }} />
        </motion.button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={`flex items-end gap-2.5 ${m.isMe ? "flex-row-reverse" : ""}`}>
            {!m.isMe && <Avatar initials={m.initials} color={m.color} size={30} />}
            <div className={`max-w-[75%] ${m.isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
              {!m.isMe && (
                <span style={{ fontSize: "11px", fontWeight: 700, color: m.color, marginLeft: "4px" }}>{m.from}</span>
              )}
              <div className="px-3.5 py-2.5 rounded-2xl"
                style={{
                  background: m.isMe ? "var(--teal)" : "var(--surface)",
                  border: m.isMe ? "none" : "1px solid var(--border)",
                  borderBottomRightRadius: m.isMe ? "6px" : "16px",
                  borderBottomLeftRadius:  m.isMe ? "16px" : "6px",
                }}>
                <p style={{ fontSize: "13px", color: m.isMe ? "#fff" : "var(--text-2)", fontWeight: 500, lineHeight: 1.45 }}>
                  {m.msg}
                </p>
              </div>
              <span style={{ fontSize: "10px", color: "var(--text-4)", marginLeft: m.isMe ? 0 : "4px", marginRight: m.isMe ? "4px" : 0 }}>
                {m.time} ago
              </span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-4 py-3"
        style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
        <input
          className="flex-1 px-4 py-3 rounded-2xl outline-none"
          style={{ background: "var(--surface-2)", border: "1.5px solid var(--border)", fontSize: "13px", color: "var(--text)", fontFamily: "var(--font)" }}
          placeholder={`Message ${team.name}…`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={send}
          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: input.trim() ? "var(--teal)" : "var(--surface-2)",
            border: input.trim() ? "none" : "1px solid var(--border)",
            cursor: "pointer", transition: "background 0.2s",
          }}
        >
          <Send size={16} style={{ color: input.trim() ? "#fff" : "var(--text-4)" }} />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ── Schedule Modal ───────────────────────────────────────────────────────────
function ScheduleModal({ team, onClose }: { team: Team; onClose: () => void }) {
  const [booked, setBooked] = useState<number | null>(null);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
        className="w-full max-w-md rounded-t-3xl p-6"
        style={{ background: "var(--surface)", maxHeight: "85vh", overflowY: "auto", fontFamily: "var(--font)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 style={{ fontWeight: 800, fontSize: "17px", color: "var(--text)" }}>Pick a Time Slot</h3>
            <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "3px" }}>{team.name} · {team.task.slice(0, 40)}…</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <X size={14} style={{ color: "var(--text-3)" }} />
          </button>
        </div>

        <div className="space-y-3">
          {SCHEDULE_SLOTS.map((s, i) => (
            <motion.button
              key={i} whileTap={{ scale: 0.97 }}
              onClick={() => {
                setBooked(i);
                toast.success(`📅 Scheduled! ${s.day} ${s.time}`);
                setTimeout(onClose, 1200);
              }}
              className="w-full flex items-center gap-4 p-4 rounded-2xl text-left"
              style={{
                background: booked === i ? "var(--teal-light)" : "var(--surface-2)",
                border: `1.5px solid ${booked === i ? "#99f6e4" : "var(--border)"}`,
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                📅
              </div>
              <div className="flex-1">
                <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>{s.day}</div>
                <div style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "2px" }}>{s.time}</div>
              </div>
              <div className="text-right">
                <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--teal)" }}>{s.spots} spots</div>
                <div style={{ fontSize: "10px", color: "var(--text-4)" }}>available</div>
              </div>
              {booked === i && <Check size={16} style={{ color: "var(--teal)", flexShrink: 0 }} />}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export function SwarmScreen() {
  const { user } = useAuth();
  const userInitials = (user?.name || user?.email || "You").split(/\s+/).map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "★";

  const [accepted,       setAccepted]       = useState<null | boolean>(null);
  const [openTeam,       setOpenTeam]       = useState<number | null>(null);
  const [joinedTeams,    setJoinedTeams]    = useState<number[]>([]);
  const [chatTeam,       setChatTeam]       = useState<Team | null>(null);
  const [scheduleTeam,   setScheduleTeam]   = useState<Team | null>(null);

  const FEATURED = TEAMS[1]; // Delivery Team

  const handleJoin = (team: Team) => {
    if (joinedTeams.includes(team.id)) {
      toast.info(`You're already on ${team.name}!`);
      return;
    }
    setJoinedTeams(p => [...p, team.id]);
    toast.success(`🎉 You joined ${team.name}! Welcome aboard.`);
  };

  const handlePhone = (team: Team) => {
    toast.info(`📞 Calling ${team.name} at ${team.phone}…`, { duration: 4000 });
    window.open(`tel:${team.phone}`);
  };

  return (
    <>
      <AnimatePresence>
        {chatTeam && (
          <ChatPanel key="chat" team={chatTeam} onClose={() => setChatTeam(null)} userInitials={userInitials} />
        )}
        {scheduleTeam && (
          <ScheduleModal key="schedule" team={scheduleTeam} onClose={() => setScheduleTeam(null)} />
        )}
      </AnimatePresence>

      <div className="h-full overflow-y-auto" style={{ background: "var(--bg)" }}>
        <div className="p-4 space-y-4">

          {/* ── Header ── */}
          <div className="flex items-center justify-between">
            <div>
              <h1 style={{ fontWeight: 800, fontSize: "20px", color: "var(--text)" }}>Volunteer Teams</h1>
              <p style={{ fontSize: "13px", color: "var(--text-3)", fontWeight: 500 }}>
                {TEAMS.reduce((s, t) => s + t.count, 0) + joinedTeams.length} helpers active right now
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "var(--green-light)", border: "1px solid #bbf7d0" }}>
              <span className="gs-dot gs-dot-green gs-soft-pulse" />
              <span style={{ fontSize: "12px", color: "var(--green)", fontWeight: 700 }}>Live</span>
            </div>
          </div>

          {/* ── Featured assignment card ── */}
          <AnimatePresence mode="wait">
            {accepted === null && (
              <motion.div
                key="assign"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="gs-card p-5"
                style={{ border: `1.5px solid ${FEATURED.border}` }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "var(--teal-light)" }}>
                    <span style={{ fontSize: "12px" }}>✨</span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-2)" }}>You've been matched to help nearby</span>
                  <span className="ml-auto gs-chip" style={{ background: "var(--teal-light)", color: "var(--teal)", fontSize: "10px" }}>
                    94% match
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: FEATURED.bg, border: `1.5px solid ${FEATURED.border}` }}>
                    {FEATURED.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "16px", color: "var(--text)" }}>{FEATURED.name}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-2)", fontWeight: 600, marginTop: "2px" }}>
                      {FEATURED.count} people · 0.8 km away
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "3px" }}>
                      Your location and availability are a great fit for this team.
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl mb-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border-light)" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 600, marginBottom: "4px" }}>WHAT YOU'LL DO</div>
                  <div style={{ fontSize: "13px", color: "var(--text-2)", fontWeight: 600 }}>{FEATURED.task}</div>
                </div>

                <div className="flex items-center gap-2 mb-5">
                  <div className="flex -space-x-2">
                    {FEATURED.members.map((m, i) => (
                      <div key={i} style={{ zIndex: FEATURED.members.length - i }}>
                        <Avatar initials={m.initials} color={m.color} size={30} />
                      </div>
                    ))}
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 500 }}>
                    {FEATURED.members.map(m => m.name.split(" ")[0]).join(", ")} are waiting
                  </span>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setAccepted(false)}
                    className="gs-btn gs-btn-secondary flex-1 py-3"
                    style={{ fontSize: "13px" }}
                  >
                    <X size={14} /> Maybe Later
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
                    onClick={() => { setAccepted(true); handleJoin(FEATURED); }}
                    className="gs-btn gs-btn-primary flex-1 py-3"
                    style={{ fontSize: "13px" }}
                  >
                    <Check size={14} /> Accept
                  </motion.button>
                </div>
              </motion.div>
            )}

            {accepted === true && (
              <motion.div
                key="confirmed"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 280 }}
                className="gs-card p-4"
                style={{ border: "1.5px solid #bbf7d0" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--green-light)" }}>
                    <Check size={18} style={{ color: "var(--green)", strokeWidth: 2.5 }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "14px", color: "var(--text)" }}>You're on the team!</div>
                    <div style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 500 }}>
                      {FEATURED.name} · 0.8 km away
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {[
                    { icon: <MessageSquare size={13} />, label: "Chat",     action: () => setChatTeam(FEATURED) },
                    { icon: <Phone size={13} />,         label: "Call",     action: () => handlePhone(FEATURED) },
                    { icon: <Clock size={13} />,         label: "Schedule", action: () => setScheduleTeam(FEATURED) },
                  ].map(a => (
                    <motion.button
                      key={a.label}
                      whileTap={{ scale: 0.92 }}
                      onClick={a.action}
                      className="gs-btn gs-btn-secondary flex-1 py-2.5 gap-1"
                      style={{ fontSize: "11px" }}
                    >
                      {a.icon} {a.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {accepted === false && (
              <motion.div
                key="browse"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="gs-card p-5 text-center"
              >
                <div className="text-2xl mb-2">🤗</div>
                <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text)", marginBottom: "4px" }}>
                  No problem at all!
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-3)" }}>
                  Browse teams below and join when you're ready.
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Team list ── */}
          <div>
            <h2 style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-2)", marginBottom: "10px" }}>All Teams</h2>
            <div className="space-y-3">
              {TEAMS.map(team => {
                const isJoined = joinedTeams.includes(team.id);
                return (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: team.id * 0.07 }}
                    className="gs-card overflow-hidden"
                    style={{ border: isJoined ? `1.5px solid ${team.border}` : "1px solid var(--border)" }}
                  >
                    <button
                      className="w-full flex items-center gap-3 p-4 text-left"
                      onClick={() => setOpenTeam(openTeam === team.id ? null : team.id)}
                    >
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: team.bg, border: `1.5px solid ${team.border}` }}>
                        {team.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>
                            {team.name}
                            <span style={{ fontWeight: 500, color: "var(--text-3)", fontSize: "13px", marginLeft: "6px" }}>
                              ({team.count + (isJoined ? 1 : 0)} people)
                            </span>
                          </span>
                          {isJoined && (
                            <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "9px", fontWeight: 800, background: team.bg, color: team.color, border: `1px solid ${team.border}` }}>
                              ✓ Joined
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="gs-progress flex-1" style={{ height: "4px" }}>
                            <div className="gs-progress-fill" style={{ width: `${team.progress}%`, background: team.color }} />
                          </div>
                          <span style={{ fontSize: "10px", color: "var(--text-3)", fontWeight: 600 }}>{team.progress}%</span>
                        </div>
                      </div>
                      <motion.div animate={{ rotate: openTeam === team.id ? 90 : 0 }}>
                        <ChevronRight size={16} style={{ color: "var(--text-4)" }} />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {openTeam === team.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{ overflow: "hidden" }}
                        >
                          <div className="px-4 pb-4" style={{ borderTop: "1px solid var(--border-light)" }}>
                            <div className="my-3 p-3 rounded-xl" style={{ background: "var(--surface-2)" }}>
                              <div style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 600, marginBottom: "3px" }}>CURRENT TASK</div>
                              <div style={{ fontSize: "13px", color: "var(--text-2)", fontWeight: 600 }}>{team.task}</div>
                            </div>

                            <div style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 600, marginBottom: "10px" }}>TEAM MEMBERS</div>
                            <div className="space-y-2.5 mb-4">
                              {team.members.map((m, mi) => (
                                <div key={mi} className="flex items-center gap-3">
                                  <Avatar initials={m.initials} color={team.color} size={34} />
                                  <div className="flex-1">
                                    <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text)" }}>{m.name}</div>
                                    <div style={{ fontSize: "11px", color: "var(--text-3)" }}>{m.role}</div>
                                  </div>
                                  <StatusPill status={m.status} />
                                  <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handlePhone(team)}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg"
                                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                                    title={`Call ${m.name}`}
                                  >
                                    <Phone size={11} style={{ color: "var(--text-3)" }} />
                                  </motion.button>
                                </div>
                              ))}
                              {isJoined && (
                                <div className="flex items-center gap-3">
                                  <Avatar initials={userInitials} color={team.color} size={34} />
                                  <div className="flex-1">
                                    <div style={{ fontWeight: 700, fontSize: "13px", color: team.color }}>You</div>
                                    <div style={{ fontSize: "11px", color: "var(--text-3)" }}>Volunteer</div>
                                  </div>
                                  <span className="gs-chip gs-chip-green" style={{ fontSize: "10px" }}>Active</span>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2">
                              {!isJoined ? (
                                <motion.button
                                  whileTap={{ scale: 0.96 }}
                                  onClick={() => handleJoin(team)}
                                  className="gs-btn gs-btn-primary flex-1 py-2.5"
                                  style={{ fontSize: "13px" }}
                                >
                                  Join this team
                                </motion.button>
                              ) : (
                                <div className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                                  style={{ background: "var(--green-light)", border: "1px solid #bbf7d0" }}>
                                  <Check size={13} style={{ color: "var(--green)" }} />
                                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--green)" }}>You're on this team</span>
                                </div>
                              )}
                              <motion.button
                                whileTap={{ scale: 0.92 }}
                                onClick={() => setChatTeam(team)}
                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: "var(--lavender-light)", border: "1px solid #ddd6fe" }}
                                title="Team chat"
                              >
                                <MessageSquare size={14} style={{ color: "#7c3aed" }} />
                              </motion.button>
                              <motion.button
                                whileTap={{ scale: 0.92 }}
                                onClick={() => setScheduleTeam(team)}
                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: "var(--blue-light)", border: "1px solid #bfdbfe" }}
                                title="Schedule"
                              >
                                <Calendar size={14} style={{ color: "var(--blue)" }} />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ── Summary strip ── */}
          <div className="grid grid-cols-3 gap-3 pb-2">
            {[
              { label: "Teams active",      value: TEAMS.length,                                       icon: "🤝" },
              { label: "Total helpers",     value: TEAMS.reduce((s, t) => s + t.count, 0) + joinedTeams.length, icon: "👥" },
              { label: "Tasks in progress", value: TEAMS.length,                                       icon: "📋" },
            ].map(s => (
              <div key={s.label} className="gs-card p-3 text-center">
                <div style={{ fontSize: "18px", marginBottom: "4px" }}>{s.icon}</div>
                <div style={{ fontWeight: 800, fontSize: "18px", color: "var(--text)" }}>{s.value}</div>
                <div style={{ fontSize: "10px", color: "var(--text-3)", fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
