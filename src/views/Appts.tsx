import { useState } from "react";
import { useStore } from "../state/store";
import { Group, Empty, Icon } from "../components/ui";
import { D, dt, KIND } from "../lib/utils";
import type { SheetT } from "../components/sheets";
export default function Appts({ tp, open }: { tp: string; open: (s: SheetT) => void }) {
  const { S } = useStore(), [seg, setSeg] = useState<"up" | "past">("up");
  const all = S.topics.filter(t => tp === "all" || t.id === tp).flatMap(t => t.appointments.map(a => ({ t, a })));
  const list = (seg === "up" ? all.filter(x => x.a.date >= D()).sort((a, b) => (a.a.date + a.a.time).localeCompare(b.a.date + b.a.time)) : all.filter(x => x.a.date < D()).sort((a, b) => b.a.date.localeCompare(a.a.date)));
  return (
    <div className="view">
      <div className="seg" role="tablist"><button className={seg === "up" ? "on" : ""} onClick={() => setSeg("up")}>קרובים</button><button className={seg === "past" ? "on" : ""} onClick={() => setSeg("past")}>עברו</button></div>
      {list.length ? <Group>{list.map(({ t, a }) => (
        <button className="row" key={a.id} onClick={() => open({ k: "appt", tid: t.id, id: a.id })}>
          <div className="date"><b>{dt(a.date).getDate()}</b><span>{dt(a.date).toLocaleDateString("he-IL", { month: "short" })}</span></div>
          <div className="g"><b>{a.doctor}</b><span className="sub">{KIND[a.kind] || a.kind} · {a.time}{a.summary ? " · יש סיכום" : ""}{tp === "all" ? " · " + t.name : ""}</span></div>
          <span className="chev"><Icon n="chev" s={18} /></span></button>))}</Group>
        : <Empty text="אין תורים להצגה" action="תור חדש" onAction={() => open({ k: "newAppt" })} />}
    </div>
  );
}
