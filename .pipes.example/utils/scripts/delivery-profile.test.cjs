const test = require('node:test');
const assert = require('node:assert/strict');
const { DEFAULT_PROFILE, environmentRule, loadProfile, parseProfile, validateProfile } = require('./delivery-profile.cjs');

test('the installed delivery profile parses and validates, or defaults apply without one', () => {
  const profile = loadProfile();
  if (!profile.source) {
    assert.equal(profile, DEFAULT_PROFILE, 'a starter without delivery.md uses the defaults');
    return;
  }
  assert.deepEqual(validateProfile(profile), []);
  assert.ok(profile.protectedBranches.length > 0);
  assert.ok(profile.environments.some((environment) => environment.name === '*'));
});

test('tables are read by section heading and backticks are removed', () => {
  const profile = parseProfile('---\ntitle: X\n---\n## Layout\n\n| Key | Value |\n| --- | --- |\n| Mode | `multi-repo` |\n| Services root | `services` |\n\n## Environments\n\n| Environment | Autonomy | Dispatch |\n| --- | --- | --- |\n| `qa` | `ask` | `gh workflow run x.yml` |\n');
  assert.deepEqual(profile.layout, { mode: 'multi-repo', servicesRoot: 'services' });
  assert.deepEqual(profile.environments, [{ name: 'qa', autonomy: 'ask', dispatch: 'gh workflow run x.yml' }]);
  assert.equal(environmentRule(profile, 'qa').autonomy, 'ask');
  assert.equal(environmentRule(profile, 'prod').autonomy, 'ticket', 'unknown environments need a ticket');
});

test('validation reports bad values', () => {
  const errors = validateProfile(parseProfile('## Layout\n\n| Key | Value |\n| --- | --- |\n| Mode | `mono` |\n\n## Environments\n\n| Environment | Autonomy | Dispatch |\n| --- | --- | --- |\n| `qa` | `sometimes` | x |\n| `*` | `ticket` | y |\n'));
  assert.ok(errors.some((error) => /Layout mode/.test(error)));
  assert.ok(errors.some((error) => /Protected Branches/.test(error)));
  assert.ok(errors.some((error) => /autonomy sometimes/.test(error)));
  assert.ok(errors.some((error) => /no pattern/.test(error)));
});

test('the default profile is safe and valid in shape', () => {
  assert.deepEqual(DEFAULT_PROFILE.protectedBranches, ['main', 'master']);
  assert.equal(environmentRule(DEFAULT_PROFILE, 'anything').autonomy, 'ticket');
});

test('an Evals table makes eval results required at gate G6; without it they are recommended', () => {
  const withTable = parseProfile('## Evals\n\n| Key | Value |\n| --- | --- |\n| Routine model | `fixture-model` |\n| Milestone model | `default` |\n');
  assert.deepEqual(withTable.evals, { required: true, routineModel: 'fixture-model', milestoneModel: null });
  assert.equal(parseProfile('## Layout\n\n| Key | Value |\n| --- | --- |\n| Mode | `single-repo` |\n').evals.required, false);
  assert.equal(DEFAULT_PROFILE.evals.required, false, 'a starter without delivery.md does not require eval results');
  assert.equal(parseProfile('## Evals\n\nThis project runs no evals yet.\n').evals.required, false, 'a heading without a table is not a requirement');
  assert.equal(parseProfile('## Evals\n\n| Key | Value |\n| --- | --- |\n').evals.required, false, 'a table without rows is not a requirement');
});
