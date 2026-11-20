import { useState } from "react";
import { Sheet, Group, Field } from "./ui";
import { useStore } from "../state/store";
import { D, uid, WL, doseL } from "../lib/utils";
import type { Dose } from "../types";
type R = { s: string; e: string; doses: Dose[] };
const nr = (): R => ({ s: D(), e: "", doses: [{ q: "1", w: "morning", t: "" }] });
export default function RxSheet({ topicId, apptId, doctor, personal, onClose }: { topicId?: string; apptId?: string; doctor?: string; personal?: boolean; onClose: () => void }) {
  const { S, up, say } = useStore();
  const [name, setName] = useState(""), [dr, setDr] = useState(doctor || ""), [tid, setTid] = useState(topicId || (personal ? "" : S.topics[0]?.id || ""));
  const [rs, setRs] = useState<R[]>([nr()]);
  const setR = (i: number, f: (r: R) => R) => setRs(rs.map((r, j) => (j === i ? f(r) : r)));
  const setD = (i: number, j: number, p: Partial<Dose>) => setR(i, r => ({ ...r, doses: r.doses.map((d, k) => (k === j ? { ...d, ...p } : d)) }));
  const save = () => {
    if (!name.trim()) return say("נא להזין שם תרופה");
    for (const r of rs) { if (r.e && r.s && r.e < r.s) return say("תאריך הסיום מוקדם מההתחלה"); if (r.doses.some(d => d.w === "time" && !d.t)) return say("נא לבחור שעה למנה"); }
    const cycles = rs.map(r => ({ id: uid(), start: r.s, end: r.e, doses: r.doses.map(d => ({ q: d.q || "1", w: d.w, t: d.w === "time" ? d.t : "" })) }));
    const rx = { id: uid(), name: name.trim(), doctor: dr || "לא צוין", dosage: cycles[0].doses.map(doseL).join(" + "), appt: apptId, cycles };
    up(s => { (tid ? s.topics.find(t => t.id === tid)!.prescriptions : s.meds).unshift(rx); });
    say("נשמר"); onClose();
  };
  return (
    <Sheet title="מרשם / כדור חדש" onClose={onClose}>
      <Group>
        {!topicId && <Field label="תיק"><select value={tid} onChange={e => setTid(e.target.value)}><option value="">אישי (ללא תיק)</option>{S.topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field>}
        <Field label="תרופה"><input value={name} onChange={e => setName(e.target.value)} placeholder="שם התרופה" /></Field>
        <Field label="רופא"><input value={dr} onChange={e => setDr(e.target.value)} placeholder="אופציונלי" /></Field>
      </Group>
      {rs.map((r, i) => (
        <div key={i}>
          <div className="cap"><span>טווח תאריכים {i + 1}</span>{rs.length > 1 && <button className="sub" onClick={() => setRs(rs.filter((_, j) => j !== i))}>הסר</button>}</div>
          <Group>
            <Field label="התחלה"><input type="date" value={r.s} onChange={e => setR(i, x => ({ ...x, s: e.target.value }))} /></Field>
            <Field label="סיום"><input type="date" value={r.e} onChange={e => setR(i, x => ({ ...x, e: e.target.value }))} /></Field>
            {r.doses.map((d, j) => (
              <div className="fld" key={j}>
                <input style={{ width: 48, flex: "none" }} inputMode="decimal" aria-label="כמות" value={d.q} onChange={e => setD(i, j, { q: e.target.value })} />
                <select value={d.w} onChange={e => setD(i, j, { w: e.target.value })}>{Object.entries(WL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                {d.w === "time" && <input type="time" style={{ width: 100, flex: "none" }} value={d.t} onChange={e => setD(i, j, { t: e.target.value })} />}
                {r.doses.length > 1 && <button className="ib" aria-label="הסר מנה" onClick={() => setR(i, x => ({ ...x, doses: x.doses.filter((_, k) => k !== j) }))}>✕</button>}
              </div>
            ))}
            <button className="row" style={{ color: "var(--pr)" }} onClick={() => setR(i, x => ({ ...x, doses: [...x.doses, { q: "1", w: "evening", t: "" }] }))}>+ מנה נוספת</button>
          </Group>
        </div>
      ))}
      <button className="btn g" onClick={() => setRs([...rs, { ...nr(), s: "" }])}>+ טווח תאריכים (הפסקה בין כדורים)</button>
      <button className="btn" onClick={save}>שמירה</button>
    </Sheet>
  );
}
