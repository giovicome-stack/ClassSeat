import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const CAP = { single: 1, double: 2, triple: 3 };
const SEAT_W = 150;
const SEAT_H = 96;
const GAP = 14;

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function nameBlock(name) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0] || "";
  const last = parts.slice(1).join(" ");
  const fs = (txt) => (txt.length > 16 ? 13 : txt.length > 12 ? 15 : txt.length > 9 ? 17 : 19);
  return `
    <div style="font-size:${fs(first)}px;font-weight:700;line-height:1.5;color:#1a1a1a;white-space:nowrap">${esc(first)}</div>
    ${last ? `<div style="font-size:${fs(last) - 2}px;font-weight:500;line-height:1.5;color:#3d3d3d;white-space:nowrap">${esc(last)}</div>` : ""}`;
}

function data_locale() {
  return document.documentElement.lang === "en" ? "en-GB" : "it-IT";
}

function buildPrintNode({ layout, students, assignments, className, teacherLabel }) {
  const byId = {};
  students.forEach((s) => (byId[s.id] = s));
  const at = {};
  (assignments || []).forEach((a) => (at[`${a.row}-${a.desk}-${a.seat}`] = a.student_id));

  const rowsHtml = (layout.rows || [])
    .map((row, r) => {
      const desks = row.desks
        .map((desk, d) => {
          const cap = CAP[desk.type] || 0;
          if (!cap) {
            return `<div style="width:${SEAT_W * 0.5}px;height:${SEAT_H}px;flex:none"></div>`;
          }
          const seats = Array.from({ length: cap })
            .map((_, s) => {
              const sid = at[`${r}-${d}-${s}`];
              const st = sid ? byId[sid] : null;
              const inner = st
                ? `<div style="display:flex;flex-direction:column;justify-content:center;height:100%;padding:0 12px">${nameBlock(st.name)}</div>`
                : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#b5b5b5;font-size:18px">—</div>`;
              return `<div style="width:${SEAT_W}px;height:${SEAT_H}px;flex:none;box-sizing:border-box;border-radius:8px;background:${st ? "#ffffff" : "#f6f6f3"};border:1.5px ${st ? "solid #9fd6b8" : "dashed #d6d6d0"}">${inner}</div>`;
            })
            .join("");
          return `<div style="display:flex;gap:8px;padding:8px;flex:none;box-sizing:border-box;border-radius:12px;border:1.5px solid #d9d9d3;background:#f0f4ee">${seats}</div>`;
        })
        .join("");
      return `<div style="display:flex;justify-content:center;gap:${GAP}px;margin-bottom:${GAP}px">${desks}</div>`;
    })
    .join("");

  const dateStr = new Date().toLocaleDateString(data_locale(), { day: "2-digit", month: "long", year: "numeric" });
  const wrap = document.createElement("div");
  wrap.setAttribute("data-testid", "print-layout");
  wrap.style.cssText =
    "position:fixed;left:-20000px;top:0;background:#FBFBF9;padding:40px 48px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;width:max-content;box-sizing:border-box";
  wrap.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:28px;gap:40px">
      <div style="font-size:30px;font-weight:800;color:#1a1a1a;line-height:1.3">${esc(className)}</div>
      <div style="font-size:16px;color:#555;line-height:1.3">${esc(dateStr)}</div>
    </div>
    <div style="margin:0 auto 32px;max-width:520px;padding:14px 24px;border-radius:10px;background:#fde9b8;border:1.5px solid #e6c57a;text-align:center;font-size:18px;font-weight:700;color:#6b4e0a;line-height:1.3">${esc(teacherLabel)}</div>
    <div>${rowsHtml}</div>`;
  document.body.appendChild(wrap);
  return wrap;
}

async function capture(data) {
  const node = buildPrintNode(data);
  try {
    await document.fonts?.ready;
    return await html2canvas(node, { backgroundColor: "#FBFBF9", scale: 3, useCORS: true, logging: false });
  } finally {
    node.remove();
  }
}

export async function exportSeatingPNG(data, filename = "seating.png") {
  const canvas = await capture(data);
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = filename;
  a.click();
}

export async function exportSeatingPDF(data, filename = "seating.pdf") {
  const canvas = await capture(data);
  const imgData = canvas.toDataURL("image/png");
  const landscape = canvas.width >= canvas.height;
  const pdf = new jsPDF({ orientation: landscape ? "landscape" : "portrait", unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 24;
  const availW = pageW - margin * 2;
  const availH = pageH - margin * 2;
  const ratio = canvas.width / canvas.height;
  let w = availW;
  let h = w / ratio;
  if (h > availH) {
    h = availH;
    w = h * ratio;
  }
  pdf.addImage(imgData, "PNG", (pageW - w) / 2, (pageH - h) / 2, w, h, undefined, "FAST");
  pdf.save(filename);
}
