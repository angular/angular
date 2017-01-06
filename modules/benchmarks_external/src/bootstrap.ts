/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


(function(global: any /** TODO #9100 */) {

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
        map: {
          'index': 'index.js',
          '@angular/core': '/packages-dist/core/bundles/core.umd.js',
          '@angular/common': '/packages-dist/common/bundles/common.umd.js',
          '@angular/forms': '/packages-dist/forms/bundles/forms.umd.js',
          '@angular/compiler': '/packages-dist/compiler/bundles/compiler.umd.js',
          '@angular/platform-browser':
              '/packages-dist/platform-browser/bundles/platform-browser.umd.js',
          '@angular/platform-browser-dynamic':
              '/packages-dist/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
          '@angular/http': '/packages-dist/http/bundles/http.umd.js',
          '@angular/upgrade': '/packages-dist/upgrade/bundles/upgrade.umd.js',
          '@angular/router': '/packages-dist/router/bundles/router.umd.js',
          '@angular/core/src/facade': '/all/@angular/core/src/facade',
          'rxjs': '/all/benchmarks/vendor/rxjs'
        },
        packages: {
          'app': {defaultExtension: 'js'},
          '@angular/core/src/facade': {defaultExtension: 'js'},
          'rxjs': {defaultExtension: 'js'}
        }
      });
    } else {
      console.warn(
          'Not using the Angular bundles. Don\'t use this configuration for e2e/performance tests!');

      System.config({
        map: {
          'index': 'index.js',
          '@angular': '/all/@angular',
          'rxjs': '/all/benchmarks/vendor/rxjs'
        },
        packages: {
          'app': {defaultExtension: 'js'},
          '@angular/core': {main: 'index.js', defaultExtension: 'js'},
          '@angular/compiler': {main: 'index.js', defaultExtension: 'js'},
          '@angular/router': {main: 'index.js', defaultExtension: 'js'},
          '@angular/common': {main: 'index.js', defaultExtension: 'js'},
          '@angular/forms': {main: 'index.js', defaultExtension: 'js'},
          '@angular/platform-browser': {main: 'index.js', defaultExtension: 'js'},
          '@angular/platform-browser-dynamic': {main: 'index.js', defaultExtension: 'js'},
          '@angular/upgrade': {main: 'index.js', defaultExtension: 'js'},
          'rxjs': {defaultExtension: 'js'}
        }
      });
    }


    // BOOTSTRAP the app!
    System.import('index').then(function(m: any /** TODO #9100 */) {
      m.main();
    }, console.error.bind(console));
  }


  function writeScriptTag(scriptUrl: any /** TODO #9100 */, onload?: any /** TODO #9100 */) {
    document.write(`<script src="${scriptUrl}" onload="${onload}"></script>`);
  }
}(window));
