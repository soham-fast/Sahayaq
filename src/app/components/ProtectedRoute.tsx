import { Navigate } from "react-router";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";

interface Props {
  role: "volunteer" | "ngo";
  children: React.ReactNode;
}

/**
 * Wraps a route so only users with the matching `role` can access it.
 *
 * - Not authenticated  → redirect to /login
 * - Wrong role         → redirect to their own home (volunteers → /volunteer, NGOs → /control)
 * - Loading            → show a calm loading state (prevents flash-redirect on session restore)
 */
export function ProtectedRoute({ role, children }: Props) {
  const { user, loading } = useAuth();

  // Wait for session to be restored from sessionStorage before deciding
  if (loading) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center gap-4"
        style={{ background: "var(--bg)", fontFamily: "var(--font)" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          style={{
            width: 36, height: 36,
            border: "3px solid var(--border)",
            borderTop: "3px solid var(--teal)",
            borderRadius: "50%",
          }}
        />
        <span style={{ fontSize: "13px", color: "var(--text-3)", fontWeight: 600 }}>
          Loading…
        </span>
      </div>
    );
  }

  // Not signed in at all
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Signed in but wrong role — send them to their correct dashboard
  if (user.role !== role) {
    const correctHome = user.role === "ngo" ? "/control" : "/volunteer";
    return <Navigate to={correctHome} replace />;
  }

  return <>{children}</>;
}
