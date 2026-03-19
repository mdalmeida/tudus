export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({ status: "ok" });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.NOTION_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "NOTION_TOKEN not configured" });
  }

  const { endpoint, method, body } = req.body;
  if (!endpoint) {
    return res.status(400).json({ error: "Missing endpoint" });
  }

  try {
    const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
      method: method || "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
