/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const browserProvidersConf = require('./browser-providers.conf');
const {hostname} = require('os');

const seed = process.env.JASMINE_RANDOM_SEED || String(Math.random()).slice(-5);
console.info(`Jasmine random seed: ${seed}`);

const isBazel = !!process.env.TEST_TARGET;

module.exports = function (config) {
  const conf = {
    frameworks: ['jasmine'],

    client: {
      jasmine: {
        random: true,
        seed,
      },
      captureConsole: true,
    },

    files: [
      // Serve AngularJS for `ngUpgrade` testing.
      {pattern: 'node_modules/angular-1.5/angular?(.min).js', included: false, watched: false},
      {pattern: 'node_modules/angular-mocks-1.5/angular-mocks.js', included: false, watched: false},
      {pattern: 'node_modules/angular-1.6/angular?(.min).js', included: false, watched: false},
      {pattern: 'node_modules/angular-mocks-1.6/angular-mocks.js', included: false, watched: false},
      {pattern: 'node_modules/angular-1.7/angular?(.min).js', included: false, watched: false},
      {pattern: 'node_modules/angular-mocks-1.7/angular-mocks.js', included: false, watched: false},
      {pattern: 'node_modules/angular-1.8/angular?(.min).js', included: false, watched: false},
      {pattern: 'node_modules/angular-mocks-1.8/angular-mocks.js', included: false, watched: false},

      // Static test assets.
      {pattern: 'packages/platform-browser/test/static_assets/**/*', included: false},
      {pattern: 'packages/platform-browser/test/browser/static_assets/**/*', included: false},

      'node_modules/reflect-metadata/Reflect.js',

      'dist/legacy-test-bundle.spec.js',
    ],

    customLaunchers: browserProvidersConf.customLaunchers,

    plugins: ['karma-jasmine', 'karma-chrome-launcher', 'karma-sourcemap-loader'],

    preprocessors: {
      '**/*.js': ['sourcemap'],
    },

    // Bazel inter-op: Allow tests to request resources from either
    //   /base/node_modules/path/to/thing
    // or
    //   /base/_main/node_modules/path/to/thing
    // This can be removed when all karma tests are run under Bazel, then we
    // don't need this entire config file.
    proxies: {
      '/base/angular/': '/base/',
      '/base/npm/': '/base/',
    },

    // Always use `polling` for increased communication stability.
    transports: ['polling'],

    port: 9876,
    captureTimeout: 180000,
    browserDisconnectTimeout: 180000,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 300000,
  };

  // Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1431. The idea is
  // that we do no not allow `@bazel/karma` to add the `progress` reporter.
  Object.defineProperty(conf, 'reporters', {
    enumerable: true,
    get: () => ['dots'],
    set: () => {},
  });

  conf.hostname = hostname();

  // Run the test locally
  conf.browsers = [process.env['DISPLAY'] ? 'Chrome' : 'ChromeHeadless'];

  config.set(conf);
};
