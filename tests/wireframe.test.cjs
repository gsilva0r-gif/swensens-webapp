const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'wireframe.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'wireframe.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'wireframe.js'), 'utf8');

test('wireframe demo includes its local assets and interactive workspace', () => {
  assert.match(html, /id="page-list"/);
  assert.match(html, /id="prototype-scroll"/);
  assert.match(html, /id="notes-list"/);
  assert.match(html, /href="wireframe\.css"/);
  assert.match(html, /src="wireframe\.js"/);
  assert.ok(fs.existsSync(path.join(root, 'wireframe.css')));
  assert.ok(fs.existsSync(path.join(root, 'wireframe.js')));
});

test('wireframe maps every customer-facing page', () => {
  for (const id of ['home', 'flavors', 'menu', 'gifts', 'reviews', 'story', 'contact']) {
    assert.match(js, new RegExp(`id:\\"${id}\\"`));
  }
});

test('wireframe supports mobile, desktop, annotations, and deep links', () => {
  assert.match(js, /data-viewport/);
  assert.match(js, /data-note/);
  assert.match(js, /URLSearchParams/);
  assert.match(css, /\.prototype-shell\.mobile/);
  assert.match(css, /\.notes-hidden \.wf-callout/);
});

test('wireframe JavaScript parses', () => {
  new vm.Script(js);
});
