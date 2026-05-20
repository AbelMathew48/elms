const fs = require('fs');
const path = require('path');
const root = process.cwd();
function walk(dir) {
  let res = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) res = res.concat(walk(p));
    else if (/\.(js|jsx|css)$/i.test(e.name)) res.push(p);
  }
  return res;
}
const files = walk(root).sort();
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const first = content.split(/\r?\n/).slice(0, 6).join('\n');
  const hasComment = /^\s*(\/\/|\/\*|\*|<!--)/.test(first);
  console.log(`${path.relative(root, file)} | comment? ${hasComment}`);
  console.log(first.replace(/\r/g, '').split('\n').map((l, i) => `${i+1}: ${l}`).join('\n'));
  console.log('---');
}
