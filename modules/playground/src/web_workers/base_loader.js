/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

importScripts(
    '/node_modules/core-js/client/core.js',
    '/node_modules/zone.js/dist/zone.js',
    '/node_modules/zone.js/dist/long-stack-trace-zone.js',
    '/node_modules/systemjs/dist/system.src.js',
    '/node_modules/reflect-metadata/Reflect.js');

System.config({
  map: {
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
    'rxjs': '/node_modules/rxjs'
  },
  packages: {
    '@angular/core/src/facade': {defaultExtension: 'js'},
    '@angular/facade': {defaultExtension: 'js'},
    'rxjs': {defaultExtension: 'js'}
  },
  defaultJSExtensions: true
});
