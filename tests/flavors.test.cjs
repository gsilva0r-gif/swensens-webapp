const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'flavors.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const source = fs.readFileSync(path.join(root, 'site.js'), 'utf8');

test('seasonal and favorite flavors use distinct unstretched Victorian medallions', () => {
  assert.match(css, /body\[data-page="flavors"\] \.band-redlight \.sec-head\{[\s\S]*?text-align:center;/);
  assert.match(css, /body\[data-page="flavors"\] \.feature-card\.seasonal-medallion\{[\s\S]*?background:transparent;border:0;border-radius:0;box-shadow:none;/);
  assert.match(css, /body\[data-page="flavors"\] \.feature-card\.seasonal-medallion::after\{display:none;\}/);
  assert.match(css, /body\[data-page="flavors"\] \.seasonal-portrait\{[\s\S]*?aspect-ratio:1\/1/);
  assert.match(css, /\.seasonal-portrait::after\{[\s\S]*?seasonal-autumn-medallion-frame-v1\.png/);
  assert.match(css, /\.seasonal-portrait > img\.card-photo\{[\s\S]*?border-radius:50%[\s\S]*?clip-path:ellipse/);
  assert.match(css, /body\[data-page="flavors"\] #flavors-favorites \.card:not\(\.ghost\)\{[\s\S]*?background:transparent;border:0;border-radius:0;box-shadow:none;/);
  assert.match(css, /body\[data-page="flavors"\] #flavors-favorites \.popular-portrait\{[\s\S]*?aspect-ratio:1\/1/);
  assert.match(css, /#flavors-favorites \.popular-portrait::after\{[\s\S]*?popular-victorian-frame-v1\.png/);
  assert.match(css, /#flavors-favorites \.card:not\(\.ghost\) \.popular-portrait > img\.card-photo\{[\s\S]*?border-radius:50%[\s\S]*?clip-path:ellipse/);
  assert.doesNotMatch(css, /border-image-repeat:stretch/);
});

test('seasonal and favorite medallions retain descriptions and allergen details', () => {
  assert.equal((html.match(/class="seasonal-portrait"/g) || []).length, 2);
  assert.equal((html.match(/class="seasonal-card-copy"/g) || []).length, 2);
  assert.equal((html.match(/class="popular-portrait"/g) || []).length, 2);
  assert.equal((html.match(/class="popular-card-copy"/g) || []).length, 2);
  assert.equal((html.match(/<details class="allergen-details">/g) || []).length >= 8, true);
  assert.match(source, /if \(seasonalBox && seasonal\.length\)[\s\S]*?feature-card seasonal-medallion[\s\S]*?seasonal-portrait[\s\S]*?seasonal-card-copy[\s\S]*?allergenDetailsHTML\(s\)/);
  assert.match(source, /if \(favBox && favs\.length\)[\s\S]*?extraClass:"popular-card"[\s\S]*?allergenMode:"details"[\s\S]*?portraitMode:true/);
  assert.ok(fs.existsSync(path.join(root, 'assets', 'popular-victorian-frame-v1.png')));
  assert.ok(fs.existsSync(path.join(root, 'assets', 'seasonal-autumn-medallion-frame-v1.png')));
});

test('regular flavors are frameless ovals with Airtable-first photos and allergens below', () => {
  assert.equal((html.match(/class="regular-portrait"/g) || []).length, 4);
  assert.equal((html.match(/class="regular-card-copy"/g) || []).length, 4);
  assert.match(css, /#flavors-regular \.card\.regular-card\{[\s\S]*?background:transparent;border:0;border-radius:0;box-shadow:none;/);
  assert.match(css, /body\[data-page="flavors"\] \.regular-portrait\{[\s\S]*?aspect-ratio:4\/5[\s\S]*?border-radius:50%/);
  assert.match(css, /\.regular-portrait > img\.card-photo\{[\s\S]*?border-radius:inherit/);
  assert.doesNotMatch(css, /\.regular-portrait::after/);
  assert.match(source, /if \(regBox && regs\.length\)[\s\S]*?extraClass:"regular-card"[\s\S]*?allergenMode:"details"[\s\S]*?ovalMode:true/);
  assert.match(source, /if \(options\.ovalMode\)[\s\S]*?regular-portrait[\s\S]*?regular-card-copy[\s\S]*?allergenContent/);
  assert.match(source, /const source = attachment \|\| remote \|\| FLAVOR_PHOTO_FALLBACKS/);
  [
    'flavor-sticky-chewy-chocolate-v1.webp',
    'flavor-fresh-strawberry-v1.webp',
    'flavor-swiss-orange-chip-v1.webp',
    'flavor-old-fashioned-vanilla-v1.webp'
  ].forEach(filename => assert.ok(fs.existsSync(path.join(root, 'assets', filename))));
});

test('seasonal artwork keeps its proportions on mobile', () => {
  assert.match(css, /--airtable-autumn-backdrop-desktop,url\("assets\/autumn-leaf-backdrop-v2\.webp"\)\) center \/ cover no-repeat/);
  assert.match(css, /--airtable-autumn-backdrop-mobile,url\("assets\/autumn-leaf-backdrop-mobile-v2\.webp"\)\) top center \/ 100% auto repeat-y/);
});

test('filter trigger keeps the branded treatment while docking to the side', () => {
  assert.match(html, /<small>Find your scoop<\/small><strong>Filter<\/strong>/);
  assert.match(css, /\.flavor-edge-tab\{[\s\S]*?top:50%;right:0;bottom:auto;[\s\S]*?width:78px;min-height:176px;/);
  assert.match(css, /@media \(max-width:600px\)\{[\s\S]*?\.flavor-edge-tab\{[\s\S]*?width:70px;min-height:154px;/);
  assert.match(css, /transform:translateY\(calc\(-50% \+ var\(--flavor-filter-boundary-shift,0px\)\)\)/);
  assert.match(source, /function initFlavorFilterBoundary\(\)[\s\S]*?lastVisibleSection[\s\S]*?sectionBottom[\s\S]*?--flavor-filter-boundary-shift/);
  assert.match(source, /window\.addEventListener\("scroll", schedule, \{ passive:true \}\)/);
  assert.match(css, /@keyframes flavorFilterGlow/);
});

test('mobile footer removes Explore, uses social icons, and keeps a clean weekly list last', () => {
  assert.match(source, /section\.classList\.add\("footer-explore"\)/);
  assert.match(source, /footer-social-icon/);
  assert.match(css, /body > footer \.foot-grid-with-hours\{[\s\S]*?grid-template-columns:1fr!important/);
  assert.match(css, /body > footer \.footer-explore\{display:none!important;\}/);
  assert.match(css, /body > footer \.footer-social-name\{position:absolute;/);
  assert.match(css, /body > footer \.footer-hours tbody\{display:table-row-group!important;\}/);
  assert.match(css, /body > footer \.foot-bottom span:last-child\{display:none;\}/);
});

test('flavor allergen disclosure is visually centered as one group', () => {
  assert.match(css, /body\[data-page="flavors"\] \.allergen-details summary\{[\s\S]*?display:inline-flex!important[\s\S]*?justify-content:center/);
  assert.match(css, /body\[data-page="flavors"\] \.allergen-details summary::after\{[\s\S]*?position:static!important/);
  assert.match(css, /body\[data-page="flavors"\] \.allergen-unlisted\{[\s\S]*?margin:10px auto 0!important[\s\S]*?text-align:center!important/);
});

test('made-by-hand story uses an editorial craft layout while preserving the Airtable image hook', () => {
  assert.match(html, /class="craft-story"/);
  assert.match(html, /id="craft-story-title"/);
  assert.match(html, /data-airtable-image="Flavors · Craft Photo"/);
  assert.match(html, /class="craft-story-steps"/);
  assert.doesNotMatch(html, /pics from airtable/);
  assert.match(css, /\.craft-story-grid\{[\s\S]*?grid-template-areas:"heading media" "copy media"/);
  assert.match(css, /\.craft-story-photo\{[\s\S]*?aspect-ratio:4\/5/);
  assert.match(css, /@media \(max-width:900px\)\{[\s\S]*?\.craft-story-grid\{[\s\S]*?grid-template-areas:"heading" "media" "copy"/);
});
