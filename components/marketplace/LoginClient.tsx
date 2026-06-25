"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [status, setStatus] = useState<string | null>(null);

  async function submit() {
    setStatus(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const result =
        mode === "login"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });

      if (result.error) {
        setStatus(result.error.message);
        return;
      }

      setStatus(mode === "login" ? "Logged in. You can open My Library." : "Account created. Check your email if confirmation is enabled.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Supabase Auth is not configured.");
    }
  }

  return (
    <div className="auth-card">
      <div className="segmented wide">
        <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} type="button">Login</button>
        <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")} type="button">Create account</button>
      </div>
      <label className="field">
        <span>Email</span>
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
      </label>
      <label className="field">
        <span>Password</span>
        <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
      </label>
      <button className="button gold" type="button" onClick={submit}>{mode === "login" ? "Login" : "Create account"}</button>
      {status ? <p className="status info">{status}</p> : null}
    </div>
  );
}
