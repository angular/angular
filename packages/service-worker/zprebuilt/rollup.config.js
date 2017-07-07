/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import resolve from 'rollup-plugin-node-resolve';
import * as path from 'path';

const globals = {};

function sdkResolver() {
  return {
    name: 'sdk-resolver',
    resolveId(importee, importer) {
      switch (importee) {
        case '@angular/service-worker/sdk':
          return path.join(
              process.cwd(),
              '../../../dist/packages-dist/service-worker/@angular/service-worker/sdk.es5.js');
        case '@angular/service-worker/sdk/plugins':
          return path.join(
              process.cwd(),
              '../../../dist/packages-dist/service-worker/@angular/service-worker/sdk/plugins.es5.js');
        default:
          return null;
      }
    },
  };
}


export default {
  entry: '../../../dist/packages-dist/service-worker/@angular/service-worker/zprebuilt.es5.js',
  dest: '../../../dist/packages-dist/service-worker/bundles/worker-basic.js',
  format: 'iife',
  plugins: [
    sdkResolver(),
    resolve(),
  ],
  moduleName: 'angular.serviceWorker.prebuilt.basic',
};
