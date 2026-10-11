import React, { createContext, useContext, useEffect, useState } from "react";
import { translations } from "@/i18n/translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("csm_lang") || "it";
  });

  useEffect(() => {
    localStorage.setItem("csm_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key) => translations[lang]?.[key] ?? translations.it[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be inside LanguageProvider");
  return ctx;
}
