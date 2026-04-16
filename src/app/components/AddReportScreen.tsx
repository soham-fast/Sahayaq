/**
 * AddReportScreen – Data Input → Gemini AI → Structured Output → Map
 * Covers spec items: Data Input Module, AI Processing Module, Live Need Map feed
 */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText, Mic, Sparkles, Check, AlertTriangle, MapPin,
  Users, ChevronRight, X, RotateCcw, Plus, Send, MicOff,
  Upload, Zap, TrendingUp, Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useNeeds, Need, NeedCategory, NeedUrgency } from "../context/NeedsContext";

// ── Gemini AI simulation ───────────────────────────────────────────────────────
const CATEGORY_ICONS: Record<NeedCategory, string> = {
  Food: "🍽️", Health: "🏥", Education: "📖", Shelter: "🏠",
  Water: "💧", "Mental Health": "💬", Logistics: "📦", Other: "📌",
};
const URGENCY_CFG: Record<NeedUrgency, { color: string; bg: string; border: string; label: string }> = {
  Critical: { color: "#e11d48", bg: "#fff1f2",            border: "#fecaca", label: "Critical" },
  High:     { color: "#b45309", bg: "var(--amber-light)", border: "#fde68a", label: "High"     },
  Medium:   { color: "#0f766e", bg: "var(--teal-light)",  border: "#99f6e4", label: "Medium"   },
  Low:      { color: "#059669", bg: "var(--green-light)", border: "#bbf7d0", label: "Low"      },
};

function analyzeText(text: string): Omit<Need, "id" | "rawText" | "createdAt" | "status" | "addedToMap"> {
  const t = text.toLowerCase();
  let category: NeedCategory = "Other";
  let urgency: NeedUrgency   = "Medium";
  let affected = 40;
  let needs: string[]  = ["General support", "Assessment", "Follow-up"];
  let location = "Community Area";
  let action = "Dispatch community support team";
  let confidence = 0.78 + Math.random() * 0.18;

  // Category
  if (t.match(/food|hunger|hungry|meal|eat|starv|grain|ration/))   { category = "Food";         needs = ["Food packets", "Meal preparation", "Nutrition kits", "Dry ration distribution"]; action = "Deploy food distribution team with emergency supplies"; }
  else if (t.match(/medical|health|sick|medicine|clinic|hospital|doctor|patient|drug|blood|inject/)) { category = "Health";        needs = ["Medical supplies", "First-aid kits", "Medication delivery", "Health checkup camp"]; action = "Deploy certified medical volunteers with supplies"; }
  else if (t.match(/school|education|learning|student|exam|book|class|teach|study/)) { category = "Education";      needs = ["Learning materials", "Stationery kits", "Teaching volunteers", "Exam preparation support"]; action = "Coordinate education support volunteers"; urgency = "Medium"; }
  else if (t.match(/water|drink|thirst|purif|well|tap|flood/))      { category = "Water";         needs = ["Water purification tablets", "Filter systems", "Clean water tankers", "Hydration kits"]; action = "Emergency water supply and purification deployment"; urgency = "Critical"; }
  else if (t.match(/shelter|home|house|roof|tent|camp|displace/))   { category = "Shelter";       needs = ["Tarpaulins", "Shelter repair kits", "Blankets", "Construction volunteers"]; action = "Send shelter repair team immediately"; }
  else if (t.match(/mental|trauma|stress|anxiety|counsel|psych/))   { category = "Mental Health"; needs = ["Trauma counselors", "Group therapy sessions", "Helpline connection", "Child counseling"]; action = "Deploy certified counselors to site"; }
  else if (t.match(/transport|deliver|logistics|supply|cargo/))     { category = "Logistics";     needs = ["Transport vehicles", "Supply chain coordination", "Warehouse support"]; action = "Coordinate logistics and delivery team"; }

  // Urgency
  if (t.match(/urgent|emergency|critical|immediate|asap|now|dying|crisis|severe/)) urgency = "Critical";
  else if (t.match(/short|running low|shortage|need|hungry|sick|flood|displace/))  urgency = "High";
  else if (t.match(/soon|upcoming|approaching|may need|within/))                    urgency = "Medium";
  else if (t.match(/future|plan|prepare|consider|might/))                            urgency = "Low";

  // Numbers
  const nums = text.match(/\d+/g);
  if (nums) {
    const relevant = nums.map(Number).filter(n => n > 0 && n < 5000);
    if (relevant.length) affected = Math.max(...relevant);
  } else {
    affected = category === "Food" ? 85 : category === "Health" ? 55 : category === "Water" ? 120 : 35;
  }

  // Location
  const locMatch = text.match(/sector\s*\d+/i) || text.match(/block\s*\d+/i) || text.match(/zone\s*\d+/i);
  if (locMatch) location = locMatch[0].replace(/\s+/g, " ").trim();
  else if (t.match(/east/)) location = "East Side";
  else if (t.match(/north/)) location = "North Quarter";
  else if (t.match(/west/)) location = "West Camp";
  else if (t.match(/south/)) location = "South Zone";
  else if (t.match(/central|center/)) location = "Central Hub";

  const volunteersNeeded = Math.max(3, Math.ceil(affected / 7));
  const summary = `${affected} people may be affected by ${category.toLowerCase()} shortage in ${location}. Urgency: ${urgency}. Recommend ${volunteersNeeded} volunteers with ${category} skills.`;

  return { category, urgency, affected, location, needs, summary, volunteersNeeded, confidence, action };
}

// ── AI Processing Steps ──────────────────────────────────────────────────────
const AI_STEPS = [
  { icon: "📄", label: "Reading your report…",           detail: "Parsing text input using NLP tokenization"    },
  { icon: "🔍", label: "Extracting key needs…",          detail: "Identifying critical need keywords and phrases" },
  { icon: "📊", label: "Classifying category…",          detail: "Matching patterns against training data"       },
  { icon: "⚡", label: "Detecting urgency level…",       detail: "Scoring severity based on context signals"      },
  { icon: "🗺️", label: "Inferring location context…",    detail: "Geo-entity recognition and area mapping"       },
  { icon: "✅", label: "Generating structured output…",  detail: "Compiling JSON response for action pipeline"   },
];

// ── Sample reports ────────────────────────────────────────────────────────────
const SAMPLES = [
  { label: "Food shortage", text: "Many families in Sector 7 don't have enough food. Nearly 80 children are going hungry every day. We urgently need food distribution support.", icon: "🍽️" },
  { label: "Medical need",  text: "The medical supplies at East Side Clinic are running critically low. About 55 patients need daily medication and we may run out in 2 days.", icon: "🏥" },
  { label: "Education",     text: "North Quarter school has 40 students preparing for upcoming exams but they lack learning materials and stationery kits.", icon: "📖" },
  { label: "Water crisis",  text: "South Zone residents are experiencing acute water shortage. Over 120 families need clean drinking water urgently. The taps have been dry for 3 days.", icon: "💧" },
];

type InputMode = "manual" | "upload" | "voice";
type Screen    = "input" | "processing" | "result";

export function AddReportScreen() {
  const navigate         = useNavigate();
  const { addNeed }      = useNeeds();
  const recognitionRef   = useRef<SpeechRecognition | null>(null);

  const [screen,       setScreen]       = useState<Screen>("input");
  const [inputMode,    setInputMode]    = useState<InputMode>("manual");
  const [reportText,   setReportText]   = useState("");
  const [locInput,     setLocInput]     = useState("");
  const [stepIdx,      setStepIdx]      = useState(0);
  const [stepDone,     setStepDone]     = useState<number[]>([]);
  const [result,       setResult]       = useState<ReturnType<typeof analyzeText> | null>(null);
  const [addedToMap,   setAddedToMap]   = useState(false);
  const [recording,    setRecording]    = useState(false);
  const [uploadName,   setUploadName]   = useState<string | null>(null);
  const fileRef        = useRef<HTMLInputElement>(null);

  // Run AI steps sequentially
  useEffect(() => {
    if (screen !== "processing") return;
    let i = 0;
    setStepIdx(0); setStepDone([]);
    const timer = setInterval(() => {
      setStepDone(p => [...p, i]);
      i++;
      setStepIdx(i);
      if (i >= AI_STEPS.length) {
        clearInterval(timer);
        setTimeout(() => {
          const r = analyzeText(reportText + " " + locInput);
          if (locInput) r.location = locInput;
          setResult(r);
          setScreen("result");
        }, 500);
      }
    }, 680);
    return () => clearInterval(timer);
  }, [screen]);

  // Voice recording
  const toggleRecording = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) { toast.error("Voice input not supported in this browser. Please use Chrome."); return; }
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
    } else {
      const rec = new SpeechRec();
      rec.continuous = true; rec.interimResults = true; rec.lang = "en-IN";
      rec.onresult = (e: SpeechRecognitionEvent) => {
        const transcript = Array.from(e.results).map(r => r[0].transcript).join(" ");
        setReportText(transcript);
      };
      rec.onerror = () => { setRecording(false); toast.error("Voice input error. Please try again."); };
      rec.onend   = () => setRecording(false);
      rec.start();
      recognitionRef.current = rec;
      setRecording(true);
      toast.info("🎙️ Listening… Speak your report clearly.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadName(file.name);
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      setReportText(text.slice(0, 2000));
      toast.success(`📄 "${file.name}" loaded — ready to analyze`);
    };
    reader.readAsText(file);
  };

  const handleAnalyze = () => {
    if (!reportText.trim() || reportText.trim().length < 15) {
      toast.error("Please enter a more detailed report (at least 15 characters).");
      return;
    }
    setScreen("processing");
  };

  const handleAddToMap = () => {
    if (!result) return;
    const need: Need = {
      id: `need_${Date.now()}`,
      ...result,
      rawText:   reportText,
      createdAt: new Date().toISOString(),
      status:    "open",
      addedToMap: true,
    };
    addNeed(need);
    setAddedToMap(true);
    toast.success(`🗺️ Added to Community Map! ${result.affected} people, ${result.volunteersNeeded} volunteers needed.`);
  };

  const reset = () => {
    setScreen("input"); setResult(null); setReportText(""); setLocInput("");
    setAddedToMap(false); setUploadName(null); setStepIdx(0); setStepDone([]);
  };

  return (
    <div className="h-full overflow-y-auto" style={{ background: "var(--bg)", fontFamily: "var(--font)" }}>
      <AnimatePresence mode="wait">

        {/* ────────────────────── INPUT SCREEN ────────────────────────────── */}
        {screen === "input" && (
          <motion.div key="input" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            <div className="p-4 space-y-4">

              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 style={{ fontWeight: 900, fontSize: "22px", color: "var(--text)", letterSpacing: "-0.02em" }}>
                    Report a Need
                  </h1>
                  <p style={{ fontSize: "13px", color: "var(--text-3)", fontWeight: 500, marginTop: "3px" }}>
                    Describe the community need — our AI will extract and classify it
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                  style={{ background: "var(--lavender-light)", border: "1px solid #ddd6fe" }}>
                  <Sparkles size={12} style={{ color: "#7c3aed" }} />
                  <span style={{ fontSize: "11px", color: "#7c3aed", fontWeight: 700 }}>Gemini AI</span>
                </div>
              </div>

              {/* Data flow banner */}
              <div className="gs-card p-3 flex items-center gap-2 overflow-x-auto"
                style={{ background: "linear-gradient(90deg, #f0fdfa, #eff6ff)", border: "1px solid #bfdbfe" }}>
                {["Input", "→", "AI Analysis", "→", "Classify", "→", "Map", "→", "Match", "→", "Action"].map((s, i) => (
                  <span key={i} style={{
                    fontSize: "10px", fontWeight: s === "→" ? 400 : 700, whiteSpace: "nowrap",
                    color: s === "→" ? "var(--text-4)" : i === 0 ? "var(--teal)" : "var(--text-2)",
                  }}>{s}</span>
                ))}
              </div>

              {/* Input mode tabs */}
              <div className="flex gap-1 p-1 rounded-2xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                {([
                  { id: "manual", label: "Manual",  icon: <FileText size={13} /> },
                  { id: "upload", label: "Upload",   icon: <Upload size={13} />   },
                  { id: "voice",  label: "Voice",    icon: <Mic size={13} />      },
                ] as const).map(t => (
                  <motion.button
                    key={t.id} whileTap={{ scale: 0.94 }}
                    onClick={() => setInputMode(t.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl"
                    style={{
                      background: inputMode === t.id ? "var(--teal)" : "transparent",
                      color:      inputMode === t.id ? "#fff" : "var(--text-3)",
                      fontWeight: 700, fontSize: "12px", cursor: "pointer", transition: "all 0.2s",
                    }}
                  >
                    {t.icon} {t.label}
                  </motion.button>
                ))}
              </div>

              {/* ── Manual input ── */}
              {inputMode === "manual" && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-2)", display: "block", marginBottom: "8px" }}>
                      Describe the need *
                    </label>
                    <textarea
                      rows={6}
                      className="w-full px-4 py-3 rounded-2xl outline-none resize-none"
                      style={{
                        background: "var(--surface)", border: `1.5px solid ${reportText.length > 15 ? "var(--teal)" : "var(--border)"}`,
                        fontSize: "13px", color: "var(--text)", fontFamily: "var(--font)", lineHeight: 1.6,
                        transition: "border-color 0.2s",
                      }}
                      placeholder="e.g. Many families in Sector 7 don't have enough food. Around 80 children are going hungry…"
                      value={reportText}
                      onChange={e => setReportText(e.target.value)}
                    />
                    <div className="flex justify-between mt-1.5">
                      <span style={{ fontSize: "10px", color: reportText.length < 15 ? "#e11d48" : "var(--green)", fontWeight: 600 }}>
                        {reportText.length < 15 ? `${15 - reportText.length} more characters needed` : "✓ Ready for analysis"}
                      </span>
                      <span style={{ fontSize: "10px", color: "var(--text-4)" }}>{reportText.length} chars</span>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-2)", display: "block", marginBottom: "8px" }}>
                      Location (optional)
                    </label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-4)" }} />
                      <input
                        className="w-full pl-10 pr-4 py-3 rounded-xl outline-none"
                        style={{ background: "var(--surface)", border: "1.5px solid var(--border)", fontSize: "13px", color: "var(--text)", fontFamily: "var(--font)" }}
                        placeholder="e.g. Sector 7, North Quarter, East Side…"
                        value={locInput}
                        onChange={e => setLocInput(e.target.value)}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Upload mode ── */}
              {inputMode === "upload" && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <input ref={fileRef} type="file" accept=".txt,.pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} />
                  <motion.button
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    onClick={() => fileRef.current?.click()}
                    className="w-full py-10 rounded-2xl flex flex-col items-center gap-3"
                    style={{ border: `2px dashed ${uploadName ? "var(--teal)" : "var(--border)"}`, background: uploadName ? "var(--teal-pale)" : "var(--surface)", cursor: "pointer" }}
                  >
                    {uploadName ? (
                      <>
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: "var(--teal-light)", border: "1.5px solid #99f6e4" }}>📄</div>
                        <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--teal)" }}>{uploadName}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-3)" }}>File loaded — ready to analyze</div>
                      </>
                    ) : (
                      <>
                        <Upload size={28} style={{ color: "var(--text-4)" }} />
                        <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-2)" }}>Drop survey file here</div>
                        <div style={{ fontSize: "12px", color: "var(--text-3)" }}>Supports .txt, .doc, .pdf (text content)</div>
                        <span className="px-4 py-2 rounded-xl" style={{ background: "var(--teal-light)", color: "var(--teal)", fontWeight: 700, fontSize: "12px", border: "1px solid #99f6e4" }}>
                          Browse files
                        </span>
                      </>
                    )}
                  </motion.button>
                  {uploadName && (
                    <textarea
                      rows={5} readOnly
                      className="w-full px-4 py-3 rounded-2xl resize-none"
                      style={{ background: "var(--surface-2)", border: "1px solid var(--border)", fontSize: "12px", color: "var(--text-2)", fontFamily: "var(--font)", lineHeight: 1.6 }}
                      value={reportText}
                    />
                  )}
                </motion.div>
              )}

              {/* ── Voice mode ── */}
              {inputMode === "voice" && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex flex-col items-center gap-4 py-6">
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      onClick={toggleRecording}
                      animate={recording ? { scale: [1, 1.08, 1] } : {}}
                      transition={recording ? { repeat: Infinity, duration: 1.2 } : {}}
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{
                        background: recording ? "#e11d48" : "var(--teal)",
                        boxShadow: recording ? "0 0 0 12px rgba(225,29,72,0.15), 0 0 0 24px rgba(225,29,72,0.07)" : "0 4px 20px rgba(15,118,110,0.3)",
                        cursor: "pointer", transition: "background 0.3s",
                      }}
                    >
                      {recording ? <MicOff size={28} style={{ color: "#fff" }} /> : <Mic size={28} style={{ color: "#fff" }} />}
                    </motion.button>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>
                      {recording ? "🔴 Recording… Speak clearly" : "Tap to start recording"}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-3)", textAlign: "center" }}>
                      Describe the community need in your own words.<br/>Works best in Chrome browser.
                    </div>
                  </div>
                  {reportText && (
                    <div className="gs-card p-4">
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-3)", marginBottom: "8px" }}>TRANSCRIBED</div>
                      <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.6 }}>{reportText}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── Sample reports ── */}
              <div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-3)", marginBottom: "10px" }}>
                  TRY A SAMPLE REPORT
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SAMPLES.map((s, i) => (
                    <motion.button
                      key={i} whileTap={{ scale: 0.96 }}
                      onClick={() => { setReportText(s.text); setInputMode("manual"); toast.info(`Sample loaded: ${s.label}`); }}
                      className="p-3 rounded-2xl text-left"
                      style={{ background: "var(--surface)", border: "1.5px solid var(--border)", cursor: "pointer" }}
                    >
                      <div style={{ fontSize: "18px", marginBottom: "4px" }}>{s.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: "12px", color: "var(--text)" }}>{s.label}</div>
                      <div style={{ fontSize: "10px", color: "var(--text-3)", marginTop: "2px", lineHeight: 1.4 }}>
                        {s.text.slice(0, 50)}…
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Analyze button */}
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleAnalyze}
                disabled={reportText.trim().length < 15}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-3"
                style={{
                  background: reportText.trim().length >= 15
                    ? "linear-gradient(135deg, #0f766e, #2563eb)"
                    : "var(--border)",
                  color: "#fff", fontWeight: 800, fontSize: "15px",
                  fontFamily: "var(--font)", cursor: reportText.trim().length >= 15 ? "pointer" : "not-allowed",
                  boxShadow: reportText.trim().length >= 15 ? "0 4px 20px rgba(15,118,110,0.35)" : "none",
                  transition: "all 0.3s",
                }}
              >
                <Sparkles size={18} /> Analyze with Gemini AI
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ────────────────────── PROCESSING SCREEN ───────────────────────── */}
        {screen === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="h-full flex flex-col items-center justify-center p-6 min-h-screen"
          >
            {/* Gemini badge */}
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
              style={{ background: "linear-gradient(135deg, var(--teal), #7c3aed)", boxShadow: "0 8px 32px rgba(15,118,110,0.35)" }}
            >
              <Sparkles size={36} style={{ color: "#fff" }} />
            </motion.div>

            <h2 style={{ fontWeight: 900, fontSize: "20px", color: "var(--text)", marginBottom: "6px", textAlign: "center" }}>
              Gemini AI Processing
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-3)", marginBottom: "32px", textAlign: "center" }}>
              Analyzing your report through our intelligence pipeline…
            </p>

            {/* Steps */}
            <div className="w-full max-w-sm space-y-3">
              {AI_STEPS.map((step, i) => {
                const done    = stepDone.includes(i);
                const current = stepIdx === i;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: i <= stepIdx + 1 ? 1 : 0.25, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 p-3.5 rounded-2xl"
                    style={{
                      background: done ? "var(--teal-pale)" : current ? "var(--surface)" : "transparent",
                      border: done ? "1px solid #99f6e4" : current ? "1.5px solid var(--teal)" : "1px solid var(--border-light)",
                      transition: "all 0.3s",
                    }}
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: done ? "var(--teal)" : current ? "var(--teal-light)" : "var(--surface-2)" }}>
                      {done
                        ? <Check size={14} style={{ color: "#fff" }} />
                        : current
                          ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}>
                              <RotateCcw size={13} style={{ color: "var(--teal)" }} />
                            </motion.div>
                          : <span style={{ fontSize: "14px" }}>{step.icon}</span>}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "13px", color: done ? "var(--teal)" : current ? "var(--text)" : "var(--text-3)" }}>
                        {step.label}
                      </div>
                      {(done || current) && (
                        <div style={{ fontSize: "10px", color: "var(--text-3)", marginTop: "2px" }}>{step.detail}</div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-sm mt-6">
              <div className="gs-progress" style={{ height: "6px" }}>
                <motion.div
                  animate={{ width: `${(stepDone.length / AI_STEPS.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="gs-progress-fill"
                  style={{ background: "linear-gradient(90deg, var(--teal), #7c3aed)" }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span style={{ fontSize: "11px", color: "var(--text-3)" }}>Processing…</span>
                <span style={{ fontSize: "11px", color: "var(--teal)", fontWeight: 700 }}>
                  {Math.round((stepDone.length / AI_STEPS.length) * 100)}%
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ────────────────────── RESULT SCREEN ───────────────────────────── */}
        {screen === "result" && result && (
          <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="p-4 space-y-4">

              {/* Result header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 style={{ fontWeight: 900, fontSize: "20px", color: "var(--text)", letterSpacing: "-0.02em" }}>
                    AI Analysis Complete
                  </h1>
                  <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "2px" }}>
                    Confidence: <strong style={{ color: result.confidence > 0.85 ? "var(--green)" : "var(--teal)" }}>
                      {Math.round(result.confidence * 100)}%
                    </strong>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                  style={{ background: "var(--green-light)", border: "1px solid #bbf7d0" }}>
                  <Check size={12} style={{ color: "var(--green)" }} />
                  <span style={{ fontSize: "11px", color: "var(--green)", fontWeight: 700 }}>Gemini AI</span>
                </div>
              </div>

              {/* ── Structured output card ── */}
              <div className="gs-card overflow-hidden" style={{ border: "1.5px solid var(--border)" }}>
                {/* JSON header */}
                <div className="px-4 py-2.5 flex items-center justify-between"
                  style={{ background: "#1e293b", borderBottom: "1px solid #334155" }}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      {["#ff5f56","#ffbd2e","#27c93f"].map(c => (
                        <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                      ))}
                    </div>
                    <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>gemini_output.json</span>
                  </div>
                  <span style={{ fontSize: "10px", color: "#0f766e", fontFamily: "monospace", fontWeight: 700 }}>200 OK</span>
                </div>

                <div className="p-4" style={{ background: "#0f172a", fontFamily: "monospace" }}>
                  {([
                    { k: "category",           v: `"${result.category}"`,            c: "#34d399" },
                    { k: "urgency",            v: `"${result.urgency}"`,             c: result.urgency === "Critical" ? "#f87171" : result.urgency === "High" ? "#fbbf24" : "#34d399" },
                    { k: "affected_people",    v: `${result.affected}`,              c: "#60a5fa" },
                    { k: "location",           v: `"${result.location}"`,            c: "#f472b6" },
                    { k: "volunteers_needed",  v: `${result.volunteersNeeded}`,      c: "#60a5fa" },
                    { k: "confidence",         v: `${result.confidence.toFixed(2)}`, c: "#a78bfa" },
                    { k: "action",             v: `"${result.action}"`,              c: "#34d399" },
                  ]).map((line, i) => (
                    <motion.div
                      key={line.k}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-2 mb-1"
                    >
                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>  "{line.k}":</span>
                      <span style={{ fontSize: "11px", color: line.c, fontWeight: 600 }}>{line.v}</span>
                    </motion.div>
                  ))}
                  <div className="mt-2 pt-2" style={{ borderTop: "1px solid #1e293b" }}>
                    <div style={{ fontSize: "10px", color: "#64748b" }}>  "needs": [</div>
                    {result.needs.map((n, i) => (
                      <div key={i} style={{ fontSize: "10px", color: "#f472b6", marginLeft: "16px" }}>"{n}"{i < result.needs.length - 1 ? "," : ""}</div>
                    ))}
                    <div style={{ fontSize: "10px", color: "#64748b" }}>  ]</div>
                  </div>
                </div>
              </div>

              {/* ── Human-readable summary cards ── */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: CATEGORY_ICONS[result.category], label: "Category",   value: result.category,             color: "#0f766e", bg: "var(--teal-light)",    border: "#99f6e4"  },
                  { icon: result.urgency === "Critical" ? "🚨" : result.urgency === "High" ? "⚡" : "🔵", label: "Urgency", value: result.urgency, color: URGENCY_CFG[result.urgency].color, bg: URGENCY_CFG[result.urgency].bg, border: URGENCY_CFG[result.urgency].border },
                  { icon: "👥", label: "People Affected", value: `${result.affected}`, color: "#2563eb", bg: "var(--blue-light)", border: "#bfdbfe" },
                  { icon: "🙌", label: "Volunteers Needed", value: `${result.volunteersNeeded}`, color: "#059669", bg: "var(--green-light)", border: "#bbf7d0" },
                ].map(s => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                    className="gs-card p-4"
                    style={{ border: `1.5px solid ${s.border}`, background: s.bg }}
                  >
                    <div style={{ fontSize: "20px", marginBottom: "6px" }}>{s.icon}</div>
                    <div style={{ fontWeight: 900, fontSize: "18px", color: s.color, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 600, marginTop: "3px" }}>{s.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Location + Summary */}
              <div className="gs-card p-4 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--blue-light)", border: "1px solid #bfdbfe" }}>
                    <MapPin size={14} style={{ color: "var(--blue)" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)" }}>IDENTIFIED LOCATION</div>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text)" }}>{result.location}</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border-light)" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)", marginBottom: "6px" }}>AI SUMMARY</div>
                  <p style={{ fontSize: "13px", color: "var(--text-2)", fontWeight: 500, lineHeight: 1.55 }}>{result.summary}</p>
                </div>

                <div>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)", marginBottom: "8px" }}>EXTRACTED NEEDS</div>
                  <div className="flex flex-wrap gap-2">
                    {result.needs.map((n, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full"
                        style={{ fontSize: "11px", fontWeight: 600, background: "var(--teal-light)", color: "var(--teal)", border: "1px solid #99f6e4" }}>
                        {n}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl flex items-start gap-2.5"
                  style={{ background: URGENCY_CFG[result.urgency].bg, border: `1px solid ${URGENCY_CFG[result.urgency].border}` }}>
                  <Zap size={14} style={{ color: URGENCY_CFG[result.urgency].color, flexShrink: 0, marginTop: "1px" }} />
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: URGENCY_CFG[result.urgency].color, marginBottom: "2px" }}>
                      RECOMMENDED ACTION
                    </div>
                    <p style={{ fontSize: "12px", color: URGENCY_CFG[result.urgency].color, fontWeight: 600, lineHeight: 1.4 }}>
                      {result.action}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleAddToMap}
                  disabled={addedToMap}
                  className="w-full py-4 rounded-2xl flex items-center justify-center gap-3"
                  style={{
                    background: addedToMap ? "#059669" : "var(--teal)",
                    color: "#fff", fontWeight: 800, fontSize: "15px",
                    fontFamily: "var(--font)", cursor: addedToMap ? "default" : "pointer",
                    boxShadow: addedToMap ? "0 4px 20px rgba(5,150,105,0.3)" : "0 4px 20px rgba(15,118,110,0.3)",
                    transition: "all 0.3s",
                  }}
                >
                  {addedToMap
                    ? <><Check size={18} /> Added to Community Map ✓</>
                    : <><MapPin size={18} /> Add to Community Map</>}
                </motion.button>

                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      toast.success(`🤖 Smart matching: finding ${result.volunteersNeeded} volunteers for ${result.category} support…`);
                      setTimeout(() => navigate("/swarm"), 800);
                    }}
                    className="flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2"
                    style={{ background: "var(--blue-light)", border: "1px solid #bfdbfe", cursor: "pointer" }}
                  >
                    <Users size={15} style={{ color: "var(--blue)" }} />
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--blue)", fontFamily: "var(--font)" }}>
                      Match Volunteers
                    </span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate("/predict")}
                    className="flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2"
                    style={{ background: "var(--lavender-light)", border: "1px solid #ddd6fe", cursor: "pointer" }}
                  >
                    <TrendingUp size={15} style={{ color: "#7c3aed" }} />
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#7c3aed", fontFamily: "var(--font)" }}>
                      View Insights
                    </span>
                  </motion.button>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.96 }} onClick={reset}
                    className="flex-1 py-3 rounded-2xl flex items-center justify-center gap-2"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)", cursor: "pointer" }}
                  >
                    <Plus size={14} style={{ color: "var(--text-3)" }} />
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-2)", fontFamily: "var(--font)" }}>New Report</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate("/")}
                    className="flex-1 py-3 rounded-2xl flex items-center justify-center gap-2"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)", cursor: "pointer" }}
                  >
                    <Eye size={14} style={{ color: "var(--text-3)" }} />
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-2)", fontFamily: "var(--font)" }}>View on Map</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
