import { createBrowserRouter } from "react-router";
import { Layout }                from "./components/Layout";
import { LoginScreen }           from "./components/LoginScreen";
import { GravityMapScreen }      from "./components/GravityMapScreen";
import { SwarmScreen }           from "./components/SwarmScreen";
import { FutureMemoryScreen }    from "./components/FutureMemoryScreen";
import { MissionControlScreen }  from "./components/MissionControlScreen";
import { VolunteerActionScreen } from "./components/VolunteerActionScreen";
import { ImpactScreen }          from "./components/ImpactScreen";
import { VolunteerDashboard }    from "./components/VolunteerDashboard";
import { ProtectedRoute }        from "./components/ProtectedRoute";
import { AddReportScreen }       from "./components/AddReportScreen";
import { ProfileScreen }         from "./components/ProfileScreen";

export const router = createBrowserRouter([
  // ── Full-page (no nav shell) ───────────────────────────────────────────────
  { path: "/login", Component: LoginScreen },

  // ── App shell ─────────────────────────────────────────────────────────────
  {
    path: "/",
    Component: Layout,
    children: [
      // ── Shared routes (both roles) ─────────────────────────────────────────
      { index: true,      Component: GravityMapScreen   }, // Home – Community Map
      { path: "swarm",    Component: SwarmScreen         }, // Team / Swarm view
      { path: "predict",  Component: FutureMemoryScreen  }, // Insights / Predictions
      { path: "report",   Component: AddReportScreen     }, // Add Report + AI
      { path: "profile",  Component: ProfileScreen       }, // User profile

      // ── Volunteer-only routes ──────────────────────────────────────────────
      {
        path: "volunteer",
        element: (
          <ProtectedRoute role="volunteer">
            <VolunteerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "mission",
        element: (
          <ProtectedRoute role="volunteer">
            <VolunteerActionScreen />
          </ProtectedRoute>
        ),
      },
      {
        path: "impact",
        element: (
          <ProtectedRoute role="volunteer">
            <ImpactScreen />
          </ProtectedRoute>
        ),
      },

      // ── NGO-only routes ────────────────────────────────────────────────────
      {
        path: "control",
        element: (
          <ProtectedRoute role="ngo">
            <MissionControlScreen />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
