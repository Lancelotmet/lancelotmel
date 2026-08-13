"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [status, setStatus] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

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

      if (mode === "login") {
        const next = searchParams.get("next");
        router.push(next?.startsWith("/") ? next : "/portal");
        router.refresh();
        return;
      }
      setStatus("Cuenta creada. Revisa tu correo si la confirmación está activada.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "El acceso no está configurado en este momento.");
    }
  }

  return (
    <div className="auth-card">
      <div className="segmented wide">
        <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} type="button">Ingresar</button>
        <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")} type="button">Crear cuenta</button>
      </div>
      <label className="field">
        <span>Email</span>
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
      </label>
      <label className="field">
        <span>Contraseña</span>
        <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
      </label>
      <button className="button gold" type="button" onClick={submit}>{mode === "login" ? "Entrar al portal" : "Crear mi acceso"}</button>
      {status ? <p className="status info">{status}</p> : null}
    </div>
  );
}
