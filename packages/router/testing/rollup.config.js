/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const resolve = require('rollup-plugin-node-resolve');
const sourcemaps = require('rollup-plugin-sourcemaps');

const globals = require('../../rollup.config').globals('@angular/router/testing');

exports.default = {
  entry: '../../../dist/packages-dist/router/esm5/testing.js',
  dest: '../../../dist/packages-dist/router/bundles/router-testing.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@angular/router/testing'},
  moduleName: 'ng.router.testing',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
