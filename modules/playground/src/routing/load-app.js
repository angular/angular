/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/*
 * Normally the "ts_devserver" bundles all specified source files into a bundle and uses
 * Require.JS, but for this example we need to use SystemJS as module loader since this
 * example uses lazy loading and we want to ensure that the default SystemJS factory loader
 * works as expected.
 */

System.config({
  packages: {
    'angular/modules/playground/src/routing': {defaultExtension: 'js'},
  }
});

System.import('./main.js').catch(e => console.error(e));
