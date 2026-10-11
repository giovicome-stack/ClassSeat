import React, { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BookOpen, Plus, Trash2, Pencil } from "lucide-react";

export default function ClassManager({
  classes,
  activeClassId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}) {
  const { t } = useLang();
  const [openCreate, setOpenCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [renameId, setRenameId] = useState(null);
  const [renameVal, setRenameVal] = useState("");

  const submitCreate = async () => {
    if (!newName.trim()) return;
    await onCreate(newName.trim());
    setNewName("");
    setOpenCreate(false);
  };

  const active = classes?.find((c) => c.id === activeClassId);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <BookOpen className="w-4 h-4 text-muted-foreground" />
      <Select value={activeClassId || ""} onValueChange={onSelect}>
        <SelectTrigger data-testid="class-selector-dropdown" className="w-[220px] rounded-full">
          <SelectValue placeholder={t("classes")} />
        </SelectTrigger>
        <SelectContent>
          {classes.map((c) => (
            <SelectItem key={c.id} value={c.id} data-testid={`class-option-${c.id}`}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogTrigger asChild>
          <Button data-testid="create-class-button" size="sm" className="rounded-full gap-1.5">
            <Plus className="w-4 h-4" />
            {t("new_class")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("new_class")}</DialogTitle>
          </DialogHeader>
          <Input
            data-testid="new-class-name-input"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Classe 1A"
            onKeyDown={(e) => e.key === "Enter" && submitCreate()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>{t("cancel")}</Button>
            <Button data-testid="new-class-submit" onClick={submitCreate}>{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {active && (
        <>
          <Dialog open={!!renameId} onOpenChange={(o) => !o && setRenameId(null)}>
            <Button
              size="icon"
              variant="ghost"
              data-testid="rename-class-button"
              onClick={() => {
                setRenameId(active.id);
                setRenameVal(active.name);
              }}
              className="rounded-full h-9 w-9"
              title={t("rename_class")}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("rename_class")}</DialogTitle>
              </DialogHeader>
              <Input
                data-testid="rename-class-input"
                value={renameVal}
                onChange={(e) => setRenameVal(e.target.value)}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setRenameId(null)}>{t("cancel")}</Button>
                <Button
                  data-testid="rename-class-submit"
                  onClick={async () => {
                    await onRename(active.id, renameVal.trim());
                    setRenameId(null);
                  }}
                >
                  {t("save")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            size="icon"
            variant="ghost"
            data-testid="delete-class-button"
            onClick={() => {
              if (window.confirm(t("confirm_delete_class"))) onDelete(active.id);
            }}
            className="rounded-full h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  );
}
