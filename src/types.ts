export type Dose = { q: string; w: string; t?: string; legacy?: number };
export type Cycle = { id: string; start: string; end: string; doses: Dose[] };
export type Rx = { id: string; name: string; doctor: string; dosage: string; appt?: string; cycles: Cycle[] };
export type FileRef = { id: string; name?: string; title?: string; date?: string; type?: string; size?: string; note?: string; dv?: string };
export type Appt = { id: string; kind: string; doctor: string; date: string; time: string; location: string; preparation: string; notes: string; summary: string; files: FileRef[] };
export type Topic = { id: string; name: string; icon: string; appointments: Appt[]; prescriptions: Rx[]; docs: FileRef[]; notes: { id: string; date: string; text: string }[] };
export type Vital = { id: string; type: string; value: string; date: string; time?: string };
export type State = { view?: string; topics: Topic[]; meds: Rx[]; vitals: Vital[]; taken: Record<string, boolean>; upd?: number };
