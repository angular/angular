#!/usr/bin/env node

const path = require('path');
const proc = require('child_process');
const fs = require('fs');

const findResult = proc.spawnSync('find', ['.', '-iname', '"_*.scss"'], {
  cwd: __dirname,
  shell: true,
  env: process.env,
}).stdout.toString();

const sassFiles = findResult.trim().split('\n');
for (const f of sassFiles) {
  const originalFileContent = fs.readFileSync(f, 'utf8');

  const originalFileName = path.basename(f);
  const originalDirectory = path.dirname(f);

  let importFileContent =
      `@forward '${originalFileName.replace(/^_/, '').replace('.scss', '')}';\n`;
  const originalImportLines = originalFileContent.matchAll(/@import '(.+)';/g);
  for (const match of originalImportLines) {
    const importPath = match[1];
    if (importPath.includes('@material')) continue;
    if (importPath.includes('private')) continue;

    importFileContent += `@forward '${importPath}';\n`;
  }

  const importFileName = originalFileName.replace('.scss', '.import.scss');
  const importFilePath = path.join(originalDirectory, importFileName);
  fs.writeFileSync(importFilePath, importFileContent, 'utf8');
}
