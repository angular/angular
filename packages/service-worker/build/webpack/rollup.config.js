/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const globals = {
  '@angular/service-worker/build': 'ng.serviceWorker.build',
};

export default {
  entry:
      '../../../../dist/packages-dist/service-worker/@angular/service-worker/build/webpack.es5.js',
  dest: '../../../../dist/packages-dist/service-worker/bundles/service-worker-build-webpack.umd.js',
  format: 'umd',
  exports: 'named',
  moduleName: 'ng.serviceWorker.build.webpack',
  external: Object.keys(globals), globals,
};
