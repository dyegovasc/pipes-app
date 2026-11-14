#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const PIPE_ROOT = path.resolve(__dirname, '..', '..');
const WORKSPACE_ROOT = path.dirname(PIPE_ROOT);
const CANONICAL_ROOT = '.pipes';
const BT = String.fromCharCode(96);
const DELIMITER_START = '<!-- pipes-notebook:start -->';
const DELIMITER_END = '<!-- pipes-notebook:end -->';
const RULES_TABLE_MARKER = '<!-- assembly:rules-table -->';

const TARGET_MAP = {
  agents: { target: 'AGENTS.md', tool: 'Codex' },
  claude: { target: 'CLAUDE.md', tool: 'Claude Code' },
  copilot: { target: '.github/copilot-instructions.md', tool: 'GitHub Copilot' },
};
const DEFAULT_TARGETS = ['agents', 'claude', 'copilot'];

function parseArgs(argv) {
  const flags = { targets: null, json: false, print: false };
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') flags.json = true;
    else if (arg === '--print') flags.print = true;
    else if (arg === '--targets' || arg === '--target') {
      flags.targets = argv[index + 1] || '';
      index += 1;
    } else if (arg.startsWith('--targets=')) flags.targets = arg.slice(10);
    else if (arg.startsWith('--target=')) flags.targets = arg.slice(9);
  }
  return flags;
}

function resolveTargets(value) {
  const ids = value
    ? value.split(',').map((item) => item.trim()).filter(Boolean)
    : DEFAULT_TARGETS;
  const invalid = ids.find((id) => !TARGET_MAP[id]);
  if (invalid) throw new Error('Invalid target "' + invalid + '".');
  return ids.map((id) => TARGET_MAP[id]);
}

function parseFrontmatter(content) {
  const text = String(content);
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { meta: {}, body: text };
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (field) meta[field[1]] = field[2].trim().replace(/^["']|["']$/g, '');
  }
  return {
    meta,
    body: text.slice(match[0].length).replace(/^\r?\n+/, ''),
  };
}

function markdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((name) => name.endsWith('.md')).sort();
}

function instructionEntries() {
  const dir = path.join(PIPE_ROOT, 'ai-instructions');
  const priority = ['project.md', 'core.md', 'architecture.md'];
  const files = markdownFiles(dir);
  const ordered = [
    ...priority.filter((name) => files.includes(name)),
    ...files.filter((name) => !priority.includes(name)),
  ];
  return ordered.map((filename) => {
    const parsed = parseFrontmatter(fs.readFileSync(path.join(dir, filename), 'utf8'));
    return {
      filename,
      canonicalPath: CANONICAL_ROOT + '/ai-instructions/' + filename,
      assembly: parsed.meta.assembly || 'inline',
      meta: parsed.meta,
      body: parsed.body,
    };
  });
}

function ruleEntries() {
  const dir = path.join(PIPE_ROOT, 'utils/rules');
  return markdownFiles(dir)
    .filter((name) => name.startsWith('rule-'))
    .map((filename) => {
      const parsed = parseFrontmatter(fs.readFileSync(path.join(dir, filename), 'utf8'));
      return {
        id: filename.slice(0, -3),
        title: parsed.meta.title || filename,
        description: parsed.meta.description || '',
        enforcement: parsed.meta.enforcement || '',
        enforcedBy: String(parsed.meta.enforced_by || '').replace(/[\[\]]/g, '').split(',').map((item) => item.trim()).filter(Boolean),
      };
    });
}

function rulesTable(rules) {
  if (!rules.length) return '';
  const rows = rules
    .map((rule) => '| ' + BT + rule.id + BT + ' | ' + (rule.enforcement || '') + ' | ' + (rule.enforcedBy || []).join(', ') + ' | ' + (rule.description || rule.title) + ' |')
    .join('\n');
  return '| Rule | Enforcement | Enforced by | Description |\n| --- | --- | --- | --- |\n' + rows;
}

function renderPipesSection(tool, entries = instructionEntries(), rules = ruleEntries()) {
  const inline = entries.filter((entry) => entry.assembly !== 'reference');
  const references = entries.filter((entry) => entry.assembly === 'reference');
  const included = inline
    .map((entry, index) => String(index + 1) + '. ' + BT + entry.canonicalPath + BT)
    .join('\n') || '- none';
  const referenceList = references
    .map((entry) => '- ' + BT + entry.canonicalPath + BT)
    .join('\n');
  const table = rulesTable(rules);
  const bodies = inline.map((entry) => entry.body.replace(RULES_TABLE_MARKER, table));

  let content = [
    '# Pipes Instructions (' + tool + ')',
    '',
    'Auto-managed by Pipes. Do not edit between the delimiters.',
    '',
    'Included instructions:',
    included,
  ].join('\n');
  if (referenceList) content += '\n\nReference instructions:\n' + referenceList;
  content += '\n\nCanonical Markdown under ' + BT + CANONICAL_ROOT + '/' + BT + ' governs Pipes behavior.';
  content += '\n\n---\n\n' + bodies.join('\n\n---\n\n');
  if (!bodies.some((body) => body.includes(table)) && table) {
    content += '\n\n---\n\n# Active Rules\n\n' + table;
  }
  return content
    + '\n\n---\n\n*Generated from '
    + BT + CANONICAL_ROOT + '/ai-instructions/' + BT
    + ' and ' + BT + CANONICAL_ROOT + '/utils/rules/' + BT + '.*';
}

function wrapperFrontmatter(tool) {
  const title = tool === 'Codex' ? 'Codex' : tool;
  return [
    '---',
    'title: ' + title + ' Entrypoint',
    'description: Generated Pipes instruction wrapper.',
    'version: 2.0',
    'generated_from: ' + CANONICAL_ROOT + '/ai-instructions/',
    '---',
    '',
  ].join('\n');
}

function normalizeGeneratedFrom(content) {
  if (!content.startsWith('---\n')) return content;
  let normalized = /^version:\s*.*$/m.test(content)
    ? content.replace(/^version:\s*.*$/m, 'version: 2.0')
    : content;
  if (/^generated_from:\s*.*$/m.test(normalized)) {
    return normalized.replace(
      /^generated_from:\s*.*$/m,
      'generated_from: ' + CANONICAL_ROOT + '/ai-instructions/',
    );
  }
  return normalized.replace(
    /^---\n([\s\S]*?)\n---/,
    (match, body) => '---\n' + body + '\ngenerated_from: ' + CANONICAL_ROOT + '/ai-instructions/\n---',
  );
}

function mergeIntoContent(existing, pipesSection, tool) {
  const managed = DELIMITER_START + '\n' + pipesSection + '\n' + DELIMITER_END;
  if (existing == null) return wrapperFrontmatter(tool) + managed + '\n';
  const normalized = normalizeGeneratedFrom(
    existing.startsWith('---\n') ? existing : wrapperFrontmatter(tool) + existing,
  );
  const start = normalized.indexOf(DELIMITER_START);
  const end = normalized.indexOf(DELIMITER_END);
  if (start >= 0 && end > start) {
    return normalized.slice(0, start)
      + managed
      + normalized.slice(end + DELIMITER_END.length);
  }
  return normalized.replace(/\s*$/, '') + '\n\n' + managed + '\n';
}

function alwaysOnBudget(pipeRoot = PIPE_ROOT) {
  // The budget is a project setting in the frontmatter of ai-instructions/project.md (Markdown first).
  const file = path.join(pipeRoot, 'ai-instructions/project.md');
  if (!fs.existsSync(file)) return null;
  const raw = parseFrontmatter(fs.readFileSync(file, 'utf8')).meta.always_on_line_budget;
  if (raw === undefined || raw === null || raw === '') return null;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) throw new Error('always_on_line_budget in ai-instructions/project.md must be a positive integer.');
  return value;
}

function budgetReport(section, limit) {
  const lines = section.split('\n').length;
  return { lines, limit, ok: limit === null || lines <= limit };
}

function assemble({ targets = null, print = false } = {}) {
  const entries = instructionEntries();
  const rules = ruleEntries();
  if (!entries.length) throw new Error('No AI instruction Markdown found.');
  const sources = {
    inline: entries.filter((entry) => entry.assembly !== 'reference').length,
    reference: entries.filter((entry) => entry.assembly === 'reference').length,
    rules: rules.length,
  };
  const preview = renderPipesSection('Preview', entries, rules);
  const budget = budgetReport(preview, alwaysOnBudget());
  if (print) {
    return {
      ok: budget.ok,
      content: preview,
      results: [],
      sources,
      budget,
    };
  }
  if (!budget.ok) {
    throw new Error('Always-on instructions are ' + budget.lines + ' lines; the budget (always_on_line_budget in ai-instructions/project.md) is ' + budget.limit + '. Move content to a reference instruction or raise the budget deliberately.');
  }

  const results = [];
  for (const target of resolveTargets(targets)) {
    const full = path.join(WORKSPACE_ROOT, target.target);
    const existing = fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : null;
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(
      full,
      mergeIntoContent(existing, renderPipesSection(target.tool, entries, rules), target.tool),
      'utf8',
    );
    results.push({ status: 'success', target: target.target });
  }
  return { ok: true, results, sources, budget };
}

function runCli() {
  const flags = parseArgs(process.argv);
  try {
    const result = assemble({ targets: flags.targets, print: flags.print });
    if (flags.print) console.log(result.content);
    else if (flags.json) console.log(JSON.stringify(result));
    else result.results.forEach((item) => console.log('✓ ' + item.target));
  } catch (error) {
    if (flags.json) console.log(JSON.stringify({ ok: false, error: error.message }));
    else console.error(error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) runCli();

module.exports = {
  alwaysOnBudget,
  assemble,
  budgetReport,
  instructionEntries,
  mergeIntoContent,
  parseArgs,
  parseFrontmatter,
  renderPipesSection,
  resolveTargets,
  ruleEntries,
  TARGET_MAP,
};
