/**
 * i18n coverage audit.
 *
 * Catches two classes of problem:
 *  1. a language block missing a key that `id` has -> t() silently falls back
 *     to Indonesian, which is what makes "switching language" look broken.
 *  2. a key referenced by the code but absent from translations.ts -> t()
 *     returns the raw key (the visible "LMSACTPAGE" bug).
 *
 * Key references are collected from BOTH direct `tr(t, 'key', ...)` / `t('key')`
 * calls AND indirect declarations such as `labelKey: 'lmsActPage'`, which an
 * earlier version of this script missed.
 */
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync('src/i18n/translations.ts', 'utf8');
const LANGS = ['id', 'en', 'zh', 'hi', 'ja', 'nl', 'pt', 'es', 'es-AR', 'ru', 'de'];

function blockOf(lang) {
  const label = lang.includes('-') ? "'" + lang + "'" : lang;
  const start = src.indexOf('\n  ' + label + ': {');
  if (start < 0) return null;
  let i = src.indexOf('{', start) + 1;
  let depth = 1;
  while (i < src.length && depth > 0) {
    const c = src[i];
    if (c === '{') depth++;
    else if (c === '}') depth--;
    if (depth === 0) break;
    i++;
  }
  return src.slice(start, i);
}

const KEY_RE = /(?:^|\s|,)'?([A-Za-z][A-Za-z0-9]*)'?\s*:\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/g;

const perLang = {};
for (const lang of LANGS) {
  const body = blockOf(lang);
  if (body === null) {
    console.log('!! language block not found:', lang);
    continue;
  }
  const map = {};
  let m;
  KEY_RE.lastIndex = 0;
  while ((m = KEY_RE.exec(body))) map[m[1]] = m[2] !== undefined ? m[2] : m[3];
  perLang[lang] = map;
}

const idKeys = Object.keys(perLang.id || {});

// ---- 1. per-language gaps --------------------------------------------------
console.log('id keys:', idKeys.length, '\n');
let gapTotal = 0;
for (const lang of LANGS) {
  if (lang === 'id') continue;
  const missing = idKeys.filter((k) => !(k in (perLang[lang] || {})));
  gapTotal += missing.length;
  console.log(
    lang.padEnd(6),
    String(Object.keys(perLang[lang] || {}).length).padStart(4),
    'keys | falls back to Indonesian for:',
    missing.length,
    missing.length ? '-> ' + missing.slice(0, 6).join(', ') : ''
  );
}

// ---- 2. keys the code references but translations.ts lacks -----------------
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(e.name)) files.push(p);
  }
})('src');

const referenced = new Set();
const DIRECT = /\btr\(\s*t\s*,\s*'([A-Za-z][A-Za-z0-9]*)'/g;
const PLAIN = /\bt\(\s*'([A-Za-z][A-Za-z0-9]*)'\s*\)/g;
const INDIRECT = /\b(?:labelKey|titleKey|descKey|i18nKey)\s*:\s*'([A-Za-z][A-Za-z0-9]*)'/g;

for (const f of files) {
  if (f.includes(path.join('src', 'i18n'))) continue;
  const text = fs.readFileSync(f, 'utf8');
  for (const re of [DIRECT, PLAIN, INDIRECT]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text))) referenced.add(m[1]);
  }
}

const undefinedKeys = [...referenced].filter((k) => !(k in (perLang.id || {}))).sort();
console.log('\ncode references', referenced.size, 'keys |', undefinedKeys.length, 'not in translations.ts');
if (undefinedKeys.length) console.log('  ->', undefinedKeys.join(', '));

console.log(
  '\n' + (gapTotal === 0 && undefinedKeys.length === 0 ? 'PASS: full coverage' : 'FAIL: see above')
);
process.exit(gapTotal === 0 && undefinedKeys.length === 0 ? 0 : 1);
