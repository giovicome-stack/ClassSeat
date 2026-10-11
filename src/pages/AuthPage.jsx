import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Armchair, GraduationCap } from "lucide-react";

export default function AuthPage() {
  const { login, register, error } = useAuth();
  const { t, lang, setLang } = useLang();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "login") await login(email, password);
    else await register(email, password, name);
    setLoading(false);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left hero */}
      <div className="hidden lg:flex relative overflow-hidden bg-[#1E3A2F] text-white">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1580582932707-520aed937b7b?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(2px)",
          }}
        />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-emerald-400/90 flex items-center justify-center text-emerald-950">
              <Armchair className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-emerald-200">
                Classroom OS
              </div>
              <div className="font-semibold text-lg">ClassSeat Master</div>
            </div>
          </div>
          <div className="max-w-md">
            <div className="eyebrow text-emerald-300 mb-4">
              per docenti · scuole · didattica
            </div>
            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight">
              La disposizione dei banchi,{" "}
              <span className="text-emerald-300">finalmente semplice.</span>
            </h1>
            <p className="mt-6 text-white/80 leading-relaxed">
              Layout personalizzati per ogni fila, regole pedagogiche (DSA,
              coppie, separazioni) e rotazione automatica. Esporta il piano in
              PDF o PNG pronto per la stampa.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <GraduationCap className="w-4 h-4" />
            <span>Progettato per il sistema scolastico italiano</span>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 sm:p-12 paper-texture">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 lg:hidden">
              <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                <Armchair className="w-5 h-5" />
              </div>
              <span className="font-semibold">ClassSeat Master</span>
            </div>
            <div className="ml-auto flex items-center gap-1 rounded-full bg-secondary p-1">
              <button
                data-testid="language-selector-it"
                onClick={() => setLang("it")}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  lang === "it" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                IT
              </button>
              <button
                data-testid="language-selector-en"
                onClick={() => setLang("en")}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                EN
              </button>
            </div>
          </div>

          <div className="eyebrow text-emerald-700 dark:text-emerald-400 mb-3">
            {mode === "login" ? "ACCESSO DOCENTE" : "NUOVO ACCOUNT"}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            {mode === "login" ? t("login_cta") : t("register_cta")}
          </h2>
          <p className="text-sm text-muted-foreground mb-8">
            {t("app_tagline")}
          </p>

          <Card className="p-6 border-border/70">
            <form onSubmit={submit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <Label htmlFor="name">{t("name")}</Label>
                  <Input
                    id="name"
                    data-testid="register-name-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1.5"
                    placeholder="Giovanni Comerlati"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  data-testid={mode === "login" ? "login-email-input" : "register-email-input"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1.5"
                  placeholder="docente@scuola.it"
                />
              </div>
              <div>
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  type="password"
                  data-testid={mode === "login" ? "login-password-input" : "register-password-input"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="mt-1.5"
                />
              </div>
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                data-testid={mode === "login" ? "login-submit-button" : "register-submit-button"}
                disabled={loading}
                className="w-full rounded-full h-11"
              >
                {loading ? "..." : mode === "login" ? t("login") : t("register")}
              </Button>
            </form>
          </Card>

          <div className="text-sm text-center mt-6 text-muted-foreground">
            {mode === "login" ? t("no_account") : t("already_have_account")}{" "}
            <button
              data-testid="auth-toggle-button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              {mode === "login" ? t("register") : t("login")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
