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
  '@angular/animations': 'ng.animations',
  '@angular/animations/browser': 'ng.animations.browser',
  'rxjs': 'rxjs',
};

module.exports = {
  entry: '../../../../dist/packages-dist/animations/fesm5/browser/testing.js',
  dest: '../../../../dist/packages-dist/animations/bundles/animations-browser-testing.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@angular/animations/browser/testing'},
  moduleName: 'ng.animations.browser.testing',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
