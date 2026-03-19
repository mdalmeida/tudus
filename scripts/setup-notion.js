// Setup Notion database for Tudús
// Usage: NOTION_TOKEN=secret_xxx node scripts/setup-notion.js
//    or: node scripts/setup-notion.js secret_xxx

const TOKEN = process.env.NOTION_TOKEN || process.argv[2];
if (!TOKEN) {
  console.error("Error: NOTION_TOKEN requerido.\nUso: NOTION_TOKEN=secret_xxx node scripts/setup-notion.js");
  process.exit(1);
}

const PAGE_ID = "328d85fa113d80ef92d8fa4200d86d88";

const sel = (opts) => ({
  select: { options: opts.map(name => ({ name })) }
});

const msel = () => ({
  multi_select: { options: [] }
});

const properties = {
  "Título":    { title: {} },
  "Tipo":      sel(["Tarea","Idea","WhatsApp","Mail","Teams","Compra","Llamada","Decisión","Hábito","Aprender","Reflexionar","Investigar","Ejercicio","Redactar","Analizar"]),
  "Categoría": sel(["My Work","Setup Base","House & Car","Financial","Family","Social & Experiences","Skills","Health","Mindset","Inbox"]),
  "Estado":    sel(["Por hacer","Empezada","En curso","Terminando","Esperando","Listo","No lo haré"]),
  "Cuando":    sel(["Sin fecha","Hoy","Mañana","Esta semana","Próxima semana","Este mes","Algún día"]),
  "Deadline":  { date: {} },
  "Color":     { rich_text: {} },
  "Tamaño":    sel(["XS","S","M","L","XL"]),
  "Etiquetas": msel(),
  "Contenido": { rich_text: {} },
  "Eliminado": { checkbox: {} },
};

async function main() {
  console.log("Creando base de datos Tudús en Notion...");

  const res = await fetch("https://api.notion.com/v1/databases", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { type: "page_id", page_id: PAGE_ID },
      title: [{ type: "text", text: { content: "Tudús" } }],
      description: [{ type: "text", text: { content: "Base de datos principal — tareas, ideas y actividades" } }],
      properties,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Error:", data.message || JSON.stringify(data));
    process.exit(1);
  }

  console.log("Base de datos creada!");
  console.log("ID:", data.id);
  console.log("URL:", data.url);
}

main();
