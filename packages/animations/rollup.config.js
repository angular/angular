/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const resolve = require('rollup-plugin-node-resolve');
const sourcemaps = require('rollup-plugin-sourcemaps');

const globals = require('../rollup.config').globals('@angular/animations');

exports.default = {
  entry: '../../dist/packages-dist/animations/esm5/animations.js',
  dest: '../../dist/packages-dist/animations/bundles/animations.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@angular/animations'},
  moduleName: 'ng.animations',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
