const TOKEN = import.meta.env.VITE_NOTION_TOKEN;
const DB = "328d85fa113d8103898cd86ec5db2feb";
const API = "https://api.notion.com/v1";
const H = {
  "Authorization": `Bearer ${TOKEN}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
};

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
  eliminado: boolean;
};

function parsePage(p: any): Tudu {
  const pr = p.properties;
  return {
    id: p.id,
    title: pr["Título"]?.title?.[0]?.plain_text || "",
    tipo: pr["Tipo"]?.select?.name || "",
    categoria: pr["Categoría"]?.select?.name || "",
    estado: pr["Estado"]?.select?.name || "",
    cuando: pr["Cuando"]?.select?.name || "",
    deadline: pr["Deadline"]?.date?.start || null,
    color: pr["Color"]?.rich_text?.[0]?.plain_text || "",
    tamano: pr["Tamaño"]?.select?.name || "",
    etiquetas: pr["Etiquetas"]?.multi_select?.map((t: any) => t.name) || [],
    contenido: pr["Contenido"]?.rich_text?.[0]?.plain_text || "",
    eliminado: pr["Eliminado"]?.checkbox || false,
  };
}

function selectProp(value: string | undefined) {
  return value ? { select: { name: value } } : undefined;
}

function buildProps(data: Partial<Omit<Tudu, "id">>) {
  const props: Record<string, any> = {};
  if (data.title !== undefined)
    props["Título"] = { title: [{ text: { content: data.title } }] };
  if (data.tipo !== undefined)
    props["Tipo"] = selectProp(data.tipo);
  if (data.categoria !== undefined)
    props["Categoría"] = selectProp(data.categoria);
  if (data.estado !== undefined)
    props["Estado"] = selectProp(data.estado);
  if (data.cuando !== undefined)
    props["Cuando"] = selectProp(data.cuando);
  if (data.deadline !== undefined)
    props["Deadline"] = data.deadline ? { date: { start: data.deadline } } : { date: null };
  if (data.color !== undefined)
    props["Color"] = { rich_text: [{ text: { content: data.color } }] };
  if (data.tamano !== undefined)
    props["Tamaño"] = selectProp(data.tamano);
  if (data.etiquetas !== undefined)
    props["Etiquetas"] = { multi_select: data.etiquetas.map(name => ({ name })) };
  if (data.contenido !== undefined)
    props["Contenido"] = { rich_text: [{ text: { content: data.contenido } }] };
  if (data.eliminado !== undefined)
    props["Eliminado"] = { checkbox: data.eliminado };
  return props;
}

export async function getTudus(): Promise<Tudu[]> {
  const pages: any[] = [];
  let cursor: string | undefined;
  do {
    const body: any = { filter: { property: "Eliminado", checkbox: { equals: false } } };
    if (cursor) body.start_cursor = cursor;
    const res = await fetch(`${API}/databases/${DB}/query`, {
      method: "POST", headers: H, body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al leer tudús");
    pages.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return pages.map(parsePage);
}

export async function createTudu(data: Partial<Omit<Tudu, "id">>): Promise<Tudu> {
  const res = await fetch(`${API}/pages`, {
    method: "POST", headers: H,
    body: JSON.stringify({ parent: { database_id: DB }, properties: buildProps(data) }),
  });
  const page = await res.json();
  if (!res.ok) throw new Error(page.message || "Error al crear tudú");
  return parsePage(page);
}

export async function updateTudu(id: string, data: Partial<Omit<Tudu, "id">>): Promise<Tudu> {
  const res = await fetch(`${API}/pages/${id}`, {
    method: "PATCH", headers: H,
    body: JSON.stringify({ properties: buildProps(data) }),
  });
  const page = await res.json();
  if (!res.ok) throw new Error(page.message || "Error al actualizar tudú");
  return parsePage(page);
}

export async function deleteTudu(id: string): Promise<Tudu> {
  return updateTudu(id, { eliminado: true });
}
