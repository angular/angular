import {join} from 'path';

export const MATERIAL_VERSION = require('../../package.json').version;

export const PROJECT_ROOT = join(__dirname, '../..');
export const SOURCE_ROOT = join(PROJECT_ROOT, 'src');

/** Root build output directory */
export const DIST_ROOT = join(PROJECT_ROOT, 'dist');

/** Output subdirectory where all bundles will be written (flat ES modules and UMD) */
export const DIST_BUNDLES = join(DIST_ROOT, 'bundles');

/** Output subdirectory where all library artifacts will be written (compiled JS, CSS, etc.) */
export const DIST_MATERIAL = join(DIST_ROOT, 'packages', 'material');
export const DIST_CDK = join(DIST_ROOT, 'packages', 'cdk');
export const DIST_DEMOAPP = join(DIST_ROOT, 'packages', 'demo-app');
export const DIST_E2EAPP = join(DIST_ROOT, 'packages', 'e2e-app');
export const DIST_EXAMPLES = join(DIST_ROOT, 'packages', 'examples');

export const DIST_RELEASES = join(DIST_ROOT, 'releases');

export const COVERAGE_RESULT_FILE = join(DIST_ROOT, 'coverage', 'coverage-summary.json');

export const HTML_MINIFIER_OPTIONS = {
  collapseWhitespace: true,
  removeComments: true,
  caseSensitive: true,
  removeAttributeQuotes: false
};

export const LICENSE_BANNER = `/**
  * @license Angular Material v${MATERIAL_VERSION}
  * Copyright (c) 2017 Google, Inc. https://material.angular.io/
  * License: MIT
  */`;

export const NPM_VENDOR_FILES = [
  '@angular', 'core-js/client', 'hammerjs', 'rxjs', 'systemjs/dist',
  'zone.js/dist', 'web-animations-js'
];

export const COMPONENTS_DIR = join(SOURCE_ROOT, 'lib');
