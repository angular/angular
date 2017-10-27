/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const globals = require('../../rollup.config').globals('@angular/common/http');

exports.default = {
  entry: '../../../dist/packages-dist/common/esm5/http.js',
  dest: '../../../dist/packages-dist/common/bundles/common-http.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@angular/common/http'},
  moduleName: 'ng.common.http',
  external: Object.keys(globals),
  globals: globals
};
