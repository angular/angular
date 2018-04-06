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
  'rxjs': 'rxjs',
};

module.exports = {
  entry: '../../dist/packages-dist/common/fesm5/common.js',
  dest: '../../dist/packages-dist/common/bundles/common.umd.js',
  format: 'umd',
  exports: 'named',
  moduleName: 'ng.common',
  amd: {id: '@angular/common'},
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
