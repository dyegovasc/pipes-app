const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { DEFAULT_G5_HOLDER, decide, g5HolderFrom } = require('./hook-guard-protected-actions.cjs');
const { parseProfile } = require('./delivery-profile.cjs');

// A neutral fixture profile, so these cases do not depend on the installed project's profile. Its names
// start with fixture- or FX so that the leak test never matches a real project's environment or workflow.
const FIXTURE_PROFILE = parseProfile([
  '## Protected Branches', '', '| Branch | Rule |', '| --- | --- |', '| `main` | PR only |', '| `master` | PR only |', '| `develop` | PR only |', '',
  '## Environments', '', '| Environment | Autonomy | Dispatch |', '| --- | --- | --- |',
  '| `fixture-auto` | `auto` | on merge |', '| `fixture-ask` | `ask` | x |', '| `*` | `ticket` | y |', '',
  '## Change Tickets', '', '| Key | Value |', '| --- | --- |', '| Pattern | `FXT-\\d+` |', '| Approver | Fixture approver |', '',
  '## Release Workflows', '', '| Workflow | Purpose |', '| --- | --- |', '| `fixture-ship.yml` | ship |', '| `fixture-rollout.yml` | roll out |',
].join('\n'));

const bash = (command, branch = 'feature/x') => decide(
  { tool_name: 'Bash', tool_input: { command }, cwd: '/repo' },
  { currentBranch: () => branch, profile: FIXTURE_PROFILE },
).decision;

const CASES = [
  ['ls -la', 'none'],
  ['git status && git diff', 'none'],
  ['make build', 'none'],
  ['git commit -m "feat: x"', 'ask'],
  ['git -C fixture-app commit -am "x"', 'ask'],
  ['git push origin feature/x', 'ask'],
  ['git push', 'ask'],
  ['git push origin main', 'deny'],
  ['git push origin HEAD:develop', 'deny'],
  ['git push origin feature/x:refs/heads/master', 'deny'],
  ['git push --force origin feature/x', 'deny'],
  ['git push --force-with-lease', 'deny'],
  ['git push origin +feature/x', 'deny'],
  ['git push origin --delete feature/x', 'deny'],
  ['git push --all', 'deny'],
  ['cd fixture-app && git push origin main', 'deny'],
  ['echo ok; git push origin main', 'deny'],
  ['bash -c "git push origin main"', 'deny'],
  ['FOO=1 git commit -m x', 'ask'],
  ['gh pr create --fill', 'ask'],
  ['gh pr merge 12 --squash', 'deny'],
  ['gh pr review 12 --approve', 'deny'],
  ['gh pr review 12 --comment -b "looks fine"', 'ask'],
  ['gh pr review 12 --request-changes -b "see findings"', 'ask'],
  ['gh pr comment 12 --body-file review.md', 'ask'],
  ['gh issue comment 7 -b "x"', 'ask'],
  ['git -C fixture-app worktree add /tmp/review-12 pr-12', 'none'],
  ['git -C fixture-app fetch origin pull/12/head:pr-12', 'none'],
  ['gh pr view 12', 'none'],
  ['gh workflow run fixture-rollout.yml -f version=0.9.0 -f environment=fixture-ask', 'ask'],
  ['gh workflow run fixture-ship.yml -f environment=fixture-auto', 'ask'],
  ['gh workflow run fixture-rollout.yml -f version=1.0.0 -f environment=fixture-prod', 'deny'],
  ['gh workflow run fixture-rollout.yml -f environment=fixture-prod -f ticket=FXT-1234', 'ask'],
  ['gh workflow run fixture-rollout.yml -f environment=fixture-prod -f ticket=FXX-1234', 'deny'],
  ['gh workflow run fixture-rollout.yml -f version=1.0.0', 'deny'],
  ['gh workflow run terraform.yaml', 'ask'],
  ['terraform plan', 'none'],
  ['terraform -chdir=infra apply -auto-approve', 'deny'],
  ['terraform state rm module.x', 'deny'],
  ['kubectl get pods', 'none'],
  ['kubectl apply -f deploy.yaml', 'deny'],
  ['kubectl -n app scale deploy/api --replicas=0', 'deny'],
  ['flux get kustomizations', 'none'],
  ['flux reconcile kustomization app', 'deny'],
  ['helm upgrade app ./chart', 'deny'],
  ['echo "git push origin main"', 'none'],
];

test('protected-action hook returns the expected decision for each command', () => {
  for (const [command, expected] of CASES) assert.equal(bash(command), expected, command);
});

test('heredoc bodies are data, not commands, but the command around them is still checked', () => {
  const heredoc = (body, after = '') => ['python3 - <<\'EOF\'', body, 'EOF', after].filter(Boolean).join('\n');
  assert.equal(bash(heredoc('# note: profile; command gh pr merge 1 -> fine')), 'none');
  assert.equal(bash(heredoc('print("git push origin main")')), 'none');
  assert.equal(bash(heredoc('x = 1', 'git push origin main')), 'deny', 'a command after the heredoc is checked');
  assert.equal(bash('cat <<EOF | gh pr merge 1\nbody\nEOF'), 'deny', 'the command line that opens the heredoc is checked');
});

test('push without a refspec uses the current branch', () => {
  assert.equal(bash('git push', 'main'), 'deny');
  assert.equal(bash('git push origin HEAD', 'develop'), 'deny');
  assert.equal(bash('git push', null), 'ask');
});

test('non-Bash tools are ignored', () => {
  assert.equal(decide({ tool_name: 'Read', tool_input: { file_path: 'x' } }).decision, 'none');
});

test('CLI prints a PreToolUse permission decision', () => {
  const run = (input) => spawnSync(process.execPath, [path.join(__dirname, 'hook-guard-protected-actions.cjs')], { input: JSON.stringify(input), encoding: 'utf8' });
  const denied = run({ tool_name: 'Bash', tool_input: { command: 'gh pr merge 1' }, cwd: __dirname });
  assert.equal(denied.status, 0);
  const output = JSON.parse(denied.stdout);
  assert.equal(output.hookSpecificOutput.hookEventName, 'PreToolUse');
  assert.equal(output.hookSpecificOutput.permissionDecision, 'deny');
  assert.match(output.hookSpecificOutput.permissionDecisionReason, /G4/);
  assert.equal(run({ tool_name: 'Bash', tool_input: { command: 'ls' }, cwd: __dirname }).stdout, '');
});

const { DEFAULT_PROFILE } = require('./delivery-profile.cjs');

const withProfile = (profile) => (command, branch = 'feature/x') => decide(
  { tool_name: 'Bash', tool_input: { command }, cwd: '/repo' },
  { currentBranch: () => branch, profile },
).decision;

test('without a delivery profile the hook falls back to safe defaults', () => {
  const run = withProfile(DEFAULT_PROFILE);
  assert.equal(run('git push origin main'), 'deny');
  assert.equal(run('git push origin develop'), 'ask', 'develop is protected only when a profile says so');
  assert.equal(run('gh workflow run fixture-deploy.yml -f environment=fixture-any'), 'ask', 'without a profile every release or promotion asks the G5 holder');
  assert.equal(run('gh workflow run fixture-deploy.yml'), 'ask', 'a release without an environment also asks');
  const reason = decide({ tool_name: 'Bash', tool_input: { command: 'gh workflow run release.yml -f environment=production' }, cwd: '/repo' }, { currentBranch: () => 'feature/x', profile: DEFAULT_PROFILE, g5Holder: DEFAULT_G5_HOLDER }).reason;
  assert.match(reason, /you, the G5 holder/);
  assert.match(reason, /gate G5/);
  assert.equal(run('gh workflow run lint.yml'), 'ask');
});

test('another project profile changes branches, environments, ticket pattern, and workflows', () => {
  const run = withProfile(parseProfile([
    '## Protected Branches', '', '| Branch | Rule |', '| --- | --- |', '| `trunk` | PR only |', '',
    '## Environments', '', '| Environment | Autonomy | Dispatch |', '| --- | --- | --- |',
    '| `fixture-qa` | `ask` | x |', '| `*` | `ticket` | y |', '',
    '## Change Tickets', '', '| Key | Value |', '| --- | --- |', '| Pattern | `FXT-\\d+` |', '| Approver | Fixture approvers |', '',
    '## Release Workflows', '', '| Workflow | Purpose |', '| --- | --- |', '| `fixture-ship.yml` | ship |',
  ].join('\n')));
  assert.equal(run('git push origin trunk'), 'deny');
  assert.equal(run('git push origin main'), 'ask');
  assert.equal(run('gh workflow run fixture-ship.yml -f environment=fixture-qa'), 'ask');
  assert.equal(run('gh workflow run fixture-ship.yml -f environment=fixture-live'), 'deny');
  assert.equal(run('gh workflow run fixture-ship.yml -f environment=fixture-live -f t=FXT-7'), 'ask');
  assert.equal(run('gh workflow run fixture-ship.yml -f environment=fixture-live -f t=FXR-7'), 'deny', 'another project\'s ticket pattern does not apply');
  assert.equal(run('gh workflow run deploy-docs.yml -f environment=fixture-live'), 'ask', 'not a release workflow in this profile');
});

test('the G5 holder comes from the accountability matrix when it names one', () => {
  const matrix = (holder) => ['| Gate | Decision | Deciding human role | Holder resolved by |', '| --- | --- | --- | --- |', '| G4 Pull request | x | Code owner | fixture-owners |', '| G5 Release | x | Release approver | ' + holder + ' |'].join('\n');
  assert.equal(g5HolderFrom(matrix('fixture-release-team')), 'fixture-release-team');
  assert.equal(g5HolderFrom(matrix('{environment reviewers, or session user}')), DEFAULT_G5_HOLDER, 'a template placeholder is not a holder');
  assert.equal(g5HolderFrom(matrix('session user')), DEFAULT_G5_HOLDER);
  assert.equal(g5HolderFrom(''), DEFAULT_G5_HOLDER, 'no matrix means the user holds G5');
  const reason = decide({ tool_name: 'Bash', tool_input: { command: 'gh workflow run release.yml' }, cwd: '/repo' }, { currentBranch: () => 'feature/x', profile: DEFAULT_PROFILE, g5Holder: 'fixture-release-team' }).reason;
  assert.match(reason, /fixture-release-team \(gate G5\)/);
});

test('a profile that opts in to tickets keeps the ticket rule for an unlisted environment and for a dispatch without one', () => {
  const run = withProfile(parseProfile([
    '## Environments', '', '| Environment | Autonomy | Dispatch |', '| --- | --- | --- |',
    '| `fixture-qa` | `ask` | x |', '| `fixture-live` | `ticket` | y |', '',
    '## Change Tickets', '', '| Key | Value |', '| --- | --- |', '| Pattern | `FXT-\\d+` |', '| Approver | Fixture approvers |', '',
    '## Release Workflows', '', '| Workflow | Purpose |', '| --- | --- |', '| `fixture-ship.yml` | ship |',
  ].join('\n')));
  assert.equal(run('gh workflow run fixture-ship.yml -f environment=fixture-qa'), 'ask');
  assert.equal(run('gh workflow run fixture-ship.yml -f environment=fixture-live'), 'deny');
  assert.equal(run('gh workflow run fixture-ship.yml -f environment=fixture-staging'), 'deny', 'an unlisted environment needs a ticket when the profile uses tickets');
  assert.equal(run('gh workflow run fixture-ship.yml'), 'deny', 'a dispatch without an environment needs a ticket when the profile uses tickets');
  assert.equal(run('gh workflow run fixture-ship.yml -f t=FXT-9'), 'ask');
});

