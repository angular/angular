/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

(function(global: any) {

writeScriptTag('/all/benchmarks/vendor/core.js');
writeScriptTag('/all/benchmarks/vendor/system.src.js', 'benchmarksBootstrap()');

(<any>global).benchmarksBootstrap = benchmarksBootstrap;

function benchmarksBootstrap() {
  System.config({
    defaultJSExtensions: true,
    map: {'incremental-dom': '/all/benchmarks/vendor/incremental-dom-cjs.js'}
  });

  // BOOTSTRAP the app!
  System.import('index').then(function(m: any) {
    m.main && m.main();
  }, console.error.bind(console));
}

function writeScriptTag(scriptUrl: string, onload?: string) {
  document.write(`<script src="${scriptUrl}" onload="${onload}"></script>`);
}
}(window));
