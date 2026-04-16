import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RefreshCw, Plus, Send, Search, X, Check, CheckCircle2,
  Users, MapPin, BarChart3, TrendingUp, AlertTriangle,
  Sparkles, ChevronRight, Download, MessageSquare, Bell,
  UserCheck, Zap, Eye, Copy, Mail, FilePlus,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { useNeeds } from "../context/NeedsContext";
import { useNavigate } from "react-router";

// ── Types ─────────────────────────────────────────────────────────────────────
type TaskStatus  = "Open" | "In Progress" | "Done";
type Urgency     = "Critical" | "High" | "Normal";
type VolStatus   = "Active" | "Available" | "Offline";
type DashTab     = "overview" | "tasks" | "volunteers" | "reports";
type TaskFilter  = "All" | "Open" | "In Progress" | "Done" | "Critical";

interface Task {
  id: number; title: string; category: string; icon: string;
  location: string; urgency: Urgency; status: TaskStatus;
  needed: number; assigned: number; desc: string; time: string;
}
interface Volunteer {
  id: number; name: string; initials: string; skills: string[];
  status: VolStatus; task: string | null; missions: number;
  location: string; rating: number;
}

// ── Static data ───────────────────────────────────────────────────────────────
const INIT_TASKS: Task[] = [
  { id:1,  title:"Food Distribution – Sector 7",    category:"Food",         icon:"🍽️", location:"Sector 7 Community Hall",  urgency:"Critical", status:"In Progress", needed:18, assigned:8,  desc:"Emergency food packets for 200+ families displaced by recent flooding.",     time:"2h ago" },
  { id:2,  title:"Medical Aid Camp – East Side",     category:"Medical",      icon:"🏥", location:"East Side Primary School",  urgency:"High",     status:"In Progress", needed:15, assigned:11, desc:"Basic health checkups and medication distribution for senior citizens.",       time:"4h ago" },
  { id:3,  title:"Learning Support – North Quarter", category:"Education",    icon:"📖", location:"North Quarter Library",     urgency:"Normal",   status:"Open",        needed:9,  assigned:2,  desc:"After-school learning support for children affected by school closures.",      time:"1d ago" },
  { id:4,  title:"Shelter Repair – West Camp",       category:"Shelter",      icon:"🏠", location:"West Relief Camp, Zone 4",  urgency:"High",     status:"Open",        needed:12, assigned:6,  desc:"Repair and reinforce temporary shelters before expected rainfall.",            time:"6h ago" },
  { id:5,  title:"Water Purification – South Zone",  category:"Water",        icon:"💧", location:"South Zone Checkpoint",     urgency:"Critical", status:"Open",        needed:8,  assigned:4,  desc:"Distribute water purification tablets and filter systems to 150 households.", time:"30m ago" },
  { id:6,  title:"Supply Logistics – Central Hub",   category:"Logistics",    icon:"📦", location:"Central Relief Hub",        urgency:"Normal",   status:"In Progress", needed:10, assigned:7,  desc:"Sort, pack and dispatch incoming supply donations to 5 relief points.",        time:"3h ago" },
  { id:7,  title:"Child Counseling Sessions",        category:"Mental Health",icon:"💬", location:"Hope Community Centre",     urgency:"Normal",   status:"Open",        needed:6,  assigned:1,  desc:"Trained counselors needed for child trauma support sessions.",                 time:"1d ago" },
  { id:8,  title:"Medical Supplies Delivery",        category:"Medical",      icon:"🚐", location:"3 drop points – Full route",urgency:"High",     status:"Done",        needed:5,  assigned:5,  desc:"Urgent delivery of insulin and blood pressure medications to 3 clinics.",     time:"5h ago" },
];

const INIT_VOLS: Volunteer[] = [
  { id:1,  name:"Anika Sharma",  initials:"AS", skills:["First Aid","Driving"],      status:"Active",    task:"Food Distribution – Sector 7",    missions:48, location:"Sector 7",    rating:4.9 },
  { id:2,  name:"Rahul Dev",     initials:"RD", skills:["Logistics","Cooking"],      status:"Active",    task:"Supply Logistics – Central Hub",   missions:32, location:"Central Hub", rating:4.7 },
  { id:3,  name:"Priya Nair",    initials:"PN", skills:["Counseling","Translation"], status:"Available", task:null,                               missions:19, location:"North Zone",  rating:4.8 },
  { id:4,  name:"Chen Wei",      initials:"CW", skills:["Medical","First Aid"],      status:"Active",    task:"Medical Aid Camp – East Side",     missions:43, location:"East Side",   rating:5.0 },
  { id:5,  name:"Sofia Rahman",  initials:"SR", skills:["Teaching","Childcare"],     status:"Available", task:null,                               missions:27, location:"West Zone",   rating:4.6 },
  { id:6,  name:"Marcus Obi",    initials:"MO", skills:["Driving","Logistics"],      status:"Offline",   task:null,                               missions:15, location:"South Zone",  rating:4.5 },
  { id:7,  name:"Leena Thomas",  initials:"LT", skills:["Cooking","Childcare"],      status:"Active",    task:"Food Distribution – Sector 7",    missions:38, location:"Sector 7",    rating:4.8 },
  { id:8,  name:"James Patel",   initials:"JP", skills:["Tech","Logistics"],         status:"Available", task:null,                               missions:11, location:"North Zone",  rating:4.4 },
  { id:9,  name:"Deepa Menon",   initials:"DM", skills:["Medical","Translation"],    status:"Active",    task:"Medical Aid Camp – East Side",     missions:56, location:"East Side",   rating:4.9 },
  { id:10, name:"Yusuf Ali",     initials:"YA", skills:["Driving","First Aid"],      status:"Available", task:null,                               missions:22, location:"Central Hub", rating:4.7 },
];

const HOURLY = [
  {t:"8am",v:28},{t:"9am",v:35},{t:"10am",v:42},{t:"11am",v:38},
  {t:"12pm",v:55},{t:"1pm",v:62},{t:"2pm",v:50},{t:"3pm",v:68},
  {t:"4pm",v:75},{t:"5pm",v:58},{t:"6pm",v:72},{t:"Now",v:147},
];
const WEEKLY = [
  {day:"Mon",helped:45},{day:"Tue",helped:62},{day:"Wed",helped:58},
  {day:"Thu",helped:80},{day:"Fri",helped:95},{day:"Sat",helped:112},{day:"Today",helped:138},
];
const CAT_PIE = [
  {name:"Food",value:8,color:"#0f766e"},{name:"Medical",value:5,color:"#2563eb"},
  {name:"Education",value:4,color:"#7c3aed"},{name:"Shelter",value:3,color:"#b45309"},
  {name:"Water",value:2,color:"#059669"},{name:"Other",value:3,color:"#94a3b8"},
];
const SUGGESTIONS = [
  {id:1,text:"3 volunteers near Sector 7 are unassigned – perfect for food distribution gap.",action:"Assign them",icon:"🍽️",color:"#0f766e",bg:"var(--teal-light)",border:"#99f6e4"},
  {id:2,text:"Water Purification is Critical with only 50% coverage — needs urgent attention.",action:"Boost now",icon:"💧",color:"#e11d48",bg:"#fff1f2",border:"#fecaca"},
  {id:3,text:"Medical Aid has 11/15 volunteers — consider adding 2 more before evening surge.",action:"Find volunteers",icon:"🏥",color:"#2563eb",bg:"var(--blue-light)",border:"#bfdbfe"},
  {id:4,text:"Chen Wei has completed 5 tasks this week — a thank-you note would go a long way!",action:"Send thanks",icon:"⭐",color:"#b45309",bg:"var(--amber-light)",border:"#fde68a"},
];

const URGENCY_CFG: Record<Urgency,{label:string;color:string;bg:string;border:string}> = {
  Critical: {label:"Critical", color:"#e11d48", bg:"#fff1f2",           border:"#fecaca"},
  High:     {label:"High",     color:"#b45309", bg:"var(--amber-light)", border:"#fde68a"},
  Normal:   {label:"Normal",   color:"#059669", bg:"var(--green-light)", border:"#bbf7d0"},
};
const STATUS_CFG: Record<TaskStatus,{color:string;bg:string;border:string}> = {
  "Open":        {color:"#2563eb", bg:"var(--blue-light)",  border:"#bfdbfe"},
  "In Progress": {color:"#0f766e", bg:"var(--teal-light)",  border:"#99f6e4"},
  "Done":        {color:"#059669", bg:"var(--green-light)", border:"#bbf7d0"},
};
const VOL_STATUS_CFG: Record<VolStatus,{dot:string;label:string;color:string}> = {
  Active:    {dot:"#059669", label:"Active",    color:"#059669"},
  Available: {dot:"#0f766e", label:"Available", color:"#0f766e"},
  Offline:   {dot:"#cbd5e1", label:"Offline",   color:"#94a3b8"},
};

const CATEGORIES = ["Food","Medical","Education","Shelter","Water","Logistics","Mental Health","Sanitation","Transport","Other"];
const ICONS_MAP: Record<string,string> = {
  Food:"🍽️",Medical:"🏥",Education:"📖",Shelter:"🏠",Water:"💧",
  Logistics:"📦","Mental Health":"💬",Sanitation:"🧹",Transport:"🚐",Other:"📌",
};

// ── Main component ────────────────────────────────────────────────────────────
export function MissionControlScreen() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const { needs, openCount, totalAffected, updateNeedStatus } = useNeeds();
  const orgName    = user?.orgName || user?.name || "Your Organisation";
  const orgType    = user?.orgType  || "NGO";

  const [tab,         setTab]         = useState<DashTab>("overview");
  const [tasks,       setTasks]       = useState<Task[]>(INIT_TASKS);
  const [taskFilter,  setTaskFilter]  = useState<TaskFilter>("All");
  const [volSearch,   setVolSearch]   = useState("");
  const [sugg,        setSugg]        = useState<number[]>([]);
  const [refreshing,  setRefreshing]  = useState(false);
  const [lastUpdate,  setLastUpdate]  = useState(new Date());
  const [broadcast,   setBroadcast]   = useState("");
  const [broadSent,   setBroadSent]   = useState(false);
  const [showNewTask,  setShowNewTask]  = useState(false);
  const [assignVol,    setAssignVol]    = useState<Volunteer | null>(null);
  const [assignTask,   setAssignTask]   = useState<string>("");
  const [showInvite,   setShowInvite]   = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  const [newTask, setNewTask] = useState({
    title:"", category:"Food", location:"", urgency:"Normal" as Urgency,
    needed:5, desc:"",
  });

  // KPI derivations
  const openTasks     = tasks.filter(t => t.status !== "Done").length;
  const doneTasks     = tasks.filter(t => t.status === "Done").length;
  const criticalCount = tasks.filter(t => t.urgency === "Critical" && t.status !== "Done").length;
  const totalAssigned = INIT_VOLS.filter(v => v.status === "Active").length;
  const available     = INIT_VOLS.filter(v => v.status === "Available").length;

  const filteredTasks = useMemo(() => {
    if (taskFilter === "All")      return tasks;
    if (taskFilter === "Critical") return tasks.filter(t => t.urgency === "Critical");
    return tasks.filter(t => t.status === taskFilter);
  }, [tasks, taskFilter]);

  const filteredVols = useMemo(() =>
    INIT_VOLS.filter(v =>
      v.name.toLowerCase().includes(volSearch.toLowerCase()) ||
      v.skills.some(s => s.toLowerCase().includes(volSearch.toLowerCase()))
    ),
  [volSearch]);

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => { setRefreshing(false); setLastUpdate(new Date()); toast.success("✅ Dashboard refreshed!"); }, 700);
  };

  const updateTaskStatus = (id: number, status: TaskStatus) => {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, status } : t));
    toast.success(status === "In Progress" ? "🚀 Task started!" : "✅ Task marked complete!");
  };

  const createTask = () => {
    if (!newTask.title.trim()) return;
    const t: Task = {
      id: Date.now(), title: newTask.title, category: newTask.category,
      icon: ICONS_MAP[newTask.category] || "📌",
      location: newTask.location || "TBD", urgency: newTask.urgency,
      status: "Open", needed: newTask.needed, assigned: 0,
      desc: newTask.desc, time: "Just now",
    };
    setTasks(ts => [t, ...ts]);
    setNewTask({ title:"", category:"Food", location:"", urgency:"Normal", needed:5, desc:"" });
    setShowNewTask(false);
    setTab("tasks");
    toast.success(`📋 "${t.title}" posted! Volunteers will be notified.`);
  };

  const sendBroadcast = () => {
    if (!broadcast.trim()) return;
    setBroadSent(true);
    toast.success(`📢 Broadcast sent to ${totalAssigned + available} volunteers!`);
    setTimeout(() => { setBroadSent(false); setBroadcast(""); }, 2200);
  };

  const handleAssign = () => {
    if (!assignVol || !assignTask) return;
    toast.success(`✅ ${assignVol.name} assigned to "${assignTask}"!`);
    setAssignVol(null);
    setAssignTask("");
  };

  const handleCopyInviteLink = () => {
    const slug = (orgName).toLowerCase().replace(/\s+/g, "-");
    const link = `https://sahayaq.app/join/${slug}`;
    navigator.clipboard.writeText(link).then(() => {
      setInviteCopied(true);
      toast.success("🔗 Invite link copied to clipboard!");
      setTimeout(() => setInviteCopied(false), 2000);
    }).catch(() => toast.error("Could not copy. Please copy the link manually."));
  };

  // ── Tabs bar ─────────────────────────────────────────────────────────────────
  const TABS: { id: DashTab; label: string; icon: string; badge?: number }[] = [
    { id:"overview",   label:"Overview",   icon:"🏠"  },
    { id:"tasks",      label:"Tasks",      icon:"📋", badge: openTasks },
    { id:"volunteers", label:"Volunteers", icon:"👥", badge: available },
    { id:"reports",    label:"Reports",    icon:"📊"  },
  ];

  return (
    <div className="h-full overflow-y-auto" style={{ background:"var(--bg)", fontFamily:"var(--font)" }}>

      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-20 px-4 py-3"
        style={{ background:"var(--surface)", borderBottom:"1px solid var(--border)", boxShadow:"var(--shadow-xs)" }}
      >
        {/* Org title row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize:"18px" }}>🏢</span>
              <h1 style={{ fontWeight:900, fontSize:"17px", color:"var(--text)", letterSpacing:"-0.02em" }}>
                {orgName}
              </h1>
              <span
                className="px-2 py-0.5 rounded-full"
                style={{ fontSize:"10px", fontWeight:700, background:"var(--blue-light)", color:"var(--blue)", border:"1px solid #bfdbfe" }}
              >
                {orgType}
              </span>
            </div>
            <p style={{ fontSize:"11px", color:"var(--text-3)", fontWeight:500, marginTop:"2px" }}>
              Updated {lastUpdate.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:true})}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <motion.div
                animate={{ scale:[1,1.05,1] }}
                transition={{ repeat:Infinity, duration:2 }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
                style={{ background:"#fff1f2", border:"1.5px solid #fecaca" }}
              >
                <AlertTriangle size={11} style={{ color:"#e11d48" }} />
                <span style={{ fontSize:"11px", fontWeight:800, color:"#e11d48" }}>{criticalCount} critical</span>
              </motion.div>
            )}
            <motion.button
              whileTap={{ scale:0.9 }} onClick={refresh}
              className="w-8 h-8 rounded-xl flex items-center justify-center gs-card"
              style={{ cursor:"pointer" }}
            >
              <motion.div animate={{ rotate:refreshing ? 360 : 0 }} transition={{ duration:0.6 }}>
                <RefreshCw size={13} style={{ color:"var(--text-3)" }} />
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background:"var(--bg)", border:"1px solid var(--border)" }}>
          {TABS.map(t => (
            <motion.button
              key={t.id}
              whileTap={{ scale:0.94 }}
              onClick={() => setTab(t.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl relative"
              style={{
                background: tab === t.id ? "var(--surface)" : "transparent",
                boxShadow: tab === t.id ? "var(--shadow-sm)" : "none",
                cursor:"pointer", transition:"all 0.2s",
              }}
            >
              <span style={{ fontSize:"13px" }}>{t.icon}</span>
              <span style={{ fontSize:"11px", fontWeight:700, color: tab === t.id ? "var(--text)" : "var(--text-3)" }}>
                {t.label}
              </span>
              {t.badge !== undefined && t.badge > 0 && (
                <span
                  className="absolute -top-1 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background:"#e11d48", fontSize:"9px", fontWeight:800, color:"#fff" }}
                >
                  {t.badge}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Tab content ────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity:0, y:8 }}
          animate={{ opacity:1, y:0 }}
          exit={{ opacity:0, y:-6 }}
          transition={{ duration:0.22 }}
          className="p-4 space-y-4"
        >

          {/* ────────────────── OVERVIEW TAB ───────────────────────────────── */}
          {tab === "overview" && (
            <>
              {/* KPI grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {label:"Volunteers Active",  value:totalAssigned, note:`${available} available`,  icon:"🙌", color:"#0f766e", bg:"var(--teal-light)",     border:"#99f6e4"},
                  {label:"Open Tasks",         value:openTasks,     note:`${criticalCount} critical`,icon:"📋", color:"#2563eb", bg:"var(--blue-light)",     border:"#bfdbfe"},
                  {label:"Completed Today",    value:doneTasks,     note:"+3 this hour",             icon:"✅", color:"#059669", bg:"var(--green-light)",    border:"#bbf7d0"},
                  {label:"People Helped",      value:342 + totalAffected, note:`+${totalAffected > 0 ? totalAffected + " from reports" : "52 today"}`, icon:"💙", color:"#7c3aed", bg:"var(--lavender-light)", border:"#ddd6fe"},
                ].map((s,i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                    transition={{ delay:i*0.07 }}
                    className="gs-card p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                        style={{ background:s.bg, border:`1px solid ${s.border}` }}>
                        {s.icon}
                      </div>
                    </div>
                    <div style={{ fontWeight:900, fontSize:"28px", color:s.color, lineHeight:1, marginBottom:"2px" }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize:"12px", color:"var(--text-3)", fontWeight:600 }}>{s.label}</div>
                    <div style={{ fontSize:"10px", color:s.color, fontWeight:600, marginTop:"4px" }}>{s.note}</div>
                  </motion.div>
                ))}
              </div>

              {/* Volunteer activity chart */}
              <div className="gs-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={15} style={{ color:"var(--teal)" }} />
                    <span style={{ fontWeight:700, fontSize:"13px", color:"var(--text)" }}>Volunteer Activity</span>
                  </div>
                  <span style={{ fontSize:"11px", color:"var(--text-3)" }}>Last 12 hours</span>
                </div>
                <ResponsiveContainer width="100%" height={90}>
                  <BarChart data={HOURLY} barCategoryGap="30%">
                    <Bar dataKey="v" radius={[4,4,0,0]}>
                      {HOURLY.map((entry,i) => (
                        <Cell
                          key={`hourly-bar-${i}`}
                          fill={i === HOURLY.length - 1 ? "#0f766e" : `rgba(15,118,110,${0.2 + (entry.v/147)*0.55})`}
                        />
                      ))}
                    </Bar>
                    <XAxis dataKey="t" tick={{ fontSize:9, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(v:number) => [`${v} volunteers`,""]}
                      contentStyle={{ borderRadius:10, border:"1px solid #dde5ed", fontSize:11, fontFamily:"var(--font)" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl"
                  style={{ background:"var(--teal-light)", border:"1px solid #99f6e4" }}>
                  <TrendingUp size={13} style={{ color:"var(--teal)" }} />
                  <span style={{ fontSize:"12px", color:"var(--teal)", fontWeight:600 }}>
                    Activity up 34% vs this time yesterday
                  </span>
                </div>
              </div>

              {/* Recent tasks (top 3) */}
              <div className="gs-card overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3.5"
                  style={{ borderBottom:"1px solid var(--border-light)" }}>
                  <span style={{ fontWeight:700, fontSize:"14px", color:"var(--text)" }}>Active Missions</span>
                  <button onClick={() => setTab("tasks")} className="flex items-center gap-1"
                    style={{ fontSize:"12px", color:"var(--teal)", fontWeight:600, fontFamily:"var(--font)", cursor:"pointer" }}>
                    See all <ChevronRight size={13} />
                  </button>
                </div>
                {tasks.filter(t => t.status !== "Done").slice(0,3).map((t,i) => {
                  const uc = URGENCY_CFG[t.urgency];
                  const pct = Math.round((t.assigned/t.needed)*100);
                  return (
                    <div key={t.id} className="px-4 py-3.5"
                      style={{ borderBottom:i < 2 ? "1px solid var(--border-light)" : "none" }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize:"14px" }}>{t.icon}</span>
                          <span style={{ fontSize:"13px", fontWeight:600, color:"var(--text)" }}>{t.title}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{ background:uc.bg, color:uc.color, border:`1px solid ${uc.border}`, fontSize:"10px" }}>
                          {uc.label}
                        </span>
                      </div>
                      <div className="gs-progress mb-1.5" style={{ height:"5px" }}>
                        <motion.div
                          initial={{ width:0 }} animate={{ width:`${pct}%` }}
                          transition={{ delay:0.3+i*0.07, duration:0.7 }}
                          className="gs-progress-fill"
                          style={{ background: t.urgency === "Critical" ? "#e11d48" : "var(--teal)" }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span style={{ fontSize:"11px", color:"var(--text-3)", fontWeight:500 }}>
                          {t.assigned} / {t.needed} volunteers · {t.location}
                        </span>
                        <span style={{ fontSize:"11px", fontWeight:700, color: t.urgency === "Critical" ? "#e11d48" : "var(--teal)" }}>
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Live reported needs feed ── */}
              {needs.length > 0 && (
                <div className="gs-card overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3.5"
                    style={{ borderBottom:"1px solid var(--border-light)" }}>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize:"14px" }}>🚨</span>
                      <span style={{ fontWeight:700, fontSize:"14px", color:"var(--text)" }}>Community Reports</span>
                      {openCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full" style={{ fontSize:"10px", fontWeight:800, background:"#fff1f2", color:"#e11d48", border:"1px solid #fecaca" }}>
                          {openCount} open
                        </span>
                      )}
                    </div>
                    <button onClick={() => navigate("/report")} className="flex items-center gap-1 cursor-pointer"
                      style={{ fontSize:"12px", color:"var(--teal)", fontWeight:600, fontFamily:"var(--font)", background:"none", border:"none" }}>
                      Add <FilePlus size={13} />
                    </button>
                  </div>
                  {needs.slice(0, 3).map((n, i) => (
                    <div key={n.id} className="flex items-center gap-3 px-4 py-3"
                      style={{ borderBottom: i < Math.min(needs.length-1, 2) ? "1px solid var(--border-light)" : "none" }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                        style={{ background: n.urgency === "Critical" ? "#fff1f2" : "var(--teal-light)" }}>
                        {n.category === "Food" ? "🍽️" : n.category === "Health" ? "🏥" : n.category === "Education" ? "📖" : n.category === "Water" ? "💧" : n.category === "Shelter" ? "🏠" : "📌"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div style={{ fontWeight:700, fontSize:"13px", color:"var(--text)" }}>{n.category} — {n.location}</div>
                        <div style={{ fontSize:"11px", color:"var(--text-3)" }}>{n.affected} people · {n.volunteersNeeded} volunteers needed</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full" style={{
                          fontSize:"9px", fontWeight:800,
                          background: n.urgency === "Critical" ? "#fff1f2" : n.urgency === "High" ? "var(--amber-light)" : "var(--teal-light)",
                          color: n.urgency === "Critical" ? "#e11d48" : n.urgency === "High" ? "#b45309" : "var(--teal)",
                        }}>{n.urgency}</span>
                        {n.status === "open" && (
                          <motion.button
                            whileTap={{ scale:0.9 }}
                            onClick={() => { updateNeedStatus(n.id, "in-progress"); toast.success(`✅ ${n.category} need accepted!`); }}
                            className="px-2.5 py-1 rounded-lg"
                            style={{ fontSize:"10px", fontWeight:700, background:"var(--teal-light)", color:"var(--teal)", border:"1px solid #99f6e4", cursor:"pointer", fontFamily:"var(--font)" }}
                          >
                            Accept
                          </motion.button>
                        )}
                        {n.status !== "open" && (
                          <span style={{ fontSize:"10px", fontWeight:700, color:"#059669" }}>✓ Taken</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Suggestions */}
              <div className="gs-card overflow-hidden">
                <div className="flex items-center gap-2.5 px-4 py-3.5"
                  style={{ borderBottom:"1px solid var(--border-light)" }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background:"var(--lavender-light)" }}>
                    <Sparkles size={13} style={{ color:"#7c3aed" }} />
                  </div>
                  <span style={{ fontWeight:700, fontSize:"14px", color:"var(--text)" }}>AI Insights</span>
                  <span className="ml-auto gs-chip gs-chip-lavender" style={{ fontSize:"10px" }}>
                    {SUGGESTIONS.filter(s => !sugg.includes(s.id)).length} new
                  </span>
                </div>
                <AnimatePresence>
                  {SUGGESTIONS.filter(s => !sugg.includes(s.id)).map((s,i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }}
                      exit={{ opacity:0, height:0, paddingTop:0, paddingBottom:0 }}
                      transition={{ delay:i*0.06 }}
                      className="flex items-start gap-3 px-4 py-3.5"
                      style={{ borderBottom:"1px solid var(--border-light)" }}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 mt-0.5"
                        style={{ background:s.bg, border:`1px solid ${s.border}` }}>
                        {s.icon}
                      </div>
                      <p style={{ flex:1, fontSize:"12px", color:"var(--text-2)", fontWeight:500, lineHeight:1.5 }}>
                        {s.text}
                      </p>
                      <div className="flex flex-col gap-1 items-end flex-shrink-0">
                        <motion.button
                          whileTap={{ scale:0.92 }}
                          onClick={() => { setSugg(p => [...p,s.id]); toast.success(`✅ Action taken: ${s.action}`); }}
                          className="px-2.5 py-1 rounded-lg text-nowrap"
                          style={{ fontSize:"10px", fontWeight:700, background:s.bg, border:`1px solid ${s.border}`, color:s.color, cursor:"pointer", fontFamily:"var(--font)" }}
                        >
                          {s.action}
                        </motion.button>
                        <button onClick={() => setSugg(p => [...p,s.id])}
                          style={{ fontSize:"10px", color:"var(--text-4)", cursor:"pointer", fontFamily:"var(--font)" }}>
                          Dismiss
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {sugg.length === SUGGESTIONS.length && (
                  <div className="flex flex-col items-center gap-1.5 py-6">
                    <span style={{ fontSize:"22px" }}>✅</span>
                    <span style={{ fontWeight:600, fontSize:"13px", color:"var(--text-3)" }}>
                      All insights handled — great work!
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Broadcast */}
              <div className="gs-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare size={14} style={{ color:"var(--blue)" }} />
                  <span style={{ fontWeight:700, fontSize:"13px", color:"var(--text)" }}>Broadcast to All Volunteers</span>
                </div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 gs-input px-3 py-2.5 rounded-xl"
                    placeholder="Type a message to all active volunteers…"
                    value={broadcast}
                    onChange={e => setBroadcast(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendBroadcast()}
                  />
                  <motion.button
                    whileTap={{ scale:0.92 }}
                    onClick={sendBroadcast}
                    className="px-3 py-2.5 rounded-xl flex items-center gap-1.5"
                    style={{
                      background: broadSent ? "#059669" : "var(--blue)",
                      color:"#fff", fontWeight:700, fontSize:"12px",
                      fontFamily:"var(--font)", cursor:"pointer", minWidth:"72px",
                      transition:"background 0.3s",
                    }}
                  >
                    {broadSent ? <><Check size={14}/> Sent!</> : <><Send size={14}/> Send</>}
                  </motion.button>
                </div>
                <p style={{ fontSize:"11px", color:"var(--text-3)", marginTop:"8px" }}>
                  Will notify {totalAssigned} active + {available} available volunteers via app alert.
                </p>
              </div>
            </>
          )}

          {/* ────────────────── TASKS TAB ──────────────────────────────────── */}
          {tab === "tasks" && (
            <>
              {/* Filter pills */}
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth:"none" }}>
                {(["All","Open","In Progress","Done","Critical"] as TaskFilter[]).map(f => (
                  <motion.button
                    key={f} whileTap={{ scale:0.93 }}
                    onClick={() => setTaskFilter(f)}
                    className="px-3 py-1.5 rounded-full flex-shrink-0"
                    style={{
                      fontSize:"12px", fontWeight:700, cursor:"pointer",
                      background: taskFilter === f ? "var(--teal)" : "var(--surface)",
                      color:      taskFilter === f ? "#fff" : "var(--text-2)",
                      border:     taskFilter === f ? "none" : "1.5px solid var(--border)",
                      transition:"all 0.18s",
                      fontFamily:"var(--font)",
                    }}
                  >
                    {f}
                    <span className="ml-1.5 opacity-70">
                      {f === "All" ? tasks.length
                       : f === "Critical" ? tasks.filter(t => t.urgency === "Critical").length
                       : tasks.filter(t => t.status === f).length}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Task list */}
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredTasks.map((t,i) => {
                    const uc = URGENCY_CFG[t.urgency];
                    const sc = STATUS_CFG[t.status];
                    const pct = Math.round((t.assigned/t.needed)*100);
                    return (
                      <motion.div
                        key={t.id}
                        initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                        exit={{ opacity:0, x:-20, height:0 }}
                        transition={{ delay:i*0.04 }}
                        className="gs-card p-4"
                      >
                        {/* Row 1: icon + title + urgency */}
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                            style={{ background:uc.bg, border:`1px solid ${uc.border}` }}>
                            {t.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span style={{ fontWeight:700, fontSize:"13px", color:"var(--text)" }}>{t.title}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded-full"
                                style={{ fontSize:"10px", fontWeight:700, background:uc.bg, color:uc.color, border:`1px solid ${uc.border}` }}>
                                {t.urgency}
                              </span>
                              <span className="px-2 py-0.5 rounded-full"
                                style={{ fontSize:"10px", fontWeight:700, background:sc.bg, color:sc.color, border:`1px solid ${sc.border}` }}>
                                {t.status}
                              </span>
                              <span style={{ fontSize:"10px", color:"var(--text-3)", fontWeight:500 }}>{t.time}</span>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p style={{ fontSize:"12px", color:"var(--text-2)", lineHeight:1.5, marginBottom:"12px" }}>
                          {t.desc}
                        </p>

                        {/* Location */}
                        <div className="flex items-center gap-1.5 mb-3">
                          <MapPin size={12} style={{ color:"var(--text-4)" }} />
                          <span style={{ fontSize:"11px", color:"var(--text-3)", fontWeight:500 }}>{t.location}</span>
                        </div>

                        {/* Progress */}
                        <div className="mb-3">
                          <div className="flex justify-between mb-1.5">
                            <span style={{ fontSize:"11px", color:"var(--text-2)", fontWeight:600 }}>
                              <Users size={11} className="inline mr-1" style={{ color:"var(--text-3)" }} />
                              {t.assigned} / {t.needed} volunteers
                            </span>
                            <span style={{ fontSize:"11px", fontWeight:800, color:t.urgency==="Critical"?"#e11d48":"var(--teal)" }}>
                              {pct}%
                            </span>
                          </div>
                          <div className="gs-progress" style={{ height:"6px" }}>
                            <motion.div
                              initial={{ width:0 }} animate={{ width:`${pct}%` }}
                              transition={{ delay:0.2, duration:0.7 }}
                              className="gs-progress-fill"
                              style={{ background: t.urgency==="Critical" ? "#e11d48" : t.urgency==="High" ? "#b45309" : "var(--teal)" }}
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {t.status !== "Done" && (
                            <motion.button
                              whileTap={{ scale:0.94 }}
                              onClick={() => updateTaskStatus(t.id, t.status === "Open" ? "In Progress" : "Done")}
                              className="flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5"
                              style={{
                                background:"var(--teal)", color:"#fff",
                                fontSize:"11px", fontWeight:700, fontFamily:"var(--font)", cursor:"pointer",
                              }}
                            >
                              <Zap size={12} />
                              {t.status === "Open" ? "Mark In Progress" : "Mark Done"}
                            </motion.button>
                          )}
                          {t.status === "Done" && (
                            <div className="flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5"
                              style={{ background:"var(--green-light)", border:"1px solid #bbf7d0" }}>
                              <CheckCircle2 size={13} style={{ color:"#059669" }} />
                              <span style={{ fontSize:"11px", fontWeight:700, color:"#059669" }}>Completed</span>
                            </div>
                          )}
                          <motion.button
                            whileTap={{ scale:0.94 }}
                            onClick={() => toast.info(`📋 ${t.title}\n📍 ${t.location}`, { duration: 4000 })}
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background:"var(--surface-2)", border:"1px solid var(--border)", cursor:"pointer" }}
                            title="View details"
                          >
                            <Eye size={13} style={{ color:"var(--text-3)" }} />
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {filteredTasks.length === 0 && (
                  <div className="gs-card p-8 flex flex-col items-center gap-3">
                    <span style={{ fontSize:"32px" }}>📭</span>
                    <span style={{ fontWeight:600, fontSize:"14px", color:"var(--text-3)" }}>
                      No tasks match this filter
                    </span>
                  </div>
                )}
              </div>

              {/* Floating Post Task button */}
              <div className="sticky bottom-4 flex justify-center">
                <motion.button
                  whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
                  onClick={() => setShowNewTask(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl"
                  style={{
                    background:"var(--blue)", color:"#fff",
                    fontWeight:800, fontSize:"14px", fontFamily:"var(--font)",
                    boxShadow:"0 4px 20px rgba(37,99,235,0.35)", cursor:"pointer",
                  }}
                >
                  <Plus size={18} /> Post New Task
                </motion.button>
              </div>
            </>
          )}

          {/* ────────────────── VOLUNTEERS TAB ─────────────────────────────── */}
          {tab === "volunteers" && (
            <>
              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  {label:"Total",     value:INIT_VOLS.length, color:"var(--text)",   bg:"var(--surface)", icon:"👥"},
                  {label:"Active",    value:totalAssigned,    color:"#059669",       bg:"var(--green-light)", icon:"🟢"},
                  {label:"Available", value:available,        color:"var(--teal)",   bg:"var(--teal-light)",  icon:"🔵"},
                ].map(s => (
                  <div key={s.label} className="gs-card p-3 flex flex-col items-center gap-1">
                    <span style={{ fontSize:"16px" }}>{s.icon}</span>
                    <span style={{ fontWeight:900, fontSize:"22px", color:s.color, lineHeight:1 }}>{s.value}</span>
                    <span style={{ fontSize:"10px", color:"var(--text-3)", fontWeight:600 }}>{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color:"var(--text-4)" }} />
                <input
                  className="w-full gs-input pl-10 pr-4 py-3 rounded-xl"
                  placeholder="Search by name or skill…"
                  value={volSearch}
                  onChange={e => setVolSearch(e.target.value)}
                />
                {volSearch && (
                  <button onClick={() => setVolSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <X size={13} style={{ color:"var(--text-3)" }} />
                  </button>
                )}
              </div>

              {/* Volunteer list */}
              <div className="space-y-3">
                {filteredVols.map((v,i) => {
                  const vs = VOL_STATUS_CFG[v.status];
                  return (
                    <motion.div
                      key={v.id}
                      initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                      transition={{ delay:i*0.04 }}
                      className="gs-card p-4"
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <div
                            className="w-11 h-11 rounded-2xl flex items-center justify-center font-black"
                            style={{
                              background:"var(--teal-light)", color:"var(--teal)",
                              fontSize:"13px", border:"2px solid #99f6e4",
                            }}
                          >
                            {v.initials}
                          </div>
                          <span
                            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white"
                            style={{ background:vs.dot }}
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span style={{ fontWeight:800, fontSize:"14px", color:"var(--text)" }}>{v.name}</span>
                            <span style={{ fontSize:"10px", fontWeight:700, color:vs.color }}>{vs.label}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <MapPin size={10} style={{ color:"var(--text-4)" }} />
                            <span style={{ fontSize:"11px", color:"var(--text-3)", fontWeight:500 }}>{v.location}</span>
                            <span style={{ fontSize:"11px", color:"var(--text-4)" }}>·</span>
                            <span style={{ fontSize:"11px", color:"var(--text-3)" }}>⭐ {v.rating}</span>
                            <span style={{ fontSize:"11px", color:"var(--text-4)" }}>·</span>
                            <span style={{ fontSize:"11px", color:"var(--text-3)" }}>{v.missions} missions</span>
                          </div>
                          {/* Skills */}
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {v.skills.map(s => (
                              <span key={s} className="px-2 py-0.5 rounded-full"
                                style={{ fontSize:"10px", fontWeight:600, background:"var(--surface-2)", color:"var(--text-2)", border:"1px solid var(--border)" }}>
                                {s}
                              </span>
                            ))}
                          </div>
                          {/* Current task */}
                          {v.task && (
                            <div className="flex items-center gap-1.5 p-2 rounded-lg"
                              style={{ background:"var(--teal-light)", border:"1px solid #99f6e4" }}>
                              <Zap size={11} style={{ color:"var(--teal)" }} />
                              <span style={{ fontSize:"11px", color:"var(--teal)", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                {v.task}
                              </span>
                            </div>
                          )}
                          {!v.task && v.status === "Available" && (
                            <motion.button
                              whileTap={{ scale:0.94 }}
                              onClick={() => { setAssignVol(v); setAssignTask(""); }}
                              className="w-full py-1.5 rounded-lg mt-1 flex items-center justify-center gap-1.5"
                              style={{ background:"var(--blue-light)", border:"1px solid #bfdbfe", cursor:"pointer" }}
                            >
                              <UserCheck size={12} style={{ color:"var(--blue)" }} />
                              <span style={{ fontSize:"11px", fontWeight:700, color:"var(--blue)", fontFamily:"var(--font)" }}>
                                Assign to task
                              </span>
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Invite CTA */}
              <motion.button
                whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
                onClick={() => setShowInvite(true)}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 gs-card"
                style={{
                  border:"2px dashed var(--border)", cursor:"pointer",
                  fontSize:"14px", fontWeight:700, color:"var(--text-3)", fontFamily:"var(--font)",
                }}
              >
                <Plus size={16} /> Invite a Volunteer
              </motion.button>
            </>
          )}

          {/* ────────────────── REPORTS TAB ────────────────────────────────── */}
          {tab === "reports" && (
            <>
              {/* Summary hero */}
              <div className="gs-card p-5"
                style={{ background:"linear-gradient(135deg, #eff6ff, #f0fdfa)", border:"1.5px solid #bfdbfe" }}>
                <div className="flex items-center gap-3 mb-3">
                  <span style={{ fontSize:"28px" }}>📊</span>
                  <div>
                    <div style={{ fontWeight:800, fontSize:"16px", color:"var(--text)" }}>This Month's Impact</div>
                    <div style={{ fontSize:"12px", color:"var(--text-3)", fontWeight:500 }}>April 2026 — live data</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {label:"People Helped", value:"1,284", color:"#0f766e"},
                    {label:"Tasks Done",    value:"83",    color:"#2563eb"},
                    {label:"Vol. Hours",    value:"2,140", color:"#7c3aed"},
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <div style={{ fontWeight:900, fontSize:"22px", color:s.color, lineHeight:1.1 }}>{s.value}</div>
                      <div style={{ fontSize:"10px", color:"var(--text-3)", fontWeight:600, marginTop:"3px" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* People helped over 7 days */}
              <div className="gs-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={15} style={{ color:"var(--teal)" }} />
                    <span style={{ fontWeight:700, fontSize:"13px", color:"var(--text)" }}>People Helped Daily</span>
                  </div>
                  <span style={{ fontSize:"11px", color:"var(--text-3)" }}>Last 7 days</span>
                </div>
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={WEEKLY}>
                    <defs>
                      <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#0f766e" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#0f766e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize:9, fill:"#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize:9, fill:"#94a3b8" }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip
                      formatter={(v:number) => [`${v} people helped`,""]}
                      contentStyle={{ borderRadius:10, border:"1px solid #dde5ed", fontSize:11, fontFamily:"var(--font)" }}
                    />
                    <Area type="monotone" dataKey="helped" stroke="#0f766e" strokeWidth={2.5}
                      fill="url(#tealGrad)" dot={{ r:3, fill:"#0f766e" }} activeDot={{ r:5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Task category breakdown */}
              <div className="gs-card p-4">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 size={15} style={{ color:"var(--blue)" }} />
                  <span style={{ fontWeight:700, fontSize:"13px", color:"var(--text)" }}>Tasks by Category</span>
                </div>
                <div className="flex items-center gap-4">
                  <PieChart width={130} height={130}>
                    <Pie data={CAT_PIE} dataKey="value" cx="50%" cy="50%" innerRadius={38} outerRadius={60} strokeWidth={0}>
                      {CAT_PIE.map((entry, idx) => <Cell key={`pie-cell-${idx}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip
                      formatter={(v:number,n:string) => [`${v} tasks`, n]}
                      contentStyle={{ borderRadius:10, border:"1px solid #dde5ed", fontSize:11, fontFamily:"var(--font)" }}
                    />
                  </PieChart>
                  <div className="flex-1 space-y-2">
                    {CAT_PIE.map(c => (
                      <div key={c.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background:c.color }} />
                          <span style={{ fontSize:"12px", color:"var(--text-2)", fontWeight:600 }}>{c.name}</span>
                        </div>
                        <span style={{ fontSize:"12px", color:"var(--text-3)", fontWeight:700 }}>{c.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Volunteer performance */}
              <div className="gs-card overflow-hidden">
                <div className="px-4 py-3.5" style={{ borderBottom:"1px solid var(--border-light)" }}>
                  <span style={{ fontWeight:700, fontSize:"14px", color:"var(--text)" }}>Top Volunteers This Month</span>
                </div>
                {INIT_VOLS.sort((a,b) => b.missions - a.missions).slice(0,5).map((v,i) => (
                  <div key={v.id} className="flex items-center gap-3 px-4 py-3"
                    style={{ borderBottom:i<4?"1px solid var(--border-light)":"none" }}>
                    <span style={{ fontWeight:800, fontSize:"13px", color:i<3?"#b45309":"var(--text-4)", width:16, textAlign:"center" }}>
                      {i+1}
                    </span>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                      style={{ background:"var(--teal-light)", color:"var(--teal)", border:"2px solid #99f6e4" }}>
                      {v.initials}
                    </div>
                    <div className="flex-1">
                      <div style={{ fontWeight:700, fontSize:"13px", color:"var(--text)" }}>{v.name}</div>
                      <div style={{ fontSize:"11px", color:"var(--text-3)" }}>⭐ {v.rating} · {v.location}</div>
                    </div>
                    <div className="text-right">
                      <div style={{ fontWeight:800, fontSize:"13px", color:"var(--teal)" }}>{v.missions}</div>
                      <div style={{ fontSize:"10px", color:"var(--text-4)" }}>missions</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Export button */}
              <motion.button
                whileHover={{ scale:1.01 }} whileTap={{ scale:0.97 }}
                className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 gs-card"
                style={{ cursor:"pointer", fontWeight:700, fontSize:"14px", color:"var(--text-2)", fontFamily:"var(--font)" }}
                onClick={() => {
                  toast.success("📄 Generating report… downloading CSV");
                  const csv = ["Task,Category,Status,Urgency,Assigned,Needed,Location",
                    ...tasks.map(t => `"${t.title}",${t.category},${t.status},${t.urgency},${t.assigned},${t.needed},"${t.location}"`)
                  ].join("\n");
                  const blob = new Blob([csv], { type: "text/csv" });
                  const url  = URL.createObjectURL(blob);
                  const a    = document.createElement("a");
                  a.href = url; a.download = "sahayaq-impact-report.csv"; a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download size={16} style={{ color:"var(--blue)" }} /> Export Full Report (CSV)
              </motion.button>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Volunteer Assignment Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {assignVol && (
          <>
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 z-40"
              style={{ background:"rgba(15,23,42,0.45)", backdropFilter:"blur(4px)" }}
              onClick={() => setAssignVol(null)}
            />
            <motion.div
              initial={{ opacity:0, scale:0.94, y:10 }}
              animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:0.94 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 gs-card p-5"
              style={{ maxWidth:"420px", margin:"0 auto", boxShadow:"var(--shadow-lg)", fontFamily:"var(--font)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontWeight:800, fontSize:"17px", color:"var(--text)" }}>Assign Volunteer</h3>
                <button onClick={() => setAssignVol(null)} className="w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ background:"var(--surface-2)", border:"1px solid var(--border)", cursor:"pointer" }}>
                  <X size={13} style={{ color:"var(--text-3)" }} />
                </button>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl mb-4"
                style={{ background:"var(--teal-light)", border:"1px solid #99f6e4" }}>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0"
                  style={{ background:"#fff", color:"var(--teal)", border:"2px solid #99f6e4" }}>
                  {assignVol.initials}
                </div>
                <div>
                  <div style={{ fontWeight:800, fontSize:"14px", color:"var(--text)" }}>{assignVol.name}</div>
                  <div style={{ fontSize:"11px", color:"var(--text-3)" }}>{assignVol.skills.join(", ")} · {assignVol.location}</div>
                </div>
              </div>
              <label style={{ fontSize:"12px", fontWeight:700, color:"var(--text-2)", display:"block", marginBottom:"10px" }}>
                Select a task to assign:
              </label>
              <div className="space-y-2 mb-4" style={{ maxHeight:"220px", overflowY:"auto" }}>
                {tasks.filter(t => t.status !== "Done").map(t => (
                  <button
                    key={t.id}
                    onClick={() => setAssignTask(t.title)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left"
                    style={{
                      background: assignTask === t.title ? "var(--teal-light)" : "var(--surface-2)",
                      border: `1.5px solid ${assignTask === t.title ? "#99f6e4" : "var(--border)"}`,
                      cursor:"pointer", transition:"all 0.15s",
                    }}
                  >
                    <span style={{ fontSize:"16px" }}>{t.icon}</span>
                    <div className="flex-1">
                      <div style={{ fontWeight:700, fontSize:"12px", color:"var(--text)" }}>{t.title}</div>
                      <div style={{ fontSize:"10px", color:"var(--text-3)" }}>{t.needed - t.assigned} spots open</div>
                    </div>
                    {assignTask === t.title && <Check size={14} style={{ color:"var(--teal)", flexShrink:0 }} />}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setAssignVol(null)} className="gs-btn gs-btn-secondary flex-1 py-3" style={{ fontSize:"13px" }}>Cancel</button>
                <motion.button
                  whileTap={{ scale:0.96 }}
                  onClick={handleAssign}
                  disabled={!assignTask}
                  className="flex-1 py-3 rounded-2xl flex items-center justify-center gap-1.5"
                  style={{
                    background: assignTask ? "var(--teal)" : "var(--border)",
                    color:"#fff", fontSize:"13px", fontWeight:700, fontFamily:"var(--font)",
                    cursor: assignTask ? "pointer" : "not-allowed",
                  }}
                >
                  <UserCheck size={14} /> Confirm Assign
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Invite Volunteer Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showInvite && (
          <>
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 z-40"
              style={{ background:"rgba(15,23,42,0.45)", backdropFilter:"blur(4px)" }}
              onClick={() => setShowInvite(false)}
            />
            <motion.div
              initial={{ opacity:0, scale:0.94, y:10 }}
              animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:0.94 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 gs-card p-5"
              style={{ maxWidth:"420px", margin:"0 auto", boxShadow:"var(--shadow-lg)", fontFamily:"var(--font)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontWeight:800, fontSize:"17px", color:"var(--text)" }}>Invite a Volunteer</h3>
                <button onClick={() => setShowInvite(false)} className="w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ background:"var(--surface-2)", border:"1px solid var(--border)", cursor:"pointer" }}>
                  <X size={13} style={{ color:"var(--text-3)" }} />
                </button>
              </div>
              <p style={{ fontSize:"13px", color:"var(--text-3)", marginBottom:"16px", lineHeight:1.55 }}>
                Share your organisation's invite link. New volunteers who sign up via this link will be automatically linked to {orgName}.
              </p>
              <div className="flex items-center gap-2 p-3 rounded-xl mb-5"
                style={{ background:"var(--surface-2)", border:"1.5px solid var(--border)" }}>
                <span style={{ flex:1, fontSize:"11px", color:"var(--text-2)", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  sahayaq.app/join/{orgName.toLowerCase().replace(/\s+/g,"-")}
                </span>
                <motion.button
                  whileTap={{ scale:0.9 }}
                  onClick={handleCopyInviteLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg flex-shrink-0"
                  style={{ background: inviteCopied ? "var(--green-light)" : "var(--teal-light)", border:"1px solid #99f6e4", cursor:"pointer" }}
                >
                  <Copy size={12} style={{ color: inviteCopied ? "var(--green)" : "var(--teal)" }} />
                  <span style={{ fontSize:"11px", fontWeight:700, color: inviteCopied ? "var(--green)" : "var(--teal)", fontFamily:"var(--font)" }}>
                    {inviteCopied ? "Copied!" : "Copy"}
                  </span>
                </motion.button>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale:0.96 }}
                  onClick={() => {
                    const slug = orgName.toLowerCase().replace(/\s+/g,"-");
                    const sub  = encodeURIComponent(`Join ${orgName} as a volunteer on Sahayaq`);
                    const bod  = encodeURIComponent(`Hi!\n\nI'd like to invite you to volunteer with ${orgName} on Sahayaq.\n\nSign up: https://sahayaq.app/join/${slug}\n\nThank you!`);
                    window.open(`mailto:?subject=${sub}&body=${bod}`);
                    toast.success("📧 Email invite opened!");
                  }}
                  className="flex-1 py-3 rounded-2xl flex items-center justify-center gap-2"
                  style={{ background:"var(--blue-light)", border:"1px solid #bfdbfe", cursor:"pointer" }}
                >
                  <Mail size={14} style={{ color:"var(--blue)" }} />
                  <span style={{ fontSize:"13px", fontWeight:700, color:"var(--blue)", fontFamily:"var(--font)" }}>Email</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale:0.96 }}
                  onClick={() => { handleCopyInviteLink(); setTimeout(() => setShowInvite(false), 500); }}
                  className="flex-1 py-3 rounded-2xl flex items-center justify-center gap-2"
                  style={{ background:"var(--teal)", cursor:"pointer" }}
                >
                  <span style={{ fontSize:"13px", fontWeight:700, color:"#fff", fontFamily:"var(--font)" }}>Copy & Share</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── New Task Modal (slide-up drawer) ─────────────────────────────────── */}
      <AnimatePresence>
        {showNewTask && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 z-30"
              style={{ background:"rgba(15,23,42,0.45)", backdropFilter:"blur(4px)" }}
              onClick={() => setShowNewTask(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }}
              transition={{ type:"spring", damping:28, stiffness:320 }}
              className="fixed bottom-0 left-0 right-0 z-40 rounded-t-3xl overflow-hidden"
              style={{ background:"var(--surface)", maxHeight:"90vh", boxShadow:"0 -8px 40px rgba(15,23,42,0.18)" }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1.5 rounded-full" style={{ background:"var(--border)" }} />
              </div>

              <div className="overflow-y-auto px-5 pb-8 pt-2" style={{ maxHeight:"82vh" }}>
                <div className="flex items-center justify-between mb-5">
                  <h2 style={{ fontWeight:900, fontSize:"20px", color:"var(--text)", letterSpacing:"-0.02em" }}>
                    Post New Task
                  </h2>
                  <motion.button
                    whileTap={{ scale:0.9 }}
                    onClick={() => setShowNewTask(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background:"var(--surface-2)", border:"1px solid var(--border)", cursor:"pointer" }}
                  >
                    <X size={15} style={{ color:"var(--text-3)" }} />
                  </motion.button>
                </div>

                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label style={lbl}>Task title *</label>
                    <input className="w-full gs-input px-4 py-3 rounded-xl"
                      placeholder="e.g. Food distribution at Sector 7"
                      value={newTask.title}
                      onChange={e => setNewTask(p => ({...p, title:e.target.value}))}
                    />
                  </div>

                  {/* Category + Urgency row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={lbl}>Category</label>
                      <select
                        className="w-full gs-input px-3 py-3 rounded-xl appearance-none"
                        value={newTask.category}
                        onChange={e => setNewTask(p => ({...p, category:e.target.value}))}
                        style={{ backgroundImage:"none", cursor:"pointer" }}
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={lbl}>Urgency</label>
                      <select
                        className="w-full gs-input px-3 py-3 rounded-xl appearance-none"
                        value={newTask.urgency}
                        onChange={e => setNewTask(p => ({...p, urgency:e.target.value as Urgency}))}
                        style={{ backgroundImage:"none", cursor:"pointer" }}
                      >
                        {(["Normal","High","Critical"] as Urgency[]).map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label style={lbl}>Location</label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                        style={{ color:"var(--text-4)" }} />
                      <input className="w-full gs-input pl-10 pr-4 py-3 rounded-xl"
                        placeholder="Address or area name"
                        value={newTask.location}
                        onChange={e => setNewTask(p => ({...p, location:e.target.value}))}
                      />
                    </div>
                  </div>

                  {/* Volunteers needed */}
                  <div>
                    <label style={{ ...lbl, display:"flex", justifyContent:"space-between" }}>
                      <span>Volunteers needed</span>
                      <span style={{ color:"var(--teal)", fontWeight:800 }}>{newTask.needed}</span>
                    </label>
                    <input type="range" min={1} max={50} value={newTask.needed}
                      onChange={e => setNewTask(p => ({...p, needed:+e.target.value}))}
                      className="w-full mt-2"
                    />
                    <div className="flex justify-between mt-1">
                      <span style={{ fontSize:"10px", color:"var(--text-4)" }}>1</span>
                      <span style={{ fontSize:"10px", color:"var(--text-4)" }}>50</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label style={lbl}>Description</label>
                    <textarea
                      className="w-full gs-input px-4 py-3 rounded-xl resize-none"
                      placeholder="Describe what volunteers need to do, bring, or know…"
                      rows={3}
                      value={newTask.desc}
                      onChange={e => setNewTask(p => ({...p, desc:e.target.value}))}
                      style={{ fontFamily:"var(--font)" }}
                    />
                  </div>

                  {/* Preview urgency indicator */}
                  {newTask.urgency === "Critical" && (
                    <motion.div
                      initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }}
                      className="flex items-center gap-2 p-3 rounded-xl"
                      style={{ background:"#fff1f2", border:"1.5px solid #fecaca" }}
                    >
                      <AlertTriangle size={14} style={{ color:"#e11d48" }} />
                      <span style={{ fontSize:"12px", color:"#b91c1c", fontWeight:600 }}>
                        This task will be flagged Critical and notify volunteers immediately.
                      </span>
                    </motion.div>
                  )}

                  {/* Submit */}
                  <motion.button
                    whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                    onClick={createTask}
                    disabled={!newTask.title.trim()}
                    className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
                    style={{
                      background: newTask.title.trim() ? "var(--blue)" : "var(--border)",
                      color:"#fff",
                      fontWeight:800, fontSize:"15px", fontFamily:"var(--font)",
                      cursor: newTask.title.trim() ? "pointer" : "not-allowed",
                      boxShadow: newTask.title.trim() ? "0 4px 18px rgba(37,99,235,0.30)" : "none",
                      transition:"all 0.2s",
                    }}
                  >
                    <Bell size={16} /> Post Task to Volunteers
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const lbl: React.CSSProperties = {
  fontSize:"12px", fontWeight:700, color:"var(--text-2)",
  display:"block", marginBottom:"7px",
};
