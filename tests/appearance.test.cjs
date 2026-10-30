const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../assets/appearance.js'), 'utf8');
function boot(saved, dark, blocked = false) {
  const dataset = {};
  let onSystemChange;
  const media = { matches: dark, addEventListener: (_, fn) => { onSystemChange = fn; } };
  const context = {
    document: { documentElement: { dataset }, querySelector: () => null, addEventListener() {} },
    window: { matchMedia: () => media },
    localStorage: { getItem(key) { assert.equal(key, 'laurel-appearance'); if (blocked) throw Error('Unavailable'); return saved; } }
  };
  vm.runInNewContext(source, context);
  return { dataset, change(dark) { media.matches = dark; onSystemChange(); } };
}
test('first visit follows the system and responds to system changes', () => {
  const ui = boot(null, true);
  assert.equal(ui.dataset.theme, 'dark');
  ui.change(false);
  assert.equal(ui.dataset.theme, 'light');
});
test('explicit preferences override system theme changes', () => {
  const ui = boot('light', true);
  assert.equal(ui.dataset.theme, 'light');
  ui.change(true);
  assert.equal(ui.dataset.theme, 'light');
  assert.equal(boot('dark', false).dataset.theme, 'dark');
});
test('invalid or unavailable appearance storage falls back to system', () => {
  assert.equal(boot('unexpected', true).dataset.theme, 'dark');
  assert.equal(boot(null, false, true).dataset.theme, 'light');
});
