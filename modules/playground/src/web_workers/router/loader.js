/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

importScripts(
    '../../../vendor/core.js', '../../../vendor/zone.js',
    '../../../vendor/long-stack-trace-zone.js', '../../../vendor/system.src.js',
    '../../../vendor/Reflect.js');
importScripts('../worker-systemjs-configure.js');

System.import('playground/src/web_workers/router/background_index')
    .then(
        function(m) {
          try {
            m.main();
          } catch (e) {
            console.error(e);
          }
        },
        function(error) { console.error('error loading background', error); });
