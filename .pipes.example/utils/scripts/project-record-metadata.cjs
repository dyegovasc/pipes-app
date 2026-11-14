'use strict';
// Read-only, conservative metadata inspection. The native parser remains authoritative.
const KEYS = ['schema-version', 'sequence', 'starred', 'title', 'description', 'version', 'related'];
const RAW = new Set(['script', 'style', 'title', 'noscript', 'textarea', 'xmp', 'iframe', 'noembed', 'noframes']);
function decode(value) {
  return value.replace(/&([^;\s<&]+);?/g, (raw, name) => {
    if (!raw.endsWith(';')) throw new Error('Unsupported entity without a semicolon');
    const named = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: '\u00a0' };
    if (Object.hasOwn(named, name)) return named[name];
    let n;
    if (/^#x[0-9a-f]+$/i.test(name)) n = parseInt(name.slice(2), 16);
    else if (/^#\d+$/.test(name)) n = Number(name.slice(1));
    if (!Number.isInteger(n) || n <= 0 || n > 0x10ffff || n >= 0xd800 && n <= 0xdfff || n >= 0x80 && n <= 0x9f) throw new Error('Unsupported entity: ' + raw);
    return String.fromCodePoint(n);
  });
}
function attributes(text) {
  const values = new Map(); let position = 0;
  while (position < text.length) {
    while (/\s/.test(text[position] || '') && position < text.length) position++;
    if (position === text.length || text.slice(position).trim() === '/') break;
    const match = /^[^\s=<>/"'`]+/.exec(text.slice(position));
    if (!match) throw new Error('Ambiguous HTML attribute');
    const key = match[0].toLowerCase(); position += match[0].length;
    while (/\s/.test(text[position] || '') && position < text.length) position++;
    let value = '';
    if (text[position] === '=') {
      position++; while (/\s/.test(text[position] || '') && position < text.length) position++;
      const quote = text[position];
      if (quote === '"' || quote === "'") {
        const end = text.indexOf(quote, ++position); if (end < 0) throw new Error('Unclosed attribute');
        value = text.slice(position, end); position = end + 1;
      } else {
        const match = /^[^\s<>"'`=]+/.exec(text.slice(position));
        if (!match) throw new Error('Missing attribute value');
        value = match[0]; position += value.length;
      }
    }
    if (values.has(key)) throw new Error('Duplicate attribute: ' + key);
    values.set(key, decode(value));
  }
  return values;
}
function readHtmlMetadata(input) {
  const fields = {}; const diagnostics = []; let relatedPresent = false;
  try {
    const content = Buffer.isBuffer(input) ? new TextDecoder('utf-8', { fatal: true }).decode(input) : String(input);
    let index = content.charCodeAt(0) === 0xfeff ? 1 : 0; let body = false; let head = false; const ignored = [];
    while (index < content.length) {
      if (content.startsWith('<!--', index)) {
        const end = content.indexOf('-->', index + 4); if (end < 0) throw new Error('Unclosed HTML comment'); index = end + 3; continue;
      }
      if (content[index] !== '<') {
        const end = content.indexOf('<', index); const stop = end < 0 ? content.length : end;
        if (!ignored.length && content.slice(index, stop).trim()) body = true;
        index = stop; continue;
      }
      if (/^<!doctype\b/i.test(content.slice(index))) { const end = content.indexOf('>',index); if (end<0) throw new Error('Unclosed doctype'); index=end+1; continue; }
      const match = /^<(\/)?([a-z][a-z0-9:-]*)\b/i.exec(content.slice(index));
      if (!match) throw new Error('Unsupported HTML token');
      let end = index + match[0].length; let quote = null;
      for (; end < content.length; end++) {
        const c = content[end]; if (quote) { if (c === quote) quote = null; } else if (c === '"' || c === "'") quote=c; else if (c === '>') break;
      }
      if (end === content.length || quote) throw new Error('Unclosed HTML tag');
      const tag = match[2].toLowerCase(); const closing = !!match[1]; const rawAttributes=content.slice(index+match[0].length,end); index=end+1;
      if (RAW.has(tag) && !closing) {
        const close = new RegExp('</' + tag + '\\s*>','ig'); close.lastIndex=index; const found=close.exec(content);
        if (!found) throw new Error('Unclosed raw-text element: ' + tag);
        index=close.lastIndex; continue;
      }
      if (ignored.length) {
        if (!closing && tag === ignored.at(-1)) ignored.push(tag);
        else if (closing && tag === ignored.at(-1)) ignored.pop();
        continue;
      }
      if (tag === 'template' || tag === 'svg' || tag === 'math') {
        if (!closing) { ignored.push(tag); if (tag !== 'template') body=true; } continue;
      }
      if (tag === 'head') { if (closing) body=true; else { if (head) throw new Error('Multiple heads'); head=true; } continue; }
      if (closing || tag === 'html') continue;
      if (!['meta','link','base'].includes(tag)) body=true;
      if (tag !== 'meta' || body) continue;
      const attrs = attributes(rawAttributes);
      if (attrs.has('charset') && !/^utf-?8$/i.test(attrs.get('charset'))) throw new Error('Unsupported encoding');
      if (/^content-type$/i.test(attrs.get('http-equiv') || '') && /charset\s*=\s*(?!utf-?8\b)/i.test(attrs.get('content') || '')) throw new Error('Unsupported encoding');
      const name = (attrs.get('name') || '').toLowerCase(); if (!name.startsWith('pipes:')) continue;
      const key = name.slice(6); if (!KEYS.includes(key)) continue;
      if (key === 'related') relatedPresent=true;
      if (Object.hasOwn(fields,key)) throw new Error('Duplicate pipes:' + key);
      if (!attrs.has('content')) throw new Error('Missing pipes:' + key + ' content');
      fields[key]=attrs.get('content');
    }
    if (ignored.length) throw new Error('Unclosed ignored content');
    for (const [key,value] of Object.entries(fields)) {
      if (key==='schema-version' && value!=='1' || key==='sequence' && (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value)<=0) || key==='starred' && !['true','false'].includes(value) || key==='title' && !value.trim() || key==='version' && !/^\d+\.\d+$/.test(value) || value.includes('\0')) throw new Error('Invalid pipes:' + key);
    }
    if (relatedPresent) {
      const related=JSON.parse(fields.related); if (!Array.isArray(related) || related.some(p=>typeof p!=='string' || !p || /[\\:\u0000]/.test(p) || p.split('/').some(s=>!s || s==='.' || s==='..')) || new Set(related).size!==related.length) throw new Error('Invalid pipes:related');
    }
  } catch (error) { diagnostics.push(error.message); }
  return { state: diagnostics.length ? 'invalid' : Object.keys(fields).length===KEYS.length ? 'complete' : Object.keys(fields).length ? 'partial' : 'absent', relatedPresent,
    fields, related: relatedPresent && !diagnostics.length ? JSON.parse(fields.related) : [], diagnostics };
}
module.exports={ readHtmlMetadata, decode };
