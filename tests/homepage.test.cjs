const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const postcss = require('postcss');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'site.js'), 'utf8');
const homepageSource = fs.readFileSync(path.join(root, 'homepage.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'homepage.css'), 'utf8');
// Evaluate only pure rendering helpers: no configuration, network, or page boot.
const context = vm.createContext({});
vm.runInContext(
  source.slice(source.indexOf('function esc('), source.indexOf('async function fetchTable(')) +
  source.slice(source.indexOf('function promotionSlidesHTML('), source.indexOf('function buildSlideshow(')),
  context
);
const render = records => context.promotionSlidesHTML(records);
const fall = { Caption:'Fall flavors have arrived.', 'Promo Label':'Pumpkin + Black Licorice', Destination:'menu.html', 'Button Label':'See Fall Flavors' };

test('sign is first, promotions second; old text-overlay hero is absent', () => {
  assert.ok(html.indexOf('class="brand-intro"') < html.indexOf('id="promotions"'));
  assert.match(html, /class="visually-hidden">The Original Swensen’s/);
  assert.match(html, /class="brand-logo-animation"/);
  assert.match(html, /data-animation-src="assets\/swensens-logo-animation-fast-v1\.png"/);
  assert.match(html, /data-static-src="assets\/swensens-logo-final-transparent\.png"/);
  assert.doesNotMatch(html, /class="brand-signature"|original-handwriting/);
  assert.doesNotMatch(html, /campaign-card|campaign-wash|hero-campaigns/);
});

test('approved logo starts once after page load and the animation itself does not loop', () => {
  assert.match(homepageSource, /window\.addEventListener\('load', startWhenImagesAreConfigured, \{once:true\}\)/);
  assert.match(homepageSource, /window\.swensensImagesReady/);
  assert.match(homepageSource, /logo\.dataset\.animationSrc/);
  const animation = fs.readFileSync(path.join(root, 'assets', 'swensens-logo-animation-fast-v1.png'));
  const control = animation.indexOf(Buffer.from('acTL'));
  assert.ok(control > -1, 'animated PNG control chunk is present');
  assert.equal(animation.readUInt32BE(control + 8), 1, 'APNG is configured for one play');
});

test('default fall art is responsive and the whole slide links to the menu', () => {
  const result = render([fall]);
  assert.match(result, /href="menu.html"/);
  assert.match(result, /src="assets\/swensens-autumn-landscape.png"/);
  assert.match(result, /srcset="assets\/swensens-autumn-portrait.png"/);
  assert.doesNotMatch(result, /campaign-card|campaign-wash/);
});

test('Airtable replacement wins on every device, not only desktop', () => {
  const result = render([{ ...fall, Image:[{url:'https://example.com/new-ad.jpg'}] }]);
  assert.match(result, /src="https:\/\/example.com\/new-ad.jpg"/);
  assert.doesNotMatch(result, /swensens-autumn|<source/);
});

test('optional phone attachment is used independently of desktop', () => {
  const result = render([{ ...fall, Image:[{url:'https://example.com/wide.jpg'}], 'Mobile Image':[{url:'https://example.com/tall.jpg'}] }]);
  assert.match(result, /src="https:\/\/example.com\/wide.jpg"/);
  assert.match(result, /srcset="https:\/\/example.com\/tall.jpg"/);
});

test('empty photo records are skipped; new records create additional slides', () => {
  assert.equal(render([{Caption:'No image'}]), '');
  const result = render([fall, {Caption:'A second offer', Image:[{url:'https://example.com/image.jpg'}], Destination:'contact.html'}]);
  assert.equal((result.match(/class="slide promotion-slide"/g) || []).length, 2);
  assert.match(result, /href="contact.html"/);
});

test('record text is escaped and unsupported destinations cannot execute scripts', () => {
  const result = render([{ ...fall, Caption:'<script>alert("test")</script>', Destination:'javascript:alert(1)' }]);
  assert.doesNotMatch(result, /<script>|href="javascript:/);
  assert.match(result, /&lt;script&gt;/);
  assert.match(result, /href="index.html"/);
});

test('carousel renders inactive slides unfocusable until initialized', () => {
  const result = render([fall]);
  assert.match(result, /tabindex="-1" aria-hidden="true" inert/);
  assert.match(source, /slide\.toggleAttribute\("inert", !active\)/);
  assert.match(source, /document\.hidden/);
  assert.match(source, /motionPreference\.matches/);
  assert.match(source, /threshold:\.2/);
  assert.match(source, /setTimeout\(\(\) => container\.classList\.remove\("controls-awake"\), 900\)/);
  assert.doesNotMatch(html, /Pause slides|data-promotion-playback/);
});

test('popular flavors use an unstretched Victorian portrait frame, not boxed cards', () => {
  const sheet = postcss.parse(css);
  const frame = sheet.nodes.find(node => node.selector === '#home-favorites .popular-portrait::after');
  assert.ok(frame);
  assert.ok(frame.nodes.some(node => node.prop === 'content' && node.value === '""'));
  assert.ok(frame.nodes.some(node => node.prop === 'position' && node.value === 'absolute'));
  assert.ok(frame.nodes.some(node => node.prop === 'pointer-events' && node.value === 'none'));
  assert.ok(frame.nodes.some(node => node.prop === 'inset' && node.value === '0'));
  assert.ok(frame.nodes.some(node => node.prop === 'background' && node.value.includes('popular-victorian-frame-v1.png')));
  assert.ok(!frame.nodes.some(node => node.prop.startsWith('border-image')));
  assert.match(css, /#home-favorites \.popular-portrait\{[\s\S]*?aspect-ratio:1\/1/);
  assert.match(css, /#home-favorites\.popular-grid \.card\{[\s\S]*?background:transparent;border:0;border-radius:0;box-shadow:none/);
  assert.match(css, /#home-favorites \.popular-portrait > \.card-photo\{[\s\S]*?border-radius:50%/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});

test('popular flavor portraits keep descriptions and allergen disclosures', () => {
  assert.equal((html.match(/class="popular-portrait"/g) || []).length, 3);
  assert.equal((html.match(/class="popular-card-copy"/g) || []).length, 3);
  assert.equal((html.match(/<details class="allergen-details">/g) || []).length, 3);
  assert.match(source, /portraitMode:true/);
  assert.match(source, /allergenMode:"details"/);
  assert.match(source, /<div class="popular-portrait">\$\{photoOrCone\(f\)\}<\/div>/);
});

test('all local homepage references resolve, including campaign artwork and frame', () => {
  for (const match of html.matchAll(/(?:src|href|srcset)="([^"#?]+)(?:[?#][^"]*)?"/g)) {
    const value = match[1];
    if (/^(?:https?:|data:|mailto:|tel:)/.test(value)) continue;
    assert.ok(fs.existsSync(path.resolve(root, value)), `Missing local reference: ${value}`);
  }
  assert.ok(fs.existsSync(path.join(root, 'assets/popular-victorian-frame-v1.png')));
});

test('homepage keeps all three platform choices visible above one changing review card', () => {
  assert.match(html, /class="home-fan-club home-review-carousel"/);
  assert.match(html, /class="home-review-platform-switcher[^\"]*" id="reviews-grid"/);
  assert.match(html, /data-review-platform="Google"/);
  assert.match(html, /data-review-platform="Yelp"/);
  assert.match(html, /data-review-platform="Tripadvisor"/);
  assert.equal((html.match(/<article class="home-review-feature">/g) || []).length, 1);
  assert.match(html, /data-home-review-dir="-1"/);
  assert.match(html, /data-home-review-dir="1"/);
  assert.doesNotMatch(html, /data-home-review-playback|Pause rotation/);
  assert.doesNotMatch(source, /data-home-review-playback|Resume automatic review rotation/);
});

test('homepage review switcher remains Airtable-driven with up to three notes per source', () => {
  assert.match(source, /const platformOrder = \["Google", "Yelp", "Tripadvisor"\]/);
  assert.match(source, /groups\[platform\].*slice\(0, 3\)/s);
  assert.match(source, /entries = groups\[activePlatform\]/);
  assert.match(source, /quote\.textContent/);
  assert.match(source, /review\["Customer Name"\]/);
  assert.match(source, /review\["Quote"\]/);
});

test('mobile review section includes the supplied Polaroid photos', () => {
  assert.match(html, /mobile-review-polaroid-top/);
  assert.match(html, /assets\/reviews-polaroid-team\.jpeg/);
  assert.match(html, /mobile-review-polaroid-bottom/);
  assert.match(html, /assets\/reviews-polaroid-friends\.jpeg/);
  assert.match(html, /data-airtable-image="Home · Mobile Review Polaroid Team"/);
  assert.match(html, /data-airtable-image="Home · Mobile Review Polaroid Friends"/);
});

test('review background keeps its Polaroid wall while the fixed platform row and card remain mobile friendly', () => {
  assert.match(html, /class="review-polaroid-wall"/);
  assert.match(html, /review-wall-polaroid-6/);
  assert.doesNotMatch(html, /Swipe the card to browse reviews/);
  assert.match(source, /showcase\.addEventListener\("touchstart"/);
  const sharedStyles = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  assert.match(sharedStyles, /\.home-review-platform-switcher\{[\s\S]*?grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(sharedStyles, /@media \(max-width:650px\)\{[\s\S]*?\.home-review-platform-tab\{[\s\S]*?flex-direction:column/);
  assert.doesNotMatch(sharedStyles, /\.home-review-trio\{/);
  assert.match(sharedStyles, /\.home-review-carousel::before\{\s*content:none;\s*display:none;\s*\}/);
  assert.doesNotMatch(sharedStyles, /\.home-review-carousel::after\s*\{/);
});

test('homepage promotion copy is bold and unboxed while the merch crop favors the people', () => {
  assert.match(css, /\.promotion-caption\{[\s\S]*?border:0;background:transparent;box-shadow:none/);
  assert.match(css, /\.promotion-label\{[\s\S]*?background:transparent;color:var\(--cherry\)/);
  assert.match(css, /\.promotion-caption-copy::after\{[\s\S]*?background:linear-gradient/);
  const sharedStyles = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
  assert.match(sharedStyles, /@media \(max-width:600px\)\{[\s\S]*?\.home-merch-image\{background-position:72% 42%;\}/);
});
