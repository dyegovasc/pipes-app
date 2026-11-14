#!/usr/bin/env node
const fs = require('node:fs');
const { inspectArtifactRecords } = require('./project-artifact-validation.cjs');
const path = require('node:path');

const DEFAULT_ROOT = path.resolve(__dirname, '..', '..');
const COMMON_FIELDS = ['title', 'description', 'version', 'created', 'status', 'related'];
const MISSION_SECTIONS = [
  'Objective',
  'Scope',
  'Operating Envelope',
  'Roles',
  'Current State',
  'Gates',
  'Validation',
  'Stop',
  'Next Actions',
  'Journal',
];
const SHARED_PHASES = new Set([
  'framed',
  'observing',
  'understanding',
  'choosing',
  'acting',
  'validating',
  'reflecting',
  'updating',
]);
const MISSION_INTERVENTION_PROFILES = new Map([
  ['less', 'delegated_until_escalation'],
  ['more', 'user_mediated'],
  ['context-dependent', 'mixed'],
]);
const MISSION_NON_JOURNAL_LINE_LIMIT = 300;
const MISSION_DELIVERY_CLASSIFICATIONS = new Set([
  'plan-required',
  'plan-recommended',
  'direct-capable',
]);
const AREAS = [
  ['00-notes', 'note-'],
  ['01-intents', 'intent-'],
  ['02-specs', 'spec-'],
  ['03-missions', 'mission-'],
  ['04-plans', 'plan-'],
  ['05-decisions', 'decision-'],
  ['06-outcomes', 'outcome-'],
  ['07-artifacts', 'artifact-'],
];

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseArgs(argv) {
  const options = { root: DEFAULT_ROOT, strict: false };
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--strict') options.strict = true;
    else if (arg === '--root') {
      options.root = argv[index + 1] || '';
      index += 1;
    } else if (arg.startsWith('--root=')) options.root = arg.slice(7);
    else if (arg === '--new-record' || arg === '--source-record') {
      const key = arg === '--new-record' ? 'newRecords' : 'sourceRecords';
      const value = argv[++index]; if (!value || value.startsWith('--')) throw new Error(arg + ' requires a path.');
      (options[key] ||= []).push(value);
    } else if (arg.startsWith('--new-record=') || arg.startsWith('--source-record=')) {
      const split = arg.indexOf('='); const key = arg.startsWith('--new-record=') ? 'newRecords' : 'sourceRecords';
      const value = arg.slice(split+1); if (!value) throw new Error('Record path is required.'); (options[key] ||= []).push(value);
    } else throw new Error('Unknown argument: ' + arg);
  }
  if (options.sourceRecords?.length && options.newRecords?.length !== 1) throw new Error('--source-record requires exactly one --new-record target.');
  return options;
}

function frontmatter(content) {
  const match = String(content).match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { block: '', fields: [], values: {}, related: null, body: String(content), content: String(content) };
  const block = match[1];
  const fields = [];
  const values = {};
  for (const line of block.split(/\r?\n/)) {
    const item = line.match(/^([a-z][a-z0-9_-]*):\s*(.*)$/i);
    if (!item) continue;
    fields.push(item[1]);
    values[item[1]] = item[2].trim().replace(/^["']|["']$/g, '');
  }
  const { related, relatedStyle } = parseRelated(block);
  return { block, fields, values, related, relatedStyle, body: String(content).slice(match[0].length), content: String(content) };
}

// Canonical Markdown form: `related: []` or `related:` followed by `  - path` lines.
// The one-line JSON form `related: [...]` stays readable as `flow`. Any other form
// returns `related: null` so it reports as `related-format` instead of reading as empty.
function parseRelated(block) {
  const lines = block.split(/\r?\n/);
  const index = lines.findIndex((line) => /^related:/.test(line));
  if (index < 0) return { related: null, relatedStyle: null };
  const value = lines[index].slice('related:'.length).trim();
  if (value === '[]') return { related: [], relatedStyle: 'block' };
  if (value.startsWith('[')) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')
        ? { related: parsed, relatedStyle: 'flow' }
        : { related: null, relatedStyle: null };
    } catch { return { related: null, relatedStyle: null }; }
  }
  if (value) return { related: null, relatedStyle: null };
  const items = [];
  for (const line of lines.slice(index + 1)) {
    if (!/^[ \t]/.test(line) && line.trim() && !line.startsWith('#')) break;
    if (!line.trim() || /^\s*#/.test(line)) continue;
    const item = line.match(/^ {2}-\s+(.+)$/)?.[1]?.trim();
    if (!item) return { related: null, relatedStyle: null };
    items.push(item.replace(/^["']|["']$/g, ''));
  }
  return items.length ? { related: items, relatedStyle: 'block' } : { related: null, relatedStyle: null };
}

function configContract(content) {
  const block = frontmatter(content).block;
  const fieldsBlock = block.match(/^fields:\r?\n([\s\S]*?)(?=^[a-z][a-z0-9_-]*:|(?![\s\S]))/mi)?.[1] || '';
  const statusesBlock = block.match(/^statuses:\r?\n([\s\S]*?)(?=^[a-z][a-z0-9_-]*:|(?![\s\S]))/mi)?.[1] || '';
  return {
    fields: [...fieldsBlock.matchAll(/^  - id:\s*(\S+)\s*$/gm)].map((item) => item[1]),
    statuses: [...statusesBlock.matchAll(/^  - id:\s*(\S+)\s*$/gm)].map((item) => item[1]),
  };
}

function section(body, title) {
  const match = String(body).match(new RegExp('^## ' + escapeRegExp(title) + '\\s*$([\\s\\S]*?)(?=^## |(?![\\s\\S]))', 'm'));
  return match?.[1] || '';
}

function missionNonJournalLineCount(content) {
  const lines = String(content).split(/\r?\n/);
  const journalIndex = lines.findIndex((line) => /^## Journal\s*$/.test(line));
  return journalIndex >= 0 ? journalIndex : lines.length;
}

function listFiles(dir, prefix) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.startsWith(prefix) && entry.name.endsWith('.md'))
    .map((entry) => path.join(dir, entry.name))
    .sort();
}

function projectPath(root, value) {
  if (!value.startsWith('.pipes/')) return null;
  const target = path.resolve(root, value.slice('.pipes/'.length));
  return target.startsWith(root + path.sep) || target === root ? target : null;
}

function loopPhases(root, loopId) {
  const loopPath = path.join(root, 'utils', 'loops', loopId + '.md');
  if (!fs.existsSync(loopPath)) return null;
  const content = fs.readFileSync(loopPath, 'utf8');
  const declared = content.match(/^Mission phases use .*? Specialized mission phases:\s*(.+?)\.?$/m)?.[1] || 'none';
  const specializations = declared.toLowerCase() === 'none'
    ? []
    : declared.split(',').map((item) => item.replace(/[`\s.]/g, '')).filter(Boolean);
  return new Set([...SHARED_PHASES, ...specializations]);
}

function finding(findings, level, recordPath, code, message) {
  findings.push({ level, path: recordPath, code, message });
}

function validateRelated(root, recordPath, related, findings) {
  if (!Array.isArray(related)) {
    finding(findings, 'error', recordPath, 'related-format', '`related` must be a YAML list.');
    return;
  }
  const seen = new Set();
  for (const value of related) {
    if (seen.has(value)) finding(findings, 'error', recordPath, 'related-duplicate', 'Duplicate related path: ' + value);
    seen.add(value);
    const target = projectPath(root, value);
    if (!target) finding(findings, 'error', recordPath, 'related-path', 'Related path must be project-relative: ' + value);
    else if (!fs.existsSync(target)) finding(findings, 'error', recordPath, 'related-missing', 'Related path does not resolve: ' + value);
  }
}

function validateMission(root, recordPath, record, findings) {
  for (const heading of MISSION_SECTIONS) {
    if (!new RegExp('^## ' + escapeRegExp(heading) + '\\s*$', 'm').test(record.body)) {
      finding(findings, 'error', recordPath, 'mission-section', 'Missing mission section: ' + heading);
    }
  }
  const loopId = record.values.loop;
  const phases = loopId ? loopPhases(root, loopId) : null;
  if (!loopId) finding(findings, 'error', recordPath, 'mission-loop', 'Mission has no selected loop ID.');
  else if (!phases) finding(findings, 'error', recordPath, 'mission-loop', 'Selected loop does not resolve: ' + loopId);

  const nonJournalLines = missionNonJournalLineCount(record.content);
  if (nonJournalLines > MISSION_NON_JOURNAL_LINE_LIMIT) {
    finding(findings, 'error', recordPath, 'mission-line-limit', 'Mission has ' + nonJournalLines + ' physical lines before `## Journal`; maximum is ' + MISSION_NON_JOURNAL_LINE_LIMIT + '.');
  }

  const operatingEnvelope = section(record.body, 'Operating Envelope');
  const autonomyProfile = operatingEnvelope.match(/^Autonomy profile:\s*`?([a-z][a-z_-]*)`?\s*$/m)?.[1];
  const interventionLevel = operatingEnvelope.match(/^Human-intervention level:\s*`?([a-z][a-z-]*)`?\s*$/m)?.[1];
  if (!autonomyProfile && !interventionLevel) {
    finding(findings, 'warning', recordPath, 'mission-intervention-legacy', 'Mission predates the explicit intervention-to-autonomy mapping; migration remains optional until the mission is substantively updated.');
  } else if (!autonomyProfile || !interventionLevel) {
    finding(findings, 'error', recordPath, 'mission-intervention-incomplete', 'Autonomy profile and human-intervention level must be recorded together.');
  } else if (!MISSION_INTERVENTION_PROFILES.has(interventionLevel)) {
    finding(findings, 'error', recordPath, 'mission-intervention-invalid', 'Unsupported human-intervention level: ' + interventionLevel);
  } else if (MISSION_INTERVENTION_PROFILES.get(interventionLevel) !== autonomyProfile) {
    finding(findings, 'error', recordPath, 'mission-intervention-mapping', 'Human-intervention level `' + interventionLevel + '` must map to autonomy profile `' + MISSION_INTERVENTION_PROFILES.get(interventionLevel) + '`.');
  }

  const delivery = section(record.body, 'Delivery');
  if (delivery) {
    const approach = delivery.match(/^Approach:\s*`?(spec-driven|adaptive)`?\s*$/m)?.[1];
    if (!approach) {
      finding(findings, 'error', recordPath, 'mission-delivery-approach', 'Delivery has no supported `spec-driven` or `adaptive` approach.');
    }
    for (const capability of ['Planning', 'Plan execution']) {
      if (!new RegExp('^-\\s+' + escapeRegExp(capability) + ':\\s*\\S.+$', 'm').test(delivery)) {
        finding(findings, 'error', recordPath, 'mission-delivery-capability', 'Delivery has no ' + capability.toLowerCase() + ' capability evidence.');
      }
    }
    const themes = [...delivery.matchAll(/^\d+\.\s+\*\*(.+?)\*\*\s+—\s+`([^`]+)`\s*$/gm)]
      .map((match) => ({ label: match[1].trim(), classification: match[2] }));
    if (!themes.length) {
      finding(findings, 'error', recordPath, 'mission-delivery-themes', 'Delivery has no ordered theme with a planning classification.');
    }
    const labels = themes.map((theme) => theme.label);
    if (new Set(labels).size !== labels.length) {
      finding(findings, 'error', recordPath, 'mission-delivery-theme-duplicate', 'Delivery theme labels must be unique.');
    }
    for (const theme of themes) {
      if (!MISSION_DELIVERY_CLASSIFICATIONS.has(theme.classification)) {
        finding(findings, 'error', recordPath, 'mission-delivery-classification', 'Unsupported delivery classification: ' + theme.classification);
      }
    }
    for (const field of ['Outcome', 'Depends on', 'Affected contract families', 'Route', 'Promotion trigger']) {
      const count = (delivery.match(new RegExp('^\\s+- ' + escapeRegExp(field) + ':\\s*\\S.+$', 'gm')) || []).length;
      if (count !== themes.length) {
        finding(findings, 'error', recordPath, 'mission-delivery-theme-field', 'Every delivery theme must contain `' + field + '`.');
      }
    }
    const currentTheme = delivery.match(/^Current theme:\s*(.+?)\s*$/m)?.[1]?.trim();
    if (!currentTheme || !labels.includes(currentTheme)) {
      finding(findings, 'error', recordPath, 'mission-delivery-current-theme', 'Current theme must name one recorded delivery theme.');
    }
  }

  const currentState = section(record.body, 'Current State');
  const phase = currentState.match(/^Phase:\s*`?([a-z][a-z-]*)`?\s*$/m)?.[1];
  if (!phase) finding(findings, 'error', recordPath, 'mission-phase', 'Current State has no Phase value.');
  else if (phases && !phases.has(phase)) finding(findings, 'error', recordPath, 'mission-phase', 'Phase is not permitted by the selected loop: ' + phase);

  const journal = section(record.body, 'Journal');
  const headings = [...journal.matchAll(/^###\s+(.+)$/gm)].map((item) => item[1]);
  if (!headings.length) finding(findings, 'error', recordPath, 'journal-empty', 'Journal has no timestamped entry.');
  let previousJournalTimestamp = null;
  for (const heading of headings) {
    if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\s+—\s+.+$/.test(heading)) {
      const level = /^\d{4}-\d{2}-\d{2}\s+—\s+.+$/.test(heading) ? 'warning' : 'error';
      finding(findings, level, recordPath, 'journal-timestamp', 'Journal heading needs YYYY-MM-DD hh:mm:ss and a title; migration policy is required for legacy entries.');
    }
    const timestamp = heading.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\s+—\s+(.+)$/);
    if (!timestamp) continue;
    if (timestamp[2] === 'Created' && timestamp[1].endsWith(' 00:00:00')) finding(findings, 'error', recordPath, 'journal-created-time', 'Created Journal headings must use a real local timestamp, not 00:00:00.');
    if (previousJournalTimestamp && timestamp[1] < previousJournalTimestamp) finding(findings, 'error', recordPath, 'journal-order', 'Journal headings must be in ascending chronological order.');
    previousJournalTimestamp = timestamp[1];
  }

  const gates = section(record.body, 'Gates');
  const nextActions = section(record.body, 'Next Actions');
  if (record.values.status === 'done') {
    if (!/\bnone\b/i.test(gates)) finding(findings, 'error', recordPath, 'terminal-gates', 'Done mission has a pending gate.');
    if (!/none;\s*mission complete\.?/i.test(nextActions)) {
      finding(findings, 'error', recordPath, 'terminal-next-actions', 'Done mission needs `None; mission complete.` as Next Actions.');
    }
  }
  if (record.values.status === 'blocked' && !/block/i.test(gates + '\n' + section(record.body, 'Stop'))) {
    finding(findings, 'error', recordPath, 'blocked-consistency', 'Blocked mission does not identify its blocker.');
  }

  const executingPlan = /^Active workflow:\s*`?pipeline-execute-plan`?\s*$/mi.test(currentState);
  if (/Approach:\s*`spec-driven`/i.test(delivery) && executingPlan) {
    const hasPlanPath = /\.pipes\/project\/04-plans\/plan-[a-z0-9-]+\.md/i.test(record.body);
    const hasVersionReceipt = /plan[^\n]*version\s*`?\d+\.\d+(?:\.\d+)?`?/i.test(record.body);
    const hasContentApproval = /plan-content[^\n]*approval/i.test(record.body);
    const hasFinalValidation = /final[- ]validation[^\n]*(?:receipt|pass|clear)/i.test(record.body);
    if (!hasPlanPath || !hasVersionReceipt || !hasContentApproval || !hasFinalValidation) {
      finding(findings, 'error', recordPath, 'mission-plan-evidence', 'Spec-driven plan execution requires a readable plan path plus matching plan approval, version, and final-validation receipt evidence.');
    }
  }
}

function validateMissionRelationships(root, findings) {
  const records = new Map();
  for (const [area, prefix] of AREAS) {
    for (const file of listFiles(path.join(root, 'project', area), prefix)) {
      const recordPath = '.pipes/' + path.relative(root, file).split(path.sep).join('/');
      records.set(recordPath, frontmatter(fs.readFileSync(file, 'utf8')));
    }
  }
  const missionPrefix = '.pipes/project/03-missions/mission-';
  for (const [recordPath, record] of records) {
    const missionPaths = (record.related || []).filter((value) => value.startsWith(missionPrefix));
    for (const missionPath of missionPaths) {
      const mission = records.get(missionPath);
      if (!mission || (mission.related || []).includes(recordPath)) continue;
      const level = mission.values.status === 'done' ? 'warning' : 'error';
      finding(findings, level, recordPath, 'mission-related-reciprocal', 'Mission-related record is unlinked or not reciprocal with its invoking mission: ' + missionPath);
    }
    if (!recordPath.startsWith(missionPrefix)) continue;
    for (const targetPath of record.related || []) {
      const target = records.get(targetPath);
      if (!target || (target.related || []).includes(recordPath)) continue;
      const level = record.values.status === 'done' ? 'warning' : 'error';
      finding(findings, level, recordPath, 'mission-related-reciprocal', 'Invoking mission and related project record must link reciprocally: ' + targetPath);
    }
  }
}

function validatePlanOutcomeRelationships(root, findings) {
  const planDir = path.join(root, 'project', '04-plans');
  const outcomeDir = path.join(root, 'project', '06-outcomes');
  const outcomes = new Map(listFiles(outcomeDir, 'outcome-').map((file) => {
    const recordPath = '.pipes/' + path.relative(root, file).split(path.sep).join('/');
    return [recordPath, frontmatter(fs.readFileSync(file, 'utf8'))];
  }));
  for (const file of listFiles(planDir, 'plan-')) {
    const recordPath = '.pipes/' + path.relative(root, file).split(path.sep).join('/');
    const plan = frontmatter(fs.readFileSync(file, 'utf8'));
    const declared = (plan.related || []).filter((value) => value.startsWith('.pipes/project/06-outcomes/outcome-'));
    const inbound = [...outcomes.entries()]
      .filter(([, outcome]) => (outcome.related || []).includes(recordPath))
      .map(([outcomePath]) => outcomePath);
    const candidates = [...new Set([...declared, ...inbound])];
    const legacyLevel = plan.values.status === 'done' ? 'warning' : 'error';
    if (candidates.length > 1) {
      finding(findings, legacyLevel, recordPath, 'plan-outcome-duplicate', 'Plan has multiple related outcome candidates: ' + candidates.join(', '));
    }
    for (const outcomePath of candidates) {
      const outcome = outcomes.get(outcomePath);
      if (!outcome) continue;
      const planLinksOutcome = declared.includes(outcomePath);
      const outcomeLinksPlan = (outcome.related || []).includes(recordPath);
      if (!planLinksOutcome || !outcomeLinksPlan) {
        finding(findings, legacyLevel, recordPath, 'plan-outcome-reciprocal', 'Plan and outcome must link reciprocally: ' + outcomePath);
      }
      if (!['succeeded', 'partial', 'failed', 'cancelled'].includes(outcome.values.result)) {
        finding(findings, legacyLevel, outcomePath, 'plan-outcome-result', 'Related plan outcome has no supported terminal result.');
      }
    }
  }
}

const SPEC_PREFIX = '.pipes/project/02-specs/spec-';
const INTENT_PREFIX = '.pipes/project/01-intents/intent-';

function specRequirementIds(body) {
  return [...section(body, 'Requirements').matchAll(/^- \*\*(R\d+)\*\*\s+\S/gm)].map((match) => match[1]);
}

function readRecords(root, area, prefix) {
  return new Map(listFiles(path.join(root, 'project', area), prefix).map((file) => [
    '.pipes/' + path.relative(root, file).split(path.sep).join('/'),
    frontmatter(fs.readFileSync(file, 'utf8')),
  ]));
}

function validateSpecTraceability(root, findings) {
  const specs = readRecords(root, '02-specs', 'spec-');
  const specIds = new Map();
  for (const [recordPath, spec] of specs) {
    const ids = specRequirementIds(spec.body);
    specIds.set(recordPath, new Set(ids));
    const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
    if (duplicates.length) {
      finding(findings, 'error', recordPath, 'spec-requirement-duplicate', 'Requirement IDs must be unique: ' + duplicates.join(', '));
    }
    if (!ids.length) {
      finding(findings, 'warning', recordPath, 'spec-requirements-missing', 'Spec has no requirements written as `- **R1** ...` under `## Requirements`.');
    }
    if (!(spec.related || []).some((value) => value.startsWith(INTENT_PREFIX))) {
      finding(findings, 'warning', recordPath, 'spec-intent-missing', 'Spec does not relate to an intent in `01-intents`.');
    }
  }
  for (const [recordPath, plan] of readRecords(root, '04-plans', 'plan-')) {
    const relatedSpecs = (plan.related || []).filter((value) => value.startsWith(SPEC_PREFIX));
    if (!relatedSpecs.length) continue;
    const level = plan.values.status === 'done' ? 'warning' : 'error';
    const traceability = section(plan.body, 'Spec Traceability');
    if (!traceability.trim()) {
      finding(findings, level, recordPath, 'plan-traceability-missing', 'Plan relates to a spec but has no `## Spec Traceability` section.');
      continue;
    }
    const known = new Set(relatedSpecs.flatMap((specPath) => [...(specIds.get(specPath) || [])]));
    const cited = [...new Set([...traceability.matchAll(/\bR\d+\b/g)].map((match) => match[0]))];
    const unknown = cited.filter((id) => !known.has(id));
    if (unknown.length) {
      finding(findings, level, recordPath, 'plan-requirement-unknown', 'Plan cites requirement IDs absent from its related spec: ' + unknown.join(', '));
    }
  }
}

function validateProjectRecords(root = DEFAULT_ROOT, options = {}) {
  const absoluteRoot = path.resolve(root);
  const findings = [];
  for (const [area, prefix] of AREAS) {
    const areaPath = path.join(absoluteRoot, 'project', area);
    const configPath = path.join(areaPath, 'config.md');
    if (!fs.existsSync(configPath)) {
      finding(findings, 'blocked', '.pipes/project/' + area + '/config.md', 'config-missing', 'Area config is missing.');
      continue;
    }
    const contract = configContract(fs.readFileSync(configPath, 'utf8'));
    if (!contract.fields.length || !contract.statuses.length || new Set(contract.fields).size !== contract.fields.length || new Set(contract.statuses).size !== contract.statuses.length) {
      finding(findings, 'blocked', '.pipes/project/' + area + '/config.md', 'config-contradictory', 'Area config needs unique readable fields and statuses.');
      continue;
    }
    for (const file of listFiles(areaPath, prefix)) {
      const recordPath = '.pipes/' + path.relative(absoluteRoot, file).split(path.sep).join('/');
      const record = frontmatter(fs.readFileSync(file, 'utf8'));
      if (!record.block) {
        finding(findings, 'error', recordPath, 'frontmatter-missing', 'Record has no frontmatter.');
        continue;
      }
      for (const field of contract.fields) {
        if (!record.fields.includes(field)) finding(findings, 'error', recordPath, 'field-missing', 'Missing configured field: ' + field);
      }
      for (const field of record.fields) {
        if (!contract.fields.includes(field)) finding(findings, 'error', recordPath, 'field-unsupported', 'Unsupported field: ' + field);
      }
      for (const field of COMMON_FIELDS) {
        if (!record.fields.includes(field)) finding(findings, 'error', recordPath, 'field-common', 'Missing common field: ' + field);
      }
      if (record.values.status && !contract.statuses.includes(record.values.status)) {
        finding(findings, 'error', recordPath, 'status-invalid', 'Status is not configured: ' + record.values.status);
      }
      validateRelated(absoluteRoot, recordPath, record.related, findings);
      if (record.relatedStyle === 'flow') finding(findings, 'warning', recordPath, 'related-noncanonical', 'Write `related` as a YAML block list: `related: []` or one `  - path` line per file.');
      if (area === '03-missions') validateMission(absoluteRoot, recordPath, record, findings);
    }
  }
  findings.push(...inspectArtifactRecords(absoluteRoot, frontmatter, options));
  validateMissionRelationships(absoluteRoot, findings);
  validatePlanOutcomeRelationships(absoluteRoot, findings);
  validateSpecTraceability(absoluteRoot, findings);
  if (!findings.length) finding(findings, 'info', '.pipes/project', 'records-valid', 'All configured project records passed validation.');
  return findings;
}

function renderFindings(findings) {
  const counts = { info: 0, warning: 0, error: 0, blocked: 0 };
  findings.forEach((item) => { counts[item.level] += 1; });
  const lines = findings.map((item) => '[' + item.level + '] ' + item.path + ' ' + item.code + ' — ' + item.message);
  lines.push('Summary: info=' + counts.info + ' warning=' + counts.warning + ' error=' + counts.error + ' blocked=' + counts.blocked);
  return lines.join('\n') + '\n';
}

function run(options = {}) {
  const findings = validateProjectRecords(options.root || DEFAULT_ROOT, options);
  const failed = Boolean(options.strict) && findings.some((item) => item.level === 'error' || item.level === 'blocked');
  return { findings, failed, output: renderFindings(findings) };
}

if (require.main === module) {
  try {
    const options = parseArgs(process.argv);
    const result = run(options);
    process.stdout.write(result.output);
    if (result.failed) process.exitCode = 1;
  } catch (error) {
    process.stderr.write(error.message + '\n');
    process.exitCode = 1;
  }
}

module.exports = {
  configContract,
  frontmatter,
  parseArgs,
  renderFindings,
  run,
  validateProjectRecords,
};
