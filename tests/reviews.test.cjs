const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const postcss = require('postcss');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'reviews.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'reviews-gelato.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'reviews-gelato.js'), 'utf8');

test('Reviews page follows the Swensens love-note scrapbook flow', () => {
  const sections = [
    'lovebook-hero',
    'lovebook-notes',
    'lovebook-keepsakes',
    'lovebook-platforms',
    'lovebook-legacy',
    'lovebook-video',
    'lovebook-invite'
  ];
  sections.forEach(section => assert.match(html, new RegExp(`class="[^"]*${section}`)));
  assert.match(html, /id="featured-review-card"/);
  assert.match(html, /id="reviews-grid"/);
  assert.match(html, /data-review-platform="Google"/);
  assert.match(html, /data-review-platform="Yelp"/);
  assert.match(html, /data-review-platform="Tripadvisor"/);
  assert.match(html, /class="lovebook-platform-shell"/);
  assert.match(html, /data-airtable-image="Reviews · Hero Team"/);
  assert.match(html, /data-airtable-image="Reviews · Best of the Bay Area Team"/);
});

test('Every Reviews Polaroid is square and uses a real photograph', () => {
  assert.match(css, /\.lovebook-float\{[\s\S]*?aspect-ratio:1\/1/);
  assert.match(css, /\.keepsake:not\(\.keepsake-small-note\)\{[\s\S]*?aspect-ratio:1\/1/);
  assert.doesNotMatch(html, /reviews-happy-(?:inside|outside)\.png/);
  assert.doesNotMatch(html, /reviews-kid-drawing-(?:sundae|corner)-v2\.webp/);
  assert.match(html, /assets\/reviews-polaroid-team\.jpeg/);
  assert.match(html, /assets\/reviews-polaroid-friends\.jpeg/);
  assert.match(html, /assets\/storefront-evening-original\.png/);
  assert.match(html, /assets\/best-of-bay-area-team\.png/);
});

test('Reviews imagery remains editable', () => {
  const images = [...html.matchAll(/<img\b[^>]*>/g)].map(match => match[0]);
  assert.ok(images.length >= 4);
  images.forEach(image => {
    assert.ok(
      image.includes('data-airtable-image') || image.includes('data-site-logo'),
      `Missing editable-image hook: ${image}`
    );
  });
  assert.match(html, /data-airtable-bg="Reviews · Guest Video Cover"/);
});

test('Reviews styling and rail interaction are valid and responsive', () => {
  assert.doesNotThrow(() => postcss.parse(css));
  assert.match(css, /@media \(max-width:1040px\)/);
  assert.match(css, /@media \(max-width:760px\)/);
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)/);
  assert.match(js, /scrollBy/);
  assert.match(js, /MutationObserver/);
  assert.match(css, /\.lovebook-platform-shell\{[\s\S]*?grid-template-columns:/);
  assert.match(css, /body\[data-page="reviews"\] \.reviews-platform-tabs\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
});

test('All local Reviews page references resolve', () => {
  const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]);
  const localReferences = references
    .filter(reference => !/^(?:https?:|#|mailto:|tel:)/.test(reference))
    .map(reference => reference.split(/[?#]/, 1)[0]);
  const missing = localReferences.filter(reference => !fs.existsSync(path.join(root, reference)));
  assert.deepEqual(missing, []);
});
