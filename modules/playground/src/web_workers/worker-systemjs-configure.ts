/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

declare var System: any;

System.config({
  baseURL: '/all',
  map: {
    '@angular/common': '/packages-dist/common/bundles/common.umd.js',
    '@angular/animations': '/packages-dist/animation/bundles/animations.umd.js',
    '@angular/platform-browser/animations':
        '/packages-dist/platform-browser/animations/bundles/platform-browser-animations.umd.js',
    '@angular/compiler': '/packages-dist/compiler/bundles/compiler.umd.js',
    '@angular/core': '/packages-dist/core/bundles/core.umd.js',
    '@angular/forms': '/packages-dist/forms/bundles/forms.umd.js',
    '@angular/http': '/packages-dist/http/bundles/http.umd.js',
    '@angular/platform-browser': '/packages-dist/platform-browser/bundles/platform-browser.umd.js',
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
    'rxjs/ajax': {main: 'index.js', defaultExtension: 'js'},
    'rxjs/operators': {main: 'index.js', defaultExtension: 'js'},
    'rxjs/testing': {main: 'index.js', defaultExtension: 'js'},
    'rxjs/websocket': {main: 'index.js', defaultExtension: 'js'},
    'rxjs': {main: 'index.js', defaultExtension: 'js'},
  },

  defaultJSExtensions: true
});
