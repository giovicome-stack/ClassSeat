import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Armchair, LogOut, Moon, Sun, User } from "lucide-react";

export default function Header() {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useLang();
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <Armchair className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <div className="hidden sm:block">
            <div className="eyebrow text-emerald-700 dark:text-emerald-400 leading-none">
              CLASSROOM · OS
            </div>
            <div className="font-semibold leading-tight">ClassSeat Master</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-full bg-secondary p-1">
            <button
              data-testid="header-lang-it"
              onClick={() => setLang("it")}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                lang === "it" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              IT
            </button>
            <button
              data-testid="header-lang-en"
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              EN
            </button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            data-testid="theme-toggle-button"
            onClick={toggle}
            className="rounded-full"
            title={t("theme_toggle")}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" data-testid="user-menu-button" className="rounded-full gap-2">
                <div className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="hidden sm:inline text-sm">{user?.name || user?.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="text-xs text-muted-foreground">{user?.email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem data-testid="logout-button" onClick={logout} className="cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                {t("logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
