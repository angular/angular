/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

(function(global: any) {

writeScriptTag('/all/benchmarks/vendor/core.js');
writeScriptTag('/all/benchmarks/vendor/zone.js');
writeScriptTag('/all/benchmarks/vendor/long-stack-trace-zone.js');
writeScriptTag('/all/benchmarks/vendor/system.src.js');
writeScriptTag('/all/benchmarks/vendor/Reflect.js', 'benchmarksBootstrap()');

(<any>global).benchmarksBootstrap = benchmarksBootstrap;

function benchmarksBootstrap() {
  // check query param
  const useBundles = location.search.indexOf('bundles=false') == -1;
  if (useBundles) {
    System.config({
      defaultJSExtensions: true,
      map: {
        '@angular/core': '/packages-dist/core/bundles/core.umd.js',
        '@angular/animations': '/packages-dist/common/bundles/animations.umd.js',
        '@angular/platform-browser/animations':
            '/packages-dist/platform-browser/bundles/platform-browser-animations.umd.js',
        '@angular/common': '/packages-dist/common/bundles/common.umd.js',
        '@angular/forms': '/packages-dist/forms/bundles/forms.umd.js',
        '@angular/compiler': '/packages-dist/compiler/bundles/compiler.umd.js',
        '@angular/platform-browser':
            '/packages-dist/platform-browser/bundles/platform-browser.umd.js',
        '@angular/platform-browser-dynamic':
            '/packages-dist/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
        '@angular/upgrade': '/packages-dist/upgrade/bundles/upgrade.umd.js',
        '@angular/router': '/packages-dist/router/bundles/router.umd.js',
        'rxjs': '/all/benchmarks/vendor/rxjs',
      },
      packages: {
        'rxjs/ajax': {main: 'index.js', defaultExtension: 'js'},
        'rxjs/operators': {main: 'index.js', defaultExtension: 'js'},
        'rxjs/testing': {main: 'index.js', defaultExtension: 'js'},
        'rxjs/websocket': {main: 'index.js', defaultExtension: 'js'},
        'rxjs': {main: 'index.js', defaultExtension: 'js'},
      }
    });
  } else {
    console.warn(
        'Not using the Angular bundles. Don\'t use this configuration for e2e/performance tests!');

    System.config({
      defaultJSExtensions: true,
      map: {'@angular': '/all/@angular', 'rxjs': '/all/benchmarks/vendor/rxjs'},
      packages: {
        '@angular/core': {main: 'index.js', defaultExtension: 'js'},
        '@angular/animations': {main: 'index.js', defaultExtension: 'js'},
        '@angular/platform-browser/animations': {main: 'index.js', defaultExtension: 'js'},
        '@angular/compiler': {main: 'index.js', defaultExtension: 'js'},
        '@angular/router': {main: 'index.js', defaultExtension: 'js'},
        '@angular/common': {main: 'index.js', defaultExtension: 'js'},
        '@angular/forms': {main: 'index.js', defaultExtension: 'js'},
        '@angular/platform-browser': {main: 'index.js', defaultExtension: 'js'},
        '@angular/platform-browser-dynamic': {main: 'index.js', defaultExtension: 'js'},
        '@angular/upgrade': {main: 'index.js', defaultExtension: 'js'},
        'rxjs/ajax': {main: 'index.js', defaultExtension: 'js'},
        'rxjs/operators': {main: 'index.js', defaultExtension: 'js'},
        'rxjs/testing': {main: 'index.js', defaultExtension: 'js'},
        'rxjs/websocket': {main: 'index.js', defaultExtension: 'js'},
        'rxjs': {main: 'index.js', defaultExtension: 'js'},
      }
    });
  }

  // BOOTSTRAP the app!
  System.import('index').then(function(m: any) {
    m.main();
  }, console.error.bind(console));
}

function writeScriptTag(scriptUrl: string, onload?: string) {
  document.write(`<script src="${scriptUrl}" onload="${onload}"></script>`);
}
}(window));
