const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  buildRows,
  render,
} = require('./generate-source-map.cjs');

test('maps starter files to canonical installed paths', (t) => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'pipes-source-map-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const starter = path.join(temp, 'starter');
  const installed = path.join(temp, '.pipes');
  fs.mkdirSync(path.join(starter, 'utils'), { recursive: true });
  fs.mkdirSync(path.join(installed, 'utils'), { recursive: true });
  fs.writeFileSync(path.join(starter, 'README.md'), 'starter\n');
  fs.writeFileSync(path.join(starter, 'framework-baseline.json.gz'), 'archive');
  fs.writeFileSync(path.join(starter, 'framework-fork.json'), '{}\n');
  fs.writeFileSync(path.join(starter, 'manifest.json'), '{}\n');
  fs.writeFileSync(path.join(starter, 'utils', 'source.md'), 'source\n');
  fs.writeFileSync(path.join(installed, 'README.md'), 'installed\n');
  fs.writeFileSync(path.join(installed, 'history.md'), 'history\n');

  const rows = buildRows({ starterRoot: starter, installedRoot: installed });
  assert.deepEqual(
    rows.map((row) => [row.source, row.action, row.target]),
    [
      ['.pipes/README.md', 'replace', '.pipes/README.md'],
      ['.pipes/framework-baseline.json.gz', 'create-new', '.pipes/framework-baseline.json.gz'],
      ['.pipes/framework-fork.json', 'create-new', '.pipes/framework-fork.json'],
      ['.pipes/manifest.json', 'create-new', '.pipes/manifest.json'],
      ['.pipes/utils/source.md', 'create-new', '.pipes/utils/source.md'],
      ['.pipes/history.md', 'omit', 'none'],
    ],
  );
  const output = render(rows);
  assert.doesNotMatch(output, /\.pipes-v2/);
});

test('project records and runtime state never enter the framework map', (t) => {
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'pipes-map-opacity-')); t.after(()=>fs.rmSync(temp,{recursive:true,force:true}));
  for(const name of ['starter','.pipes']) {fs.mkdirSync(path.join(temp,name,'project','07-artifacts'),{recursive:true});fs.mkdirSync(path.join(temp,name,'utils','state'),{recursive:true});fs.writeFileSync(path.join(temp,name,'project','07-artifacts','artifact-001.html'),'opaque');fs.writeFileSync(path.join(temp,name,'utils','state','related-sync-state.json'),'{}');}
  assert.deepEqual(buildRows({starterRoot:path.join(temp,'starter'),installedRoot:path.join(temp,'.pipes')}),[]);
});
