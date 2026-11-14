const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const ROOT = path.resolve(__dirname, '..', '..');
const GENERATED = new Set(['utils/fragments/CATALOG.md']);

function version(content) {
  const block = String(content).match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || '';
  return block.match(/^version:\s*"?([^"\s]+)"?\s*$/m)?.[1];
}

// rule-record-versioning: a changed Markdown contract carries a new version. Compared with the
// installed baseline archive, so a starter whose baseline equals its content always passes.
test('every Markdown file changed since the installed baseline has a new version', () => {
  const archivePath = path.join(ROOT, 'framework-baseline.json.gz');
  if (!fs.existsSync(archivePath)) return;
  const archive = JSON.parse(zlib.gunzipSync(fs.readFileSync(archivePath)));
  const stale = [];
  for (const file of archive.files) {
    if (!file.path.endsWith('.md') || GENERATED.has(file.path)) continue;
    const current = path.join(ROOT, file.path);
    if (!fs.existsSync(current)) continue;
    const content = fs.readFileSync(current, 'utf8');
    if (content === file.content) continue;
    const before = version(file.content);
    if (before && before === version(content)) stale.push(file.path + ' (still ' + before + ')');
  }
  assert.deepEqual(stale, [], 'bump the version of each changed contract once (rule-record-versioning)');
});
