import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Clock, CheckCircle, Circle, Users, MessageSquare, Navigation, ChevronDown, ChevronUp, Phone, Send, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";

const INITIAL_TASKS = [
  { id:1, text:"Pick up food supplies from Depot A",    note:"Bring the van — 14 boxes",   done:true  },
  { id:2, text:"Drive to Sector 7 distribution point",  note:"Use entrance on Elm Street",  done:true  },
  { id:3, text:"Set up the serving area with the team", note:"Aria and Lena will guide you",done:false, current:true },
  { id:4, text:"Help serve food to community members",  note:"Estimated 1.5 hours",         done:false },
  { id:5, text:"Final clean-up and handoff",            note:"Leave by 5 pm if possible",   done:false },
];

const TEAM = [
  { name:"Aria K.",  role:"Lead cook",    initials:"AK", status:"active",   color:"#0f766e", phone:"+91 98765 43210" },
  { name:"Lena T.",  role:"Prep & serve", initials:"LT", status:"active",   color:"#0f766e", phone:"+91 98765 43211" },
  { name:"Dev M.",   role:"Driver",       initials:"DM", status:"active",   color:"#2563eb", phone:"+91 98765 43212" },
  { name:"Sofia R.", role:"Coordinator",  initials:"SR", status:"en-route", color:"#7c3aed", phone:"+91 98765 43213" },
];

const INITIAL_CHAT = [
  { from:"Aria K.",  msg:"Cooking is almost ready – maybe 20 mins!", time:"3m",  initials:"AK", color:"#0f766e", isMe:false },
  { from:"Sofia R.", msg:"On my way, 5 minutes out.",                 time:"7m",  initials:"SR", color:"#7c3aed", isMe:false },
  { from:"Dev M.",   msg:"Got the boxes — heading over now.",         time:"9m",  initials:"DM", color:"#2563eb", isMe:false },
];

function Avatar({ initials, color, size = 34 }: { initials:string; color:string; size?:number }) {
  return (
    <div
      style={{
        width:size, height:size, borderRadius:"50%",
        background:`${color}14`, border:`2px solid ${color}35`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize: size > 36 ? "14px" : "11px", fontWeight:800,
        color, fontFamily:"var(--font)", flexShrink:0,
      }}
    >
      {initials}
    </div>
  );
}

export function VolunteerActionScreen() {
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const chatEndRef   = useRef<HTMLDivElement>(null);

  const userInitials = (user?.name || "You").split(/\s+/).map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "★";

  const [tasks,      setTasks]      = useState(INITIAL_TASKS);
  const [showChat,   setShowChat]   = useState(false);
  const [complete,   setComplete]   = useState(false);
  const [chatMsgs,   setChatMsgs]   = useState(INITIAL_CHAT);
  const [chatInput,  setChatInput]  = useState("");
  const [loggedTime, setLoggedTime] = useState<string | null>(null);

  const donePct  = Math.round(tasks.filter(t => t.done).length / tasks.length * 100);
  const toggle   = (id:number) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const now = !t.done;
      if (now) toast.success(`✅ Task marked complete!`);
      return { ...t, done: now };
    }));
  };

  useEffect(() => {
    if (showChat) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMsgs, showChat]);

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChatMsgs(p => [
      ...p,
      { from: user?.name || "You", msg: chatInput.trim(), time: "now", initials: userInitials, color: "#2563eb", isMe: true },
    ]);
    setChatInput("");
    toast.success("📨 Message sent to team!");
  };

  const handleNavigate = () => {
    const dest = encodeURIComponent("Sector 7 Food Station, Elm Street");
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, "_blank");
    toast.success("🗺️ Opening navigation…");
  };

  const handlePhone = (member: typeof TEAM[0]) => {
    window.open(`tel:${member.phone}`);
    toast.info(`📞 Calling ${member.name} at ${member.phone}…`);
  };

  const handleComplete = () => {
    setComplete(true);
    toast.success("🎉 Mission complete! +350 XP earned. Streak extended!");
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background:"var(--bg)" }}>

      {/* ── Mission header ── */}
      <div
        className="flex-shrink-0 p-4"
        style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)" }}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <div style={{ fontSize:"11px", fontWeight:700, color:"var(--teal)", marginBottom:"4px", letterSpacing:"0.04em" }}>
              YOUR ACTIVE MISSION
            </div>
            <h1 style={{ fontWeight:800, fontSize:"17px", color:"var(--text)", lineHeight:1.2 }}>
              Food Station – Sector 7
            </h1>
          </div>
          <span className="gs-chip gs-chip-teal" style={{ flexShrink:0, marginTop:"2px" }}>In progress</span>
        </div>

        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1.5">
            <MapPin size={13} style={{ color:"var(--text-3)" }} />
            <span style={{ fontSize:"12px", color:"var(--text-2)", fontWeight:600 }}>0.8 km away</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={13} style={{ color:"var(--text-3)" }} />
            <span style={{ fontSize:"12px", color:"var(--text-2)", fontWeight:600 }}>ETA 4 min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={13} style={{ color:"var(--text-3)" }} />
            <span style={{ fontSize:"12px", color:"var(--text-2)", fontWeight:600 }}>{TEAM.length} with you</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1.5">
            <span style={{ fontSize:"12px", color:"var(--text-3)", fontWeight:500 }}>Task progress</span>
            <span style={{ fontSize:"12px", color:"var(--teal)", fontWeight:700 }}>
              {tasks.filter(t=>t.done).length}/{tasks.length} done
            </span>
          </div>
          <div className="gs-progress" style={{ height:"7px" }}>
            <motion.div
              animate={{ width:`${donePct}%` }}
              transition={{ duration:0.5 }}
              className="gs-progress-fill"
              style={{ background:"linear-gradient(90deg, var(--teal), #2dd4bf)" }}
            />
          </div>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">

          {/* ── Mini map card ── */}
          <div className="gs-card overflow-hidden">
            <div style={{ height:"130px", background:"#dde9f0", position:"relative", overflow:"hidden" }}>
              <svg width="100%" height="130" style={{ position:"absolute", inset:0 }}>
                <rect width="100%" height="130" fill="#dde9f0" />
                {[0,1,2,3,4,5,6].map(i=>(
                  <g key={i}>
                    <line x1={i*60} y1="0" x2={i*60} y2="130" stroke="rgba(180,200,220,0.4)" strokeWidth="0.5" />
                    <line x1="0" y1={i*30} x2="400" y2={i*30} stroke="rgba(180,200,220,0.4)" strokeWidth="0.5" />
                  </g>
                ))}
                {[[10,10,50,20],[70,10,50,20],[130,10,50,20],[200,10,80,20],[10,40,40,20],[60,40,60,20],[130,40,50,20],[200,40,70,20],[10,70,50,20],[70,70,50,20],[130,70,50,20],[200,70,80,20]].map(([x,y,w,h],i)=>(
                  <rect key={i} x={x} y={y} width={w} height={h} rx="4" fill="rgba(200,215,228,0.6)" />
                ))}
                <line x1="0" y1="65" x2="400" y2="65" stroke="rgba(255,255,255,0.85)" strokeWidth="5" />
                <line x1="190" y1="0" x2="190" y2="130" stroke="rgba(255,255,255,0.85)" strokeWidth="4" />
                <line x1="50" y1="100" x2="175" y2="65" stroke="#0f766e" strokeWidth="2" strokeDasharray="5,4" />
                <circle cx="175" cy="65" r="10" fill="rgba(15,118,110,0.15)" />
                <circle cx="175" cy="65" r="5" fill="#0f766e" />
                <circle cx="175" cy="65" r="2.5" fill="white" />
                <circle cx="50" cy="100" r="8" fill="rgba(37,99,235,0.15)" />
                <circle cx="50" cy="100" r="5" fill="#2563eb" />
                <circle cx="50" cy="100" r="2.5" fill="white" />
              </svg>
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                style={{ background:"rgba(255,255,255,0.92)", border:"1px solid var(--border)", backdropFilter:"blur(8px)", boxShadow:"var(--shadow-xs)" }}>
                <Navigation size={11} style={{ color:"var(--teal)" }} />
                <span style={{ fontSize:"11px", fontWeight:700, color:"var(--teal)" }}>4 min away</span>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <div style={{ fontWeight:700, fontSize:"13px", color:"var(--text)" }}>Sector 7 Food Station</div>
                <div style={{ fontSize:"11px", color:"var(--text-3)" }}>Elm Street entrance · 0.8 km</div>
              </div>
              <motion.button
                whileTap={{ scale:0.94 }}
                onClick={handleNavigate}
                className="gs-btn gs-btn-primary px-4 py-2.5 flex items-center gap-1.5"
                style={{ fontSize:"12px" }}
              >
                <ExternalLink size={12} /> Navigate
              </motion.button>
            </div>
          </div>

          {/* ── Task checklist ── */}
          <div className="gs-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5"
              style={{ borderBottom:"1px solid var(--border-light)" }}>
              <span style={{ fontWeight:700, fontSize:"14px", color:"var(--text)" }}>Your tasks</span>
              <span style={{ fontSize:"12px", color:"var(--teal)", fontWeight:700 }}>{donePct}% complete</span>
            </div>
            {tasks.map((task, i) => (
              <motion.button
                key={task.id}
                onClick={() => toggle(task.id)}
                className="w-full flex items-start gap-3 px-4 py-3.5 text-left"
                style={{
                  borderBottom:i < tasks.length-1 ? "1px solid var(--border-light)" : "none",
                  background:task.current && !task.done ? "var(--teal-pale)" : "transparent",
                }}
                whileTap={{ scale:0.99 }}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {task.done
                    ? <CheckCircle size={20} style={{ color:"var(--teal)", strokeWidth:2 }} />
                    : <Circle size={20} style={{ color:"var(--text-4)", strokeWidth:1.5 }} />}
                </div>
                <div className="flex-1">
                  <div style={{
                    fontSize:"13px", fontWeight:600,
                    color:task.done ? "var(--text-3)" : "var(--text)",
                    textDecoration:task.done ? "line-through" : "none",
                    lineHeight:1.4,
                  }}>
                    {task.text}
                  </div>
                  {!task.done && (
                    <div style={{ fontSize:"11px", color:"var(--text-3)", marginTop:"3px", fontWeight:500 }}>
                      {task.note}
                    </div>
                  )}
                </div>
                {task.current && !task.done && (
                  <span className="gs-chip gs-chip-teal flex-shrink-0" style={{ fontSize:"9px", marginTop:"1px" }}>Now</span>
                )}
              </motion.button>
            ))}
          </div>

          {/* ── Team ── */}
          <div className="gs-card p-4">
            <div style={{ fontWeight:700, fontSize:"14px", color:"var(--text)", marginBottom:"14px" }}>
              Who's here with you
            </div>
            <div className="space-y-3">
              {TEAM.map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Avatar initials={m.initials} color={m.color} />
                  <div className="flex-1">
                    <div style={{ fontWeight:700, fontSize:"13px", color:"var(--text)" }}>{m.name}</div>
                    <div style={{ fontSize:"11px", color:"var(--text-3)" }}>{m.role}</div>
                  </div>
                  <span
                    className="gs-chip"
                    style={{
                      background: m.status === "active" ? "var(--green-light)" : "var(--blue-light)",
                      color: m.status === "active" ? "var(--green)" : "var(--blue)",
                      fontSize:"10px",
                    }}
                  >
                    {m.status === "active" ? "Active" : "En route"}
                  </span>
                  <motion.button
                    whileTap={{ scale:0.9 }}
                    onClick={() => handlePhone(m)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg"
                    style={{ background:"var(--surface-2)", border:"1px solid var(--border)", cursor:"pointer" }}
                    title={`Call ${m.name}`}
                  >
                    <Phone size={11} style={{ color:"var(--text-3)" }} />
                  </motion.button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Chat ── */}
          <div className="gs-card overflow-hidden">
            <motion.button
              className="w-full flex items-center justify-between px-4 py-3.5"
              onClick={() => setShowChat(!showChat)}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:"var(--lavender-light)" }}>
                  <MessageSquare size={13} style={{ color:"#7c3aed" }} />
                </div>
                <span style={{ fontWeight:700, fontSize:"14px", color:"var(--text)" }}>Team messages</span>
                <span className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background:"#7c3aed", fontSize:"9px", color:"#fff", fontWeight:700 }}>
                  {chatMsgs.length}
                </span>
              </div>
              {showChat
                ? <ChevronUp size={15} style={{ color:"var(--text-3)" }} />
                : <ChevronDown size={15} style={{ color:"var(--text-3)" }} />}
            </motion.button>

            <AnimatePresence>
              {showChat && (
                <motion.div
                  initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
                  style={{ overflow:"hidden" }}
                >
                  {/* Messages */}
                  <div style={{ maxHeight: "260px", overflowY: "auto" }}>
                    {chatMsgs.map((m, i) => (
                      <div
                        key={i}
                        className={`flex items-end gap-2.5 px-4 py-2.5 ${m.isMe ? "flex-row-reverse" : ""}`}
                        style={{ borderTop:"1px solid var(--border-light)" }}
                      >
                        <Avatar initials={m.initials} color={m.color} size={28} />
                        <div className={`max-w-[72%] flex flex-col gap-0.5 ${m.isMe ? "items-end" : ""}`}>
                          <span style={{ fontSize: "10px", fontWeight: 700, color: m.color, paddingLeft: m.isMe ? 0 : "4px" }}>
                            {m.from} · {m.time} ago
                          </span>
                          <div className="px-3 py-2 rounded-2xl"
                            style={{
                              background: m.isMe ? "var(--teal)" : "var(--surface-2)",
                              border: m.isMe ? "none" : "1px solid var(--border)",
                              borderBottomRightRadius: m.isMe ? "4px" : "14px",
                              borderBottomLeftRadius:  m.isMe ? "14px" : "4px",
                            }}>
                            <p style={{ fontSize:"12px", color: m.isMe ? "#fff" : "var(--text-2)", fontWeight:500, lineHeight:1.4 }}>
                              {m.msg}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat input */}
                  <div className="flex items-center gap-2 px-3 py-3"
                    style={{ borderTop:"1px solid var(--border-light)" }}>
                    <input
                      className="flex-1 px-3.5 py-2.5 rounded-2xl outline-none"
                      style={{
                        background:"var(--surface-2)", border:"1.5px solid var(--border)",
                        fontSize:"12px", color:"var(--text)", fontFamily:"var(--font)",
                      }}
                      placeholder="Message your team…"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && sendChat()}
                    />
                    <motion.button
                      whileTap={{ scale:0.9 }}
                      onClick={sendChat}
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: chatInput.trim() ? "var(--teal)" : "var(--surface-2)",
                        border: chatInput.trim() ? "none" : "1px solid var(--border)",
                        cursor:"pointer", transition:"background 0.2s",
                      }}
                    >
                      <Send size={14} style={{ color: chatInput.trim() ? "#fff" : "var(--text-4)" }} />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Time log card (if not complete) ── */}
          {!complete && loggedTime && (
            <motion.div
              initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
              className="gs-card p-3 flex items-center gap-3"
              style={{ border:"1.5px solid #bbf7d0" }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:"var(--green-light)" }}>
                <Clock size={16} style={{ color:"var(--green)" }} />
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:"13px", color:"var(--text)" }}>Time logged: {loggedTime}</div>
                <div style={{ fontSize:"11px", color:"var(--text-3)" }}>Keep it up!</div>
              </div>
              <button className="ml-auto" onClick={() => setLoggedTime(null)}>
                <X size={14} style={{ color:"var(--text-4)" }} />
              </button>
            </motion.div>
          )}

          {/* ── Complete button ── */}
          <AnimatePresence mode="wait">
            {!complete ? (
              <div className="flex gap-3">
                <motion.button
                  key="log"
                  whileTap={{ scale:0.97 }}
                  onClick={() => {
                    const hrs = ["0.5h","1h","1.5h","2h","2.5h","3h"];
                    const t = hrs[Math.floor(Math.random() * hrs.length)];
                    setLoggedTime(t);
                    toast.success(`⏱️ Logged ${t} of volunteer time!`);
                  }}
                  className="gs-btn gs-btn-secondary py-4 px-5"
                  style={{ fontSize:"14px" }}
                >
                  <Clock size={15} /> Log time
                </motion.button>
                <motion.button
                  key="cta"
                  whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                  onClick={handleComplete}
                  className="gs-btn gs-btn-primary flex-1 py-4"
                  style={{ fontSize:"15px" }}
                >
                  Mark Mission Complete
                </motion.button>
              </div>
            ) : (
              <motion.div
                key="done"
                initial={{ scale:0.9, opacity:0 }}
                animate={{ scale:1, opacity:1 }}
                transition={{ type:"spring", stiffness:260 }}
                className="gs-card p-6 text-center"
                style={{ border:"1.5px solid #bbf7d0" }}
              >
                <motion.div
                  initial={{ scale:0 }} animate={{ scale:1 }}
                  transition={{ type:"spring", stiffness:300, delay:0.1 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background:"var(--green-light)", border:"2px solid #bbf7d0" }}
                >
                  <CheckCircle size={30} style={{ color:"var(--green)", strokeWidth:2 }} />
                </motion.div>
                <div style={{ fontWeight:800, fontSize:"18px", color:"var(--text)", marginBottom:"6px" }}>
                  Mission complete! 🎉
                </div>
                <div style={{ fontSize:"13px", color:"var(--text-3)", fontWeight:500, marginBottom:"16px" }}>
                  You helped feed 80 people today. Thank you!
                </div>
                <div className="flex gap-3 justify-center mb-4">
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
                    style={{ background:"var(--teal-light)", border:"1px solid #99f6e4" }}>
                    <span style={{ fontSize:"14px" }}>⭐</span>
                    <span style={{ fontWeight:700, fontSize:"12px", color:"var(--teal)" }}>+350 points</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
                    style={{ background:"var(--amber-light)", border:"1px solid #fde68a" }}>
                    <span style={{ fontSize:"14px" }}>🔥</span>
                    <span style={{ fontWeight:700, fontSize:"12px", color:"var(--amber)" }}>Streak +1</span>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale:0.97 }}
                  onClick={() => navigate("/volunteer")}
                  className="gs-btn gs-btn-primary px-6 py-3 w-full"
                  style={{ fontSize:"14px" }}
                >
                  Back to Dashboard
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
