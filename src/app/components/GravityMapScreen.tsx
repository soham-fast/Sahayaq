import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { Search, SlidersHorizontal, MapPin, Users, ChevronRight, X, Navigation, FilePlus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useNeeds } from "../context/NeedsContext";

interface Zone {
  id: number; x: number; y: number; r: number;
  label: string; icon: string; people: number;
  distance: string; color: string; rgb: string;
  category: string; volunteers: number; needed: number;
}

const ZONE_DEFS = [
  { id:1, r:90, label:"Food Support",       icon:"🍽️", people:80,  distance:"0.8 km", color:"#0f766e", rgb:"15,118,110",   category:"Food",    volunteers:8,  needed:18 },
  { id:2, r:72, label:"Medical Assistance", icon:"🏥", people:55,  distance:"1.4 km", color:"#2563eb", rgb:"37,99,235",    category:"Health",  volunteers:11, needed:15 },
  { id:3, r:56, label:"Learning Support",   icon:"📖", people:34,  distance:"2.1 km", color:"#7c3aed", rgb:"124,58,237",   category:"Learning",volunteers:5,  needed:9  },
  { id:4, r:48, label:"Shelter Help",       icon:"🏠", people:47,  distance:"1.9 km", color:"#b45309", rgb:"180,83,9",     category:"Shelter", volunteers:6,  needed:12 },
  { id:5, r:40, label:"Water Access",       icon:"💧", people:29,  distance:"3.2 km", color:"#059669", rgb:"5,150,105",    category:"Water",   volunteers:4,  needed:8  },
];

const FILTERS = ["All", "Food", "Health", "Learning", "Shelter", "Water"];

export function GravityMapScreen() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const animRef      = useRef<number>(0);
  const zonesRef     = useRef<Zone[]>([]);
  const filterRef    = useRef("All");
  const searchRef    = useRef("");
  const navigate     = useNavigate();
  const { user }     = useAuth();
  const { needs, openCount } = useNeeds();

  const [selected,     setSelected]     = useState<Zone | null>(null);
  const [filter,       setFilter]       = useState("All");
  const [showFilters,  setShowFilters]  = useState(false);
  const [searchText,   setSearchText]   = useState("");
  const [joinedZones,  setJoinedZones]  = useState<number[]>([]);

  // Keep refs in sync so canvas draw loop can read them without stale closures
  useEffect(() => { filterRef.current = filter; }, [filter]);
  useEffect(() => { searchRef.current = searchText; }, [searchText]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const init = () => {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      const W = canvas.offsetWidth, H = canvas.offsetHeight;
      const pos = [
        { x: W*0.40, y: H*0.42 },
        { x: W*0.68, y: H*0.28 },
        { x: W*0.22, y: H*0.60 },
        { x: W*0.70, y: H*0.60 },
        { x: W*0.50, y: H*0.72 },
      ];
      zonesRef.current = ZONE_DEFS.map((d, i) => ({ ...d, ...pos[i] }));
    };
    init();
    window.addEventListener("resize", init);

    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    let time = 0;

    const draw = () => {
      const W = canvas.width/dpr, H = canvas.height/dpr;
      ctx.save(); ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = "#e8eff5";
      ctx.fillRect(0, 0, W, H);

      const gs = 36;
      for (let x = 0; x < W; x += gs) {
        for (let y = 0; y < H; y += gs) {
          ctx.fillStyle = "rgba(200,215,230,0.45)";
          ctx.beginPath(); ctx.roundRect(x+3, y+3, gs-6, gs-6, 4); ctx.fill();
        }
      }
      ctx.strokeStyle = "rgba(180,200,220,0.35)"; ctx.lineWidth = 0.5;
      for (let x = 0; x <= W; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y <= H; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 4; ctx.lineCap = "round";
      [[W*0,H*0.5,W*1,H*0.5],[W*0.5,H*0,W*0.5,H*1],[W*0,H*0.3,W*1,H*0.7]].forEach(([x1,y1,x2,y2])=>{
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      });
      ctx.lineWidth = 2;
      [[W*0,H*0.72,W*1,H*0.55],[W*0.25,H*0,W*0.35,H*1]].forEach(([x1,y1,x2,y2])=>{
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      });

      const zones = zonesRef.current;
      const q = searchRef.current.toLowerCase().trim();
      const f = filterRef.current;

      const visibleIds = zones.filter(z => {
        const matchFilter   = f === "All" || z.category === f;
        const matchSearch   = !q || z.label.toLowerCase().includes(q) || z.category.toLowerCase().includes(q);
        return matchFilter && matchSearch;
      }).map(z => z.id);

      zones.forEach(zone => {
        const visible = visibleIds.includes(zone.id);
        const pulse   = 1 + Math.sin(time * 1.2 + zone.id) * 0.04;
        const r       = zone.r * pulse;
        const [rv, gv, bv] = zone.rgb.split(",").map(Number);
        const alpha = visible ? 1 : 0.15;

        [2.2, 1.65, 1.1].forEach((scale, i) => {
          const grad = ctx.createRadialGradient(zone.x, zone.y, 0, zone.x, zone.y, r * scale);
          grad.addColorStop(0, `rgba(${rv},${gv},${bv},${(0.09 - i*0.025) * alpha})`);
          grad.addColorStop(1, "transparent");
          ctx.fillStyle = grad;
          ctx.beginPath(); ctx.arc(zone.x, zone.y, r * scale, 0, Math.PI*2); ctx.fill();
        });

        const coreGrad = ctx.createRadialGradient(zone.x, zone.y, 0, zone.x, zone.y, r * 0.85);
        coreGrad.addColorStop(0, `rgba(${rv},${gv},${bv},${0.2 * alpha})`);
        coreGrad.addColorStop(1, `rgba(${rv},${gv},${bv},${0.06 * alpha})`);
        ctx.fillStyle = coreGrad;
        ctx.beginPath(); ctx.arc(zone.x, zone.y, r * 0.85, 0, Math.PI*2); ctx.fill();

        ctx.strokeStyle = `rgba(${rv},${gv},${bv},${0.45 * alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(zone.x, zone.y, r * 0.85, 0, Math.PI*2); ctx.stroke();

        ctx.fillStyle = `rgba(${rv},${gv},${bv},${alpha})`;
        ctx.beginPath(); ctx.arc(zone.x, zone.y, 6, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.beginPath(); ctx.arc(zone.x, zone.y, 3, 0, Math.PI*2); ctx.fill();

        if (visible) {
          ctx.font = "13px serif";
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(zone.icon, zone.x, zone.y - 20);
        }
      });

      // "You are here" marker
      const mx = W * 0.5, my = H * 0.52;
      ctx.fillStyle = "rgba(37,99,235,0.12)";
      ctx.beginPath(); ctx.arc(mx, my, 18, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#2563eb";
      ctx.beginPath(); ctx.arc(mx, my, 7, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(mx, my, 3.5, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(mx, my, 10, 0, Math.PI*2); ctx.stroke();

      time += 0.016;
      ctx.restore();
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", init); };
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const q = searchRef.current.toLowerCase().trim();
    const f = filterRef.current;
    const hit = zonesRef.current.find(z => {
      const matchFilter = f === "All" || z.category === f;
      const matchSearch = !q || z.label.toLowerCase().includes(q) || z.category.toLowerCase().includes(q);
      return matchFilter && matchSearch && Math.hypot(z.x - x, z.y - y) < z.r + 12;
    });
    setSelected(hit || null);
  }, []);

  const handleJoinZone = (zone: Zone) => {
    if (joinedZones.includes(zone.id)) {
      toast.info(`Already helping with ${zone.label}`);
      return;
    }
    if (user?.role === "ngo") {
      toast.info("NGO accounts manage tasks — switch to a volunteer account to join directly.");
      return;
    }
    setJoinedZones(p => [...p, zone.id]);
    toast.success(`✅ You joined ${zone.label}! Redirecting to your task…`);
    setTimeout(() => { setSelected(null); navigate("/mission"); }, 1200);
  };

  const handleNavigateToZone = (zone: Zone) => {
    const query = encodeURIComponent(`${zone.label} community centre`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
    toast.success(`🗺️ Opening navigation to ${zone.label}`);
  };

  return (
    <div className="relative h-full overflow-hidden" style={{ background: "#e8eff5" }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-pointer"
        onClick={handleClick}
      />

      {/* ── Search bar ── */}
      <div className="absolute top-3 left-3 right-3 z-10">
        <div
          className="flex items-center gap-2.5 px-4 py-2.5"
          style={{
            background: "rgba(255,255,255,0.97)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-md)",
            backdropFilter: "blur(12px)",
          }}
        >
          <Search size={15} style={{ color: "var(--text-3)", flexShrink: 0 }} />
          <input
            className="flex-1 bg-transparent outline-none"
            placeholder="Search a community need…"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ fontSize: "13px", color: "var(--text)", fontFamily: "var(--font)" }}
          />
          {searchText && (
            <button onClick={() => setSearchText("")}>
              <X size={14} style={{ color: "var(--text-3)" }} />
            </button>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{
              background: showFilters ? "var(--teal-light)" : "var(--surface-2)",
              border: `1px solid ${showFilters ? "#99f6e4" : "var(--border)"}`,
            }}
          >
            <SlidersHorizontal size={12} style={{ color: showFilters ? "var(--teal)" : "var(--text-3)" }} />
            <span style={{ fontSize: "11px", fontWeight: 700, color: showFilters ? "var(--teal)" : "var(--text-3)" }}>
              {filter !== "All" ? filter : "Filter"}
            </span>
          </motion.button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex gap-2 mt-2 flex-wrap px-1"
            >
              {FILTERS.map(f => (
                <motion.button
                  key={f}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => { setFilter(f); setShowFilters(false); }}
                  className="px-3 py-1.5"
                  style={{
                    borderRadius: "var(--radius-full)",
                    fontSize: "11px", fontWeight: 700, fontFamily: "var(--font)",
                    background: filter === f ? "var(--teal)" : "rgba(255,255,255,0.95)",
                    color: filter === f ? "#fff" : "var(--text-2)",
                    border: `1px solid ${filter === f ? "var(--teal)" : "var(--border)"}`,
                    boxShadow: "var(--shadow-xs)",
                  }}
                >
                  {f}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Zone detail modal ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="absolute inset-x-4 top-1/3 -translate-y-1/2 z-20 gs-card p-5"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: `${selected.color}12`, border: `1.5px solid ${selected.color}22` }}
                >
                  {selected.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "16px", color: "var(--text)" }}>{selected.label}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <MapPin size={11} style={{ color: "var(--text-3)" }} />
                    <span style={{ fontSize: "12px", color: "var(--text-2)", fontWeight: 600 }}>{selected.distance} away</span>
                    {joinedZones.includes(selected.id) && (
                      <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: "9px", fontWeight: 800, background: "#ecfdf5", color: "#059669", border: "1px solid #bbf7d0" }}>
                        ✓ Joined
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-xl"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
              >
                <X size={14} style={{ color: "var(--text-3)" }} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { l: "People", v: selected.people },
                { l: "Helpers", v: `${selected.volunteers}/${selected.needed}` },
                { l: "Still need", v: selected.needed - selected.volunteers },
              ].map(s => (
                <div key={s.l} className="text-center py-2.5 rounded-xl"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border-light)" }}>
                  <div style={{ fontWeight: 800, fontSize: "16px", color: selected.color }}>{s.v}</div>
                  <div style={{ fontSize: "10px", color: "var(--text-3)", fontWeight: 600 }}>{s.l}</div>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <div className="flex justify-between mb-1.5">
                <span style={{ fontSize: "12px", color: "var(--text-2)", fontWeight: 600 }}>Volunteers on the way</span>
                <span style={{ fontSize: "12px", color: selected.color, fontWeight: 700 }}>
                  {Math.round(selected.volunteers / selected.needed * 100)}%
                </span>
              </div>
              <div className="gs-progress" style={{ height: "7px" }}>
                <div
                  className="gs-progress-fill"
                  style={{ width: `${(selected.volunteers / selected.needed) * 100}%`, background: selected.color }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="flex-1 py-3 rounded-2xl flex items-center justify-center gap-1.5"
                style={{
                  background: joinedZones.includes(selected.id) ? "#059669" : selected.color,
                  color: "#fff", fontWeight: 800, fontSize: "14px",
                  fontFamily: "var(--font)", cursor: "pointer",
                }}
                onClick={() => handleJoinZone(selected)}
              >
                {joinedZones.includes(selected.id) ? "✓ Joined" : "Help Now →"}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => handleNavigateToZone(selected)}
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", cursor: "pointer" }}
                title="Get directions"
              >
                <Navigation size={15} style={{ color: "var(--text-2)" }} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom need card ── */}
      <AnimatePresence>
        {!selected && (
          <motion.div
            initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 220 }}
            className="absolute bottom-4 left-4 right-4 z-10 gs-card p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div style={{ fontWeight: 700, fontSize: "11px", color: "var(--text-3)", marginBottom: "2px" }}>
                  NEAREST NEED
                </div>
                <div style={{ fontWeight: 800, fontSize: "16px", color: "var(--text)" }}>
                  {searchText
                    ? `${zonesRef.current.filter(z => z.label.toLowerCase().includes(searchText.toLowerCase())).length} matching zones`
                    : "Food support needed"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {openCount > 0 && (
                  <motion.button
                    whileTap={{ scale: 0.94 }}
                    onClick={() => navigate("/report")}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl"
                    style={{ background: "#fff1f2", border: "1.5px solid #fecaca", cursor: "pointer" }}
                  >
                    <span style={{ fontSize: "9px", fontWeight: 800, color: "#e11d48" }}>🚨 {openCount} new</span>
                  </motion.button>
                )}
                <span className="gs-chip gs-chip-amber" style={{ fontSize: "10px" }}>Urgent</span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--teal-light)" }}>
                  <Users size={13} style={{ color: "var(--teal)" }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text)" }}>80 people</div>
                  <div style={{ fontSize: "10px", color: "var(--text-3)" }}>affected</div>
                </div>
              </div>
              <div className="h-8 w-px" style={{ background: "var(--border-light)" }} />
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--blue-light)" }}>
                  <MapPin size={13} style={{ color: "var(--blue)" }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text)" }}>0.8 km</div>
                  <div style={{ fontSize: "10px", color: "var(--text-3)" }}>from you</div>
                </div>
              </div>
              <div className="h-8 w-px" style={{ background: "var(--border-light)" }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text)" }}>8 / 18</div>
                <div style={{ fontSize: "10px", color: "var(--text-3)" }}>helpers</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="gs-progress" style={{ height: "6px" }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: "44%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="gs-progress-fill"
                  style={{ background: "linear-gradient(90deg, var(--teal), #2dd4bf)" }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span style={{ fontSize: "10px", color: "var(--text-3)", fontWeight: 500 }}>44% filled</span>
                <span style={{ fontSize: "10px", color: "var(--teal)", fontWeight: 700 }}>10 more helpers needed</span>
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="gs-btn gs-btn-primary flex-1 py-3"
                style={{ fontSize: "14px" }}
                onClick={() => {
                  if (user?.role === "ngo") { navigate("/control"); }
                  else { toast.success("✅ Joining Food Support mission!"); setTimeout(() => navigate("/mission"), 800); }
                }}
              >
                Help Now
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="gs-btn gs-btn-secondary px-4 flex items-center gap-1.5"
                style={{ fontSize: "13px" }}
                onClick={() => navigate("/report")}
                title="Report a new need"
              >
                <FilePlus size={13} /> Report
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}