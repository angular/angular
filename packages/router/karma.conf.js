/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const browserProvidersConf = require('../../browser-providers.conf');
const {generateSeed} = require('../../tools/jasmine-seed-generator');

// Karma configuration
module.exports = function(config) {
  config.set({

    basePath: '../../',

    frameworks: ['jasmine'],

    client: {
      jasmine: {
        random: true,
        seed: generateSeed('router/karma.conf'),
      },
    },

    files: [
      // Polyfills.
      'node_modules/core-js/client/core.js',
      'node_modules/reflect-metadata/Reflect.js',
      'third_party/shims_for_internal_tests.js',

      // System.js for module loading
      'node_modules/systemjs/dist/system-polyfills.js',
      'node_modules/systemjs/dist/system.src.js',

      // Zone.js dependencies
      'dist/bin/packages/zone.js/npm_package/bundles/zone.umd.js',
      'dist/bin/packages/zone.js/npm_package/bundles/zone-testing.umd.js',

      {pattern: 'node_modules/rxjs/**/*', included: false, watched: false},

      // shim
      {pattern: 'packages/router/karma-test-shim.js', included: true, watched: true},

      // Angular modules
      {pattern: 'dist/all/@angular/core/*.js', included: false, watched: false},
      {pattern: 'dist/all/@angular/core/src/**/*.js', included: false, watched: false},
      {pattern: 'dist/all/@angular/core/testing/**/*.js', included: false, watched: false},

      {pattern: 'dist/all/@angular/common/*.js', included: false, watched: false},
      {pattern: 'dist/all/@angular/common/src/**/*.js', included: false, watched: false},
      {pattern: 'dist/all/@angular/common/testing/**/*.js', included: false, watched: false},

      {pattern: 'dist/all/@angular/compiler/*.js', included: false, watched: false},
      {pattern: 'dist/all/@angular/compiler/src/**/*.js', included: false, watched: false},
      {pattern: 'dist/all/@angular/compiler/testing/**/*.js', included: false, watched: false},

      {pattern: 'dist/all/@angular/platform-browser/*.js', included: false, watched: false},
      {pattern: 'dist/all/@angular/platform-browser/src/**/*.js', included: false, watched: false},
      {
        pattern: 'dist/all/@angular/platform-browser/testing/**/*.js',
        included: false,
        watched: false
      },

      {pattern: 'dist/all/@angular/platform-browser-dynamic/*.js', included: false, watched: false},
      {
        pattern: 'dist/all/@angular/platform-browser-dynamic/src/**/*.js',
        included: false,
        watched: false
      },
      {
        pattern: 'dist/all/@angular/platform-browser-dynamic/testing/**/*.js',
        included: false,
        watched: false
      },

      {pattern: 'dist/all/@angular/private/testing/**/*.js', included: false, watched: false},

      {pattern: 'dist/all/@angular/upgrade/static/*.js', included: false, watched: false},
      {pattern: 'dist/all/@angular/upgrade/static/src/**/*.js', included: false, watched: false},

      // Router
      {pattern: 'dist/all/@angular/router/**/*.js', included: false, watched: true}
    ],

    customLaunchers: browserProvidersConf.customLaunchers,

    plugins: [
      'karma-jasmine',
      'karma-browserstack-launcher',
      'karma-sauce-launcher',
      'karma-chrome-launcher',
      'karma-sourcemap-loader',
    ],

    preprocessors: {
      '**/*.js': ['sourcemap'],
    },

    reporters: ['dots'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    captureTimeout: 60000,
    browserDisconnectTimeout: 60000,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 60000,
  });
};
