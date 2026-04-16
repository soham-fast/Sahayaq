import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { NeedsProvider } from "./context/NeedsContext";
import { Toaster } from "sonner";

export default function App() {
  return (
    <AuthProvider>
      <NeedsProvider>
        <RouterProvider router={router} />
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            style: {
              fontFamily: "var(--font)",
              borderRadius: "14px",
              fontSize: "13px",
            },
          }}
        />
      </NeedsProvider>
    </AuthProvider>
  );
}