#!/usr/bin/env node

// Imports
const {existsSync, readFileSync} = require('fs');
const {join, resolve} = require('path');

// Constants
const CONTENT_DIR = resolve(__dirname, '../../content');
const IMAGES_DIR = join(CONTENT_DIR, 'images/bios');
const CONTRIBUTORS_PATH = join(CONTENT_DIR, 'marketing/contributors.json');

// Run
_main();

// Functions - Definitions
function _main() {
  const contributors = JSON.parse(readFileSync(CONTRIBUTORS_PATH, 'utf8'));
  const expectedImages = Object.keys(contributors)
      .filter(key => !!contributors[key].picture)
      .map(key => join(IMAGES_DIR, contributors[key].picture));
  const missingImages = expectedImages.filter(path => !existsSync(path));

  if (missingImages.length > 0) {
    throw new Error(
        'The following pictures are referenced in \'contributors.json\' but do not exist:' +
        missingImages.map(path => `\n  - ${path}`).join(''));
  }
}
