const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');

// Clean dist folder
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Items to ignore from copying into production distribution
const IGNORE = new Set([
  'dist',
  'node_modules',
  '.git',
  '.gitignore',
  'build.js',
  'server.js',
  'serve.ps1',
  'package.json',
  'package-lock.json',
  'vercel.json'
]);

const entries = fs.readdirSync(rootDir);
for (const entry of entries) {
  if (IGNORE.has(entry) || entry.startsWith('.')) continue;
  const srcPath = path.join(rootDir, entry);
  const destPath = path.join(distDir, entry);
  fs.cpSync(srcPath, destPath, { recursive: true });
}

console.log('Successfully built static site into dist/');
