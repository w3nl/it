#!/usr/bin/env node
// Checks the Dutch translation (lang/nl/*.txt) against the game's English text.
//   node tools/i18n-check.js            report untranslated text and stale keys
//   node tools/i18n-check.js --missing  list only the untranslated text, file by file
//   node tools/i18n-check.js --stale    list only keys that no longer match any English text, and keys translated
//                                       twice in different ways (exit 1 if any; the tests run this)
// The English text is collected from js/*.js (string literals and the text inside HTML templates),
// index.html and scenes/*.svg (text nodes, plus data-label, aria-label, title, placeholder and alt).
// It's a heuristic: some "missing" lines are code (ids, CSS, commands) that never needs translating.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

/* ---------- reading the translation files ---------- */
const norm = s => s.replace(/\s+/g, ' ').trim();
function readLang(dir) {
  const keys = new Map(), patterns = [], conflicts = [];
  for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.txt')).sort()) {
    const lines = fs.readFileSync(path.join(dir, file), 'utf8').split('\n');
    let key = null, re = null;
    lines.forEach((line, i) => {
      if (line.startsWith('= ')) { key = line.slice(2); re = null; }
      else if (line.startsWith('~ ')) { re = line.slice(2); key = null; }
      else if (line.startsWith('> ')) {
        if (key !== null) {
          const k = norm(key.replace(/\\n/g, '\n')), prev = keys.get(k);
          if (prev && prev.value !== line.slice(2)) conflicts.push(`${prev.file}:${prev.line} and ${file}:${i + 1}  ${k}`);
          keys.set(k, { file, line: i + 1, value: line.slice(2) });
        }
        else if (re !== null) patterns.push({ re: new RegExp(re), file, line: i + 1 });
        key = re = null;
      }
    });
  }
  return { keys, patterns, conflicts };
}

/* ---------- a small JavaScript lexer: string literals and template literals ---------- */
function unescape(s) {
  return s.replace(/\\(u\{[0-9a-fA-F]+\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|.)/gs, (_, e) => {
    if (e[0] === 'u') return String.fromCodePoint(parseInt(e.replace(/[u{}]/g, ''), 16));
    if (e[0] === 'x') return String.fromCharCode(parseInt(e.slice(1), 16));
    return { n: '\n', t: '\t', r: '' }[e] ?? e;
  });
}
const HOLE = '\u0000';
function lexStrings(src) {
  const out = []; let i = 0, prev = '';
  const regexAllowed = () => !prev || /[(,=:[!&|?{};+\-*%<>~^]$/.test(prev) || /\b(return|typeof|case|in|of)$/.test(prev);
  function readTemplate() { // at the opening backtick; returns text with HOLE for each ${…}
    let s = ''; i++;
    while (i < src.length && src[i] !== '`') {
      if (src[i] === '\\') { s += src.slice(i, i + 2); i += 2; continue; }
      if (src[i] === '$' && src[i + 1] === '{') { i += 2; s += HOLE; readCode('}'); i++; continue; }
      s += src[i++];
    }
    i++; return unescape(s);
  }
  function readCode(end) {
    let depth = 0;
    while (i < src.length) {
      const c = src[i];
      if (end && c === end && depth === 0) return;
      if (c === '{') depth++; else if (c === '}') depth--;
      if (c === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
      if (c === '/' && src[i + 1] === '*') { i = src.indexOf('*/', i + 2) + 2; continue; }
      if (c === '"' || c === "'") {
        let j = i + 1, s = '';
        while (src[j] !== c) { if (src[j] === '\\') { s += src.slice(j, j + 2); j += 2; } else s += src[j++]; }
        out.push(unescape(s)); i = j + 1; prev = 'str'; continue;
      }
      if (c === '`') { out.push(readTemplate()); prev = 'str'; continue; }
      if (c === '/' && regexAllowed()) {
        let j = i + 1, cls = false;
        while (j < src.length && (src[j] !== '/' || cls)) { if (src[j] === '\\') j++; else if (src[j] === '[') cls = true; else if (src[j] === ']') cls = false; j++; }
        j++; while (/[a-z]/i.test(src[j])) j++;
        i = j; prev = 'regex'; continue;
      }
      if (!/\s/.test(c)) prev = (/[\w$]/.test(c) ? (prev.match(/[\w$]*$/)[0] + c) : c);
      i++;
    }
  }
  readCode(null);
  return out;
}

/* ---------- turning strings and markup into the text a player sees ---------- */
// A tag has attributes or is a known bare tag, so "cat <file>" in a help text is not mistaken for HTML.
const TAG = /<!--[\s\S]*?-->|<![^>]*>|<\/[a-z][\w-]*\s*>|<[a-z][\w-]*\s[^>]*>|<(?:b|i|s|u|em|strong|small|br|div|span|p|code|dl|dt|dd|h\d|ul|li|table|thead|tbody|tr|td|th|g|defs|form|label|sup|sub|head|body|html|header|button|option|select|title)\/?>/gi;
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = s => s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => e[0] === '#' ? String.fromCodePoint(parseInt(e.slice(1).replace(/^x/i, '0x'))) : (ENT[e] ?? m));
function segments(str) {
  const segs = [];
  const attr = /\b(?:data-label|aria-label|title|placeholder|alt)="([^"]*)"/g; let m;
  while ((m = attr.exec(str))) segs.push(...m[1].split(HOLE));
  // text between tags; a ${…} inside a sentence is kept as {…} so it can be found as a placeholder
  const text = str.replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ').replace(TAG, '\u0001');
  text.split('\u0001').forEach(t => segs.push(t.replace(new RegExp(HOLE, 'g'), '{…}')));
  return segs.map(s => norm(decode(s))).filter(s => /[A-Za-z]{2}/.test(s));
}
const looksLikeCode = s =>
  /^[\w-]+$/.test(s) && !/^[A-Z][a-z]+$/.test(s) && !/^[A-Z]{2,}$/.test(s) // ids, classes, keys
  || /^[#.]?[\w-]+(\s*[,>]\s*[#.]?[\w-]+)*$/.test(s) && /[#.-]/.test(s)    // selectors
  || /^(M|m)[\d .,-]+/.test(s) || /^[\w-]+:[^ ]/.test(s)                     // paths, css
  || /^(px|em|rem|%|svg|http|url)\b/.test(s) || /^\{…\}$/.test(s);

const wholeStrings = new Set();   // every string literal as a whole, so a key for tx('<b>…</b> …') is not reported as stale
function collect() {
  const found = new Map(); // text -> first file
  const add = (t, file) => { if (!found.has(t)) found.set(t, file); };
  for (const f of fs.readdirSync(path.join(ROOT, 'js')).filter(f => f.endsWith('.js'))) {
    if (f === 'boot.js' || f === 'i18n.js' || f === 'ambience.js') continue;
    for (const s of lexStrings(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'))) {
      wholeStrings.add(norm(s));
      const segs = new RegExp(TAG.source, 'i').test(s) || s.includes(HOLE) ? segments(s) : [norm(s)].filter(x => /[A-Za-z]{2}/.test(x));
      segs.filter(x => !looksLikeCode(x)).forEach(x => add(x, 'js/' + f));
    }
  }
  const markup = ['index.html', ...fs.readdirSync(path.join(ROOT, 'scenes')).map(f => 'scenes/' + f)];
  for (const f of markup) segments(fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/<title>[\s\S]*?<\/title>|<defs>[\s\S]*?<\/defs>/g, '')).filter(x => !looksLikeCode(x)).forEach(x => add(x, f));
  return found;
}

/* ---------- report ---------- */
const { keys, patterns, conflicts } = readLang(path.join(ROOT, 'lang', 'nl'));
const found = collect();
const translated = t => keys.has(t) || patterns.some(p => p.re.test(t));
const missing = [...found].filter(([t]) => !translated(t));
// A key is stale when it matches no collected text, not even as a {placeholder} template.
const templ = [...found.keys()].filter(t => t.includes('{…}')).map(t => new RegExp('^' + t.split('{…}').map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$'));
const allText = [...found.keys()].join('\n');
const stale = [...keys].filter(([k]) => !found.has(k) && !wholeStrings.has(k) && !templ.some(r => r.test(k)) && !allText.includes(k.replace(/\{\w+\}/g, '')));
const mode = process.argv[2];
if (mode !== '--stale') {
  let last = '';
  for (const [t, f] of missing) { if (f !== last) console.log(`\n# ${f}`); last = f; console.log(t); }
}
if (mode !== '--missing') {
  if (stale.length) { console.log('\nStale keys (no matching English text):'); stale.forEach(([k, w]) => console.log(`  ${w.file}:${w.line}  ${k}`)); }
  if (conflicts.length) { console.log('\nThe same English text translated in two different ways:'); conflicts.forEach(c => console.log('  ' + c)); }
}
console.log(`\n${found.size} English texts, ${found.size - missing.length} translated, ${missing.length} not (some are code), ${stale.length} stale keys, ${conflicts.length} conflicts.`);
process.exit(mode === '--stale' && (stale.length || conflicts.length) ? 1 : 0);
