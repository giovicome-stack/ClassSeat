import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import api, { formatApiErrorDetail } from "@/lib/api";
import { useLang } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import ClassManager from "@/components/ClassManager";
import StudentRoster from "@/components/StudentRoster";
import GridBuilder from "@/components/GridBuilder";
import RulesPanel from "@/components/RulesPanel";
import SeatingGrid from "@/components/SeatingGrid";
import HistoryLog from "@/components/HistoryLog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { exportSeatingPDF, exportSeatingPNG } from "@/utils/export";
import {
  Sparkles,
  Save,
  FileDown,
  ImageDown,
  BookMarked,
  Info,
} from "lucide-react";

export default function DashboardPage() {
  const { t } = useLang();
  const [classes, setClasses] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeClass, setActiveClass] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [history, setHistory] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [dirtyLayout, setDirtyLayout] = useState(false);
  const [dirtyRules, setDirtyRules] = useState(false);
  const gridRef = useRef(null);

  const loadClasses = useCallback(async () => {
    try {
      const { data } = await api.get("/classes");
      setClasses(data);
      if (data.length && !activeId) setActiveId(data[0].id);
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail));
    }
  }, [activeId]);

  const loadClass = useCallback(async (id) => {
    if (!id) return;
    try {
      const { data } = await api.get(`/classes/${id}`);
      setActiveClass(data);
      setAssignments([]);
      setWarnings([]);
      const h = await api.get(`/classes/${id}/history`);
      setHistory(h.data);
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail));
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    if (activeId) loadClass(activeId);
  }, [activeId, loadClass]);

  const createClass = async (name) => {
    const { data } = await api.post("/classes", { name });
    setClasses((c) => [...c, data]);
    setActiveId(data.id);
    toast.success(name);
  };
  const renameClass = async (id, name) => {
    await api.patch(`/classes/${id}`, { name });
    setClasses((cs) => cs.map((c) => (c.id === id ? { ...c, name } : c)));
    setActiveClass((c) => (c ? { ...c, name } : c));
  };
  const deleteClass = async (id) => {
    await api.delete(`/classes/${id}`);
    setClasses((cs) => cs.filter((c) => c.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setActiveClass(null);
    }
  };

  const addStudent = async (name, front_priority) => {
    const { data } = await api.post(`/classes/${activeId}/students`, {
      name,
      front_priority,
    });
    setActiveClass((c) => ({ ...c, students: [...c.students, data] }));
  };
  const bulkAdd = async (names) => {
    const { data } = await api.post(`/classes/${activeId}/students/bulk`, { names });
    setActiveClass((c) => ({ ...c, students: [...c.students, ...data] }));
    toast.success(`+${data.length} ${t("students")}`);
  };
  const deleteStudent = async (sid) => {
    await api.delete(`/classes/${activeId}/students/${sid}`);
    setActiveClass((c) => ({ ...c, students: c.students.filter((s) => s.id !== sid) }));
    setAssignments((a) => a.filter((x) => x.student_id !== sid));
  };
  const togglePriority = async (s) => {
    const { data } = await api.patch(`/classes/${activeId}/students/${s.id}`, {
      name: s.name,
      front_priority: !s.front_priority,
      notes: s.notes || "",
    });
    setActiveClass((c) => ({
      ...c,
      students: c.students.map((x) => (x.id === s.id ? data : x)),
    }));
  };

  const updateLayout = (layout) => {
    setActiveClass((c) => ({ ...c, layout }));
    setDirtyLayout(true);
  };
  const updateRules = (rules) => {
    setActiveClass((c) => ({ ...c, rules }));
    setDirtyRules(true);
  };

  const saveLayout = async () => {
    try {
      await api.patch(`/classes/${activeId}`, { layout: activeClass.layout });
      setDirtyLayout(false);
      toast.success(t("layout_saved"));
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail));
    }
  };
  const saveRules = async () => {
    try {
      await api.patch(`/classes/${activeId}`, { rules: activeClass.rules });
      setDirtyRules(false);
      toast.success(t("rules_saved"));
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail));
    }
  };

  const generate = async () => {
    if (!activeId) return;
    setGenerating(true);
    try {
      // save pending config first
      if (dirtyLayout || dirtyRules) {
        await api.patch(`/classes/${activeId}`, {
          layout: activeClass.layout,
          rules: activeClass.rules,
        });
        setDirtyLayout(false);
        setDirtyRules(false);
      }
      const { data } = await api.post(`/classes/${activeId}/generate`);
      if (!data.success) {
        toast.error(data.error || "Errore");
        setWarnings([data.error]);
        setAssignments([]);
      } else {
        setAssignments(data.assignments);
        setWarnings(data.warnings || []);
        toast.success(t("generated"));
      }
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail));
    } finally {
      setGenerating(false);
    }
  };

  const saveModifications = async () => {
    if (!assignments.length) return;
    try {
      const { data } = await api.post(`/classes/${activeId}/history`, {
        assignments,
        label: `Disposizione - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      });
      setHistory((h) => [data, ...h]);
      toast.success(t("seating_saved"));
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail));
    }
  };

  const swapSeats = (keyA, keyB) => {
    setAssignments((prev) => {
      const [rA, dA, sA] = keyA.split("-").map(Number);
      const [rB, dB, sB] = keyB.split("-").map(Number);
      const idxA = prev.findIndex((x) => x.row === rA && x.desk === dA && x.seat === sA);
      const idxB = prev.findIndex((x) => x.row === rB && x.desk === dB && x.seat === sB);
      const copy = [...prev];
      if (idxA >= 0 && idxB >= 0) {
        copy[idxA] = { ...copy[idxA], row: rB, desk: dB, seat: sB };
        copy[idxB] = { ...copy[idxB], row: rA, desk: dA, seat: sA };
      } else if (idxA >= 0) {
        copy[idxA] = { ...copy[idxA], row: rB, desk: dB, seat: sB };
      } else if (idxB >= 0) {
        copy[idxB] = { ...copy[idxB], row: rA, desk: dA, seat: sA };
      }
      return copy;
    });
  };

  const toggleFix = async (student_id, row, desk, seat) => {
    const current = activeClass?.rules?.fixed || [];
    const already = current.some(
      (f) => f.student_id === student_id && f.row === row && f.desk === desk && (f.seat ?? 0) === seat
    );
    const next = already
      ? current.filter(
          (f) => !(f.student_id === student_id && f.row === row && f.desk === desk && (f.seat ?? 0) === seat)
        )
      : [
          ...current.filter((f) => f.student_id !== student_id),
          { student_id, row, desk, seat },
        ];
    const newRules = { ...activeClass.rules, fixed: next };
    setActiveClass((c) => ({ ...c, rules: newRules }));
    try {
      await api.patch(`/classes/${activeId}`, { rules: newRules });
      toast.success(already ? "Pin rimosso" : "Studente bloccato");
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail));
    }
  };

  const restoreHistory = (h) => {
    setAssignments(h.assignments);
    toast.info(h.label);
  };
  const deleteHistory = async (id) => {
    await api.delete(`/classes/${activeId}/history/${id}`);
    setHistory((hs) => hs.filter((h) => h.id !== id));
  };

  const stats = useMemo(() => {
    if (!activeClass) return { seats: 0, students: 0 };
    const cap = (t) => (t === "single" ? 1 : t === "double" ? 2 : t === "triple" ? 3 : 0);
    let seats = 0;
    (activeClass.layout?.rows || []).forEach((r) =>
      r.desks.forEach((d) => (seats += cap(d.type)))
    );
    return { seats, students: activeClass.students?.length || 0 };
  }, [activeClass]);

  const activeRulesCount =
    (activeClass?.rules?.front_rotation ? 1 : 0) +
    (activeClass?.rules?.front_priority ? 1 : 0) +
    (activeClass?.rules?.separations?.length ? 1 : 0) +
    (activeClass?.rules?.pairings?.length ? 1 : 0);

  const exportData = () => ({
    layout: activeClass.layout,
    students: activeClass.students || [],
    assignments,
    className: activeClass.name,
    teacherLabel: t("teacher_desk"),
  });
  const exportPDF = async () => {
    if (!activeClass) return;
    await exportSeatingPDF(exportData(), `${activeClass.name}-${new Date().toISOString().slice(0, 10)}.pdf`);
  };
  const exportPNG = async () => {
    if (!activeClass) return;
    await exportSeatingPNG(exportData(), `${activeClass.name}-${new Date().toISOString().slice(0, 10)}.png`);
  };

  return (
    <div className="min-h-screen chalk-grid-bg">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Class bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <div className="eyebrow text-emerald-700 dark:text-emerald-400">
              CLASSROOM · WORKSPACE
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {activeClass ? activeClass.name : t("classes")}
            </h1>
          </div>
          <ClassManager
            classes={classes}
            activeClassId={activeId}
            onSelect={setActiveId}
            onCreate={createClass}
            onRename={renameClass}
            onDelete={deleteClass}
          />
        </div>

        {!activeClass ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-12 text-center fade-up">
            <BookMarked className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <h2 className="text-2xl font-bold mb-2">{t("empty_state_title")}</h2>
            <p className="text-muted-foreground max-w-md mx-auto">{t("empty_state_desc")}</p>
          </div>
        ) : (
          <>
          {/* ------- Desktop layout: side-by-side (lg+) ------- */}
          <div className="hidden lg:grid grid-cols-12 gap-5">
            {/* Left column - config (~32%) */}
            <div className="space-y-5 lg:col-span-4 xl:col-span-4">
              <StudentRoster
                students={activeClass.students || []}
                onAdd={addStudent}
                onBulk={bulkAdd}
                onDelete={deleteStudent}
                onTogglePriority={togglePriority}
              />
              <GridBuilder layout={activeClass.layout} onChange={updateLayout} />
              {dirtyLayout && (
                <Button data-testid="save-layout-button" onClick={saveLayout} className="w-full rounded-full gap-1.5">
                  <Save className="w-4 h-4" />
                  {t("save")} {t("layout")}
                </Button>
              )}
              <RulesPanel
                rules={activeClass.rules}
                students={activeClass.students || []}
                onChange={updateRules}
              />
              {dirtyRules && (
                <Button data-testid="save-rules-button" onClick={saveRules} className="w-full rounded-full gap-1.5">
                  <Save className="w-4 h-4" />
                  {t("save")} {t("rules")}
                </Button>
              )}
              <HistoryLog items={history} onRestore={restoreHistory} onDelete={deleteHistory} />
            </div>

            {/* Right column - grid (~68%) */}
            <div className="lg:col-span-8 xl:col-span-8 space-y-4">
              <GridToolbar
                stats={stats}
                activeRulesCount={activeRulesCount}
                assignments={assignments}
                generating={generating}
                onExportPNG={exportPNG}
                onExportPDF={exportPDF}
                onSave={saveModifications}
                onGenerate={generate}
                t={t}
              />
              {warnings.length > 0 && <WarningsBox warnings={warnings} t={t} />}
              <div className="text-xs text-muted-foreground px-1">{t("swap_hint")}</div>
              <SeatingGrid
                ref={gridRef}
                layout={activeClass.layout}
                students={activeClass.students || []}
                assignments={assignments}
                fixedSeats={activeClass.rules?.fixed || []}
                onSwap={swapSeats}
                onToggleFix={toggleFix}
              />
            </div>
          </div>

          {/* ------- Mobile / tablet layout: tabs ------- */}
          <div className="lg:hidden">
            <Tabs defaultValue="setup" className="w-full">
              <TabsList data-testid="mobile-tabs" className="w-full grid grid-cols-3 h-11 rounded-full p-1">
                <TabsTrigger value="setup" data-testid="tab-setup" className="rounded-full text-xs">
                  {t("tab_setup")}
                </TabsTrigger>
                <TabsTrigger value="rules" data-testid="tab-rules" className="rounded-full text-xs">
                  {t("tab_rules")}
                </TabsTrigger>
                <TabsTrigger value="grid" data-testid="tab-grid" className="rounded-full text-xs">
                  {t("tab_grid")}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="setup" className="space-y-5 mt-5">
                <StudentRoster
                  students={activeClass.students || []}
                  onAdd={addStudent}
                  onBulk={bulkAdd}
                  onDelete={deleteStudent}
                  onTogglePriority={togglePriority}
                />
                <GridBuilder layout={activeClass.layout} onChange={updateLayout} />
                {dirtyLayout && (
                  <Button onClick={saveLayout} className="w-full rounded-full gap-1.5">
                    <Save className="w-4 h-4" />
                    {t("save")} {t("layout")}
                  </Button>
                )}
              </TabsContent>
              <TabsContent value="rules" className="space-y-5 mt-5">
                <RulesPanel
                  rules={activeClass.rules}
                  students={activeClass.students || []}
                  onChange={updateRules}
                />
                {dirtyRules && (
                  <Button onClick={saveRules} className="w-full rounded-full gap-1.5">
                    <Save className="w-4 h-4" />
                    {t("save")} {t("rules")}
                  </Button>
                )}
                <HistoryLog items={history} onRestore={restoreHistory} onDelete={deleteHistory} />
              </TabsContent>
              <TabsContent value="grid" className="space-y-4 mt-5">
                <GridToolbar
                  stats={stats}
                  activeRulesCount={activeRulesCount}
                  assignments={assignments}
                  generating={generating}
                  onExportPNG={exportPNG}
                  onExportPDF={exportPDF}
                  onSave={saveModifications}
                  onGenerate={generate}
                  t={t}
                />
                {warnings.length > 0 && <WarningsBox warnings={warnings} t={t} />}
                <div className="text-xs text-muted-foreground px-1">{t("swap_hint")}</div>
                <SeatingGrid
                  ref={gridRef}
                  layout={activeClass.layout}
                  students={activeClass.students || []}
                  assignments={assignments}
                  fixedSeats={activeClass.rules?.fixed || []}
                  onSwap={swapSeats}
                  onToggleFix={toggleFix}
                />
              </TabsContent>
            </Tabs>
          </div>
          </>
        )}
      </main>
    </div>
  );
}

function GridToolbar({ stats, activeRulesCount, assignments, generating, onExportPNG, onExportPDF, onSave, onGenerate, t }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 bg-card border border-border rounded-xl p-4">
      <div className="flex flex-wrap gap-2 items-center">
        <Badge variant="outline" className="gap-1 rounded-full">
          {stats.seats} {t("seats")}
        </Badge>
        <Badge variant="outline" className="gap-1 rounded-full">
          {stats.students} {t("students")}
        </Badge>
        <Badge className="gap-1 rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300">
          {activeRulesCount} {t("active_rules")}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          data-testid="export-png-button"
          onClick={onExportPNG}
          disabled={!assignments.length}
          className="rounded-full gap-1.5"
        >
          <ImageDown className="w-4 h-4" />
          {t("export_png")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          data-testid="export-pdf-button"
          onClick={onExportPDF}
          disabled={!assignments.length}
          className="rounded-full gap-1.5"
        >
          <FileDown className="w-4 h-4" />
          {t("export_pdf")}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          data-testid="save-layout-button-main"
          onClick={onSave}
          disabled={!assignments.length}
          className="rounded-full gap-1.5"
        >
          <Save className="w-4 h-4" />
          {t("save_modifications")}
        </Button>
        <Button
          size="sm"
          data-testid="generate-seating-button"
          onClick={onGenerate}
          disabled={generating || stats.students === 0}
          className="rounded-full gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white"
        >
          <Sparkles className="w-4 h-4" />
          {generating ? t("generating") : t("generate")}
        </Button>
      </div>
    </div>
  );
}

function WarningsBox({ warnings, t }) {
  return (
    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex gap-2">
      <Info className="w-4 h-4 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5" />
      <div className="text-xs text-amber-900 dark:text-amber-200 space-y-0.5">
        <div className="font-semibold">{t("warnings")}</div>
        {warnings.map((w, i) => (
          <div key={i}>· {w}</div>
        ))}
      </div>
    </div>
  );
}
