import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use("*", logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/make-server-9805af2d/health", (c) => c.json({ status: "ok" }));

// ── Sign Up ───────────────────────────────────────────────────────────────────
app.post("/make-server-9805af2d/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return c.json({ error: "Missing required fields: email, password, role" }, 400);
    }
    if (!["volunteer", "ngo"].includes(role)) {
      return c.json({ error: "Role must be 'volunteer' or 'ngo'" }, 400);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const displayName = role === "ngo" ? (body.orgName || "") : (body.name || "");

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: displayName, role },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log("Signup error:", error);
      return c.json({ error: `Registration failed: ${error.message}` }, 400);
    }

    const userId = data.user.id;

    const profile = {
      id: userId,
      email,
      role,
      name: displayName,
      ...(role === "ngo"
        ? {
            orgName: body.orgName || "",
            orgType: body.orgType || "",
            regNumber: body.regNumber || "",
            contactName: body.contactName || "",
          }
        : {
            skills: body.skills || [],
          }),
      createdAt: new Date().toISOString(),
    };

    await kv.set(`user:${userId}:profile`, profile);
    console.log(`New ${role} account created: ${email} (${userId})`);

    return c.json({
      success: true,
      user: { id: userId, email, role, name: profile.name },
    });
  } catch (e) {
    console.log("Signup unexpected error:", e);
    return c.json({ error: `Unexpected signup error: ${e}` }, 500);
  }
});

// ── Sign In ───────────────────────────────────────────────────────────────────
app.post("/make-server-9805af2d/auth/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Missing required fields: email, password" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.log("Signin error:", error);
      return c.json({ error: `Sign in failed: ${error.message}` }, 401);
    }

    const userId = data.user.id;
    const accessToken = data.session.access_token;

    const profile = await kv.get(`user:${userId}:profile`);
    console.log(`User signed in: ${email} (${userId})`);

    return c.json({
      success: true,
      accessToken,
      user: profile || {
        id: userId,
        email: data.user.email,
        role: data.user.user_metadata?.role || "volunteer",
        name: data.user.user_metadata?.name || "",
      },
    });
  } catch (e) {
    console.log("Signin unexpected error:", e);
    return c.json({ error: `Unexpected signin error: ${e}` }, 500);
  }
});

// ── Get current user ──────────────────────────────────────────────────────────
app.get("/make-server-9805af2d/auth/me", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      console.log("Auth/me token invalid:", error?.message);
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    const profile = await kv.get(`user:${user.id}:profile`);

    return c.json({
      user: profile || {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || "volunteer",
        name: user.user_metadata?.name || "",
      },
    });
  } catch (e) {
    console.log("Me endpoint error:", e);
    return c.json({ error: `Error fetching user: ${e}` }, 500);
  }
});

// ── Sign Out ──────────────────────────────────────────────────────────────────
app.post("/make-server-9805af2d/auth/signout", async (c) => {
  try {
    const accessToken = c.req.header("Authorization")?.split(" ")[1];
    if (accessToken) {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      await supabaseAdmin.auth.admin.signOut(accessToken);
      console.log("User signed out server-side");
    }
    return c.json({ success: true });
  } catch (e) {
    console.log("Signout error (non-critical):", e);
    return c.json({ success: true }); // Always succeed – client clears session anyway
  }
});

Deno.serve(app.fetch);
