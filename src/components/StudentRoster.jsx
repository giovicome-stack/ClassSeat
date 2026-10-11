import React, { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, Plus, Trash2, ClipboardPaste, Eye, FileUp } from "lucide-react";

export default function StudentRoster({ students, onAdd, onBulk, onDelete, onTogglePriority }) {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [priority, setPriority] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onAdd(name.trim(), priority);
    setName("");
    setPriority(false);
  };

  const doBulk = async () => {
    const names = bulkText
      .split(/[\n,\t]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!names.length) return;
    await onBulk(names);
    setBulkText("");
    setBulkOpen(false);
  };

  const handleCSVFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    // CSV: pick first column of each row, strip quotes
    const names = text
      .split(/\r?\n/)
      .map((line) => line.split(/[,;\t]/)[0]?.trim().replace(/^"|"$/g, ""))
      .filter((n) => n && n.toLowerCase() !== "name" && n.toLowerCase() !== "nome");
    if (names.length) await onBulk(names);
    e.target.value = "";
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-4 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <h3 className="font-semibold text-lg">{t("roster")}</h3>
          <Badge variant="secondary" className="ml-1 rounded-full">
            {students.length}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <label
            data-testid="csv-import-button"
            className="inline-flex items-center gap-1 h-8 px-2.5 sm:px-3 rounded-full border border-border bg-background text-xs font-medium cursor-pointer hover:bg-secondary whitespace-nowrap"
            title="Import CSV"
          >
            <FileUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV</span>
            <input
              type="file"
              accept=".csv,.txt,text/csv,text/plain"
              onChange={handleCSVFile}
              className="hidden"
              data-testid="csv-import-input"
            />
          </label>
          <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" data-testid="bulk-students-button" className="rounded-full gap-1.5 h-8 px-2.5 sm:px-3 whitespace-nowrap">
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t("bulk_paste")}</span>
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("bulk_paste")}</DialogTitle>
            </DialogHeader>
            <p className="text-xs text-muted-foreground">{t("bulk_paste_help")}</p>
            <Textarea
              data-testid="bulk-students-textarea"
              rows={8}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Marco Rossi, Giulia Bianchi, Luca Ferrari..."
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setBulkOpen(false)}>{t("cancel")}</Button>
              <Button data-testid="bulk-students-submit" onClick={doBulk}>{t("save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-2 mb-4">
        <Input
          data-testid="add-student-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("student_name")}
          className="w-full h-10 bg-background text-foreground placeholder:text-muted-foreground"
        />
        <label className="flex items-center gap-2 text-xs px-3 py-2 rounded-md bg-secondary cursor-pointer w-full">
          <Checkbox
            data-testid="add-student-priority"
            checked={priority}
            onCheckedChange={(v) => setPriority(!!v)}
          />
          <span>{t("front_priority")}</span>
        </label>
        <Button type="submit" data-testid="add-student-button" size="sm" className="rounded-full gap-1.5 w-full">
          <Plus className="w-4 h-4" />
          {t("add_student")}
        </Button>
      </form>

      <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
        {students.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-8">—</div>
        )}
        {students.map((s) => (
          <div
            key={s.id}
            data-testid={`student-row-${s.id}`}
            className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-secondary/40 hover:bg-secondary group"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="font-medium truncate">{s.name}</span>
              {s.front_priority && (
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 gap-1 px-2 rounded-full">
                  <Eye className="w-3 h-3" />
                  {t("front_priority")}
                </Badge>
              )}
            </div>
            <button
              data-testid={`toggle-priority-${s.id}`}
              onClick={() => onTogglePriority(s)}
              className="text-xs text-muted-foreground hover:text-amber-700 px-2"
              title={t("front_priority")}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              data-testid={`delete-student-${s.id}`}
              onClick={() => onDelete(s.id)}
              className="opacity-0 group-hover:opacity-100 text-destructive px-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
