const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const postcss = require('postcss');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'about.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'about-story.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'about-story.js'), 'utf8');

test('About page follows the requested Swensen\'s story arc', () => {
  const sections = [
    'founder-opening',
    'heritage-timeline',
    'story-spotlight',
    'story-legacy',
    'story-visit'
  ];
  sections.forEach(section => assert.match(html, new RegExp(`class="[^"]*${section}`)));
  assert.equal((html.match(/class="timeline-card"/g) || []).length, 8);
  assert.equal((html.match(/data-story-step=/g) || []).length, 4);
  assert.equal((html.match(/data-story-photo=/g) || []).length, 4);
  assert.match(html, /Earle Swensen/);
  assert.match(html, /See Us Freeze/);
  assert.match(html, /Richard Campana/);
  assert.match(html, /Diane/);
  assert.match(html, /A Legacy Business/);
});

test('Every About page image remains Airtable-editable', () => {
  const images = [...html.matchAll(/<img\b[^>]*>/g)].map(match => match[0]);
  assert.ok(images.length >= 7);
  images.forEach(image => {
    assert.ok(
      image.includes('data-airtable-image') || image.includes('data-site-logo'),
      `Missing Airtable hook: ${image}`
    );
  });
});

test('About stylesheet and interactions are valid and responsive', () => {
  assert.doesNotThrow(() => postcss.parse(css));
  assert.match(css, /@media \(max-width:1040px\)/);
  assert.match(css, /@media \(max-width:820px\)/);
  assert.match(css, /@media \(max-width:680px\)/);
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)/);
  assert.doesNotMatch(js, /IntersectionObserver/);
  assert.match(js, /requestAnimationFrame\(syncActiveChapter\)/);
  assert.match(js, /triggerLine - 24/);
  assert.match(js, /triggerLine \+ 24/);
  assert.match(js, /scrollBy/);
});

test('About story keeps numbered copy left and an interactive photo stage right on mobile', () => {
  assert.doesNotMatch(css, /\.spotlight-stage\{display:none;\}/);
  assert.match(css, /\.story-spotlight-layout\{display:grid;/);
  assert.match(css, /\.spotlight-stage\{position:sticky;/);
  assert.match(css, /grid-template-columns:minmax\(0,1\.12fr\) minmax\(132px,\.88fr\);/);
  assert.match(css, /grid-template-rows:repeat\(4,minmax\(0,1fr\)\);/);
  assert.match(css, /\.spotlight-photo\.is-active\{[^}]*border-color:#FFD45E;[^}]*0 0 0 2px #FFD45E/);
  assert.equal((html.match(/class="spotlight-mobile-photo/g) || []).length, 0);
  assert.equal((html.match(/class="spotlight-step[^>]*tabindex="0"/g) || []).length, 4);
  assert.match(js, /event\.pointerType === 'mouse'/);
  assert.match(js, /step\.addEventListener\('click'/);
});

test('All local About page references resolve', () => {
  const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]);
  const localReferences = references
    .filter(reference => !/^(?:https?:|#|mailto:|tel:)/.test(reference))
    .map(reference => reference.split(/[?#]/, 1)[0]);
  const missing = localReferences.filter(reference => !fs.existsSync(path.join(root, reference)));
  assert.deepEqual(missing, []);
});
