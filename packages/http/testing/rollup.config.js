/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const resolve = require('rollup-plugin-node-resolve');
const sourcemaps = require('rollup-plugin-sourcemaps');

const globals = require('../../rollup.config').globals('@angular/http/testing');

exports.default = {
  entry: '../../../dist/packages-dist/http/esm5/testing.js',
  dest: '../../../dist/packages-dist/http/bundles/http-testing.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@angular/http/testing'},
  moduleName: 'ng.http.testing',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
