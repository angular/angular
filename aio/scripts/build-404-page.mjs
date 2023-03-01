#!/usr/bin/env node

// Imports
import {readFileSync, writeFileSync} from 'fs';
import {join, resolve} from 'path';

// Constants
const SOURCE_404_BODY_PATH = resolve(process.argv[2]);
const BUILD_OUTPUT_DIR = resolve(process.argv[3]);
const DEST_404_PAGE_PATH = resolve(process.argv[4]);

// Run
_main();

// Functions - Definitions
function _main() {
  const srcIndexPath = join(BUILD_OUTPUT_DIR, 'index.html');

  const srcIndexContent = readFileSync(srcIndexPath, 'utf8');
  const src404BodyContent = readFileSync(SOURCE_404_BODY_PATH, 'utf8').trim();
  const dst404PageContent = srcIndexContent.replace(
    /(<body>)[\s\S]+(<\/body>)/,
    `$1\n  ${src404BodyContent}\n$2`
  );

  if (dst404PageContent === srcIndexContent) {
    throw new Error(
      "Failed to generate '404.html'. " +
        "The content of 'index.html' does not match the expected pattern."
    );
  }

  writeFileSync(DEST_404_PAGE_PATH, dst404PageContent);
}
