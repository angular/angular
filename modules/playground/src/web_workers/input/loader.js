/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

importScripts(
    '../../../vendor/core.js', '../../../vendor/zone.js',
    '../../../vendor/long-stack-trace-zone.js', '../../../vendor/system.src.js',
    '../../../vendor/Reflect.js');


System.config({
  baseURL: '/all',

  map: {
    'rxjs': '/all/playground/vendor/rxjs',
  },
  packages: {
    '@angular/core': {main: 'index.js', defaultExtension: 'js'},
    '@angular/compiler': {main: 'index.js', defaultExtension: 'js'},
    '@angular/common': {main: 'index.js', defaultExtension: 'js'},
    '@angular/platform-browser': {main: 'index.js', defaultExtension: 'js'},
    '@angular/platform-browser-dynamic': {main: 'index.js', defaultExtension: 'js'},
    '@angular/platform-webworker': {main: 'index.js', defaultExtension: 'js'},
    '@angular/platform-webworker-dynamic': {main: 'index.js', defaultExtension: 'js'},
    'rxjs/ajax': {main: 'index.js', defaultExtension: 'js'},
    'rxjs/operators': {main: 'index.js', defaultExtension: 'js'},
    'rxjs/testing': {main: 'index.js', defaultExtension: 'js'},
    'rxjs/websocket': {main: 'index.js', defaultExtension: 'js'},
    'rxjs': {main: 'index.js', defaultExtension: 'js'},
  },

  defaultJSExtensions: true
});

System.import('playground/src/web_workers/input/background_index')
    .then(
        function(m) {
          try {
            m.main();
          } catch (e) {
            console.error(e);
          }
        },
        function(error) { console.error('error loading background', error); });
