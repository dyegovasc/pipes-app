#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_ROOT = path.resolve(__dirname, '..', '..');
const CANONICAL_ROOT = '.pipes';
const BT = String.fromCharCode(96);

function parseFrontmatter(content) {
  const block = String(content).match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || '';
  const meta = {};
  for (const line of block.split(/\r?\n/)) {
    const field = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (field) meta[field[1]] = field[2].trim().replace(/^["']|["']$/g, '');
  }
  return meta;
}

function markdownFiles(dir, prefix) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...markdownFiles(target, prefix));
    else if (entry.name.startsWith(prefix) && entry.name.endsWith('.md')) out.push(target);
  }
  return out.sort();
}

function inventory(root = DEFAULT_ROOT) {
  function entries(rel, prefix) {
    return markdownFiles(path.join(root, rel), prefix).map((file) => ({
      id: path.basename(file, '.md'),
      relative: path.relative(root, file).split(path.sep).join('/'),
      meta: parseFrontmatter(fs.readFileSync(file, 'utf8')),
    }));
  }
  return {
    fragments: entries('utils/fragments', 'fragment-'),
    pipelines: entries('utils/pipelines', 'pipeline-'),
    loops: entries('utils/loops', 'loop-'),
    rules: entries('utils/rules', 'rule-'),
  };
}

function safe(value) {
  return String(value || '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function table(lines, headers, rows) {
  lines.push(
    '| ' + headers.join(' | ') + ' |',
    '| ' + headers.map(() => '---').join(' | ') + ' |',
  );
  rows.forEach((row) => lines.push('| ' + row.map(safe).join(' | ') + ' |'));
  lines.push('');
}

function renderCatalog(items) {
  const lines = [
    '---',
    'title: Framework Catalog',
    'description: Generated inventory of canonical Pipes fragments, pipelines, loops, and rules.',
    'version: 2.0',
    'fragment_type: reference',
    'domain: all',
    '---',
    '# Framework Catalog',
    '',
    '**Total Fragments:** ' + items.fragments.length,
    '**Total Pipelines:** ' + items.pipelines.length,
    '**Total Loops:** ' + items.loops.length,
    '**Total Rules:** ' + items.rules.length,
    '',
    '> Generated for discovery. The listed Markdown sources remain authoritative.',
    '',
    '## Fragments By Type',
    '',
  ];
  for (const type of ['context', 'instruction', 'output', 'question', 'validation']) {
    const entries = items.fragments.filter((item) => item.meta.fragment_type === type);
    lines.push('### ' + type[0].toUpperCase() + type.slice(1) + ' (' + entries.length + ')', '');
    table(
      lines,
      ['Fragment', 'Path', 'Title', 'Domain', 'Description'],
      entries.map((item) => [
        BT + item.id + BT,
        BT + CANONICAL_ROOT + '/' + item.relative + BT,
        item.meta.title,
        item.meta.domain,
        item.meta.description,
      ]),
    );
  }
  lines.push('## Pipelines', '');
  table(
    lines,
    ['Pipeline', 'Title', 'Category', 'Domain', 'Description'],
    items.pipelines.map((item) => [
      BT + item.id + BT,
      item.meta.title,
      item.meta.category,
      item.meta.domain,
      item.meta.description,
    ]),
  );
  lines.push('## Loops', '');
  table(
    lines,
    ['Loop', 'Title', 'Type', 'Primary Role', 'Description'],
    items.loops.map((item) => [
      BT + item.id + BT,
      item.meta.title,
      item.meta.loop_type,
      item.meta.primary_role,
      item.meta.description,
    ]),
  );
  lines.push('## Rules', '');
  table(
    lines,
    ['Rule', 'Title', 'Type', 'Enforcement', 'Description'],
    items.rules.map((item) => [
      BT + item.id + BT,
      item.meta.title,
      item.meta.rule_type,
      item.meta.enforcement,
      item.meta.description,
    ]),
  );
  while (lines.at(-1) === '') lines.pop();
  return lines.join('\n') + '\n';
}

function generateCatalog(root = DEFAULT_ROOT) {
  const absoluteRoot = path.resolve(root);
  const items = inventory(absoluteRoot);
  const out = path.join(absoluteRoot, 'utils/fragments/CATALOG.md');
  const content = renderCatalog(items);
  fs.writeFileSync(out, content, 'utf8');
  return { out, items, content };
}

if (require.main === module) {
  console.log(generateCatalog(process.argv[2] || DEFAULT_ROOT).out);
}

module.exports = {
  generateCatalog,
  inventory,
  markdownFiles,
  parseFrontmatter,
  renderCatalog,
};
