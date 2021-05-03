/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/*global jasmine, __karma__, window*/
Error.stackTraceLimit = 5;
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

__karma__.loaded = function() {};

window.isNode = false;
window.isBrowser = true;

function isJsFile(path) {
  return path.slice(-3) == '.js';
}

function isSpecFile(path) {
  return path.slice(-7) == 'spec.js';
}

function isBuiltFile(path) {
  var builtPath = '/base/dist/';
  return isJsFile(path) && (path.substr(0, builtPath.length) == builtPath);
}

var allSpecFiles = Object.keys(window.__karma__.files).filter(isSpecFile).filter(isBuiltFile);

// Load our SystemJS configuration.
System.config({
  baseURL: '/base',
});

System.config({
  map: {
    '@angular': 'dist/all/@angular',
    'rxjs': 'node_modules/rxjs',
  },
  packages: {
    '@angular/core/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/core': {main: 'index.js', defaultExtension: 'js'},
    '@angular/compiler/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/compiler': {main: 'index.js', defaultExtension: 'js'},
    '@angular/common/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/common': {main: 'index.js', defaultExtension: 'js'},
    '@angular/platform-browser/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/platform-browser': {main: 'index.js', defaultExtension: 'js'},
    '@angular/platform-browser-dynamic/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/platform-browser-dynamic': {main: 'index.js', defaultExtension: 'js'},
    '@angular/private/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/upgrade/static': {main: 'index.js', defaultExtension: 'js'},
    '@angular/router/upgrade': {main: 'index.js', defaultExtension: 'js'},
    '@angular/router/testing': {main: 'index.js', defaultExtension: 'js'},
    '@angular/router': {main: 'index.js', defaultExtension: 'js'},
    'rxjs/ajax': {main: 'index.js', defaultExtension: 'js'},
    'rxjs/operators': {main: 'index.js', defaultExtension: 'js'},
    'rxjs/testing': {main: 'index.js', defaultExtension: 'js'},
    'rxjs/websocket': {main: 'index.js', defaultExtension: 'js'},
    'rxjs': {main: 'index.js', defaultExtension: 'js'},
  }
});

Promise
    .all([
      System.import('@angular/core/testing'),
      System.import('@angular/platform-browser-dynamic/testing')
    ])
    .then(function(providers) {
      var testing = providers[0];
      var testingBrowser = providers[1];

      testing.TestBed.initTestEnvironment(
          testingBrowser.BrowserDynamicTestingModule,
          testingBrowser.platformBrowserDynamicTesting());
    })
    .then(function() {
      // Finally, load all spec files.
      // This will run the tests directly.
      return Promise.all(allSpecFiles.map(function(moduleName) {
        return System.import(moduleName);
      }));
    })
    .then(__karma__.start, function(v) {
      console.error(v);
    });
