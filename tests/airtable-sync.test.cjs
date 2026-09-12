const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const siteSource = fs.readFileSync(path.join(root, 'site.js'), 'utf8');
const workerSource = fs.readFileSync(path.join(root, 'worker', 'index.js'), 'utf8');
const endpointSource = siteSource.slice(0, siteSource.indexOf('const TABLES'));

function endpointFor(hostname, override = '') {
  return vm.runInNewContext(
    endpointSource + '\nAIRTABLE_API_ENDPOINT;',
    { window: { location: { hostname }, SWENSENS_AIRTABLE_API: override } }
  );
}

async function loadWorker() {
  return (await import(`data:text/javascript,${encodeURIComponent(workerSource)}`)).default;
}

test('GitHub Pages uses the live Sites endpoint while Sites stays same-origin', () => {
  assert.equal(
    endpointFor('gsilva0r-gif.github.io'),
    'https://swensens-website-proposal.gsilva0r-sf.chatgpt.site/api/airtable'
  );
  assert.equal(endpointFor('swensens-website-proposal.gsilva0r-sf.chatgpt.site'), '/api/airtable');
  assert.equal(endpointFor('example.test', 'https://content.example.test/api'), 'https://content.example.test/api');
  assert.match(siteSource, /&fresh=" \+ Date\.now\(\)/);
  assert.match(siteSource, /cache: "no-store"/);
});

test('worker returns fresh Airtable data to the exact GitHub Pages origin', async t => {
  const originalFetch = global.fetch;
  let upstreamRequest;
  global.fetch = async (request, init = {}) => {
    upstreamRequest = { url: String(request), headers: new Headers(init.headers) };
    return new Response(JSON.stringify({ records: [{ id: 'rec-live', fields: { Name: 'Live' } }] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };
  t.after(() => { global.fetch = originalFetch; });

  const worker = await loadWorker();
  const request = new Request('https://site.test/api/airtable?table=Flavors', {
    headers: { Origin: 'https://gsilva0r-gif.github.io' },
  });
  const response = await worker.fetch(request, { AIRTABLE_TOKEN: 'server-only-token' }, {});
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('access-control-allow-origin'), 'https://gsilva0r-gif.github.io');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(body.records[0].id, 'rec-live');
  assert.equal(upstreamRequest.headers.get('authorization'), 'Bearer server-only-token');
  assert.match(upstreamRequest.url, /filterByFormula=%7BShow(?:\+|%20)on(?:\+|%20)Site%7D%3DTRUE%28%29/);
});

test('worker supports CORS preflight and rejects other browser origins', async () => {
  const worker = await loadWorker();
  const allowed = await worker.fetch(new Request('https://site.test/api/airtable', {
    method: 'OPTIONS',
    headers: { Origin: 'https://gsilva0r-gif.github.io' },
  }), {}, {});
  assert.equal(allowed.status, 204);
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://gsilva0r-gif.github.io');
  assert.equal(allowed.headers.get('access-control-allow-methods'), 'GET, HEAD, OPTIONS');

  const rejected = await worker.fetch(new Request('https://site.test/api/airtable?table=Flavors', {
    headers: { Origin: 'https://attacker.example' },
  }), { AIRTABLE_TOKEN: 'server-only-token' }, {});
  assert.equal(rejected.status, 403);
  assert.equal(rejected.headers.get('access-control-allow-origin'), null);
  assert.doesNotMatch(workerSource, /access-control-allow-origin["']?\s*[:,]\s*["']\*/i);
});
