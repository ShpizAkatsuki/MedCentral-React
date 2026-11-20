import { useStore } from "../state/store";
import { Group, Empty } from "../components/ui";
import { cyT } from "../lib/utils";
import { delFile } from "../lib/files";
import type { SheetT } from "../components/sheets";
export default function Meds({ tp, open }: { tp: string; open: (s: SheetT) => void }) {
  const { S, up, say } = useStore();
  const items = [...S.topics.filter(t => tp === "all" || t.id === tp).flatMap(t => t.prescriptions.map(p => ({ p, tid: t.id, tn: t.name }))), ...(tp === "all" ? S.meds.map(p => ({ p, tid: "", tn: "אישי" })) : [])];
  const del = (tid: string, id: string) => { if (!confirm("למחוק את המרשם?")) return; up(s => { if (tid) { const t = s.topics.find(i => i.id === tid)!; t.prescriptions = t.prescriptions.filter(p => p.id !== id); } else s.meds = s.meds.filter(p => p.id !== id); }); say("נמחק"); };
  return (
    <div className="view">
      {items.length ? items.map(({ p, tid, tn }) => (
        <div key={p.id}><div className="cap"><span>{p.name}</span><span>{tn}</span></div>
          <Group>{p.cycles.length ? p.cycles.map(c => <div className="row" key={c.id}><div className="g"><span className="sub">{cyT(c)}</span></div></div>) : <div className="row"><div className="g"><span className="sub">{p.dosage || "לפי צורך"}</span></div></div>}
            <button className="row" style={{ color: "var(--dg)" }} onClick={() => del(tid, p.id)}><div className="g">מחיקה</div></button></Group></div>))
        : <Empty text="אין תרופות" action="מרשם חדש" onAction={() => open({ k: "rx", tid: tp !== "all" ? tp : undefined })} />}
    </div>
  );
}
void delFile;
