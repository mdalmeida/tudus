import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY,
);

export type Subtarea = { id: number; titulo: string; done: boolean };

export type Tudu = {
  id: string;
  title: string;
  tipo: string;
  categoria: string;
  estado: string;
  cuando: string;
  deadline: string | null;
  color: string;
  tamano: string;
  etiquetas: string[];
  contenido: string;
  orden: number;
  eliminado: boolean;
  pos_x: number;
  pos_y: number;
  subtareas: Subtarea[];
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function rowToTudu(r: any): Tudu {
  return {
    id: r.id,
    title: r.titulo ?? "",
    tipo: r.tipo ?? "",
    categoria: r.categoria ?? "",
    estado: r.estado ?? "",
    cuando: r.cuando ?? "",
    deadline: r.deadline ?? null,
    color: r.color ?? "",
    tamano: r.tamano ?? "",
    etiquetas: r.etiquetas ?? [],
    contenido: r.contenido ?? "",
    orden: r.orden ?? 0,
    eliminado: r.eliminado ?? false,
    pos_x: r.pos_x ?? 0,
    pos_y: r.pos_y ?? 0,
    subtareas: r.subtareas ?? [],
  };
}

function tuduToRow(data: Partial<Omit<Tudu, "id">>): Record<string, any> {
  const row: Record<string, any> = {};
  if (data.title !== undefined) row.titulo = data.title;
  if (data.tipo !== undefined) row.tipo = data.tipo;
  if (data.categoria !== undefined) row.categoria = data.categoria;
  if (data.estado !== undefined) row.estado = data.estado;
  if (data.cuando !== undefined) row.cuando = data.cuando;
  if (data.deadline !== undefined) {
    if (data.deadline) {
      // Normalize to ISO YYYY-MM-DD — handles dd/mm/yyyy, locale strings, etc.
      const d = new Date(data.deadline);
      row.deadline = !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : data.deadline;
    } else {
      row.deadline = null;
    }
  }
  if (data.color !== undefined) row.color = data.color;
  if (data.tamano !== undefined) row.tamano = data.tamano;
  if (data.etiquetas !== undefined) row.etiquetas = data.etiquetas;
  if (data.contenido !== undefined) row.contenido = data.contenido;
  if (data.orden !== undefined) row.orden = data.orden;
  if (data.eliminado !== undefined) row.eliminado = data.eliminado;
  if ((data as any).pos_x !== undefined) row.pos_x = (data as any).pos_x;
  if ((data as any).pos_y !== undefined) row.pos_y = (data as any).pos_y;
  if ((data as any).subtareas !== undefined) row.subtareas = (data as any).subtareas;
  return row;
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

export async function getTudus(): Promise<Tudu[]> {
  const { data, error } = await supabase
    .from("tudus")
    .select("*")
    .eq("eliminado", false)
    .order("orden", { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []).map(rowToTudu);
}

export async function createTudu(
  input: Partial<Omit<Tudu, "id">>,
): Promise<Tudu> {
  const { data, error } = await supabase
    .from("tudus")
    .insert(tuduToRow(input))
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToTudu(data);
}

export async function updateTudu(
  id: string,
  input: Partial<Omit<Tudu, "id">>,
): Promise<Tudu> {
  const { data, error } = await supabase
    .from("tudus")
    .update(tuduToRow(input))
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToTudu(data);
}

export async function deleteTudu(id: string): Promise<Tudu> {
  return updateTudu(id, { eliminado: true });
}

// ── Orden ───────────────────────────────────────────────────────────────────

export async function getNextOrden(): Promise<number> {
  const { data, error } = await supabase
    .from("tudus")
    .select("orden")
    .order("orden", { ascending: false })
    .limit(1);
  if (error) throw new Error(error.message);
  return (data && data.length > 0 ? data[0].orden : 0) + 1;
}

// ── Trash ───────────────────────────────────────────────────────────────────

export async function getDeletedTudus(): Promise<Tudu[]> {
  const { data, error } = await supabase
    .from("tudus")
    .select("*")
    .eq("eliminado", true)
    .order("orden", { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []).map(rowToTudu);
}

export async function restoreTudu(id: string): Promise<Tudu> {
  return updateTudu(id, { eliminado: false });
}

export async function permanentDeleteTudu(id: string): Promise<void> {
  const { error } = await supabase
    .from("tudus")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Supabase ping ───────────────────────────────────────────────────────────

export async function pingSupabase(): Promise<boolean> {
  try {
    const { error } = await supabase.from("tudus").select("id").limit(1);
    return !error;
  } catch {
    return false;
  }
}

// ── Page content ─────────────────────────────────────────────────────────────
// In Supabase the content lives in the `contenido` column directly,
// so these are thin wrappers that keep the same API as the Notion version.

export async function getPageContent(pageId: string): Promise<string> {
  const { data, error } = await supabase
    .from("tudus")
    .select("contenido")
    .eq("id", pageId)
    .single();
  if (error) throw new Error(error.message);
  return data?.contenido ?? "";
}

export async function updatePageContent(
  pageId: string,
  text: string,
): Promise<void> {
  const { error } = await supabase
    .from("tudus")
    .update({ contenido: text })
    .eq("id", pageId);
  if (error) throw new Error(error.message);
}
