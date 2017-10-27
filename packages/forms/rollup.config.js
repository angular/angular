/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const resolve = require('rollup-plugin-node-resolve');
const sourcemaps = require('rollup-plugin-sourcemaps');

const globals = require('../rollup.config').globals('@angular/forms');

exports.default = {
  entry: '../../dist/packages-dist/forms/esm5/forms.js',
  dest: '../../dist/packages-dist/forms/bundles/forms.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@angular/forms'},
  moduleName: 'ng.forms',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
