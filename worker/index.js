const AIRTABLE_BASE_FALLBACK = "appKFlb55fbhaT5GJ";

const AIRTABLE_TABLES = new Set([
  "Flavors",
  "Reviews",
  "Gifts & Merch",
  "Slideshow",
  "Menu",
  "Website Branding",
  "Customer Videos",
  "Website Images",
]);

function json(payload, status = 200){
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": status === 200 ? "private, max-age=60" : "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

async function readAirtable(request, env){
  if (request.method !== "GET" && request.method !== "HEAD") {
    return json({ error: "Method not allowed" }, 405);
  }

  const table = new URL(request.url).searchParams.get("table") || "";
  if (!AIRTABLE_TABLES.has(table)) return json({ error: "Unknown table" }, 400);
  if (!env.AIRTABLE_TOKEN) return json({ error: "Content service is not configured" }, 503);

  const base = env.AIRTABLE_BASE || AIRTABLE_BASE_FALLBACK;
  const records = [];
  let offset = "";

  try {
    do {
      const api = new URL(`https://api.airtable.com/v0/${base}/${encodeURIComponent(table)}`);
      if (table === "Website Branding") api.searchParams.set("maxRecords", "20");
      else api.searchParams.set("filterByFormula", "{Show on Site}=TRUE()");
      if (offset) api.searchParams.set("offset", offset);

      const response = await fetch(api, {
        headers: { Authorization: `Bearer ${env.AIRTABLE_TOKEN}` },
      });
      if (!response.ok) return json({ error: "Content service unavailable" }, 502);

      const page = await response.json();
      records.push(...(page.records || []));
      offset = page.offset || "";
    } while (offset);

    if (request.method === "HEAD") return new Response(null, { status: 200 });
    return json({ records });
  } catch {
    return json({ error: "Content service unavailable" }, 502);
  }
}

export default {
  async fetch(request, env, ctx){
    void ctx;
    const pathname = new URL(request.url).pathname;
    if (pathname === "/api/airtable") return readAirtable(request, env);
    if (!env.ASSETS?.fetch) return new Response("Site assets unavailable", { status: 503 });
    return env.ASSETS.fetch(request);
  },
};
