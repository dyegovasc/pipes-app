#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_PIPE_ROOT = path.resolve(__dirname, '..', '..');
const GENERATED_WRAPPERS = [
  'AGENTS.md',
  'CLAUDE.md',
  '.github/copilot-instructions.md',
];
const GENERATED_SKILL_ROOTS = [
  '.agents/skills',
  '.claude/skills',
];

function markdownFiles(target) {
  if (!fs.existsSync(target)) return [];
  const stat = fs.statSync(target);
  if (stat.isFile()) return target.endsWith('.md') ? [target] : [];
  const out = [];
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    const child = path.join(target, entry.name);
    if (entry.isDirectory()) out.push(...markdownFiles(child));
    else if (entry.name.endsWith('.md')) out.push(child);
  }
  return out.sort();
}

function generatedSkillFiles(workspaceRoot) {
  const out = [];
  for (const relative of GENERATED_SKILL_ROOTS) {
    const root = path.join(workspaceRoot, relative);
    if (!fs.existsSync(root)) continue;
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory() || !entry.name.startsWith('pipes.')) continue;
      out.push(...markdownFiles(path.join(root, entry.name)));
    }
  }
  return out;
}

function defaultMarkdownFiles(pipeRoot = DEFAULT_PIPE_ROOT) {
  const absolutePipeRoot = path.resolve(pipeRoot);
  const workspaceRoot = path.dirname(absolutePipeRoot);
  const files = [
    ...markdownFiles(absolutePipeRoot),
    ...GENERATED_WRAPPERS
      .map((relative) => path.join(workspaceRoot, relative))
      .filter((file) => fs.existsSync(file)),
    ...generatedSkillFiles(workspaceRoot),
  ];
  return [...new Set(files.map((file) => path.resolve(file)))].sort();
}

function maskRange(chars, start, end) {
  for (let index = start; index < end; index += 1) {
    if (chars[index] !== '\n' && chars[index] !== '\r') chars[index] = ' ';
  }
}

function maskFencedCode(source, chars) {
  const lines = source.match(/[^\n]*(?:\n|$)/g) || [];
  let offset = 0;
  let fence = null;
  for (const line of lines) {
    const content = line.replace(/\n$/, '').replace(/\r$/, '');
    if (fence) {
      maskRange(chars, offset, offset + line.length);
      const close = content.match(/^ {0,3}(`+|~+)[ \t]*$/);
      if (close && close[1][0] === fence.marker && close[1].length >= fence.length) fence = null;
    } else {
      const open = content.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
      if (open && !(open[1][0] === '`' && open[2].includes('`'))) {
        fence = { marker: open[1][0], length: open[1].length };
        maskRange(chars, offset, offset + line.length);
      }
    }
    offset += line.length;
  }
}

function maskHtmlComments(source, chars) {
  const pattern = /<!--[\s\S]*?-->/g;
  for (const match of source.matchAll(pattern)) {
    maskRange(chars, match.index, match.index + match[0].length);
  }
}

function maskAutolinks(source, chars) {
  const pattern = /<(?:[A-Za-z][A-Za-z0-9+.-]{1,31}:[^ <>\u0000-\u0020]*|[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?)>/g;
  for (const match of source.matchAll(pattern)) {
    maskRange(chars, match.index, match.index + match[0].length);
  }
}

function maskInlineCode(chars) {
  const source = chars.join('');
  for (let index = 0; index < source.length;) {
    if (source[index] !== '`') {
      index += 1;
      continue;
    }
    let length = 1;
    while (source[index + length] === '`') length += 1;
    const delimiter = '`'.repeat(length);
    let close = source.indexOf(delimiter, index + length);
    while (close >= 0 && (source[close - 1] === '`' || source[close + length] === '`')) {
      close = source.indexOf(delimiter, close + length);
    }
    if (close < 0) {
      index += length;
      continue;
    }
    maskRange(chars, index, close + length);
    index = close + length;
  }
}

function lineAndColumn(source, index) {
  const before = source.slice(0, index);
  const lastNewline = before.lastIndexOf('\n');
  return {
    line: (before.match(/\n/g) || []).length + 1,
    column: index - lastNewline,
  };
}

function finding(source, index, markup) {
  return {
    ...lineAndColumn(source, index),
    markup: markup.replace(/\s+/g, ' ').slice(0, 120),
  };
}

function findRawHtml(content) {
  const source = String(content);
  const chars = source.split('');
  maskFencedCode(source, chars);
  maskHtmlComments(source, chars);
  maskAutolinks(source, chars);
  maskInlineCode(chars);
  const visible = chars.join('');
  const findings = [];
  const patterns = [
    /<\/?[A-Za-z][A-Za-z0-9_.:$-]*(?=[\t\n\f\r />])(?:[^<>"']|"[^"]*"|'[^']*')*>/g,
    /<![A-Za-z][^>]*>/g,
    /<!\[CDATA\[[\s\S]*?\]\]>/g,
    /<\?[^>]*\?>/g,
    /<\/?>/g,
  ];
  for (const pattern of patterns) {
    for (const match of visible.matchAll(pattern)) {
      findings.push(finding(source, match.index, source.slice(match.index, match.index + match[0].length)));
    }
  }
  const unclosedComment = visible.indexOf('<!--');
  if (unclosedComment >= 0) findings.push(finding(source, unclosedComment, '<!--'));
  return findings.sort((left, right) => left.line - right.line || left.column - right.column);
}

function validateMarkdownFiles(files) {
  const findings = [];
  for (const file of [...new Set(files.map((item) => path.resolve(item)))].sort()) {
    const content = fs.readFileSync(file, 'utf8');
    for (const issue of findRawHtml(content)) findings.push({ file, ...issue });
  }
  return findings;
}

function parseArgs(argv) {
  const options = {
    pipeRoot: DEFAULT_PIPE_ROOT,
    stdin: false,
    label: 'stdin',
    targets: [],
  };
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--stdin') options.stdin = true;
    else if (arg === '--root') {
      options.pipeRoot = path.resolve(argv[index + 1] || '');
      index += 1;
    } else if (arg.startsWith('--root=')) options.pipeRoot = path.resolve(arg.slice(7));
    else if (arg === '--label') {
      options.label = argv[index + 1] || 'stdin';
      index += 1;
    } else if (arg.startsWith('--label=')) options.label = arg.slice(8) || 'stdin';
    else options.targets.push(path.resolve(arg));
  }
  return options;
}

function report(findings, root) {
  if (!findings.length) {
    console.log('[info] pure-markdown-valid — No renderable raw HTML found.');
    return;
  }
  for (const issue of findings) {
    const label = issue.file ? path.relative(root, issue.file) || path.basename(issue.file) : issue.label;
    console.error('[error] ' + label + ':' + issue.line + ':' + issue.column + ' — raw HTML: ' + issue.markup);
  }
  console.error('Summary: error=' + findings.length);
  process.exitCode = 1;
}

function runCli() {
  const options = parseArgs(process.argv);
  const workspaceRoot = path.dirname(options.pipeRoot);
  if (options.stdin) {
    const content = fs.readFileSync(0, 'utf8');
    const findings = findRawHtml(content).map((issue) => ({ label: options.label, ...issue }));
    report(findings, workspaceRoot);
    return;
  }
  const files = options.targets.length
    ? options.targets.flatMap(markdownFiles)
    : defaultMarkdownFiles(options.pipeRoot);
  report(validateMarkdownFiles(files), workspaceRoot);
}

if (require.main === module) runCli();

module.exports = {
  defaultMarkdownFiles,
  findRawHtml,
  generatedSkillFiles,
  markdownFiles,
  parseArgs,
  validateMarkdownFiles,
};
