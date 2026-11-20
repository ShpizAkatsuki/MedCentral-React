import { useStore } from "../state/store";
import { Group, Cap, Dropzone, Icon } from "../components/ui";
import { he } from "../lib/utils";
import { fname, useUpload, type SheetT } from "../components/sheets";
export default function Docs({ tp, open }: { tp: string; open: (s: SheetT) => void }) {
  const { S, say } = useStore(), upload = useUpload();
  const topics = S.topics.filter(t => tp === "all" || t.id === tp);
  const docs = topics.flatMap(t => [...t.docs.map(f => ({ f, t, src: "" })), ...t.appointments.flatMap(a => a.files.map(f => ({ f, t, src: a.doctor })))]).sort((a, b) => (b.f.date || "").localeCompare(a.f.date || ""));
  const target = tp !== "all" ? tp : S.topics[0]?.id;
  return (
    <div className="view">
      <Dropzone onFiles={fs => { if (!target) return say("צרו קודם תיק רפואי"); upload(fs, (s, r) => s.topics.find((t: any) => t.id === target).docs.unshift(r)); }} />
      <Cap>{docs.length} מסמכים</Cap>
      <Group>{docs.map(({ f, t, src }) => <button className="row" key={f.id} onClick={() => open({ k: "doc", tid: t.id, id: f.id })}><Icon n="doc" /><div className="g"><b>{fname(f)}</b><span className="sub">{he(f.date)}{src ? " · " + src : ""}{f.size ? " · " + f.size : ""}</span></div><span className="chev"><Icon n="chev" s={18} /></span></button>)}</Group>
    </div>
  );
}
