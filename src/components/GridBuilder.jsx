import React from "react";
import { useLang } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, Grid3x3 } from "lucide-react";

const TYPE_LABELS = {
  it: {
    single: "Singolo",
    double: "Doppio",
    triple: "Triplo",
    aisle: "Corridoio",
    empty: "Vuoto",
  },
  en: {
    single: "Single",
    double: "Double",
    triple: "Triple",
    aisle: "Aisle",
    empty: "Empty",
  },
};

export default function GridBuilder({ layout, onChange }) {
  const { t, lang } = useLang();
  const labels = TYPE_LABELS[lang] || TYPE_LABELS.it;

  const update = (rows) => onChange({ ...layout, rows });

  const addRow = () => {
    update([...(layout.rows || []), { desks: [{ type: "single" }, { type: "single" }] }]);
  };
  const removeRow = (idx) => {
    const rows = [...layout.rows];
    rows.splice(idx, 1);
    update(rows);
  };
  const addDesk = (rIdx) => {
    const rows = layout.rows.map((r, i) =>
      i === rIdx ? { ...r, desks: [...r.desks, { type: "single" }] } : r
    );
    update(rows);
  };
  const removeDesk = (rIdx, dIdx) => {
    const rows = layout.rows.map((r, i) => {
      if (i !== rIdx) return r;
      const desks = [...r.desks];
      desks.splice(dIdx, 1);
      return { ...r, desks };
    });
    update(rows);
  };
  const changeType = (rIdx, dIdx, type) => {
    const rows = layout.rows.map((r, i) => {
      if (i !== rIdx) return r;
      const desks = r.desks.map((d, j) => (j === dIdx ? { ...d, type } : d));
      return { ...r, desks };
    });
    update(rows);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Grid3x3 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <h3 className="font-semibold text-lg">{t("layout")}</h3>
        </div>
        <Button size="sm" data-testid="grid-add-row-button" onClick={addRow} className="rounded-full gap-1.5">
          <Plus className="w-4 h-4" />
          {t("add_row")}
        </Button>
      </div>

      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {(layout.rows || []).map((row, rIdx) => (
          <div
            key={rIdx}
            data-testid={`layout-row-${rIdx}`}
            className="p-3 rounded-lg bg-secondary/40 border border-border/50"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="eyebrow text-muted-foreground">
                {t("row")} {rIdx + 1}
              </div>
              <div className="flex items-center gap-1">
                <button
                  data-testid={`add-desk-${rIdx}`}
                  onClick={() => addDesk(rIdx)}
                  className="text-xs px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300"
                >
                  {t("add_desk")}
                </button>
                <button
                  data-testid={`grid-remove-row-${rIdx}`}
                  onClick={() => removeRow(rIdx)}
                  className="text-xs px-2 py-1 rounded-md text-destructive hover:bg-destructive/10 flex items-center gap-1"
                >
                  <Minus className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {row.desks.map((desk, dIdx) => (
                <div key={dIdx} className="flex items-center gap-1">
                  <Select
                    value={desk.type}
                    onValueChange={(v) => changeType(rIdx, dIdx, v)}
                  >
                    <SelectTrigger
                      data-testid={`desk-type-${rIdx}-${dIdx}`}
                      className="w-[110px] h-8 text-xs rounded-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">{labels.single}</SelectItem>
                      <SelectItem value="double">{labels.double}</SelectItem>
                      <SelectItem value="triple">{labels.triple}</SelectItem>
                      <SelectItem value="aisle">{labels.aisle}</SelectItem>
                      <SelectItem value="empty">{labels.empty}</SelectItem>
                    </SelectContent>
                  </Select>
                  <button
                    data-testid={`remove-desk-${rIdx}-${dIdx}`}
                    onClick={() => removeDesk(rIdx, dIdx)}
                    className="text-destructive/70 hover:text-destructive text-[10px] px-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
