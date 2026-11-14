#!/usr/bin/env node
// PreToolUse hook for Edit, Write, and NotebookEdit. Enforces rule-framework-provenance:
// the installed manifest and baseline archive are immutable provenance. Read-only.
// Shell rewrites bypass this hook, so the provenance --check and the test suite repeat the check.
const path = require('node:path');

const PROTECTED = [
  ['.pipes', 'manifest.json'],
  ['.pipes', 'framework-baseline.json.gz'],
];

function targetPath(input) {
  const toolInput = input?.tool_input || {};
  return toolInput.file_path || toolInput.notebook_path || toolInput.path || '';
}

function decide(input) {
  if (!input || !['Edit', 'Write', 'MultiEdit', 'NotebookEdit'].includes(input.tool_name)) return { decision: 'none' };
  const target = targetPath(input);
  if (!target) return { decision: 'none' };
  const resolved = path.resolve(input.cwd || process.cwd(), target);
  const parts = resolved.split(path.sep);
  const [parent, name] = parts.slice(-2);
  if (PROTECTED.some(([dir, file]) => parent === dir && name === file)) {
    return {
      decision: 'deny',
      reason: path.join(parent, name) + ' is immutable framework provenance (rule-framework-provenance). Only an authorized upgrade may replace it; refresh fork control with generate-framework-provenance.cjs --refresh-fork.',
    };
  }
  return { decision: 'none' };
}

function hookOutput(result) {
  if (result.decision === 'none') return '';
  return JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: result.decision,
      permissionDecisionReason: result.reason,
    },
  });
}

function main() {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { raw += chunk; });
  process.stdin.on('end', () => {
    let input;
    try { input = JSON.parse(raw || '{}'); }
    catch { input = null; }
    process.stdout.write(hookOutput(decide(input)));
  });
}

if (require.main === module) main();

module.exports = { decide, hookOutput };
