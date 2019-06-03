/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

importScripts('angular/modules/playground/src/web_workers/worker-configure.js');

System.config({
  map: {
    'base64-js': 'npm/node_modules/base64-js/base64js.min.js',
  },
  packages: {'angular/modules/playground/src/web_workers': {defaultExtension: 'js'}}
});

System.import('./background_index.js')
    .catch(error => console.error('error loading background', error));
