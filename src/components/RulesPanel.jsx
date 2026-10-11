import React, { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  RotateCw,
  Eye,
  SplitSquareHorizontal,
  Users,
  Plus,
  Trash2,
  ShieldAlert,
} from "lucide-react";

export default function RulesPanel({ rules, students, onChange }) {
  const { t } = useLang();
  const [sepA, setSepA] = useState("");
  const [sepB, setSepB] = useState("");
  const [pairA, setPairA] = useState("");
  const [pairB, setPairB] = useState("");

  const update = (patch) => onChange({ ...rules, ...patch });

  const addSeparation = () => {
    if (!sepA || !sepB || sepA === sepB) return;
    const existing = rules.separations || [];
    if (existing.some((p) => (p[0] === sepA && p[1] === sepB) || (p[0] === sepB && p[1] === sepA))) return;
    update({ separations: [...existing, [sepA, sepB]] });
    setSepA("");
    setSepB("");
  };

  const addPairing = () => {
    if (!pairA || !pairB || pairA === pairB) return;
    const existing = rules.pairings || [];
    if (existing.some((p) => (p[0] === pairA && p[1] === pairB) || (p[0] === pairB && p[1] === pairA))) return;
    update({ pairings: [...existing, [pairA, pairB]] });
    setPairA("");
    setPairB("");
  };

  const nameOf = (id) => students.find((s) => s.id === id)?.name || "?";

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
        <h3 className="font-semibold text-lg">{t("rules")}</h3>
      </div>

      {/* Toggle rules */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3 p-3 rounded-lg bg-secondary/40">
          <div className="flex-1">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <RotateCw className="w-4 h-4 text-emerald-600" />
              {t("rule_front_rotation")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t("rule_front_rotation_desc")}</p>
          </div>
          <Switch
            data-testid="rule-front-rotation-toggle"
            checked={!!rules.front_rotation}
            onCheckedChange={(v) => update({ front_rotation: v })}
          />
        </div>

        <div className="flex items-start justify-between gap-3 p-3 rounded-lg bg-secondary/40">
          <div className="flex-1">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Eye className="w-4 h-4 text-amber-600" />
              {t("rule_front_priority")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t("rule_front_priority_desc")}</p>
          </div>
          <Switch
            data-testid="rule-front-priority-toggle"
            checked={!!rules.front_priority}
            onCheckedChange={(v) => update({ front_priority: v })}
          />
        </div>

        {/* Separations */}
        <div className="p-3 rounded-lg bg-secondary/40 border border-border/50">
          <div className="flex items-center gap-2 font-semibold text-sm mb-1">
            <SplitSquareHorizontal className="w-4 h-4 text-rose-600" />
            {t("rule_separation")}
          </div>
          <p className="text-xs text-muted-foreground mb-3">{t("rule_separation_desc")}</p>
          <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <Select value={sepA} onValueChange={setSepA}>
              <SelectTrigger data-testid="separation-a-select" className="flex-1 h-9">
                <SelectValue placeholder={t("student_a")} />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sepB} onValueChange={setSepB}>
              <SelectTrigger data-testid="separation-b-select" className="flex-1 h-9">
                <SelectValue placeholder={t("student_b")} />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" data-testid="add-separation-rule-button" onClick={addSeparation} className="rounded-full gap-1">
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(rules.separations || []).map((p, i) => (
              <Badge key={i} variant="outline" className="gap-1 rounded-full border-rose-200 bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800">
                {nameOf(p[0])} ⇔ {nameOf(p[1])}
                <button
                  data-testid={`remove-separation-${i}`}
                  onClick={() => update({ separations: rules.separations.filter((_, j) => j !== i) })}
                  className="ml-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Pairings */}
        <div className="p-3 rounded-lg bg-secondary/40 border border-border/50">
          <div className="flex items-center gap-2 font-semibold text-sm mb-1">
            <Users className="w-4 h-4 text-indigo-600" />
            {t("rule_pairing")}
          </div>
          <p className="text-xs text-muted-foreground mb-3">{t("rule_pairing_desc")}</p>
          <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <Select value={pairA} onValueChange={setPairA}>
              <SelectTrigger data-testid="pairing-a-select" className="flex-1 h-9">
                <SelectValue placeholder={t("student_a")} />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={pairB} onValueChange={setPairB}>
              <SelectTrigger data-testid="pairing-b-select" className="flex-1 h-9">
                <SelectValue placeholder={t("student_b")} />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" data-testid="add-pairing-rule-button" onClick={addPairing} className="rounded-full gap-1">
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(rules.pairings || []).map((p, i) => (
              <Badge key={i} variant="outline" className="gap-1 rounded-full border-indigo-200 bg-indigo-50 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800">
                {nameOf(p[0])} ⇌ {nameOf(p[1])}
                <button
                  data-testid={`remove-pairing-${i}`}
                  onClick={() => update({ pairings: rules.pairings.filter((_, j) => j !== i) })}
                  className="ml-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
