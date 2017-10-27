/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const resolve = require('rollup-plugin-node-resolve');
const sourcemaps = require('rollup-plugin-sourcemaps');

const globals = require('../../rollup.config').globals('@angular/platform-browser/animations');

exports.default = {
  entry: '../../../dist/packages-dist/platform-browser/esm5/animations.js',
  dest: '../../../dist/packages-dist/platform-browser/bundles/platform-browser-animations.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@angular/platform-browser/animations'},
  moduleName: 'ng.platformBrowser.animations',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
