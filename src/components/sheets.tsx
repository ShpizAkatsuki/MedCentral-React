import { useState } from "react";
import { Sheet, Group, Field, Dropzone, Cap, Icon } from "./ui";
import { useStore } from "../state/store";
import { D, uid, he, rel, KIND, fmtSize } from "../lib/utils";
import { putFile, delFile, download } from "../lib/files";
import type { FileRef } from "../types";
export type SheetT = { k: string; tid?: string; id?: string; apptId?: string; doctor?: string; personal?: boolean } | null;
type P = { s: NonNullable<SheetT>; open: (s: SheetT) => void; onClose: () => void; tp: string };
export const fname = (f: FileRef) => f.title || f.name || "קובץ";
export function useUpload() {
  const { up, say } = useStore();
  return async (files: File[], put: (s: any, r: FileRef) => void) => {
    for (const f of files) {
      const id = uid(); try { await putFile(id, f); } catch { return say("לא ניתן לשמור את הקובץ (אחסון הדפדפן מלא או חסום)"); }
      const r: FileRef = { id, title: f.name, name: f.name, date: D(), type: (f.name.split(".").pop() || "").toUpperCase(), size: fmtSize(f.size) };
      up(s => put(s, r));
    }
    say(files.length > 1 ? `${files.length} קבצים נשמרו` : "הקובץ נשמר");
  };
}
export function ApptForm({ s, onClose, open, tp }: P) {
  const { S, up, say } = useStore();
  const old = s.id ? S.topics.find(t => t.id === s.tid)?.appointments.find(a => a.id === s.id) : null;
  const [tid, setTid] = useState(s.tid || (tp !== "all" ? tp : S.topics[0]?.id || ""));
  const [f, setF] = useState({ kind: old?.kind || "specialist", doctor: old?.doctor || "", date: old?.date || D(1), time: old?.time || "09:00", location: old?.location || "", preparation: old?.preparation || "", notes: old?.notes || "" });
  const [rx, setRx] = useState(false);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const save = () => {
    if (!f.doctor.trim()) return say("נא למלא רופא או מכון");
    const id = old?.id || uid();
    up(x => { const t = x.topics.find(t => t.id === tid)!; if (old) Object.assign(t.appointments.find(a => a.id === id)!, f); else t.appointments.push({ id, ...f, summary: "", files: [] }); });
    say("התור נשמר");
    if (!old && rx) open({ k: "rx", tid, apptId: id, doctor: f.doctor }); else onClose();
  };
  return (
    <Sheet title={old ? "עריכת תור" : "תור חדש"} onClose={onClose}>
      <Group>
        {!old && <Field label="תיק"><select value={tid} onChange={e => setTid(e.target.value)}>{S.topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field>}
        <Field label="סוג"><select value={f.kind} onChange={set("kind")}>{Object.entries(KIND).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
        <Field label="רופא / מכון"><input value={f.doctor} onChange={set("doctor")} placeholder="למשל: ד״ר כהן" /></Field>
        <Field label="תאריך"><input type="date" value={f.date} onChange={set("date")} /></Field>
        <Field label="שעה"><input type="time" value={f.time} onChange={set("time")} /></Field>
        <Field label="כתובת"><input value={f.location} onChange={set("location")} placeholder="אופציונלי" /></Field>
        <Field label="הכנות"><input value={f.preparation} onChange={set("preparation")} placeholder="צום, מסמכים להביא…" /></Field>
        <Field label="פתקים"><input value={f.notes} onChange={set("notes")} placeholder="שאלות לרופא" /></Field>
      </Group>
      {!old && <label className="row grp" style={{ marginTop: 10 }}><input type="checkbox" style={{ width: 20, flex: "none" }} checked={rx} onChange={e => setRx(e.target.checked)} /><span className="g">להוסיף מרשם תרופות אחרי התור</span></label>}
      <button className="btn" onClick={save}>שמירה</button>
    </Sheet>
  );
}
export function ApptDetails({ s, onClose, open }: P) {
  const { S, up, say } = useStore(), upload = useUpload();
  const t = S.topics.find(t => t.id === s.tid), a = t?.appointments.find(a => a.id === s.id);
  const [edit, setEdit] = useState(false), [sum, setSum] = useState(a?.summary || "");
  if (!t || !a) return null;
  const rxs = t.prescriptions.filter(p => p.appt === a.id);
  return (
    <Sheet title="פרטי התור" onClose={onClose}>
      <Group>
        <div className="row" style={{ display: "block" }}><span className="chip pr">{KIND[a.kind] || a.kind}</span><b style={{ marginTop: 6, fontSize: 17 }}>{a.doctor}</b><span className="sub">{he(a.date, { weekday: "long", day: "numeric", month: "long" })} · {a.time} · {rel(a.date)}</span></div>
        {a.location && <div className="row"><Icon n="pin" s={18} /><div className="g">{a.location}</div></div>}
        {a.preparation && <div className="row"><div className="g"><span className="sub">הכנות</span><div>{a.preparation}</div></div></div>}
        {a.notes && <div className="row"><div className="g"><span className="sub">פתקים</span><div>{a.notes}</div></div></div>}
      </Group>
      <Cap>סיכום הבדיקה</Cap>
      {edit ? (<><Group><div className="fld"><textarea autoFocus value={sum} onChange={e => setSum(e.target.value)} placeholder="כתבו את הסיכום כאן…" /></div></Group>
        <button className="btn" onClick={() => { up(x => { x.topics.find(i => i.id === t.id)!.appointments.find(i => i.id === a.id)!.summary = sum; }); setEdit(false); say("הסיכום נשמר"); }}>שמירה</button></>)
        : (<><Group><div className="row" style={{ display: "block" }}>{a.summary || <span className="sub">עדיין לא מולא</span>}</div></Group><button className="btn" onClick={() => setEdit(true)}>{a.summary ? "עריכת סיכום" : "מילוי סיכום בדיקה"}</button></>)}
      {rxs.length > 0 && <><Cap>מרשמים</Cap><Group>{rxs.map(p => <div className="row" key={p.id}><div className="g"><b>{p.name}</b><span className="sub">{p.dosage}</span></div></div>)}</Group></>}
      <Cap>מסמכים</Cap>
      <Dropzone onFiles={fs => upload(fs, (x, r) => x.topics.find((i: any) => i.id === t.id).appointments.find((i: any) => i.id === a.id).files.push(r))} />
      {a.files.length > 0 && <Group>{a.files.map(f => <button className="row" key={f.id} onClick={() => open({ k: "doc", tid: t.id, id: f.id })}><Icon n="doc" /><div className="g"><b>{fname(f)}</b></div></button>)}</Group>}
      <Group><button className="row" onClick={() => open({ k: "editAppt", tid: t.id, id: a.id })}><div className="g">עריכת פרטי התור</div></button>
        <button className="row" onClick={() => open({ k: "rx", tid: t.id, apptId: a.id, doctor: a.doctor })}><div className="g">+ מרשם לתור הזה</div></button></Group>
      <button className="lnk" onClick={() => { if (!confirm("למחוק את התור וקבציו?")) return; a.files.forEach(f => delFile(f.id)); up(x => { const i = x.topics.find(i => i.id === t.id)!; i.appointments = i.appointments.filter(i => i.id !== a.id); }); onClose(); say("התור נמחק"); }}>מחיקת התור</button>
    </Sheet>
  );
}
export function DocSheet({ s, onClose }: P) {
  const { S, up, say } = useStore();
  const t = S.topics.find(t => t.id === s.tid);
  const f = t?.docs.find(d => d.id === s.id) || t?.appointments.flatMap(a => a.files).find(d => d.id === s.id);
  const [note, setNote] = useState(f?.note || "");
  if (!t || !f) return null;
  const find = (x: any) => x.topics.find((i: any) => i.id === t.id);
  return (
    <Sheet title="מאפייני מסמך" onClose={onClose}>
      <Group>
        <div className="row"><div className="g"><span className="sub">שם</span><b>{fname(f)}</b></div></div>
        <div className="row"><div className="g"><span className="sub">תאריך</span><b>{he(f.date)}</b></div><div className="g"><span className="sub">גודל</span><b>{f.size || "—"}</b></div></div>
        <div className="row"><div className="g"><span className="sub">תיק</span><b>{t.name}</b></div></div>
        <div className="fld"><textarea value={note} onChange={e => setNote(e.target.value)} placeholder="הערות" /></div>
      </Group>
      <button className="btn" onClick={() => { up(x => { const q = find(x); (q.docs.find((d: any) => d.id === f.id) || q.appointments.flatMap((a: any) => a.files).find((d: any) => d.id === f.id)).note = note.trim(); }); say("ההערות נשמרו"); }}>שמירת הערות</button>
      {f.dv ? <a className="btn g" style={{ display: "grid", placeItems: "center", textDecoration: "none", marginTop: 10 }} target="_blank" rel="noopener" href={`https://drive.google.com/file/d/${f.dv}/view`}>צפייה בדרייב</a> : <button className="btn g" disabled style={{ opacity: .5 }}>צפייה בדרייב (טרם הועלה)</button>}
      <button className="btn g" onClick={async () => { if (!(await download(f.id, fname(f)))) say("תוכן הקובץ לא נמצא במכשיר הזה"); }}>הורדה</button>
      <button className="lnk" onClick={() => { if (!confirm("למחוק את המסמך?")) return; delFile(f.id); up(x => { const q = find(x); q.docs = q.docs.filter((d: any) => d.id !== f.id); q.appointments.forEach((a: any) => (a.files = a.files.filter((d: any) => d.id !== f.id))); }); onClose(); say("המסמך נמחק"); }}>מחיקה</button>
    </Sheet>
  );
}
export function TopicSheet({ s, onClose }: P) {
  const { S, up, say } = useStore(), t = S.topics.find(t => t.id === s.id);
  const [name, setName] = useState(t?.name || "");
  const save = () => { if (!name.trim()) return say("נא להזין שם"); up(x => { if (t) x.topics.find(i => i.id === t.id)!.name = name.trim(); else x.topics.push({ id: uid(), name: name.trim(), icon: "", appointments: [], prescriptions: [], docs: [], notes: [] }); }); say(t ? "נשמר" : "התיק נוצר"); onClose(); };
  const n = t ? t.appointments.length + t.prescriptions.length + t.docs.length : 0;
  return (
    <Sheet title={t ? "עריכת תיק" : "תיק רפואי חדש"} onClose={onClose}>
      <Group><Field label="שם"><input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="למשל: מעקב סוכרת" /></Field></Group>
      <button className="btn" onClick={save}>{t ? "שמירה" : "יצירה"}</button>
      {t && <button className="lnk" onClick={() => { if (n) return say(`אי אפשר למחוק תיק שיש בו פריטים (${n})`); up(x => { x.topics = x.topics.filter(i => i.id !== t.id); }); onClose(); say("התיק נמחק"); }}>מחיקת התיק</button>}
    </Sheet>
  );
}
export function VitalSheet({ onClose }: P) {
  const { up, say } = useStore(), [type, setType] = useState("משקל"), [value, setValue] = useState("");
  return (
    <Sheet title="מדד חדש" onClose={onClose}>
      <Group><Field label="סוג"><input list="vt" value={type} onChange={e => setType(e.target.value)} /><datalist id="vt"><option value="משקל" /><option value="לחץ דם" /><option value="סוכר" /><option value="דופק" /></datalist></Field>
        <Field label="ערך"><input autoFocus value={value} onChange={e => setValue(e.target.value)} placeholder="למשל 120/80" /></Field></Group>
      <button className="btn" onClick={() => { if (!value.trim()) return say("נא להזין ערך"); up(x => { x.vitals.unshift({ id: uid(), type: type.trim(), value: value.trim(), date: D() }); }); onClose(); say("המדד נשמר"); }}>שמירה</button>
    </Sheet>
  );
}
