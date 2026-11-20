let db: Promise<IDBDatabase> | null = null;
const open = () => (db ||= new Promise((res, rej) => { const r = indexedDB.open("medcentral-files", 1); r.onupgradeneeded = () => r.result.createObjectStore("f"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }));
const tx = async <T,>(m: IDBTransactionMode, f: (s: IDBObjectStore) => IDBRequest<T>) => { const d = await open(); return new Promise<T>((res, rej) => { const r = f(d.transaction("f", m).objectStore("f")); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); };
export const putFile = (id: string, b: Blob) => tx("readwrite", s => s.put(b, id));
export const getFile = (id: string) => tx<Blob | undefined>("readonly", s => s.get(id));
export const delFile = (id: string) => tx("readwrite", s => s.delete(id)).catch(() => {});
export async function download(id: string, name: string) {
  const b = await getFile(id); if (!b) return false;
  const u = URL.createObjectURL(b), a = document.createElement("a"); a.href = u; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(u), 1e4); return true;
}
