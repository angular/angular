/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
System.config({
  defaultJSExtensions: true,
  map: {
    '@angular/common': '/vendor/@angular/common/bundles/common.umd.js',
    '@angular/compiler': '/vendor/@angular/compiler/bundles/compiler.umd.js',
    '@angular/animations': '/vendor/@angular/animations/bundles/animations.umd.js',
    '@angular/animations/browser': '/vendor/@angular/animations/bundles/animations-browser.umd.js',
    '@angular/platform-browser/animations':
        '/vendor/@angular/platform-browser/bundles/platform-browser-animations.umd.js',
    '@angular/core': '/vendor/@angular/core/bundles/core.umd.js',
    '@angular/forms': '/vendor/@angular/forms/bundles/forms.umd.js',
    '@angular/http': '/vendor/@angular/forms/bundles/http.umd.js',
    '@angular/platform-browser':
        '/vendor/@angular/platform-browser/bundles/platform-browser.umd.js',
    '@angular/platform-browser-dynamic':
        '/vendor/@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
    '@angular/router': '/vendor/@angular/router/bundles/router.umd.js',
    '@angular/upgrade': '/vendor/@angular/upgrade/bundles/upgrade.umd.js',
    '@angular/upgrade/static': '/vendor/@angular/upgrade/bundles/upgrade-static.umd.js',
    'rxjs': '/vendor/rxjs',
  },
  packages: {
    // rxjs: {format: 'cjs', exports: 'Rx' }
    rxjs: {defaultExtension: 'js'}
  }
});
