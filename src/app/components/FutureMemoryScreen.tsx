import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ChevronLeft, ChevronRight, Clock, TrendingUp, Info, Bell, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useNeeds } from "../context/NeedsContext";

const PREDICTIONS = [
  {
    id: 1,
    area: "Sector 7 – West Side",
    need: "Food support",
    icon: "🍽️",
    daysFromNow: 2,
    confidence: 82,
    affected: 95,
    color: "#0f766e",
    colorBg: "var(--teal-light)",
    colorBorder: "#99f6e4",
    reason: "Reduced food store deliveries expected over the weekend.",
    withHelp:   { people: 10, outcome: "Needs fully covered in 1 day" },
    withoutHelp:{ people: 95, outcome: "Shortage spreads to 3 streets" },
  },
  {
    id: 2,
    area: "East Quarter – Medical Zone",
    need: "Medical supplies",
    icon: "🏥",
    daysFromNow: 4,
    confidence: 71,
    affected: 60,
    color: "#2563eb",
    colorBg: "var(--blue-light)",
    colorBorder: "#bfdbfe",
    reason: "Current supply levels will run out by Thursday based on usage trends.",
    withHelp:   { people: 8,  outcome: "Restocked before shortage" },
    withoutHelp:{ people: 60, outcome: "Clinic closes temporarily" },
  },
  {
    id: 3,
    area: "North Quarter – School Area",
    need: "Learning materials",
    icon: "📖",
    daysFromNow: 7,
    confidence: 58,
    affected: 40,
    color: "#7c3aed",
    colorBg: "var(--lavender-light)",
    colorBorder: "#ddd6fe",
    reason: "End-of-term exams approaching, materials stock running low.",
    withHelp:   { people: 5,  outcome: "All students supported" },
    withoutHelp:{ people: 40, outcome: "30% miss exam materials" },
  },
];

const TIMELINE_STEPS = [
  { label: "Today",  days: 0 },
  { label: "2 days", days: 2 },
  { label: "4 days", days: 4 },
  { label: "7 days", days: 7 },
  { label: "2 wks",  days: 14 },
];

function ConfidenceBadge({ pct }: { pct: number }) {
  const color = pct >= 75 ? "#059669" : pct >= 55 ? "#b45309" : "#94a3b8";
  const label = pct >= 75 ? "High confidence" : pct >= 55 ? "Moderate" : "Possible";
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{ background: `${color}12`, border: `1px solid ${color}28` }}
    >
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      <span style={{ fontSize: "10px", fontWeight: 700, color, fontFamily: "var(--font)" }}>
        {label} · {pct}%
      </span>
    </div>
  );
}

export function FutureMemoryScreen() {
  const [activeId, setActiveId] = useState(1);
  const [ti, setTi] = useState(1);
  const [subscribed, setSubscribed] = useState<number[]>([]);
  const navigate = useNavigate();
  const { needs } = useNeeds();

  const active = PREDICTIONS.find(p => p.id === activeId)!;
  const visiblePredictions = PREDICTIONS.filter(
    p => p.daysFromNow >= (TIMELINE_STEPS[ti].days - 0.5)
  );

  return (
    <div className="h-full overflow-y-auto" style={{ background: "var(--bg)" }}>
      <div className="p-4 space-y-4">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontWeight: 800, fontSize: "20px", color: "var(--text)" }}>
              Upcoming Needs
            </h1>
            <p style={{ fontSize: "13px", color: "var(--text-3)", fontWeight: 500 }}>
              What your community may need soon
            </p>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
            style={{ background: "var(--lavender-light)", border: "1px solid #ddd6fe" }}
          >
            <Sparkles size={12} style={{ color: "#7c3aed" }} />
            <span style={{ fontSize: "11px", color: "#7c3aed", fontWeight: 700 }}>AI insights</span>
          </div>
        </div>

        {/* ── Timeline slider ── */}
        <div
          className="gs-card p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontWeight: 700, fontSize: "13px", color: "var(--text)" }}>
              Looking ahead
            </span>
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setTi(i => Math.max(0, i - 1))}
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
              >
                <ChevronLeft size={13} style={{ color: "var(--text-3)" }} />
              </motion.button>
              <span style={{ fontWeight: 700, fontSize: "13px", color: "var(--teal)", minWidth: "50px", textAlign: "center" }}>
                {TIMELINE_STEPS[ti].label}
              </span>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setTi(i => Math.min(TIMELINE_STEPS.length - 1, i + 1))}
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
              >
                <ChevronRight size={13} style={{ color: "var(--text-3)" }} />
              </motion.button>
            </div>
          </div>

          {/* Timeline track */}
          <div className="relative">
            <div
              className="h-1.5 rounded-full w-full"
              style={{ background: "var(--border-light)" }}
            />
            <motion.div
              className="absolute top-0 h-1.5 rounded-full"
              animate={{ width: `${(ti / (TIMELINE_STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.4 }}
              style={{ background: "linear-gradient(90deg, var(--teal), #5eead4)" }}
            />
            <div className="flex justify-between mt-2">
              {TIMELINE_STEPS.map((s, i) => (
                <button key={i} onClick={() => setTi(i)} className="flex flex-col items-center gap-1">
                  <div
                    className="w-2.5 h-2.5 rounded-full -mt-5 transition-all"
                    style={{
                      background: i <= ti ? "var(--teal)" : "var(--border)",
                      boxShadow: i === ti ? "0 0 0 3px #ccfbf1" : "none",
                    }}
                  />
                  <span style={{ fontSize: "9px", fontWeight: i === ti ? 700 : 500, color: i <= ti ? "var(--teal)" : "var(--text-3)" }}>
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Need cards for this time window ── */}
        <div>
          <div style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-2)", marginBottom: "10px" }}>
            {visiblePredictions.length} upcoming {visiblePredictions.length === 1 ? "need" : "needs"} in this window
          </div>
          <div className="space-y-3">
            {PREDICTIONS.map(p => {
              const visible = visiblePredictions.some(v => v.id === p.id);
              return (
                <motion.button
                  key={p.id}
                  onClick={() => setActiveId(p.id)}
                  className="w-full text-left"
                  animate={{ opacity: visible ? 1 : 0.35 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className="gs-card p-4"
                    style={{
                      border: activeId === p.id
                        ? `2px solid ${p.color}50`
                        : "1px solid var(--border)",
                      boxShadow: activeId === p.id ? `0 4px 20px ${p.color}15` : "var(--shadow-sm)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: p.colorBg, border: `1px solid ${p.colorBorder}` }}
                      >
                        {p.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>
                              {p.need}
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 500 }}>
                              {p.area}
                            </div>
                          </div>
                          <div
                            className="flex items-center gap-1 px-2 py-1 rounded-lg ml-2"
                            style={{ background: "var(--surface-2)", border: "1px solid var(--border-light)" }}
                          >
                            <Clock size={10} style={{ color: "var(--text-3)" }} />
                            <span style={{ fontSize: "10px", color: "var(--text-3)", fontWeight: 600, whiteSpace: "nowrap" }}>
                              in {p.daysFromNow} {p.daysFromNow === 1 ? "day" : "days"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <ConfidenceBadge pct={p.confidence} />
                          <span style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 500 }}>
                            ~{p.affected} people
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Detail card ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="gs-card p-5"
            style={{ border: `1.5px solid ${active.colorBorder}` }}
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={14} style={{ color: active.color }} />
              <span style={{ fontWeight: 700, fontSize: "13px", color: active.color }}>
                What the data suggests
              </span>
            </div>

            {/* Why prediction */}
            <div
              className="flex gap-2.5 p-3 rounded-xl mb-4"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-light)" }}
            >
              <Info size={14} style={{ color: "var(--text-3)", flexShrink: 0, marginTop: "2px" }} />
              <p style={{ fontSize: "13px", color: "var(--text-2)", fontWeight: 500, lineHeight: 1.5 }}>
                {active.reason}
              </p>
            </div>

            {/* Comparison: 2 soft cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Without help */}
              <div
                className="p-3.5 rounded-xl"
                style={{ background: "#fff7f7", border: "1px solid #fecaca" }}
              >
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#dc2626", marginBottom: "6px" }}>
                  Without support
                </div>
                <div style={{ fontWeight: 800, fontSize: "18px", color: "#dc2626", lineHeight: 1 }}>
                  {active.withoutHelp.people}
                </div>
                <div style={{ fontSize: "10px", color: "#ef4444", fontWeight: 500, marginTop: "2px" }}>
                  people affected
                </div>
                <div
                  className="mt-2 p-2 rounded-lg"
                  style={{ background: "rgba(220,38,38,0.06)" }}
                >
                  <p style={{ fontSize: "11px", color: "#dc2626", fontWeight: 600, lineHeight: 1.4 }}>
                    {active.withoutHelp.outcome}
                  </p>
                </div>
              </div>

              {/* With help */}
              <div
                className="p-3.5 rounded-xl"
                style={{ background: "var(--teal-pale)", border: "1px solid #99f6e4" }}
              >
                <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--teal)", marginBottom: "6px" }}>
                  With your help
                </div>
                <div style={{ fontWeight: 800, fontSize: "18px", color: "var(--teal)", lineHeight: 1 }}>
                  {active.withHelp.people}
                </div>
                <div style={{ fontSize: "10px", color: "var(--teal-mid)", fontWeight: 500, marginTop: "2px" }}>
                  volunteers needed
                </div>
                <div
                  className="mt-2 p-2 rounded-lg"
                  style={{ background: "rgba(15,118,110,0.07)" }}
                >
                  <p style={{ fontSize: "11px", color: "var(--teal)", fontWeight: 600, lineHeight: 1.4 }}>
                    {active.withHelp.outcome}
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="gs-btn gs-btn-primary w-full py-3.5"
              style={{ fontSize: "14px" }}
              onClick={() => {
                toast.success(`📋 Added to your task list — heading to missions!`);
                setTimeout(() => navigate("/mission"), 700);
              }}
            >
              Plan ahead — volunteer now
            </motion.button>

            {/* Alert subscription */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const already = subscribed.includes(active.id);
                if (already) {
                  setSubscribed(p => p.filter(id => id !== active.id));
                  toast.info(`🔕 Alert removed for ${active.need}`);
                } else {
                  setSubscribed(p => [...p, active.id]);
                  toast.success(`🔔 You'll be alerted when ${active.need} needs help!`);
                }
              }}
              className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 mt-2"
              style={{
                background: subscribed.includes(active.id) ? "var(--teal-light)" : "var(--surface-2)",
                border: `1.5px solid ${subscribed.includes(active.id) ? "#99f6e4" : "var(--border)"}`,
                color: subscribed.includes(active.id) ? "var(--teal)" : "var(--text-3)",
                fontWeight: 700, fontSize: "13px", fontFamily: "var(--font)", cursor: "pointer",
              }}
            >
              <Bell size={14} />
              {subscribed.includes(active.id) ? "Alert set ✓" : "Alert me when this needs help"}
            </motion.button>
          </motion.div>
        </AnimatePresence>

        {/* ── Gentle note ── */}
        <div
          className="flex items-start gap-2.5 p-3.5 rounded-2xl"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border-light)" }}
        >
          <span style={{ fontSize: "16px" }}>💙</span>
          <p style={{ fontSize: "12px", color: "var(--text-3)", fontWeight: 500, lineHeight: 1.5 }}>
            These are gentle predictions based on local data — not certainties.
            Small actions today can prevent bigger challenges tomorrow.
          </p>
        </div>

        {/* ── Live reported needs ── */}
        {needs.length > 0 && (
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text)", marginBottom: "10px" }}>
              🔴 Live Reported Needs ({needs.filter(n => n.status === "open").length} open)
            </div>
            <div className="space-y-3">
              {needs.slice(0, 3).map(n => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="gs-card p-4"
                  style={{
                    border: n.urgency === "Critical" ? "1.5px solid #fecaca" : n.urgency === "High" ? "1.5px solid #fde68a" : "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: n.urgency === "Critical" ? "#fff1f2" : "var(--teal-light)" }}>
                      {n.category === "Food" ? "🍽️" : n.category === "Health" ? "🏥" : n.category === "Education" ? "📖" : n.category === "Water" ? "💧" : n.category === "Shelter" ? "🏠" : "📌"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{ fontWeight: 700, fontSize: "13px", color: "var(--text)" }}>{n.category} Need — {n.location}</span>
                        <span className="px-2 py-0.5 rounded-full" style={{
                          fontSize: "9px", fontWeight: 800,
                          background: n.urgency === "Critical" ? "#fff1f2" : n.urgency === "High" ? "var(--amber-light)" : "var(--teal-light)",
                          color: n.urgency === "Critical" ? "#e11d48" : n.urgency === "High" ? "#b45309" : "var(--teal)",
                        }}>{n.urgency}</span>
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-3)" }}>
                        {n.affected} people · {n.volunteersNeeded} volunteers needed · {new Date(n.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {needs.length > 3 && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate("/report")}
                  className="w-full py-3 rounded-2xl flex items-center justify-center gap-2"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", cursor: "pointer" }}
                >
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-2)", fontFamily: "var(--font)" }}>
                    View all {needs.length} reports
                  </span>
                </motion.button>
              )}
            </div>
          </div>
        )}

        {needs.length === 0 && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/report")}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
            style={{ border: "2px dashed var(--border)", background: "var(--surface)", cursor: "pointer" }}
          >
            <Plus size={15} style={{ color: "var(--text-3)" }} />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-3)", fontFamily: "var(--font)" }}>
              Add a community report to see live predictions
            </span>
          </motion.button>
        )}
      </div>
    </div>
  );
}