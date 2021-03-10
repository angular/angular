#!/usr/bin/env node

// Imports
const {readFileSync, writeFileSync} = require('fs');
const {join, resolve} = require('path');

// Constants
const SRC_DIR = resolve(__dirname, '../src');
const DIST_DIR = resolve(__dirname, '../dist');

// Run
_main();

// Functions - Definitions
function _main() {
  const srcIndexPath = join(DIST_DIR, 'index.html');
  const src404BodyPath = join(SRC_DIR, '404-body.html');
  const dst404PagePath = join(DIST_DIR, '404.html');

  const srcIndexContent = readFileSync(srcIndexPath, 'utf8');
  const src404BodyContent = readFileSync(src404BodyPath, 'utf8').trim();
  const dst404PageContent = srcIndexContent
      .replace(/(<body>)[\s\S]+(<\/body>)/, `$1\n  ${src404BodyContent}\n$2`);

  if (dst404PageContent === srcIndexContent) {
    throw new Error(
        'Failed to generate \'404.html\'. ' +
        'The content of \'index.html\' does not match the expected pattern.');
  }

  writeFileSync(dst404PagePath, dst404PageContent);
}
