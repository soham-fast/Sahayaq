import { useEffect } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Map, Users, Sparkles, LayoutDashboard, CheckSquare,
  Heart, LogOut, FilePlus, UserCircle,
} from "lucide-react";
import logoImg from "figma:asset/3767293c23c9049c04651dc9d3779a80df70aba6.png";
import { useAuth } from "../context/AuthContext";
import { useNeeds } from "../context/NeedsContext";

// ── Role-specific navigation ──────────────────────────────────────────────────
const VOL_NAV = [
  { path: "/volunteer", label: "Dashboard", Icon: LayoutDashboard, color: "#0f766e" },
  { path: "/",          label: "Map",        Icon: Map,             color: "#0f766e" },
  { path: "/mission",   label: "My Task",    Icon: CheckSquare,     color: "#059669" },
  { path: "/swarm",     label: "Teams",      Icon: Users,           color: "#2563eb" },
  { path: "/report",    label: "Report",     Icon: FilePlus,        color: "#7c3aed" },
  { path: "/impact",    label: "Impact",     Icon: Heart,           color: "#e11d48" },
];

const NGO_NAV = [
  { path: "/control",  label: "Dashboard", Icon: LayoutDashboard, color: "#2563eb" },
  { path: "/",         label: "Map",        Icon: Map,             color: "#0f766e" },
  { path: "/swarm",    label: "Teams",      Icon: Users,           color: "#2563eb" },
  { path: "/predict",  label: "Insights",   Icon: Sparkles,        color: "#7c3aed" },
  { path: "/report",   label: "Report",     Icon: FilePlus,        color: "#7c3aed" },
];

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const ROLE_BADGE = {
  volunteer: { label: "Volunteer", color: "#0f766e", bg: "var(--teal-light)", border: "#99f6e4" },
  ngo:       { label: "NGO / Org", color: "#2563eb", bg: "#dbeafe",           border: "#93c5fd" },
};

export function Layout() {
  const loc      = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { openCount } = useNeeds();

  useEffect(() => {
    if (!loading && !user && !sessionStorage.getItem("sahayaq_session")) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const initials  = user ? getInitials(user.name || user.email) : "?";
  const roleBadge = user ? ROLE_BADGE[user.role] ?? ROLE_BADGE.volunteer : ROLE_BADGE.volunteer;
  const navItems  = user?.role === "volunteer" ? VOL_NAV : NGO_NAV;

  return (
    <div className="flex flex-col h-screen" style={{ background: "var(--bg)", fontFamily: "var(--font)" }}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-5"
        style={{
          height: "58px",
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "var(--shadow-xs)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <img
            src={logoImg} alt="Sahayaq logo"
            style={{ height: "38px", width: "38px", objectFit: "contain", borderRadius: "10px" }}
          />
          <div className="flex flex-col justify-center" style={{ lineHeight: 1 }}>
            <span style={{ fontWeight: 900, fontSize: "16px", color: "var(--text)", letterSpacing: "-0.02em" }}>
              Sahayaq
            </span>
            <span style={{ fontSize: "10px", color: "var(--text-3)", fontWeight: 500, letterSpacing: "0.01em", marginTop: "2px" }}>
              Where help finds you
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Open needs badge */}
          {openCount > 0 && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full cursor-pointer"
              style={{ background: "#fff1f2", border: "1.5px solid #fecaca" }}
              onClick={() => navigate("/report")}
              title="Reported needs awaiting action"
            >
              <span style={{ fontSize: "10px", fontWeight: 800, color: "#e11d48" }}>
                🚨 {openCount} new {openCount === 1 ? "need" : "needs"}
              </span>
            </motion.div>
          )}

          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
            style={{ background: "var(--green-light)", border: "1px solid #bbf7d0" }}>
            <span className="gs-dot gs-dot-green gs-soft-pulse" />
            <span style={{ fontSize: "11px", color: "var(--green)", fontWeight: 700 }}>147 active</span>
          </div>

          {/* Role badge */}
          {user && (
            <div className="hidden sm:flex items-center px-2.5 py-1 rounded-full"
              style={{ background: roleBadge.bg, border: `1.5px solid ${roleBadge.border}` }}>
              <span style={{ fontSize: "11px", color: roleBadge.color, fontWeight: 700 }}>{roleBadge.label}</span>
            </div>
          )}

          {/* Avatar → profile */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => navigate("/profile")}
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold select-none cursor-pointer"
            title={user ? `${user.name || user.email}\n${roleBadge.label}` : "Guest"}
            style={{
              background: roleBadge.bg,
              color: roleBadge.color,
              border: `2px solid ${roleBadge.border}`,
              fontFamily: "var(--font)",
            }}
          >
            {initials}
          </motion.button>

          {/* Sign out */}
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleSignOut}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-3)", cursor: "pointer" }}
            title="Sign out"
          >
            <LogOut size={14} />
          </motion.button>
        </div>
      </header>

      {/* ── Body ──────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Desktop sidebar */}
        <nav
          className="hidden md:flex flex-col py-4 px-2 gap-1 flex-shrink-0"
          style={{ width: "76px", borderRight: "1px solid var(--border)", background: "var(--surface)" }}
        >
          {navItems.map(({ path, label, Icon, color }) => {
            const active  = path === "/" ? loc.pathname === "/" : loc.pathname.startsWith(path);
            const isReport = path === "/report";
            return (
              <NavLink key={path} to={path}>
                <motion.div
                  whileHover={{ x: 2 }} whileTap={{ scale: 0.93 }}
                  className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl cursor-pointer relative"
                  style={{
                    background: active ? `${color}12` : "transparent",
                    border: active ? `1.5px solid ${color}28` : "1.5px solid transparent",
                  }}
                >
                  <Icon size={18} style={{ color: active ? color : "var(--text-3)", strokeWidth: active ? 2.2 : 1.8 }} />
                  <span style={{ fontSize: "9px", fontWeight: 700, color: active ? color : "var(--text-3)", letterSpacing: "0.01em" }}>
                    {label}
                  </span>
                  {isReport && openCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: "#e11d48", fontSize: "8px", fontWeight: 800, color: "#fff" }}>
                      {openCount}
                    </span>
                  )}
                </motion.div>
              </NavLink>
            );
          })}

          {/* Profile link at bottom */}
          <div style={{ marginTop: "auto" }}>
            <NavLink to="/profile">
              <motion.div
                whileHover={{ x: 2 }} whileTap={{ scale: 0.93 }}
                className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl cursor-pointer"
                style={{
                  background: loc.pathname === "/profile" ? "#0f766e12" : "transparent",
                  border: loc.pathname === "/profile" ? "1.5px solid #0f766e28" : "1.5px solid transparent",
                }}
              >
                <UserCircle size={18} style={{ color: loc.pathname === "/profile" ? "#0f766e" : "var(--text-3)", strokeWidth: loc.pathname === "/profile" ? 2.2 : 1.8 }} />
                <span style={{ fontSize: "9px", fontWeight: 700, color: loc.pathname === "/profile" ? "#0f766e" : "var(--text-3)" }}>
                  Profile
                </span>
              </motion.div>
            </NavLink>
          </div>
        </nav>

        {/* Page content */}
        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={loc.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="h-full overflow-y-auto overflow-x-hidden"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── Mobile bottom nav ─────────────────────────────────────────────────── */}
      <nav
        className="md:hidden flex-shrink-0"
        style={{ borderTop: "1px solid var(--border)", background: "var(--surface)", boxShadow: "0 -2px 12px rgba(15,23,42,0.06)" }}
      >
        <div className="flex">
          {navItems.map(({ path, label, Icon, color }) => {
            const active   = path === "/" ? loc.pathname === "/" : loc.pathname.startsWith(path);
            const isReport = path === "/report";
            return (
              <NavLink key={path} to={path} className="flex-1">
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  className="flex flex-col items-center gap-0.5 py-2.5 relative"
                >
                  {active && (
                    <motion.div
                      layoutId="bottomBar"
                      className="absolute top-0 left-3 right-3 h-0.5 rounded-b-full"
                      style={{ background: color }}
                    />
                  )}
                  <div className="relative">
                    <Icon size={19} style={{ color: active ? color : "var(--text-4)", strokeWidth: active ? 2.2 : 1.7 }} />
                    {isReport && openCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                        style={{ background: "#e11d48", fontSize: "7px", fontWeight: 800, color: "#fff" }}>
                        {openCount}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "9px", fontWeight: active ? 700 : 500, color: active ? color : "var(--text-3)" }}>
                    {label}
                  </span>
                </motion.div>
              </NavLink>
            );
          })}
          {/* Profile tab on mobile */}
          <NavLink to="/profile" className="flex-1">
            <motion.div whileTap={{ scale: 0.88 }} className="flex flex-col items-center gap-0.5 py-2.5 relative">
              {loc.pathname === "/profile" && (
                <motion.div layoutId="bottomBar" className="absolute top-0 left-3 right-3 h-0.5 rounded-b-full"
                  style={{ background: "#0f766e" }} />
              )}
              <UserCircle size={19} style={{ color: loc.pathname === "/profile" ? "#0f766e" : "var(--text-4)", strokeWidth: loc.pathname === "/profile" ? 2.2 : 1.7 }} />
              <span style={{ fontSize: "9px", fontWeight: loc.pathname === "/profile" ? 700 : 500, color: loc.pathname === "/profile" ? "#0f766e" : "var(--text-3)" }}>
                Profile
              </span>
            </motion.div>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
