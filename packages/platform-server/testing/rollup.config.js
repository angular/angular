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
  '@angular/core': 'ng.core',
  '@angular/common': 'ng.common',
  '@angular/compiler': 'ng.compiler',
  '@angular/compiler/testing': 'ng.compiler.testing',
  '@angular/platform-browser': 'ng.platformBrowser',
  '@angular/platform-browser/animations': 'ng.platformBrowser.animations',
  '@angular/platform-server': 'ng.platformServer',
  '@angular/platform-browser-dynamic/testing': 'ng.platformBrowserDynamic.testing'
};

module.exports = {
  entry: '../../../dist/packages-dist/platform-server/fesm5/testing.js',
  dest: '../../../dist/packages-dist/platform-server/bundles/platform-server-testing.umd.js',
  format: 'umd',
  exports: 'named',
  amd: {id: '@angular/platform-server/testing'},
  moduleName: 'ng.platformServer.testing',
  plugins: [resolve(), sourcemaps()],
  external: Object.keys(globals),
  globals: globals
};
