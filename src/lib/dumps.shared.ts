export type DumpType = "read" | "todo" | "idea" | "note";

export type Dump = {
  id: string;
  type: DumpType;
  kind: "link" | "text";
  content: string;
  createdAt: number;
  done: boolean;
  doneAt?: number;
};

export type DbDump = {
  id: string;
  user_id: string;
  type: DumpType;
  kind: "link" | "text";
  content: string;
  done: boolean;
  created_at: string;
  done_at: string | null;
};

export function rowToDump(row: DbDump): Dump {
  return {
    id: row.id,
    type: row.type,
    kind: row.kind,
    content: row.content,
    createdAt: new Date(row.created_at).getTime(),
    done: row.done,
    doneAt: row.done_at ? new Date(row.done_at).getTime() : undefined,
  };
}

export function dumpToRow(dump: Dump, userId: string): DbDump {
  return {
    id: dump.id,
    user_id: userId,
    type: dump.type,
    kind: dump.kind,
    content: dump.content,
    done: dump.done,
    created_at: new Date(dump.createdAt).toISOString(),
    done_at: dump.doneAt ? new Date(dump.doneAt).toISOString() : null,
  };
}

export function makeDump(content: string, type: DumpType): Dump {
  const trimmed = content.trim();
  const kind: Dump["kind"] = /^https?:\/\//i.test(trimmed) ? "link" : "text";
  return {
    id: crypto.randomUUID(),
    type,
    kind,
    content: trimmed,
    createdAt: Date.now(),
    done: false,
  };
}

export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Open items (carry-over) + anything added today, even if done. */
export function activePile(dumps: Dump[]) {
  const cutoff = startOfToday();
  return dumps.filter((d) => !d.done || d.createdAt >= cutoff);
}

export function activePileFromDbRows(rows: DbDump[]): Dump[] {
  return activePile(rows.map(rowToDump));
}
