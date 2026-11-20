import { useState } from "react";
import { useStore } from "../state/store";
import { Group, Cap, Icon } from "../components/ui";
import { he, D } from "../lib/utils";
import type { SheetT } from "../components/sheets";
import type { Vital } from "../types";
const VO = (t: string) => (/משקל/.test(t) ? 0 : /לחץ/.test(t) ? 1 : 2);
function Spark({ v }: { v: string[] }) {
  const p = v.map(x => +(x.match(/-?\d+(\.\d+)?/)?.[0] ?? NaN)).filter(x => !isNaN(x)).reverse(); if (p.length < 2) return null;
  const lo = Math.min(...p), r = Math.max(...p) - lo || 1;
  const pts = p.map((y, i) => `${((i / (p.length - 1)) * 100).toFixed(1)},${(26 - ((y - lo) / r) * 22).toFixed(1)}`).join(" ");
  return <svg viewBox="0 0 100 30" preserveAspectRatio="none" style={{ width: "100%", height: 40, display: "block", color: "var(--pr)" }}><polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" /></svg>;
}
export default function More({ open }: { open: (s: SheetT) => void }) {
  const { S, up, replace, say } = useStore(), [dark, setDark] = useState(false);
  const groups = Object.entries<Vital[]>(S.vitals.reduce<Record<string, Vital[]>>((m, v) => ((m[v.type] ||= []).push(v), m), {})).sort((a, b) => VO(a[0]) - VO(b[0]) || a[0].localeCompare(b[0], "he"));
  const exp = () => { const u = URL.createObjectURL(new Blob([JSON.stringify(S)], { type: "application/json" })), a = document.createElement("a"); a.href = u; a.download = `medcentral_backup_${D()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(u), 1e4); };
  const imp = async (f?: File) => { if (!f) return; try { const r = JSON.parse(await f.text()); if (!r.topics) throw 0; if (!confirm("השחזור מחליף את הנתונים הנוכחיים. להמשיך?")) return; replace(r); say("הנתונים שוחזרו"); } catch { say("הקובץ אינו גיבוי תקין"); } };
  return (
    <div className="view">
      <Cap>תיקים רפואיים</Cap>
      <Group>{S.topics.map(t => <button className="row" key={t.id} onClick={() => open({ k: "topic", id: t.id })}><div className="g"><b>{t.name}</b></div><span className="chev"><Icon n="chev" s={18} /></span></button>)}
        <button className="row" style={{ color: "var(--pr)" }} onClick={() => open({ k: "topic" })}><div className="g">+ תיק חדש</div></button></Group>
      <Cap end={<button style={{ color: "var(--pr)" }} onClick={() => open({ k: "vital" })}>+ מדד</button>}>מדדים</Cap>
      {groups.map(([k, l]) => <div key={k} style={{ marginBottom: 12 }}><Group><div className="row" style={{ display: "block" }}><b>{k}</b><Spark v={l.map(x => x.value)} /></div>
        {l.slice(0, 5).map(v => <div className="row" key={v.id}><div className="g"><b>{v.value}</b><span className="sub">{he(v.date)}</span></div><button className="ib" aria-label="מחיקה" onClick={() => up(s => { s.vitals = s.vitals.filter(x => x.id !== v.id); })}><Icon n="x" s={16} /></button></div>)}</Group></div>)}
      <Cap>הגדרות וגיבוי</Cap>
      <Group>
        <button className="row" onClick={() => { const d = !dark; setDark(d); document.documentElement.dataset.theme = d ? "dark" : "light"; }}><Icon n="moon" /><div className="g"><b>מצב כהה</b></div><span className="sub">{dark ? "פעיל" : "כבוי"}</span></button>
        <button className="row" onClick={exp}><div className="g"><b>הורדת גיבוי (JSON)</b><span className="sub">הרשומות בלבד, לא הקבצים עצמם</span></div></button>
        <label className="row"><div className="g"><b>שחזור מקובץ גיבוי</b></div><input type="file" accept=".json" hidden onChange={e => imp(e.target.files?.[0])} /></label>
      </Group>
    </div>
  );
}
