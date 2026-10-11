import React from "react";
import { useLang } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { History, RotateCcw, Trash2 } from "lucide-react";

export default function HistoryLog({ items, onRestore, onDelete }) {
  const { t } = useLang();
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
        <h3 className="font-semibold text-lg">{t("history")}</h3>
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-6">
          {t("no_history")}
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {items.map((h) => (
            <div
              key={h.id}
              data-testid={`history-item-${h.id}`}
              className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-secondary/40 hover:bg-secondary"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{h.label}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(h.created_at).toLocaleString()}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                data-testid={`history-restore-${h.id}`}
                onClick={() => onRestore(h)}
                className="rounded-full h-8 gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t("restore")}
              </Button>
              <button
                data-testid={`history-delete-${h.id}`}
                onClick={() => onDelete(h.id)}
                className="text-destructive hover:bg-destructive/10 rounded-full p-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
