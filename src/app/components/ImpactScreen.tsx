import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Star, TrendingUp, Award, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

const BADGES = [
  { id:1, name:"First Step",     icon:"👣", desc:"Completed your first mission",  earned:true,  color:"#0f766e", bg:"var(--teal-light)",     border:"#99f6e4" },
  { id:2, name:"Food Friend",    icon:"🍽️", desc:"Completed 10 food missions",    earned:true,  color:"#059669", bg:"var(--green-light)",    border:"#bbf7d0" },
  { id:3, name:"On a Roll",      icon:"🔥", desc:"7-day helping streak",          earned:true,  color:"#b45309", bg:"var(--amber-light)",    border:"#fde68a" },
  { id:4, name:"Team Player",    icon:"🤝", desc:"Led a team of 5+",              earned:true,  color:"#2563eb", bg:"var(--blue-light)",     border:"#bfdbfe" },
  { id:5, name:"Life Changer",   icon:"💙", desc:"Help 500 people",               earned:false, color:"#e11d48", bg:"var(--rose-light)",     border:"#fecaca", pct:68 },
  { id:6, name:"Night Helper",   icon:"🌙", desc:"3 evening missions",            earned:false, color:"#7c3aed", bg:"var(--lavender-light)", border:"#ddd6fe", pct:33 },
  { id:7, name:"Speedy Helper",  icon:"⚡", desc:"Complete in record time",       earned:false, color:"#b45309", bg:"var(--amber-light)",    border:"#fde68a", pct:80 },
  { id:8, name:"Connector",      icon:"🌐", desc:"Link 20 volunteers",            earned:false, color:"#0f766e", bg:"var(--teal-light)",     border:"#99f6e4", pct:45 },
];

const BOARD = [
  { rank:1, name:"Anika S.",  xp:12450, missions:48, emoji:"🥇", streak:21 },
  { rank:2, name:"Chen W.",   xp:11200, missions:43, emoji:"🥈", streak:15 },
  { rank:3, name:"Yusuf A.",  xp:9870,  missions:38, emoji:"🥉", streak:12 },
  { rank:4, name:"Sofia R.",  xp:8650,  missions:34, emoji:"",   streak:8  },
  { rank:5, name:"You",       xp:7820,  missions:29, emoji:"⭐", streak:7, isMe:true },
  { rank:6, name:"Priya N.",  xp:6540,  missions:25, emoji:"",   streak:4  },
  { rank:7, name:"Marcus O.", xp:5230,  missions:20, emoji:"",   streak:3  },
];

const XP = 7820, XP_NEXT = 10000, LEVEL = 14;

const TABS = [
  { id:"overview",     label:"Overview" },
  { id:"badges",       label:"Badges"   },
  { id:"leaderboard",  label:"Rankings" },
] as const;

function RingChart({ pct, color, size = 110 }: { pct:number; color:string; size?:number }) {
  const r = size/2 - 8, c = 2*Math.PI*r;
  return (
    <svg width={size} height={size} className="absolute inset-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border-light)" strokeWidth="7" />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - pct) }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ filter:`drop-shadow(0 2px 6px ${color}40)` }}
      />
    </svg>
  );
}

function Avatar({ initials, size=34 }: { initials:string; size?:number }) {
  return (
    <div
      style={{
        width:size, height:size, borderRadius:"50%",
        background:"var(--teal-light)", border:"2px solid #99f6e4",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:size > 34 ? "14px" : "10px", fontWeight:800,
        color:"var(--teal)", fontFamily:"var(--font)", flexShrink:0,
      }}
    >
      {initials}
    </div>
  );
}

export function ImpactScreen() {
  const [tab, setTab] = useState<"overview"|"badges"|"leaderboard">("overview");
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayName = user?.name || user?.email?.split("@")[0] || "Alex Chen";

  return (
    <div className="h-full overflow-y-auto" style={{ background:"var(--bg)" }}>
      <div className="p-4 space-y-4">

        {/* ── Hero message ── */}
        <motion.div
          initial={{ opacity:0, y:8 }}
          animate={{ opacity:1, y:0 }}
          className="gs-card p-5 text-center"
          style={{ border:"1.5px solid #99f6e4", background:"linear-gradient(135deg, var(--teal-pale), var(--surface))" }}
        >
          <div style={{ fontSize:"32px", marginBottom:"8px" }}>💙</div>
          <div style={{ fontWeight:800, fontSize:"20px", color:"var(--text)", marginBottom:"4px" }}>
            You helped 80 people today!
          </div>
          <div style={{ fontSize:"13px", color:"var(--text-3)", fontWeight:500, lineHeight:1.5 }}>
            Every hour you give makes a real difference to your community.
            Thank you for showing up.
          </div>
        </motion.div>

        {/* ── Profile + level ── */}
        <div className="gs-card p-4">
          <div className="flex items-center gap-4">
            {/* Ring */}
            <div style={{ position:"relative", width:110, height:110, flexShrink:0 }}>
              <RingChart pct={XP/XP_NEXT} color="var(--teal)" />
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2 }}>
                <div style={{ fontWeight:800, fontSize:"20px", color:"var(--teal)", lineHeight:1 }}>{LEVEL}</div>
                <div style={{ fontSize:"9px", color:"var(--text-3)", fontWeight:600 }}>LEVEL</div>
              </div>
            </div>

            <div className="flex-1">
              <div style={{ fontWeight:800, fontSize:"17px", color:"var(--text)" }}>{displayName}</div>
              <div style={{ fontSize:"12px", color:"var(--teal)", fontWeight:600, marginTop:"2px" }}>
                Community Volunteer
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between">
                  <span style={{ fontSize:"11px", color:"var(--text-3)", fontWeight:500 }}>Progress to Level {LEVEL+1}</span>
                  <span style={{ fontSize:"11px", color:"var(--teal)", fontWeight:700 }}>
                    {XP.toLocaleString()} / {XP_NEXT.toLocaleString()} pts
                  </span>
                </div>
                <div className="gs-progress" style={{ height:"6px" }}>
                  <motion.div
                    initial={{ width:0 }}
                    animate={{ width:`${(XP/XP_NEXT)*100}%` }}
                    transition={{ duration:1.2, ease:"easeOut" }}
                    className="gs-progress-fill"
                    style={{ background:"linear-gradient(90deg, var(--teal), #2dd4bf)" }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span
                  className="gs-chip gs-chip-amber"
                  style={{ fontSize:"10px" }}
                >
                  🔥 7-day streak
                </span>
                <span
                  className="gs-chip gs-chip-teal"
                  style={{ fontSize:"10px" }}
                >
                  ⭐ Top 5%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div
          className="flex gap-1 p-1 rounded-2xl"
          style={{ background:"var(--surface)", border:"1px solid var(--border)" }}
        >
          {TABS.map(t => (
            <motion.button
              key={t.id}
              whileTap={{ scale:0.95 }}
              onClick={() => setTab(t.id)}
              className="flex-1 py-2.5 rounded-xl"
              style={{
                background: tab === t.id ? "var(--teal)" : "transparent",
                color: tab === t.id ? "#fff" : "var(--text-3)",
                fontWeight:700, fontSize:"12px", fontFamily:"var(--font)",
                boxShadow: tab === t.id ? "0 2px 8px rgba(15,118,110,0.25)" : "none",
              }}
            >
              {t.label}
            </motion.button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <AnimatePresence mode="wait">

          {/* OVERVIEW */}
          {tab === "overview" && (
            <motion.div key="overview" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="space-y-3">
              {/* 4 stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label:"People helped",   value:"342",   icon:"💙", color:"var(--teal)",    bg:"var(--teal-light)",    note:"+80 today" },
                  { label:"Missions done",   value:"29",    icon:"✅", color:"var(--green)",   bg:"var(--green-light)",   note:"+3 this week" },
                  { label:"Points earned",   value:"7,820", icon:"⭐", color:"#b45309",        bg:"var(--amber-light)",   note:"+350 today" },
                  { label:"Day streak",      value:"7",     icon:"🔥", color:"#e11d48",        bg:"var(--rose-light)",    note:"Personal best!" },
                ].map((s,i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay:i*0.07 }}
                    className="gs-card p-4"
                  >
                    <div style={{ fontSize:"22px", marginBottom:"6px" }}>{s.icon}</div>
                    <div style={{ fontWeight:800, fontSize:"22px", color:s.color, lineHeight:1, marginBottom:"2px" }}>{s.value}</div>
                    <div style={{ fontSize:"11px", color:"var(--text-3)", fontWeight:500 }}>{s.label}</div>
                    <div style={{ fontSize:"10px", color:"var(--green)", fontWeight:600, marginTop:"3px" }}>↑ {s.note}</div>
                  </motion.div>
                ))}
              </div>

              {/* Impact visualization */}
              <div className="gs-card p-4">
                <div style={{ fontWeight:700, fontSize:"14px", color:"var(--text)", marginBottom:"14px" }}>
                  Your impact this month
                </div>
                <div className="space-y-3">
                  {[
                    { label:"People received food",      value:203, max:300, color:"var(--teal)" },
                    { label:"Medical needs supported",   value:87,  max:150, color:"var(--blue)"  },
                    { label:"Children with learning aid",value:52,  max:80,  color:"#7c3aed"       },
                  ].map((r, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-1.5">
                        <span style={{ fontSize:"12px", color:"var(--text-2)", fontWeight:600 }}>{r.label}</span>
                        <span style={{ fontSize:"12px", color:r.color, fontWeight:700 }}>{r.value}</span>
                      </div>
                      <div className="gs-progress" style={{ height:"7px" }}>
                        <motion.div
                          initial={{ width:0 }}
                          animate={{ width:`${(r.value/r.max)*100}%` }}
                          transition={{ delay:0.2+i*0.1, duration:0.8, ease:"easeOut" }}
                          className="gs-progress-fill"
                          style={{ background:r.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent activity */}
              <div className="gs-card overflow-hidden">
                <div
                  style={{ padding:"14px 16px", borderBottom:"1px solid var(--border-light)", fontWeight:700, fontSize:"14px", color:"var(--text)" }}
                >
                  Recent activity
                </div>
                {[
                  { text:"Food mission at Sector 7",  time:"2h ago",  pts:350, icon:"🍽️" },
                  { text:"7-day streak achieved!",    time:"1d ago",  pts:500, icon:"🔥" },
                  { text:"Joined delivery team",      time:"2d ago",  pts:200, icon:"🚐" },
                  { text:"Helped 100 people milestone",time:"3d ago", pts:750, icon:"💙" },
                ].map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ borderBottom:i < 3 ? "1px solid var(--border-light)" : "none" }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                      style={{ background:"var(--surface-2)", border:"1px solid var(--border-light)" }}
                    >
                      {a.icon}
                    </div>
                    <div className="flex-1">
                      <div style={{ fontSize:"13px", fontWeight:600, color:"var(--text)" }}>{a.text}</div>
                      <div style={{ fontSize:"11px", color:"var(--text-3)", fontWeight:500 }}>{a.time}</div>
                    </div>
                    <span style={{ fontWeight:700, fontSize:"12px", color:"var(--teal)" }}>+{a.pts}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* BADGES */}
          {tab === "badges" && (
            <motion.div key="badges" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <span style={{ fontSize:"13px", color:"var(--text-3)", fontWeight:500 }}>
                  {BADGES.filter(b=>b.earned).length} of {BADGES.length} earned
                </span>
                <span style={{ fontSize:"12px", color:"var(--teal)", fontWeight:700 }}>
                  {Math.round(BADGES.filter(b=>b.earned).length/BADGES.length*100)}% complete
                </span>
              </div>

              {/* Earned */}
              <div className="gs-card p-4">
                <div style={{ fontWeight:700, fontSize:"13px", color:"var(--text-2)", marginBottom:"14px" }}>
                  Earned badges
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {BADGES.filter(b=>b.earned).map((b, i) => (
                    <motion.div
                      key={b.id}
                      initial={{ scale:0 }} animate={{ scale:1 }}
                      transition={{ delay:i*0.07, type:"spring", stiffness:300 }}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <motion.div
                        whileHover={{ scale:1.08 }}
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                        style={{ background:b.bg, border:`1.5px solid ${b.border}`, boxShadow:`0 2px 10px ${b.color}18` }}
                      >
                        {b.icon}
                      </motion.div>
                      <span style={{ fontSize:"9px", fontWeight:700, color:b.color, textAlign:"center", lineHeight:1.3 }}>
                        {b.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* In progress */}
              <div className="gs-card p-4">
                <div style={{ fontWeight:700, fontSize:"13px", color:"var(--text-2)", marginBottom:"14px" }}>
                  In progress
                </div>
                <div className="space-y-4">
                  {BADGES.filter(b=>!b.earned).map((b, i) => (
                    <motion.div key={b.id} initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.08 }}
                      className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background:b.bg, border:`1.5px solid ${b.border}`, opacity:0.6 }}
                      >
                        {b.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span style={{ fontSize:"13px", fontWeight:700, color:"var(--text)" }}>{b.name}</span>
                          <span style={{ fontSize:"12px", color:b.color, fontWeight:700 }}>{b.pct}%</span>
                        </div>
                        <div className="gs-progress mb-1.5" style={{ height:"5px" }}>
                          <motion.div
                            initial={{ width:0 }}
                            animate={{ width:`${b.pct}%` }}
                            transition={{ delay:0.2+i*0.1, duration:0.7 }}
                            className="gs-progress-fill"
                            style={{ background:b.color }}
                          />
                        </div>
                        <span style={{ fontSize:"11px", color:"var(--text-3)", fontWeight:500 }}>{b.desc}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* LEADERBOARD */}
          {tab === "leaderboard" && (
            <motion.div key="board" initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="space-y-3">
              {/* Podium top 3 */}
              <div className="gs-card p-4">
                <div style={{ fontWeight:700, fontSize:"13px", color:"var(--text-2)", marginBottom:"16px", textAlign:"center" }}>
                  This month's top helpers 🏆
                </div>
                <div className="flex items-end justify-center gap-4">
                  {[BOARD[1],BOARD[0],BOARD[2]].map((p,i)=>{
                    const heights  = [70,90,58];
                    const borders  = ["#bfdbfe","#99f6e4","#fde68a"];
                    const bgs      = ["var(--blue-light)","var(--teal-light)","var(--amber-light)"];
                    return (
                      <motion.div
                        key={p.rank}
                        initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                        transition={{ delay:i*0.1, type:"spring" }}
                        className="flex flex-col items-center gap-1.5"
                        style={{ width:72 }}
                      >
                        <span style={{ fontSize:"18px" }}>{p.emoji || "🎖️"}</span>
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center"
                          style={{ background:bgs[i], border:`1.5px solid ${borders[i]}`, fontWeight:800, fontSize:"11px", color:"var(--text)" }}
                        >
                          {p.name.split(" ").map(n=>n[0]).join("")}
                        </div>
                        <span style={{ fontSize:"10px", fontWeight:700, color:"var(--text-2)", textAlign:"center" }}>
                          {p.name.split(" ")[0]}
                        </span>
                        <div
                          className="w-full rounded-t-xl flex items-end justify-center pb-2"
                          style={{ height:heights[i], background:bgs[i], border:`1px solid ${borders[i]}` }}
                        >
                          <span style={{ fontSize:"10px", fontWeight:700, color:"var(--text-2)" }}>
                            {(p.xp/1000).toFixed(1)}K
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Full list */}
              <div className="gs-card overflow-hidden">
                {BOARD.map((p,i)=>(
                  <motion.div
                    key={p.rank}
                    initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }}
                    transition={{ delay:i*0.05 }}
                    className="flex items-center gap-3 px-4 py-3.5"
                    style={{
                      borderBottom:i<BOARD.length-1?"1px solid var(--border-light)":"none",
                      background:p.isMe ? "var(--teal-pale)" : "transparent",
                      borderLeft:p.isMe ? "3px solid var(--teal)" : "3px solid transparent",
                    }}
                  >
                    <div
                      style={{
                        width:22, fontWeight:800, fontSize:"14px", textAlign:"center",
                        color:i<3 ? ["#b45309","#475569","#b45309"][i] : "var(--text-4)",
                      }}
                    >
                      {p.rank}
                    </div>
                    <Avatar
                      initials={p.isMe ? "★" : p.name.split(" ").map(n=>n[0]).join("")}
                    />
                    <div className="flex-1">
                      <div style={{ fontWeight:700, fontSize:"13px", color:p.isMe ? "var(--teal)" : "var(--text)" }}>
                        {p.name} {p.isMe ? "· You" : ""}
                      </div>
                      <div style={{ fontSize:"11px", color:"var(--text-3)", fontWeight:500 }}>
                        {p.missions} missions · 🔥 {p.streak}d streak
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontWeight:800, fontSize:"13px", color:"var(--teal)" }}>
                        {p.xp.toLocaleString()}
                      </div>
                      <div style={{ fontSize:"10px", color:"var(--text-4)" }}>points</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Encouragement */}
              <div
                className="gs-card p-5 text-center"
                style={{ border:"1.5px solid #99f6e4" }}
              >
                <div style={{ fontWeight:700, fontSize:"14px", color:"var(--text)", marginBottom:"4px" }}>
                  2,180 points from #4 position
                </div>
                <div style={{ fontSize:"12px", color:"var(--text-3)", marginBottom:"14px" }}>
                  Just two more missions and you'll climb the rankings. Keep going!
                </div>
                <motion.button
                  whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                  className="gs-btn gs-btn-primary px-6 py-2.5"
                  style={{ fontSize:"13px" }}
                  onClick={() => {
                    toast.success("🗺️ Finding a mission near you…");
                    setTimeout(() => navigate("/mission"), 600);
                  }}
                >
                  Find a mission <ChevronRight size={14} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}