/**
 * Second-pass key extractor.
 *
 * Some components declare the key and its Indonesian fallback as sibling object
 * properties (labelKey + labelFallback) instead of inline in tr(...), so the
 * first extractor missed them. Both forms must land in translations.ts or the
 * string stays Indonesian in every language.
 */
const fs = require('fs');
const path = require('path');

const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(e.name)) files.push(p);
  }
})('src');

const map = JSON.parse(fs.readFileSync('_i18n_missing.json', 'utf8'));

const PAIRS = [
  ['labelKey', 'labelFallback'],
  ['labelKey', 'fallback'],
  ['descKey', 'descFallback'],
  ['descKey', 'desc'],
  ['titleKey', 'titleFallback'],
];

for (const f of files) {
  if (f.includes(path.join('src', 'i18n'))) continue;
  const s = fs.readFileSync(f, 'utf8');
  for (const [kProp, vProp] of PAIRS) {
    const re = new RegExp(
      kProp + "\\s*:\\s*'([A-Za-z][A-Za-z0-9]*)'[\\s\\S]{0,200}?" + vProp + "\\s*:\\s*'((?:[^'\\\\]|\\\\.)*)'",
      'g'
    );
    let m;
    while ((m = re.exec(s))) {
      const k = m[1];
      const v = m[2].replace(/\\'/g, "'");
      if (!(k in map)) map[k] = v;
    }
  }
}

const tr = fs.readFileSync('src/i18n/translations.ts', 'utf8');
for (const k of Object.keys(map)) {
  if (new RegExp('(^|[\\s{,])' + k + ':').test(tr)) delete map[k];
}

fs.writeFileSync('_i18n_missing.json', JSON.stringify(map, null, 1));
console.log('total keys needing translation:', Object.keys(map).length);
