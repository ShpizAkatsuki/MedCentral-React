import type { ReactNode } from "react";
const P: Record<string, string> = { home: "M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z", cal: "M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z", pill: "M10.5 20.5a4.95 4.95 0 0 1-7-7l10-10a4.95 4.95 0 0 1 7 7zM8.5 8.5l7 7", doc: "M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7zM14 3v4h4M9 13h6M9 17h6", more: "M5 12h.01M12 12h.01M19 12h.01", plus: "M12 5v14M5 12h14", dots: "M12 5h.01M12 12h.01M12 19h.01", chev: "M15 6l-6 6 6 6", check: "M5 12.5l4.5 4.5L19 7", x: "M6 6l12 12M18 6L6 18", pin: "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z", up: "M12 16V4M7 9l5-5 5 5M5 20h14", moon: "M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z" };
export const Icon = ({ n, s = 20 }: { n: string; s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={P[n]} /></svg>
);
export const Sheet = ({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) => (
  <div className="scrim" onClick={onClose}><div className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
    <div className="grab" /><div className="sh"><b>{title}</b><button className="ib" aria-label="סגור" onClick={onClose}><Icon n="x" /></button></div>{children}
  </div></div>
);
export const Group = ({ children }: { children: ReactNode }) => <div className="grp">{children}</div>;
export const Cap = ({ children, end }: { children: ReactNode; end?: ReactNode }) => <div className="cap"><span>{children}</span>{end && <span>{end}</span>}</div>;
export const Empty = ({ text, action, onAction }: { text: string; action?: string; onAction?: () => void }) => (
  <div className="empty"><p>{text}</p>{action && <button className="btn" style={{ width: "auto", padding: "0 22px" }} onClick={onAction}>{action}</button>}</div>
);
export const Field = ({ label, children }: { label: string; children: ReactNode }) => <div className="fld"><label>{label}</label>{children}</div>;
export const Dropzone = ({ onFiles }: { onFiles: (f: File[]) => void }) => (
  <label className="dz"
    onDragOver={e => e.preventDefault()}
    onDrop={e => { e.preventDefault(); onFiles([...e.dataTransfer.files]); }}>
    <Icon n="up" s={26} /><b>גררו קבצים או לחצו להעלאה</b><span className="sub">צילום, גלריה או קבצים מהמכשיר</span>
    <input type="file" multiple hidden accept="image/*,application/*,text/*" onChange={e => { onFiles([...(e.target.files || [])]); e.target.value = ""; }} />
  </label>
);
