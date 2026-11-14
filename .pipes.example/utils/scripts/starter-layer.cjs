// Defines the framework layer and the project layer of a Pipes install.
// The framework layer is generic and could ship in a starter kit; the project layer holds this
// project's records, filled instructions, policy rules, and eval cases. Project facts are derived
// from the project layer itself, so the same checks work for any project. Read-only.
const fs = require('node:fs');
const path = require('node:path');
const { loadProfile } = require('./delivery-profile.cjs');

const PIPE_ROOT = path.resolve(__dirname, '..', '..');
const PROJECT_INSTRUCTIONS = ['project.md', 'delivery.md', 'accountability.md', 'architecture.md', 'corrections.md'];
const FRAMEWORK_DIRS = ['ai-instructions', 'team', 'utils/rules', 'utils/pipelines', 'utils/loops', 'utils/fragments', 'utils/scripts'];
const GENERATED = new Set(['utils/fragments/CATALOG.md']);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function frontmatterValue(content, key) {
  const block = String(content).match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || '';
  return block.match(new RegExp('^' + key + ':\\s*(.+)$', 'm'))?.[1]?.trim();
}

// Returns why a file belongs to the project layer, or null when it is framework content.
function projectReason(rel, content) {
  if (rel.startsWith('project/') || rel.startsWith('utils/state/') || rel.startsWith('utils/configs/')) return 'project records or local state';
  if (rel.startsWith('ai-instructions/') && PROJECT_INSTRUCTIONS.includes(path.basename(rel))) return 'project instruction';
  if (rel.startsWith('utils/rules/') && frontmatterValue(content, 'scope') === 'project') return 'project policy rule';
  if (rel.startsWith('utils/scripts/fixtures/evals/') && rel.endsWith('.json')) {
    try { if (JSON.parse(content).scope === 'project') return 'project eval case'; } catch { return null; }
  }
  return null;
}

function frameworkFiles(pipeRoot = PIPE_ROOT) {
  const files = [path.join(pipeRoot, 'README.md'), ...FRAMEWORK_DIRS.flatMap((dir) => walk(path.join(pipeRoot, dir)))];
  return files
    .filter((file) => /\.(md|cjs|json)$/.test(file) && fs.existsSync(file))
    .map((file) => ({ file, rel: path.relative(pipeRoot, file).split(path.sep).join('/') }))
    .filter(({ rel }) => !GENERATED.has(rel))
    .map(({ file, rel }) => ({ file, rel, content: fs.readFileSync(file, 'utf8') }))
    .filter(({ rel, content }) => !projectReason(rel, content));
}

function literalPrefix(regex) {
  return regex ? (regex.source.replace(/\\b/g, '').match(/^[A-Za-z][A-Za-z0-9_]*-/) || [null])[0] : null;
}

// Project facts that must not appear in framework files.
function projectTerms(pipeRoot = PIPE_ROOT) {
  const profile = loadProfile(pipeRoot);
  const terms = [];
  if (profile.source) {
    for (const environment of profile.environments) if (environment.name !== '*') terms.push({ term: environment.name, kind: 'environment', quoted: true });
    for (const prefix of [literalPrefix(profile.changeTicket.pattern), literalPrefix(profile.issueTracker.keyPattern)]) if (prefix) terms.push({ term: prefix, kind: 'ticket or issue key' });
    for (const workflow of profile.releaseWorkflows) terms.push({ term: workflow, kind: 'release workflow' });
    for (const command of profile.commands) terms.push({ term: command.command, kind: 'command' });
  }
  const projectFile = path.join(pipeRoot, 'ai-instructions', 'project.md');
  if (fs.existsSync(projectFile)) {
    for (const line of fs.readFileSync(projectFile, 'utf8').split('\n').filter((row) => /^\|/.test(row))) {
      for (const match of line.matchAll(/`([a-z][a-z0-9]+(?:-[a-z0-9]+)+)`/g)) terms.push({ term: match[1], kind: 'repository' });
    }
  }
  const seen = new Set();
  return terms.filter((item) => item.term.length >= 3 && !seen.has(item.term) && seen.add(item.term));
}

function escape(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// An eval case with workspace "starter" runs on a fresh install beside its own synthetic project. The
// names in its setup files describe that project, so those terms are not leaks in that case. Every other
// term is still checked in the whole case file, including its prompt and checks.
function syntheticSetupText(rel, content) {
  if (!rel.startsWith('utils/scripts/fixtures/evals/') || !rel.endsWith('.json')) return '';
  try {
    const value = JSON.parse(content);
    return value.workspace === 'starter' ? Object.values(value.setup || {}).join('\n') : '';
  } catch { return ''; }
}

function findLeaks(pipeRoot = PIPE_ROOT) {
  const terms = projectTerms(pipeRoot);
  const leaks = [];
  for (const { rel, content } of frameworkFiles(pipeRoot)) {
    const setupText = syntheticSetupText(rel, content);
    for (const { term, kind, quoted } of terms) {
      if (setupText && setupText.includes(term)) continue;
      // Short environment names are only matched as literal values, not inside ordinary words.
      const pattern = quoted ? new RegExp('[`\'"=]' + escape(term) + '[`\'"\\s,)]') : new RegExp('(^|[^A-Za-z0-9_-])' + escape(term) + '($|[^A-Za-z0-9_])');
      const index = content.search(pattern);
      if (index >= 0) leaks.push({ rel, term, kind, line: content.slice(0, index).split('\n').length });
    }
  }
  for (const leak of findRecordReferences(pipeRoot)) leaks.push(leak);
  return { terms, leaks };
}

// A framework file must not point at a record of this project, because records do not ship with
// the starter. Tests and test fixtures use invented records by design, so they are not checked.
const RECORD_ID = /\b(note|intent|spec|mission|plan|decision|outcome|artifact)-\d{3}\b/g;
function projectRecordIds(pipeRoot) {
  const root = path.join(pipeRoot, 'project');
  if (!fs.existsSync(root)) return new Set();
  return new Set(walk(root).map((file) => path.basename(file).match(/^([a-z]+-\d{3})-/)?.[1]).filter(Boolean));
}
function findRecordReferences(pipeRoot = PIPE_ROOT) {
  const ids = projectRecordIds(pipeRoot);
  const leaks = [];
  for (const { rel, content } of frameworkFiles(pipeRoot)) {
    if (/\.test\.cjs$/.test(rel) || (rel.startsWith('utils/scripts/fixtures/') && !rel.startsWith('utils/scripts/fixtures/evals/'))) continue;
    const setupText = syntheticSetupText(rel, content);
    for (const match of content.matchAll(RECORD_ID)) {
      if (!ids.has(match[0]) || (setupText && setupText.includes(match[0]))) continue;
      leaks.push({ rel, term: match[0], kind: 'project record', line: content.slice(0, match.index).split('\n').length });
    }
  }
  return leaks;
}

module.exports = { PROJECT_INSTRUCTIONS, findLeaks, findRecordReferences, syntheticSetupText, frameworkFiles, projectReason, projectTerms };
