/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Tun on full stack traces in errors to help debugging
Error.stackTraceLimit = Infinity;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 100;

// Cancel Karma's synchronous start,
// we will call `__karma__.start()` later, once all the specs are loaded.
__karma__.loaded = function() {};

System.config({
  baseURL: '/base',
  defaultJSExtensions: true,
  map: {
    'benchpress/*': 'dist/js/dev/es5/benchpress/*.js',
    '@angular': 'dist/all/@angular',
    'rxjs': 'node_modules/rxjs',
    'parse5': 'dist/all/@angular/empty.js',
    'url': 'dist/all/@angular/empty.js',
    'xhr2': 'dist/all/@angular/empty.js',
    '@angular/platform-server/src/parse5_adapter': 'dist/all/empty.js',
    'angular2/*': 'dist/all/angular2/*.js',
    'angular2/src/alt_router/router_testing_providers':
        'dist/all/angular2/src/alt_router/router_testing_providers.js'
  },
  packages: {
    '@angular/core/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/core': {main: 'index.js', defaultExtension: 'js'},
    '@angular/animations/browser/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/animations/browser': {main: 'index.js', defaultExtension: 'js'},
    '@angular/animations/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/animations': {main: 'index.js', defaultExtension: 'js'},
    '@angular/compiler/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/compiler': {main: 'index.js', defaultExtension: 'js'},
    '@angular/common/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/common': {main: 'index.js', defaultExtension: 'js'},
    '@angular/forms': {main: 'index.js', defaultExtension: 'js'},
    // remove after all tests imports are fixed
    '@angular/facade': {main: 'index.js', defaultExtension: 'js'},
    '@angular/router/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/router': {main: 'index.js', defaultExtension: 'js'},
    '@angular/http/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/http': {main: 'index.js', defaultExtension: 'js'},
    '@angular/upgrade/static': {main: 'index.js', defaultExtension: 'js'},
    '@angular/upgrade': {main: 'index.js', defaultExtension: 'js'},
    '@angular/platform-browser/animations/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/platform-browser/animations': {main: 'index.js', defaultExtension: 'js'},
    '@angular/platform-browser/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/platform-browser': {main: 'index.js', defaultExtension: 'js'},
    '@angular/platform-browser-dynamic/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/platform-browser-dynamic': {main: 'index.js', defaultExtension: 'js'},
    '@angular/platform-server/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/platform-server': {main: 'index.js', defaultExtension: 'js'},
    '@angular/platform-webworker': {main: 'index.js', defaultExtension: 'js'},
    '@angular/platform-webworker-dynamic': {main: 'index.js', defaultExtension: 'js'},
  }
});


// Set up the test injector, then import all the specs, execute their `main()`
// method and kick off Karma (Jasmine).
System.import('@angular/core/testing')
    .then(function(coreTesting) {
      return Promise
          .all([
            System.import('@angular/platform-browser-dynamic/testing'),
            System.import('@angular/platform-browser/animations')
          ])
          .then(function(mods) {
            coreTesting.TestBed.initTestEnvironment(
                [mods[0].BrowserDynamicTestingModule, mods[1].NoopAnimationsModule],
                mods[0].platformBrowserDynamicTesting());
          });
    })
    .then(function() {
      return Promise.all(Object
                             .keys(window.__karma__.files)  // All files served by Karma.
                             .filter(onlySpecFiles)
                             .map(window.file2moduleName)  // Normalize paths to module names.
                             .map(function(path) {
                               return System.import(path).then(function(module) {
                                 if (module.hasOwnProperty('main')) {
                                   module.main();
                                 } else {
                                   throw new Error(
                                       'Module ' + path + ' does not implement main() method.');
                                 }
                               });
                             }));
    })
    .then(function() { __karma__.start(); }, function(error) { console.error(error); });


function onlySpecFiles(path) {
  return /_spec\.js$/.test(path);
}
