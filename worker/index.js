const AIRTABLE_BASE_FALLBACK = "appKFlb55fbhaT5GJ";
const ALLOWED_BROWSER_ORIGINS = new Set([
  "https://swensens-website-proposal.gsilva0r-sf.chatgpt.site",
  "https://gsilva0r-gif.github.io",
]);

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

function requestOrigin(request){
  return request.headers.get("origin") || "";
}

function isAllowedBrowserRequest(request){
  const origin = requestOrigin(request);
  return !origin || ALLOWED_BROWSER_ORIGINS.has(origin);
}

function apiHeaders(request){
  const headers = new Headers({
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "vary": "Origin",
  });
  const origin = requestOrigin(request);
  if (ALLOWED_BROWSER_ORIGINS.has(origin)) {
    headers.set("access-control-allow-origin", origin);
    headers.set("access-control-allow-methods", "GET, HEAD, OPTIONS");
    headers.set("access-control-allow-headers", "Accept");
    headers.set("access-control-max-age", "86400");
  }
  return headers;
}

function json(request, payload, status = 200){
  const headers = apiHeaders(request);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(payload), {
    status,
    headers,
  });
}

async function readAirtable(request, env){
  if (!isAllowedBrowserRequest(request)) {
    return json(request, { error: "Origin not allowed" }, 403);
  }
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: apiHeaders(request) });
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    return json(request, { error: "Method not allowed" }, 405);
  }

  const table = new URL(request.url).searchParams.get("table") || "";
  if (!AIRTABLE_TABLES.has(table)) return json(request, { error: "Unknown table" }, 400);
  if (!env.AIRTABLE_TOKEN) return json(request, { error: "Content service is not configured" }, 503);

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
        cache: "no-store",
      });
      if (!response.ok) return json(request, { error: "Content service unavailable" }, 502);

      const page = await response.json();
      records.push(...(page.records || []));
      offset = page.offset || "";
    } while (offset);

    if (request.method === "HEAD") return new Response(null, { status: 200, headers: apiHeaders(request) });
    return json(request, { records });
  } catch {
    return json(request, { error: "Content service unavailable" }, 502);
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
