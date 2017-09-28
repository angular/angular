/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import resolve from 'rollup-plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';

const globals = {};

export default {
  entry: '../../../dist/packages-dist/service-worker/esm5/config.js',
  dest: '../../../dist/packages-dist/service-worker/bundles/service-worker-config.umd.js',
  format: 'umd',
  exports: 'named',
  moduleName: 'ng.serviceWorker.config',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
