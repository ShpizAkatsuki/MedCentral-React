import type { State, Cycle, Dose, Rx } from "../types";
export const uid = () => Math.random().toString(36).slice(2, 10);
const p2 = (n: number) => String(n).padStart(2, "0");
export const D = (n = 0) => { const d = new Date(); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`; };
export const dt = (s: string) => new Date(s + "T00:00");
export const he = (s?: string, o: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) => (s ? dt(s).toLocaleDateString("he-IL", o) : "");
export const rel = (s: string) => { const n = Math.round((+dt(s) - +dt(D())) / 864e5); return n === 0 ? "היום" : n === 1 ? "מחר" : n > 1 ? `בעוד ${n} ימים` : `לפני ${-n} ימים`; };
export const KIND: Record<string, string> = { specialist: "רופא מומחה", family: "רופא משפחה", imaging: "הדמיה", lab: "בדיקות דם", surgery: "ניתוח", other: "אחר" };
export const WL: Record<string, string> = { morning: "בבוקר", noon: "בצהריים", evening: "בערב", before: "לפני אוכל", after: "אחרי אוכל", time: "בשעה מדויקת", any: "במהלך היום" };
const WT: Record<string, string> = { morning: "08:00", noon: "13:00", evening: "20:00", before: "12:00", after: "12:30", any: "23:59" };
export const doseL = (d: Dose) => `${d.q} יח׳ · ${WL[d.w || "any"]}${d.w === "time" && d.t ? " " + d.t : ""}`;
export const cyT = (c: Cycle) => `${he(c.start) || "מיידי"} – ${he(c.end) || "ללא הגבלה"}${c.doses.some(d => d.legacy) ? "" : " · " + c.doses.map(doseL).join(" + ")}`;
export const fmtSize = (n: number) => (n > 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB");
const arr = <T,>(x: any): T[] => (Array.isArray(x) ? x : []);
const fixC = (c: any): Cycle => ({ ...c, doses: arr<Dose>(c.doses).length ? c.doses : [{ q: "1", w: "any", t: "", legacy: 1 }] });
export function norm(r: any): State {
  const s: any = { view: "home", taken: {}, ...(r || {}) };
  s.topics = arr<any>(s.topics).filter(t => t && t.id).map(t => ({
    icon: "", name: "ללא שם", ...t,
    appointments: arr<any>(t.appointments).filter(a => a && a.id).map(a => ({ kind: "specialist", doctor: "", date: D(), time: "", location: "", preparation: "", summary: "", notes: "", ...a, files: arr(a.files) })),
    prescriptions: arr<any>(t.prescriptions).filter(p => p && p.id).map(p => ({ name: "", doctor: "", dosage: "", ...p, cycles: arr<any>(p.cycles).map(fixC) })),
    docs: arr(t.docs), notes: arr(t.notes),
  }));
  s.meds = arr<any>(s.meds).map(m => ({ ...m, cycles: arr<any>(m.cycles).map(fixC) }));
  s.vitals = arr(s.vitals);
  if (!s.taken || typeof s.taken !== "object") s.taken = {};
  return s as State;
}
export function medsToday(S: State, tp: string) {
  const t = D(), o: { key: string; name: string; dosage: string; topic: string; taken: boolean; o: string }[] = [];
  const add = (p: Rx, top: string) => {
    const c = p.cycles.find(c => (!c.start || c.start <= t) && (!c.end || c.end >= t)); if (!c) return;
    c.doses.forEach((d, i) => { const k = `${p.id}#${i}`; o.push({ key: k, name: p.name, dosage: d.legacy ? p.dosage : doseL(d), topic: top, taken: !!S.taken[`${t}|${k}`], o: d.w === "time" ? d.t || "12:00" : WT[d.w] || "23:59" }); });
  };
  S.topics.filter(x => tp === "all" || x.id === tp).forEach(x => x.prescriptions.forEach(p => add(p, x.name)));
  if (tp === "all") S.meds.forEach(p => { if (p.cycles.length) add(p, "אישי"); else { const k = `${p.id}#0`; o.push({ key: k, name: p.name, dosage: p.dosage, topic: "אישי", taken: !!S.taken[`${t}|${k}`], o: "23:59" }); } });
  return o.sort((a, b) => a.o.localeCompare(b.o));
}
