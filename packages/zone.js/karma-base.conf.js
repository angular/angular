/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

module.exports = function (config) {
  config.set({
    basePath: '',
    client: {errorpolicy: config.errorpolicy},
    files: [
      'node_modules/systemjs/dist/system-polyfills.js',
      'node_modules/systemjs/dist/system.src.js',
      'node_modules/whatwg-fetch/fetch.js',
      {pattern: 'node_modules/rxjs/**/**/*.js', included: false, watched: false},
      {pattern: 'node_modules/rxjs/**/**/*.js.map', included: false, watched: false},
      {pattern: 'node_modules/rxjs/**/*.js', included: false, watched: false},
      {pattern: 'node_modules/es6-promise/**/*.js', included: false, watched: false},
      {pattern: 'node_modules/core-js/**/*.js', included: false, watched: false},
      {pattern: 'node_modules/rxjs/**/*.js.map', included: false, watched: false},
      {pattern: 'test/assets/**/*.*', watched: true, served: true, included: false},
      {pattern: 'build/**/*.js.map', watched: true, served: true, included: false},
      {pattern: 'build/**/*.js', watched: true, served: true, included: false},
    ],

    plugins: [
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('karma-sourcemap-loader'),
    ],

    preprocessors: {'**/*.js': ['sourcemap']},

    exclude: ['test/microtasks.spec.ts'],

    reporters: ['progress'],

    // port: 9876,
    colors: true,

    logLevel: config.LOG_INFO,

    browsers: ['Chrome'],

    captureTimeout: 60000,
    retryLimit: 4,

    autoWatch: true,
    singleRun: false,
  });
};
