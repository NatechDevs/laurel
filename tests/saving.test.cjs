const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const app = fs.readFileSync(path.join(__dirname, '../assets/app.js'), 'utf8');
const source = app.slice(app.indexOf('let recordsDirty='), app.indexOf('\nfunction notify'));
function boot(blocked = false) {
  const handlers = {}, saved = { textContent: '' }, writes = [];
  const state = { courses: [{ name: 'Draft course' }] };
  const context = {
    state, KEY: 'laurel-bu-v1', saveTimer: undefined,
    $: () => saved,
    setTimeout: () => 1, clearTimeout() {},
    window: { addEventListener: (event, handler) => { handlers[event] = handler; } },
    document: { visibilityState: 'hidden', addEventListener: (event, handler) => { handlers[event] = handler; } },
    localStorage: { setItem(key, value) { if (blocked) throw Error('Unavailable'); writes.push([key, JSON.parse(value)]); } }
  };
  vm.runInNewContext(source, context);
  return { context, handlers, saved, writes, state };
}
test('leaving a page flushes pending records before the debounce fires', () => {
  const ui = boot();
  ui.context.save();
  ui.state.courses = [];
  ui.handlers.pagehide();
  assert.equal(ui.writes.length, 1);
  assert.deepEqual(ui.writes[0][1].courses, []);
  ui.handlers.pagehide();
  assert.equal(ui.writes.length, 1);
});
test('hiding the page saves edits and storage failures show backup guidance', () => {
  const ui = boot();
  ui.context.save();
  ui.handlers.visibilitychange();
  assert.equal(ui.writes.length, 1);
  const blocked = boot(true);
  blocked.context.save();
  blocked.handlers.pagehide();
  assert.match(blocked.saved.textContent, /download a backup/);
});
