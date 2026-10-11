import React, { useMemo, useState, forwardRef } from "react";
import { useLang } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Presentation, Eye, GripVertical, Lock, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

const SeatingGrid = forwardRef(function SeatingGrid(
  { layout, students, assignments, fixedSeats = [], onSwap, onToggleFix, className = "" },
  ref
) {
  const { t } = useLang();
  const [selected, setSelected] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [zoom, setZoom] = useState(1);

  const fixedMap = useMemo(() => {
    const m = {};
    (fixedSeats || []).forEach((f) => {
      m[`${f.row}-${f.desk}-${f.seat ?? 0}`] = f.student_id;
    });
    return m;
  }, [fixedSeats]);

  const studentAt = useMemo(() => {
    const map = {};
    (assignments || []).forEach((a) => {
      map[`${a.row}-${a.desk}-${a.seat}`] = a.student_id;
    });
    return map;
  }, [assignments]);

  const studentById = useMemo(() => {
    const m = {};
    students.forEach((s) => (m[s.id] = s));
    return m;
  }, [students]);

  const seatKey = (r, d, s) => `${r}-${d}-${s}`;

  const handleClickSeat = (r, d, s) => {
    const key = seatKey(r, d, s);
    const sidHere = studentAt[key] || null;
    if (!selected) {
      if (sidHere) setSelected({ key, student_id: sidHere });
      return;
    }
    if (selected.key === key) {
      setSelected(null);
      return;
    }
    onSwap(selected.key, key);
    setSelected(null);
  };

  const handleDragStart = (e, key, sid) => {
    if (!sid) return;
    setDragging({ key, student_id: sid });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", key);
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, targetKey) => {
    e.preventDefault();
    if (!dragging) return;
    if (dragging.key !== targetKey) onSwap(dragging.key, targetKey);
    setDragging(null);
  };

  const deskCapacity = (t) => (t === "single" ? 1 : t === "double" ? 2 : t === "triple" ? 3 : 0);

  return (
    <TooltipProvider delayDuration={200}>
    <div className={className}>
      {/* Zoom toolbar */}
      <div className="flex items-center justify-end gap-1.5 mb-2">
        <span className="text-[11px] text-muted-foreground font-mono mr-1">{Math.round(zoom * 100)}%</span>
        <Button
          size="icon"
          variant="outline"
          data-testid="zoom-out-button"
          onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))}
          className="h-8 w-8 rounded-full"
          title="Zoom out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          data-testid="zoom-fit-button"
          onClick={() => setZoom(1)}
          className="h-8 w-8 rounded-full"
          title="Fit"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          data-testid="zoom-in-button"
          onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2)))}
          className="h-8 w-8 rounded-full"
          title="Zoom in"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </Button>
      </div>

    <div ref={ref} className="bg-card rounded-xl border border-border p-4 sm:p-6">
      {/* Teacher's podium */}
      <div
        data-testid="teacher-podium"
        className="teacher-podium rounded-lg py-3 px-4 mb-6 flex items-center justify-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200"
      >
        <Presentation className="w-4 h-4" />
        {t("teacher_desk")}
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <div
          className="space-y-3 mx-auto"
          style={{ transform: `scale(${zoom})`, transformOrigin: "top center", width: "fit-content", minWidth: "100%" }}
        >
        {(layout.rows || []).map((row, rIdx) => (
          <div
            key={rIdx}
            className="flex gap-2 justify-center min-w-min"
          >
            {row.desks.map((desk, dIdx) => {
              const cap = deskCapacity(desk.type);
              if (desk.type === "aisle" || desk.type === "empty") {
                return (
                  <div
                    key={dIdx}
                    data-testid={`aisle-${rIdx}-${dIdx}`}
                    style={{ flex: "1 1 0", minWidth: "60px" }}
                    className={`rounded-md h-[90px] ${desk.type === "aisle" ? "desk-aisle" : "bg-transparent"}`}
                  />
                );
              }
              return (
                <div
                  key={dIdx}
                  data-testid={`desk-${rIdx}-${dIdx}`}
                  style={{ flex: `${cap} ${cap} 0`, minWidth: `${cap * 95}px` }}
                  className={`rounded-lg border border-border desk-shadow p-1.5 desk-${desk.type} flex gap-1`}
                >
                  {Array.from({ length: cap }).map((_, sIdx) => {
                    const key = seatKey(rIdx, dIdx, sIdx);
                    const sid = studentAt[key];
                    const student = sid ? studentById[sid] : null;
                    const isSelected = selected?.key === key;
                    // split name into first and last part for 2-line display, no mid-word breaks
                    const parts = student ? student.name.trim().split(/\s+/) : [];
                    const firstName = parts[0] || "";
                    const lastName = parts.slice(1).join(" ");
                    // short form: First + L.
                    const lastInitial = lastName ? `${lastName.charAt(0).toUpperCase()}.` : "";
                    const slotButton = (
                      <button
                        key={sIdx}
                        data-testid={`desk-slot-${rIdx}-${dIdx}-${sIdx}`}
                        onClick={() => handleClickSeat(rIdx, dIdx, sIdx)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, key)}
                        style={{ minWidth: "88px" }}
                        className={`flex-1 min-h-[78px] rounded-md text-left px-1.5 py-1.5 border transition-colors ${
                          student
                            ? "bg-white dark:bg-neutral-800 border-emerald-300/50 dark:border-emerald-700"
                            : "bg-neutral-50 dark:bg-neutral-900/40 border-dashed border-border"
                        } ${isSelected ? "pulse-swap ring-2 ring-emerald-500" : ""}`}
                      >
                        {student ? (
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, key, sid)}
                            data-testid={`student-card-${sid}`}
                            className="h-full flex items-start gap-1 cursor-grab active:cursor-grabbing relative"
                          >
                            <GripVertical className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0 pr-4">
                              {/* Mobile: First + L. ; Desktop: full name */}
                              <div className="font-semibold leading-tight sm:hidden" style={{ wordBreak: "keep-all", overflowWrap: "normal", hyphens: "manual" }}>
                                <div className="text-[11px] truncate">{firstName}</div>
                                {lastInitial && (
                                  <div className="text-[10px] font-medium opacity-90">{lastInitial}</div>
                                )}
                              </div>
                              <div className="font-semibold leading-tight hidden sm:block" style={{ wordBreak: "keep-all", overflowWrap: "normal", hyphens: "manual" }}>
                                <div className={`${firstName.length > 10 ? "text-[10px]" : "text-xs"} truncate`}>{firstName}</div>
                                {lastName && (
                                  <div className={`${lastName.length > 10 ? "text-[10px]" : "text-[11px]"} font-medium opacity-90 truncate`}>{lastName}</div>
                                )}
                              </div>
                              {student.front_priority && (
                                <div className="flex items-center gap-0.5 text-[9px] text-amber-700 dark:text-amber-400 mt-0.5">
                                  <Eye className="w-2.5 h-2.5" />
                                  <span>priority</span>
                                </div>
                              )}
                            </div>
                            {onToggleFix && (
                              <span
                                role="button"
                                tabIndex={0}
                                data-testid={`lock-${rIdx}-${dIdx}-${sIdx}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleFix(sid, rIdx, dIdx, sIdx);
                                }}
                                className={`absolute top-0 right-0 p-0.5 rounded-full ${
                                  fixedMap[key] === sid
                                    ? "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/50"
                                    : "text-muted-foreground/50 hover:text-emerald-700"
                                }`}
                                title="Pin / Fix"
                              >
                                <Lock className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-[10px] text-muted-foreground min-h-[60px]">
                            —
                          </div>
                        )}
                      </button>
                    );
                    if (!student) return slotButton;
                    return (
                      <Tooltip key={sIdx} delayDuration={250}>
                        <TooltipTrigger asChild>{slotButton}</TooltipTrigger>
                        <TooltipContent side="top" className="font-semibold">
                          {student.name}
                          {student.front_priority && " · priorità prima fila"}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
        </div>
      </div>
    </div>
    </div>
    </TooltipProvider>
  );
});

export default SeatingGrid;
