import { useStore } from "../state/store";
import { Group, Cap, Empty, Icon } from "../components/ui";
import { D, he, rel, KIND, medsToday } from "../lib/utils";
import type { SheetT } from "../components/sheets";
import type { Vital } from "../types";
export default function Home({ tp, open }: { tp: string; open: (s: SheetT) => void }) {
  const { S, up } = useStore(), h = new Date().getHours();
  const greet = h < 5 ? "לילה טוב" : h < 12 ? "בוקר טוב" : h < 18 ? "צהריים טובים" : h < 22 ? "ערב טוב" : "לילה טוב";
  const next = S.topics.filter(t => tp === "all" || t.id === tp).flatMap(t => t.appointments.map(a => ({ t, a }))).filter(x => x.a.date >= D()).sort((a, b) => (a.a.date + a.a.time).localeCompare(b.a.date + b.a.time))[0];
  const meds = medsToday(S, tp), done = meds.filter(m => m.taken).length;
  const tick = (k: string) => up(s => { const key = `${D()}|${k}`; s.taken[key] = !s.taken[key]; });
  const lastV = Object.values<Vital>(S.vitals.reduce<Record<string, Vital>>((m, v) => (m[v.type] ||= v, m), {}));
  return (
    <div className="view">
      <div className="hero"><h2>{greet}</h2><span className="sub">{he(D(), { weekday: "long", day: "numeric", month: "long" })}</span>
        <div style={{ marginTop: 14 }}><button className="btn" style={{ marginTop: 0, width: "auto", padding: "0 20px" }} onClick={() => open({ k: "topic" })}>+ קטגוריה חדשה</button></div>
      </div>
      {next && <><div className="cap"><span>התור הבא</span><span className="chip pr">{rel(next.a.date)}</span></div>
        <button className="hero" style={{ width: "100%", textAlign: "start", display: "block" }} onClick={() => open({ k: "appt", tid: next.t.id, id: next.a.id })}>
          <b style={{ fontSize: 17, display: "block" }}>{next.a.doctor}</b><span className="sub">{KIND[next.a.kind]} · {next.a.time}{next.a.location ? " · " + next.a.location : ""}</span>
          {next.a.preparation && <div className="sub" style={{ marginTop: 6 }}>הכנה: {next.a.preparation}</div>}</button></>}
      <div className="cap"><span>תרופות להיום</span><span>{done}/{meds.length}</span></div>
      {meds.length ? <><Group>{meds.map(m => <button className="row" key={m.key} onClick={() => tick(m.key)}><span className={"ck " + (m.taken ? "on" : "")}>{m.taken && <Icon n="check" s={14} />}</span><div className="g"><b className={m.taken ? "on-t" : ""}>{m.name}</b><span className="sub">{m.dosage} · {m.topic}</span></div></button>)}</Group><div className="bar"><i style={{ width: `${(done / meds.length) * 100}%` }} /></div></> : <Empty text="אין תרופות פעילות להיום" />}
      {lastV.length > 0 && <><Cap>מדדים אחרונים</Cap><Group>{lastV.map(v => <div className="row" key={v.id}><div className="g"><span className="sub">{v.type}</span></div><b>{v.value}</b></div>)}</Group></>}
    </div>
  );
}
