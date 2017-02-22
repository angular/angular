/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


(function(global: any) {
  writeScriptTag('/all/playground/vendor/core.js');
  writeScriptTag('/all/playground/vendor/zone.js');
  writeScriptTag('/all/playground/vendor/long-stack-trace-zone.js');
  writeScriptTag('/all/playground/vendor/system.src.js');
  writeScriptTag('/all/playground/vendor/Reflect.js', 'playgroundBootstrap()');

  global.playgroundBootstrap = playgroundBootstrap;

  function playgroundBootstrap() {
    // check query param
    const useBundles = location.search.indexOf('bundles=false') == -1;

    if (useBundles) {
      System.config({
        map: {
          'index': 'index.js',
          '@angular/common': '/packages-dist/common/bundles/common.umd.js',
          '@angular/animations': '/packages-dist/animation/bundles/animations.umd.js',
          '@angular/platform-browser/animations':
              '/packages-dist/platform-browser/animations/bundles/platform-browser-animations.umd.js',
          '@angular/compiler': '/packages-dist/compiler/bundles/compiler.umd.js',
          '@angular/core': '/packages-dist/core/bundles/core.umd.js',
          '@angular/forms': '/packages-dist/forms/bundles/forms.umd.js',
          '@angular/http': '/packages-dist/http/bundles/http.umd.js',
          '@angular/platform-browser':
              '/packages-dist/platform-browser/bundles/platform-browser.umd.js',
          '@angular/platform-browser-dynamic':
              '/packages-dist/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
          '@angular/platform-webworker':
              '/packages-dist/platform-webworker/bundles/platform-webworker.umd.js',
          '@angular/platform-webworker-dynamic':
              '/packages-dist/platform-webworker-dynamic/bundles/platform-webworker-dynamic.umd.js',
          '@angular/router': '/packages-dist/router/bundles/router.umd.js',
          '@angular/upgrade': '/packages-dist/upgrade/bundles/upgrade.umd.js',
          '@angular/upgrade/static': '/packages-dist/upgrade/bundles/upgrade-static.umd.js',
          'rxjs': '/all/playground/vendor/rxjs',
        },
        packages: {
          'app': {defaultExtension: 'js'},
          'rxjs': {defaultExtension: 'js'},
        }
      });
    } else {
      console.warn(
          'Not using the Angular bundles. Don\'t use this configuration for e2e/performance tests!');

      System.config({
        map: {
          'index': 'index.js',
          '@angular': '/all/@angular',
          'rxjs': '/all/playground/vendor/rxjs'
        },
        packages: {
          'app': {defaultExtension: 'js'},
          '@angular/common': {main: 'index.js', defaultExtension: 'js'},
          '@angular/animations': {main: 'index.js', defaultExtension: 'js'},
          '@angular/compiler': {main: 'index.js', defaultExtension: 'js'},
          '@angular/core': {main: 'index.js', defaultExtension: 'js'},
          '@angular/forms': {main: 'index.js', defaultExtension: 'js'},
          '@angular/http': {main: 'index.js', defaultExtension: 'js'},
          '@angular/platform-browser': {main: 'index.js', defaultExtension: 'js'},
          '@angular/platform-browser-dynamic': {main: 'index.js', defaultExtension: 'js'},
          '@angular/platform-webworker': {main: 'index.js', defaultExtension: 'js'},
          '@angular/platform-webworker-dynamic': {main: 'index.js', defaultExtension: 'js'},
          '@angular/router': {main: 'index.js', defaultExtension: 'js'},
          '@angular/upgrade': {main: 'index.js', defaultExtension: 'js'},
          'rxjs': {defaultExtension: 'js'}
        }
      });
    }


    // BOOTSTRAP the app!
    System.import('index').then(function(m: {main: Function}) {
      m.main();
    }, console.error.bind(console));
  }


  function writeScriptTag(scriptUrl: string, onload?: string) {
    document.write(`<script src="${scriptUrl}" onload="${onload}"></script>`);
  }
}(window));
