/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


(function(global: any /** TODO #9100 */) {

  writeScriptTag('/node_modules/core-js/client/core.js');
  writeScriptTag('/node_modules/zone.js/dist/zone.js');
  writeScriptTag('/node_modules/zone.js/dist/long-stack-trace-zone.js');
  writeScriptTag('/node_modules/systemjs/dist/system.src.js');
  writeScriptTag('/node_modules/reflect-metadata/Reflect.js', 'playgroundBootstrap()');
  (<any>global).playgroundBootstrap = playgroundBootstrap;

  function playgroundBootstrap() {
    // check query param
    var useBundles = location.search.indexOf('bundles=false') == -1;
    if (useBundles) {
      System.config({
        map: {
          'index': 'index.js',
          '@angular/core': '/modules/@angular/core/dist/index.js',
          '@angular/common': '/modules/@angular/common/dist/index.js',
          '@angular/compiler': '/modules/@angular/compiler/dist/index.js',
          '@angular/forms': '/modules/@angular/forms/dist/index.js',
          '@angular/platform-browser': '/modules/@angular/platform-browser/dist/index.js',
          '@angular/platform-browser-dynamic': '/modules/@angular/platform-browser-dynamic/dist/index.js',
          '@angular/http': '/modules/@angular/http/dist/index.js',
          '@angular/upgrade': '/modules/@angular/upgrade/dist/index.js',
          '@angular/router': '/modules/@angular/router/dist/index.js',
          '@angular/core/src/facade': '/modules/@angular/core/src/facade',
          '@angular/facade': '/modules/@angular/facade',
          'rxjs': '/node_modules/rxjs',
        },
        packages: {
          'app': { defaultExtension: 'js' },
          '@angular/core/src/facade': {defaultExtension: 'js'},
          '@angular/facade': {defaultExtension: 'js'},
          'rxjs': {defaultExtension: 'js'}
        }
      });
    } else {
      console.warn(
          "Not using the Angular bundles. Don't use this configuration for e2e/performance tests!");

      System.config({
        map: {'index': 'index.js', '@angular': '/modules/@angular'},
        packages: {
          'app': { defaultExtension: 'js' },
          '@angular/core': {main: 'index.js', defaultExtension: 'js'},
          '@angular/compiler': {main: 'index.js', defaultExtension: 'js'},
          '@angular/router': {main: 'index.js', defaultExtension: 'js'},
          '@angular/common': {main: 'index.js', defaultExtension: 'js'},
          '@angular/forms': {main: 'index.js', defaultExtension: 'js'},
          '@angular/platform-browser': {main: 'index.js', defaultExtension: 'js'},
          '@angular/platform-browser-dynamic': {main: 'index.js', defaultExtension: 'js'},
          '@angular/upgrade': {main: 'index.js', defaultExtension: 'js'}
        }
      });
    }


    // BOOTSTRAP the app!
    System.import('index').then(function(m: any /** TODO #9100 */) { m.main(); }, console.error.bind(console));
  }


  function writeScriptTag(scriptUrl: any /** TODO #9100 */, onload?: any /** TODO #9100 */) {
    document.write(`<script src="${scriptUrl}" onload="${onload}"></script>`);
  }
}(window));
