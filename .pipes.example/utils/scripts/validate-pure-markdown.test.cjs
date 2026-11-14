const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {
  defaultMarkdownFiles,
  findRawHtml,
  validateMarkdownFiles,
} = require('./validate-pure-markdown.cjs');

test('rejects renderable HTML and HTML-like JSX', () => {
  const source = [
    '# Invalid',
    '<br>',
    '<section class="notice">',
    'content',
    '</section>',
    '<Widget enabled />',
    '<Layout.Header compact={true}>',
    '<!doctype html>',
    '<![CDATA[raw]]>',
    '<>',
    '</>',
  ].join('\n');
  assert.deepEqual(
    findRawHtml(source).map((item) => item.markup),
    ['<br>', '<section class="notice">', '</section>', '<Widget enabled />', '<Layout.Header compact={true}>', '<!doctype html>', '<![CDATA[raw]]>', '<>', '</>'],
  );
});

test('allows literal examples only in code and preserves Markdown autolinks and comments', () => {
  const source = [
    'Use `<br>` only as a literal example.',
    '',
    '```html',
    '<div>literal</div>',
    '```',
    '',
    '<https://example.com>',
    '<user@example.com>',
    '<!-- pipes-notebook:start -->',
  ].join('\n');
  assert.deepEqual(findRawHtml(source), []);
});

test('detects multiline tags with exact source locations', () => {
  const source = [
    '# Invalid',
    '<div',
    '  class="notice">',
    'content',
  ].join('\n');
  assert.deepEqual(findRawHtml(source), [{
    line: 2,
    column: 1,
    markup: '<div class="notice">',
  }]);
});

test('current staged Markdown and generated discovery surfaces contain no renderable raw HTML', () => {
  const root = path.resolve(__dirname, '..', '..');
  assert.deepEqual(validateMarkdownFiles(defaultMarkdownFiles(root)), []);
});
