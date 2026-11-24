#!/usr/bin/env node
// Checks the static site before/after a push: every local link and image exists, every page has a title, the app link
// goes through bowlboard.app/app/ (the one place the real address lives is app/index.html), nothing unused lingers in assets/.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
let bad = 0;
const fail = m => { bad++; console.log('FAIL', m); };
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.name === '.git' || e.name === 'node_modules' || e.name === '.github' ? [] : e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const files = walk(root), pages = files.filter(f => f.endsWith('.html'));
const text = files.filter(f => /\.(html|css|js)$/.test(f)).map(f => fs.readFileSync(f, 'utf8')).join('\n');
for (const f of pages) {
  const s = fs.readFileSync(f, 'utf8'), rel = path.relative(root, f);
  if (!/<title>[^<]+<\/title>/.test(s)) fail(rel + ' has no title');
  for (const m of s.matchAll(/(?:href|src)="([^"#?]+)(?:[?#][^"]*)?"/g)) {
    const u = m[1];
    if (/^(https?:|mailto:|tel:|data:)/.test(u)) continue;
    const target = path.resolve(path.dirname(f), u.startsWith('/') ? '.' + u : u);
    const t = fs.existsSync(target) && fs.statSync(target).isDirectory() ? path.join(target, 'index.html') : target;
    if (!fs.existsSync(t)) fail(rel + ' links to missing ' + u);
  }
  if (rel !== path.join('app', 'index.html') && /github\.io/.test(s)) fail(rel + ' links straight to github.io (use https://bowlboard.app/app/)');
}
for (const m of text.matchAll(/url\(["']?(?!data:|https?:|%23|\\#)([^)"'?#]+)/g)) if (!/^\//.test(m[1]) && !fs.existsSync(path.join(root, m[1]))) fail('styles.css refers to missing ' + m[1]);
for (const f of files.filter(f => f.includes(path.sep + 'assets' + path.sep))) { if (!text.includes(path.basename(f))) fail('unused asset ' + path.relative(root, f)); }
if (!fs.existsSync(path.join(root, 'CNAME')) || fs.readFileSync(path.join(root, 'CNAME'), 'utf8').trim() !== 'bowlboard.app') fail('CNAME must be bowlboard.app');
if (!/bowlboard\.app\/app\//.test(fs.readFileSync(path.join(root, 'index.html'), 'utf8'))) fail('the homepage has no link to bowlboard.app/app/');
console.log(bad ? bad + ' problem(s)' : 'site ok: ' + pages.length + ' pages, ' + files.length + ' files');
process.exit(bad ? 1 : 0);
