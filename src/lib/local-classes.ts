import type { Database } from "@/integrations/supabase/types";

export type ClassRow = Database["public"]["Tables"]["classes"]["Row"];

const KEY = "minval_classes";

function now() {
  return new Date().toISOString();
}

export function readLocalClasses(): ClassRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ClassRow[]) : [];
  } catch {
    return [];
  }
}

function writeLocalClasses(rows: ClassRow[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(rows));
}

export function saveLocalClass(row: Record<string, unknown>): ClassRow {
  const rows = readLocalClasses();
  const id = (row["id"] as string) ?? crypto.randomUUID();
  const base: ClassRow = {
    id,
    program: String(row["program"] ?? ""),
    name: String(row["name"] ?? ""),
    level: String(row["level"] ?? ""),
    instructor_name: String(row["instructor_name"] ?? ""),
    schedule: String(row["schedule"] ?? ""),
    notes: String(row["notes"] ?? ""),
    created_at: now(),
    updated_at: now(),
  };
  const idx = rows.findIndex((r) => r.id === id);
  if (idx >= 0) rows[idx] = { ...rows[idx], ...base, created_at: rows[idx]!.created_at };
  else rows.push(base);
  writeLocalClasses(rows);
  return base;
}

export function removeLocalClass(id: string) {
  writeLocalClasses(readLocalClasses().filter((r) => r.id !== id));
}
