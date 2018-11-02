/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const resolve = require('rollup-plugin-node-resolve');
const sourcemaps = require('rollup-plugin-sourcemaps');

const globals = {
  '@angular/core': 'ng.core',
  '@angular/core/testing': 'ng.core.testing',
  '@angular/common': 'ng.common',
  '@angular/platform-browser': 'ng.platformBrowser'
};

module.exports = {
  entry: '../../../dist/packages-dist/platform-browser/fesm5/testing.js',
  dest: '../../../dist/packages-dist/platform-browser/bundles/platform-browser-testing.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@angular/platform-browser/testing'},
  moduleName: 'ng.platformBrowser.testing',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
