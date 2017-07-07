/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import resolve from 'rollup-plugin-node-resolve';

const globals = {
  '@angular/service-worker/sdk': 'ng.serviceWorker.sdk',
};

export default {
  entry: '../../../../dist/packages-dist/service-worker/@angular/service-worker/sdk/plugins.es5.js',
  dest: '../../../../dist/packages-dist/service-worker/bundles/service-worker-sdk-plugins.umd.js',
  format: 'umd',
  exports: 'named',
  moduleName: 'ng.serviceWorker.sdk.plugins',
  plugins: [resolve()],
  external: Object.keys(globals), globals,
};
