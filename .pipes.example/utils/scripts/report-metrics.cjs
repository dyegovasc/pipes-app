#!/usr/bin/env node
// Read-only report of the SDLC indicators that Pipes records and eval results already hold.
// A project can keep the catalog of its indicators as an artifact record in .pipes/project/07-artifacts/.
// Usage: node .pipes/utils/scripts/report-metrics.cjs [--json] [--root <.pipes dir>]
const fs = require('node:fs');
const path = require('node:path');
const { frontmatter } = require('./validate-project-records.cjs');

const DEFAULT_ROOT = path.resolve(__dirname, '..', '..');
const DAY = 24 * 60 * 60 * 1000;

function parseArgs(argv) {
  const options = { root: DEFAULT_ROOT, json: false };
  for (let index = 2; index < argv.length; index += 1) {
    if (argv[index] === '--json') options.json = true;
    else if (argv[index] === '--root') { options.root = path.resolve(argv[index + 1]); index += 1; }
    else throw new Error('Unknown argument: ' + argv[index]);
  }
  return options;
}

function records(root, area, prefix, recursive = false) {
  const dir = path.join(root, 'project', area);
  if (!fs.existsSync(dir)) return [];
  const files = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory() && recursive) walk(full);
      else if (entry.isFile() && entry.name.startsWith(prefix) && entry.name.endsWith('.md')) files.push(full);
    }
  };
  walk(dir);
  return files.sort().map((file) => {
    const record = frontmatter(fs.readFileSync(file, 'utf8'));
    return { path: '.pipes/' + path.relative(root, file).split(path.sep).join('/'), ...record };
  });
}

function days(from, to) {
  const start = Date.parse(from);
  const end = Date.parse(to);
  return Number.isFinite(start) && Number.isFinite(end) ? Math.round((end - start) / DAY) : null;
}

function stats(values) {
  const list = values.filter((value) => value !== null).sort((a, b) => a - b);
  if (!list.length) return { n: 0, median: null };
  const middle = Math.floor(list.length / 2);
  return { n: list.length, median: list.length % 2 ? list[middle] : (list[middle - 1] + list[middle]) / 2 };
}

function share(part, whole) {
  return whole ? Math.round((part / whole) * 100) : null;
}

function firstRelated(record, all, prefix) {
  const linked = all.filter((other) => other.path.startsWith(prefix) && (record.related || []).includes(other.path));
  return linked.sort((a, b) => String(a.values.created).localeCompare(String(b.values.created)))[0] || null;
}

function evalRuns(root) {
  const dir = path.join(root, 'utils', 'state', 'evals');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((name) => name.endsWith('.json')).sort().map((name) => {
    const results = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8')).results || [];
    return { run: name.replace(/\.json$/, ''), cases: results.length, passed: results.filter((item) => item.passed).length };
  }).filter((run) => run.cases > 0);
}

function computeMetrics(root = DEFAULT_ROOT) {
  const intents = records(root, '01-intents', 'intent-');
  const specs = records(root, '02-specs', 'spec-');
  const plans = records(root, '04-plans', 'plan-');
  const outcomes = records(root, '06-outcomes', 'outcome-');
  const reviews = records(root, '07-artifacts', 'artifact-', true).filter((item) => item.path.includes('/reviews/'));
  const all = [...intents, ...specs, ...plans, ...outcomes];

  const byStatus = intents.reduce((acc, item) => ({ ...acc, [item.values.status]: (acc[item.values.status] || 0) + 1 }), {});
  const decided = (byStatus.accepted || 0) + (byStatus.done || 0) + (byStatus.rejected || 0);

  const intentToSpec = intents.map((intent) => {
    const spec = firstRelated(intent, all, '.pipes/project/02-specs/');
    return spec ? days(intent.values.created, spec.values.created) : null;
  });
  const specToPlan = specs.map((spec) => {
    const plan = firstRelated(spec, all, '.pipes/project/04-plans/');
    return plan ? days(spec.values.created, plan.values.created) : null;
  });
  const specsWithPlans = specs.filter((spec) => firstRelated(spec, all, '.pipes/project/04-plans/'));
  const revisedSpecs = specsWithPlans.filter((spec) => String(spec.values.version || '1.0') !== '1.0');

  const planOutcomes = plans.map((plan) => ({ plan, outcome: firstRelated(plan, all, '.pipes/project/06-outcomes/') })).filter((item) => item.outcome);
  const succeeded = planOutcomes.filter((item) => item.outcome.values.result === 'succeeded').length;

  const verdicts = {};
  let blocking = 0;
  let policyFindings = 0;
  let proved = 0;
  let criteria = 0;
  for (const review of reviews) {
    const verdict = (String(review.values.description).match(/^(ready with findings|not ready|ready)\b/i)?.[1] || 'unknown').toLowerCase();
    verdicts[verdict] = (verdicts[verdict] || 0) + 1;
    blocking += Number(String(review.values.description).match(/(\d+) blocking/)?.[1] || 0);
    policyFindings += (review.body.match(/^\|\s*(blocking|major|minor)\s*\|[^\n]*\brule-[a-z0-9-]+/gim) || []).length;
    const verification = (review.body.split('## Verification')[1] || '').split('\n## ')[0];
    const rows = verification.split('\n').filter((line) => /^\|\s*[^-|\s]/.test(line) && !/Acceptance criterion or requirement/.test(line));
    criteria += rows.length;
    proved += rows.filter((line) => /\|\s*proved\s*\|/i.test(line)).length;
  }

  const correctionsFile = path.join(root, 'ai-instructions', 'corrections.md');
  const corrections = fs.existsSync(correctionsFile)
    ? fs.readFileSync(correctionsFile, 'utf8').split('\n').filter((line) => line.startsWith('- ') && !/None recorded yet/.test(line)).length
    : 0;
  const evalCasesDir = path.join(root, 'utils', 'scripts', 'fixtures', 'evals');
  const runs = evalRuns(root);

  return {
    intents: { total: intents.length, byStatus, survivalRatePercent: share((byStatus.accepted || 0) + (byStatus.done || 0), decided) },
    intentToFirstSpecDays: stats(intentToSpec),
    specToFirstPlanDays: stats(specToPlan),
    specsRevisedAfterPlan: { revised: revisedSpecs.length, withPlans: specsWithPlans.length },
    plans: { total: plans.length, closed: planOutcomes.length, firstPassSuccessPercent: share(succeeded, planOutcomes.length), planToOutcomeDays: stats(planOutcomes.map((item) => days(item.plan.values.created, item.outcome.values.created))) },
    reviews: { total: reviews.length, verdicts, blockingFindings: blocking, policyRuleFindings: policyFindings, verifierProvedPercent: share(proved, criteria) },
    corrections,
    evals: { cases: fs.existsSync(evalCasesDir) ? fs.readdirSync(evalCasesDir).filter((name) => name.endsWith('.json')).length : 0, runs: runs.length, lastRun: runs[runs.length - 1] || null },
  };
}

function render(metrics) {
  const show = (value) => (value === null || value === undefined ? 'n/a' : String(value));
  const median = (item) => (item.n ? show(item.median) + ' (n=' + item.n + ')' : 'n/a');
  const rows = [
    ['Intents by status', Object.entries(metrics.intents.byStatus).map(([key, value]) => key + ' ' + value).join(', ') || 'none'],
    ['Intent survival rate', show(metrics.intents.survivalRatePercent) + (metrics.intents.survivalRatePercent === null ? '' : '%')],
    ['Median days intent → first spec', median(metrics.intentToFirstSpecDays)],
    ['Median days spec → first plan', median(metrics.specToFirstPlanDays)],
    ['Specs revised after their first plan', metrics.specsRevisedAfterPlan.revised + ' of ' + metrics.specsRevisedAfterPlan.withPlans],
    ['Plans closed / total', metrics.plans.closed + ' / ' + metrics.plans.total],
    ['First-pass success', show(metrics.plans.firstPassSuccessPercent) + (metrics.plans.firstPassSuccessPercent === null ? '' : '%')],
    ['Median days plan → outcome', median(metrics.plans.planToOutcomeDays)],
    ['Reviews and verdicts', metrics.reviews.total + (metrics.reviews.total ? ' (' + Object.entries(metrics.reviews.verdicts).map(([key, value]) => key + ' ' + value).join(', ') + ')' : '')],
    ['Blocking findings / policy-rule findings', metrics.reviews.blockingFindings + ' / ' + metrics.reviews.policyRuleFindings],
    ['Criteria proved by the verifier', show(metrics.reviews.verifierProvedPercent) + (metrics.reviews.verifierProvedPercent === null ? '' : '%')],
    ['Corrections in the always-on ledger', String(metrics.corrections)],
    ['Eval cases / runs', metrics.evals.cases + ' / ' + metrics.evals.runs],
    ['Last eval run', metrics.evals.lastRun ? metrics.evals.lastRun.passed + '/' + metrics.evals.lastRun.cases + ' passed (' + metrics.evals.lastRun.run + ')' : 'n/a'],
  ];
  return ['| Indicator | Value |', '| --- | --- |', ...rows.map(([name, value]) => '| ' + name + ' | ' + value + ' |')].join('\n') + '\n';
}

if (require.main === module) {
  try {
    const options = parseArgs(process.argv);
    const metrics = computeMetrics(options.root);
    process.stdout.write(options.json ? JSON.stringify(metrics, null, 2) + '\n' : render(metrics));
  } catch (error) {
    process.stderr.write(error.message + '\n');
    process.exitCode = 1;
  }
}

module.exports = { computeMetrics, render, parseArgs };
