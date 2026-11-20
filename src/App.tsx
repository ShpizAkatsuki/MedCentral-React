import { useState } from "react";
import { useStore } from "./state/store";
import { Icon, Sheet, Group } from "./components/ui";
import { ApptForm, ApptDetails, DocSheet, TopicSheet, VitalSheet, type SheetT } from "./components/sheets";
import RxSheet from "./components/RxSheet";
import Home from "./views/Home"; import Appts from "./views/Appts"; import Meds from "./views/Meds"; import Docs from "./views/Docs"; import More from "./views/More";
const NAV: [string, string, string][] = [["home", "בית", "home"], ["appts", "תורים", "cal"], ["meds", "תרופות", "pill"], ["docs", "מסמכים", "doc"], ["more", "עוד", "more"]];
export default function App() {
  const { S, msg } = useStore();
  const [tab, setTab] = useState("home"), [tp, setTp] = useState("all"), [sh, open] = useState<SheetT>(null);
  const close = () => open(null);
  const add = () => (S.topics.length ? open({ k: "add" }) : open({ k: "topic" }));
  const P = sh && { s: sh, open, onClose: close, tp };
  return (
    <div className="app">
      <header className="top"><h1>{tab === "home" ? "MedCentral" : NAV.find(n => n[0] === tab)![1]}</h1><button className="ib" aria-label="הוספה" onClick={add}><Icon n="plus" /></button></header>
      {tab !== "more" && <div className="chips" role="tablist" aria-label="תיקים רפואיים">
        <button className={"tc " + (tp === "all" ? "on" : "")} onClick={() => setTp("all")}>הכול</button>
        {S.topics.map(t => <button key={t.id} className={"tc " + (tp === t.id ? "on" : "")} onClick={() => setTp(t.id)}>{t.name}</button>)}
        <button className="tc add" onClick={() => open({ k: "topic" })}>+ תיק חדש</button></div>}
      {tab === "home" && <Home tp={tp} open={open} />}{tab === "appts" && <Appts tp={tp} open={open} />}{tab === "meds" && <Meds tp={tp} open={open} />}{tab === "docs" && <Docs tp={tp} open={open} />}{tab === "more" && <More open={open} />}
      <button className="fab" aria-label="הוספה" onClick={add}><Icon n="plus" s={26} /></button>
      <nav className="nav" aria-label="ניווט ראשי"><div>{NAV.map(([k, l, i]) => <button key={k} className={tab === k ? "on" : ""} aria-current={tab === k ? "page" : undefined} onClick={() => setTab(k)}><Icon n={i} s={22} />{l}</button>)}</div></nav>
      {sh?.k === "appt" && <ApptDetails {...P!} />}
      {(sh?.k === "newAppt" || sh?.k === "editAppt") && <ApptForm {...P!} />}
      {sh?.k === "rx" && <RxSheet topicId={sh.tid} apptId={sh.apptId} doctor={sh.doctor} personal={sh.personal} onClose={close} />}
      {sh?.k === "doc" && <DocSheet {...P!} />}{sh?.k === "topic" && <TopicSheet {...P!} />}{sh?.k === "vital" && <VitalSheet {...P!} />}
      {sh?.k === "add" && <Sheet title="הוספה" onClose={close}><Group>
        <button className="row" onClick={() => open({ k: "newAppt", tid: tp !== "all" ? tp : undefined })}><Icon n="cal" /><div className="g"><b>תור חדש</b></div></button>
        <button className="row" onClick={() => open({ k: "rx", tid: tp !== "all" ? tp : undefined })}><Icon n="pill" /><div className="g"><b>מרשם</b></div></button>
        <button className="row" onClick={() => open({ k: "rx", personal: true })}><Icon n="pill" /><div className="g"><b>כדור אישי (ללא תיק)</b></div></button>
        <button className="row" onClick={() => { close(); setTab("docs"); }}><Icon n="doc" /><div className="g"><b>מסמך</b></div></button></Group></Sheet>}
      {msg && <div className="toast" role="status">{msg}</div>}
    </div>
  );
}
