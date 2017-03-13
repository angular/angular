'use strict';

// Imports
const path = require('path');

// Constants
const BROWSER_INSTANCES = 7;

const PORT = 4201;
const BASE_URL = `http://localhost:${PORT}`;

const ROOT_DIR = path.join(__dirname, '../..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const CONTENT_DIR = path.join(DIST_DIR, 'content');
const INPUT_DIR = path.join(CONTENT_DIR, 'docs');
const TMP_SPECS_DIR = path.join(ROOT_DIR, 'tmp/docs-prerender-specs');
const TMP_OUTPUT_DIR = path.join(ROOT_DIR, 'tmp/docs-prerendered');

// Exports
module.exports = {
  BASE_URL,
  BROWSER_INSTANCES,
  CONTENT_DIR,
  DIST_DIR,
  INPUT_DIR,
  PORT,
  ROOT_DIR,
  TMP_OUTPUT_DIR,
  TMP_SPECS_DIR
};
