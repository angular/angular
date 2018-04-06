/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const resolve = require('rollup-plugin-node-resolve');
const sourcemaps = require('rollup-plugin-sourcemaps');

const globals = {
  '@angular/animations': 'ng.animations',
  '@angular/animations/browser': 'ng.animations.browser',
  '@angular/core': 'ng.core',
  '@angular/common': 'ng.common',
  '@angular/common/http': 'ng.common.http',
  '@angular/compiler': 'ng.compiler',
  '@angular/http': 'ng.http',
  '@angular/platform-browser': 'ng.platformBrowser',
  '@angular/platform-browser/animations': 'ng.platformBrowser.animations',
  '@angular/platform-browser-dynamic': 'ng.platformBrowserDynamic',
  'rxjs': 'rxjs',
  'rxjs/operators': 'rxjs.operators',
};

module.exports = {
  entry: '../../dist/packages-dist/platform-server/fesm5/platform-server.js',
  dest: '../../dist/packages-dist/platform-server/bundles/platform-server.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@angular/platform-server'},
  moduleName: 'ng.platformServer',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
