import {join} from 'path';

export const MATERIAL_VERSION = require('../../package.json').version;

export const PROJECT_ROOT = join(__dirname, '../..');
export const SOURCE_ROOT = join(PROJECT_ROOT, 'src');

export const DIST_ROOT = join(PROJECT_ROOT, 'dist');
export const DIST_COMPONENTS_ROOT = join(DIST_ROOT, '@angular/material');

export const SASS_AUTOPREFIXER_OPTIONS = {
  browsers: [
    'last 2 versions',
    'not ie <= 10',
    'not ie_mob <= 10',
  ],
  cascade: false,
};

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
