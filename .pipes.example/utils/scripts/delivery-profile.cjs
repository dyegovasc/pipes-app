#!/usr/bin/env node
// Reads the project's delivery profile from `.pipes/ai-instructions/delivery.md`: Markdown sections
// with plain tables. Framework files stay generic and get project facts from here. Read-only.
// Usage: node .pipes/utils/scripts/delivery-profile.cjs [--json]   (prints the parsed profile and validation)
const fs = require('node:fs');
const path = require('node:path');

const PIPE_ROOT = path.resolve(__dirname, '..', '..');
const PROFILE_PATH = path.join('ai-instructions', 'delivery.md');
const AUTONOMY = new Set(['auto', 'ask', 'ticket']);

// Used when a project has no delivery profile: protect the usual default branches, ask before any
// workflow dispatch, and treat every environment as needing a ticket that no pattern can match.
const DEFAULT_PROFILE = Object.freeze({
  source: null,
  layout: { mode: 'single-repo', servicesRoot: '.' },
  protectedBranches: ['main', 'master'],
  environments: [{ name: '*', autonomy: 'ticket', dispatch: '' }],
  changeTicket: { pattern: null, approver: '' },
  releaseWorkflows: [],
  commands: [],
  issueTracker: { keyPattern: null },
  evals: { required: false, routineModel: null, milestoneModel: null },
});

function unquote(value) {
  return String(value || '').trim().replace(/^`(.*)`$/, '$1').trim();
}

function sections(markdown) {
  const body = String(markdown).replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
  const result = {};
  let current = null;
  for (const line of body.split(/\r?\n/)) {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) { current = heading[1]; result[current] = []; continue; }
    if (current) result[current].push(line);
  }
  return result;
}

function firstTable(lines = []) {
  const rows = lines.filter((line) => /^\s*\|/.test(line));
  if (rows.length < 2) return [];
  const cells = (line) => line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());
  const header = cells(rows[0]).map((cell) => cell.toLowerCase());
  return rows.slice(2).map((line) => Object.fromEntries(cells(line).map((cell, index) => [header[index], cell])));
}

function keyValues(lines) {
  return Object.fromEntries(firstTable(lines).map((row) => [String(row.key || '').toLowerCase(), unquote(row.value)]));
}

function toRegExp(pattern) {
  if (!pattern) return null;
  try { return new RegExp('\\b' + pattern + '\\b'); } catch { return undefined; }
}

function parseProfile(markdown, source = null) {
  const parts = sections(markdown);
  const layout = keyValues(parts.Layout);
  const ticket = keyValues(parts['Change Tickets']);
  const tracker = keyValues(parts['Issue Tracker']);
  const evals = keyValues(parts.Evals);
  const model = (value) => (value && value !== 'default' ? value : null);
  return {
    source,
    layout: { mode: layout.mode || 'single-repo', servicesRoot: layout['services root'] || '.' },
    protectedBranches: firstTable(parts['Protected Branches']).map((row) => unquote(row.branch)).filter(Boolean),
    environments: firstTable(parts.Environments).map((row) => ({
      name: unquote(row.environment),
      autonomy: unquote(row.autonomy),
      dispatch: unquote(row.dispatch),
    })).filter((row) => row.name),
    changeTicket: { pattern: toRegExp(ticket.pattern), approver: ticket.approver || '' },
    releaseWorkflows: firstTable(parts['Release Workflows']).map((row) => unquote(row.workflow)).filter(Boolean),
    commands: firstTable(parts.Commands).map((row) => ({
      purpose: row.purpose || '',
      command: unquote(row.command),
      healthy: row['healthy output'] || '',
    })).filter((row) => row.command),
    issueTracker: { keyPattern: toRegExp(tracker['key pattern']) },
    // An Evals table makes eval results required at gate G6; without it they are recommended.
    evals: { required: firstTable(parts.Evals).length > 0, routineModel: model(evals['routine model']), milestoneModel: model(evals['milestone model']) },
  };
}

function validateProfile(profile) {
  const errors = [];
  if (!['single-repo', 'multi-repo'].includes(profile.layout.mode)) errors.push('Layout mode must be single-repo or multi-repo.');
  if (!profile.protectedBranches.length) errors.push('Protected Branches needs at least one branch.');
  if (!profile.environments.length) errors.push('Environments needs at least one row.');
  for (const environment of profile.environments) {
    if (!AUTONOMY.has(environment.autonomy)) errors.push('Environment ' + environment.name + ' has autonomy ' + environment.autonomy + '; use auto, ask, or ticket.');
  }
  if (profile.changeTicket.pattern === undefined) errors.push('Change Tickets pattern is not a valid regular expression.');
  if (profile.issueTracker.keyPattern === undefined) errors.push('Issue Tracker key pattern is not a valid regular expression.');
  if (profile.environments.some((environment) => environment.autonomy === 'ticket') && !profile.changeTicket.pattern) {
    errors.push('An environment needs a ticket, but Change Tickets has no pattern.');
  }
  return errors;
}

function loadProfile(pipeRoot = PIPE_ROOT) {
  const file = path.join(pipeRoot, PROFILE_PATH);
  if (!fs.existsSync(file)) return DEFAULT_PROFILE;
  return parseProfile(fs.readFileSync(file, 'utf8'), '.pipes/' + PROFILE_PATH.split(path.sep).join('/'));
}

function environmentRule(profile, name) {
  return profile.environments.find((environment) => environment.name === name)
    || profile.environments.find((environment) => environment.name === '*')
    || { name, autonomy: 'ticket', dispatch: '' };
}

if (require.main === module) {
  const profile = loadProfile();
  const errors = profile.source ? validateProfile(profile) : [];
  if (process.argv.includes('--json')) {
    process.stdout.write(JSON.stringify({ profile, errors }, (key, value) => (value instanceof RegExp ? value.source : value), 2) + '\n');
  } else {
    process.stdout.write((profile.source ? 'Profile: ' + profile.source : 'No delivery profile; defaults apply') + '\n');
    for (const error of errors) process.stdout.write('[error] ' + error + '\n');
    if (!errors.length) process.stdout.write('[info] delivery-profile-valid\n');
  }
  if (errors.length) process.exitCode = 1;
}

module.exports = { DEFAULT_PROFILE, environmentRule, loadProfile, parseProfile, validateProfile };
