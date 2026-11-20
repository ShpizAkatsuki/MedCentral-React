import { createContext, useContext, useState, type ReactNode } from "react";
import type { State } from "../types";
import { norm } from "../lib/utils";
const KEY = "medcentral-html-v1"; // אותו מפתח כמו בגרסה הישנה, כך שהנתונים נטענים כמות שהם
const load = (): State => { try { return norm(JSON.parse(localStorage.getItem(KEY) || "null")); } catch { return norm(null); } };
const persist = (s: State) => { try { localStorage.setItem(KEY, JSON.stringify(s)); localStorage.setItem("mc-pend", "1"); } catch { /* storage full */ } };
type Ctx = { S: State; up: (f: (s: State) => void) => void; replace: (s: State) => void; say: (m: string) => void; msg: string };
const C = createContext<Ctx>(null as any);
export const useStore = () => useContext(C);
export function Provider({ children }: { children: ReactNode }) {
  const [S, set] = useState<State>(load), [msg, setMsg] = useState("");
  const up = (f: (s: State) => void) => set(p => { const n = structuredClone(p); f(n); n.upd = Date.now(); persist(n); return n; });
  const replace = (s: State) => { const n = norm(s); n.upd = Date.now(); persist(n); set(n); };
  const say = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 1800); };
  return <C.Provider value={{ S, up, replace, say, msg }}>{children}</C.Provider>;
}
