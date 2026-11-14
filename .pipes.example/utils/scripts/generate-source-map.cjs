#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const PIPE_ROOT = path.resolve(__dirname, '..', '..');
const WORKSPACE_ROOT = path.dirname(PIPE_ROOT);
const CANONICAL_ROOT = '.pipes';
const BT = String.fromCharCode(96);

function listFiles(root) {
  const out = [];
  function walk(dir, rel = '') {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      const nextRel = rel ? rel + '/' + entry.name : entry.name;
      const target = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(target, nextRel);
      else out.push(nextRel);
    }
  }
  walk(path.resolve(root));
  return out.sort();
}

function canonical(rel) {
  return CANONICAL_ROOT + '/' + rel.split(path.sep).join('/');
}

function buildRows({
  starterRoot = PIPE_ROOT,
  installedRoot = path.join(WORKSPACE_ROOT, CANONICAL_ROOT),
} = {}) {
  // Project content and runtime state are opaque. Creating a record must not
  // change a framework-owned discovery surface or invalidate release provenance.
  const visible = rel => !rel.startsWith('project/') && !rel.startsWith('utils/state/') && !rel.startsWith('utils/configs/');
  const starter = listFiles(starterRoot).filter(visible);
  const installed = new Set(listFiles(installedRoot).filter(visible));
  const starterSet = new Set(starter);
  const rows = starter.map((rel) => ({
    source: canonical(rel),
    action: installed.has(rel) ? 'replace' : 'create-new',
    target: canonical(rel),
    reason: installed.has(rel)
      ? 'Canonical starter source replaces the installed copy.'
      : 'Canonical starter source creates the installed file.',
    validation: 'source-present',
  }));
  for (const rel of [...installed].filter((item) => !starterSet.has(item)).sort()) {
    rows.push({
      source: canonical(rel),
      action: 'omit',
      target: 'none',
      reason: 'Installed project-specific or historical file is not part of the starter baseline.',
      validation: 'intentional-extra',
    });
  }
  return rows;
}

function render(rows) {
  const lines = [
    '# Source To Target Map',
    '',
    'Generated inventory for reconciling the starter baseline with an installed canonical '
      + BT + CANONICAL_ROOT + '/' + BT + ' workspace.',
    '',
    '| source_path | action | target_path | reason | validation |',
    '| --- | --- | --- | --- | --- |',
  ];
  rows.forEach((row) => {
    lines.push(
      '| ' + BT + row.source + BT
      + ' | ' + BT + row.action + BT
      + ' | ' + BT + row.target + BT
      + ' | ' + row.reason
      + ' | ' + BT + row.validation + BT + ' |',
    );
  });
  return lines.join('\n') + '\n';
}

function generateSourceMap(options = {}) {
  const starterRoot = path.resolve(options.starterRoot || PIPE_ROOT);
  const rows = buildRows({ ...options, starterRoot });
  const out = path.join(starterRoot, 'utils/mapping/source-to-target-map.md');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, render(rows), 'utf8');
  return { out, rows };
}

if (require.main === module) console.log(generateSourceMap().out);

module.exports = {
  buildRows,
  canonical,
  generateSourceMap,
  listFiles,
  render,
};
