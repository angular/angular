const path = require('path');
const {customLaunchers, platformMap} = require('./browser-providers');

module.exports = (config) => {

  config.set({
    basePath: path.join(__dirname, '..'),
    frameworks: ['sharding', 'jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-browserstack-launcher'),
      require('karma-sauce-launcher'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('karma-sourcemap-loader'),
      require('karma-coverage'),
      require('karma-spec-reporter'),
      require('karma-sharding'),
    ],
    files: [
      {pattern: 'node_modules/core-js/client/core.js', included: true, watched: false},
      {pattern: 'node_modules/tslib/tslib.js', included: true, watched: false},
      {pattern: 'node_modules/systemjs/dist/system.src.js', included: true, watched: false},
      {pattern: 'node_modules/zone.js/dist/zone.js', included: true, watched: false},
      {pattern: 'node_modules/zone.js/dist/proxy.js', included: true, watched: false},
      {pattern: 'node_modules/zone.js/dist/sync-test.js', included: true, watched: false},
      {pattern: 'node_modules/zone.js/dist/jasmine-patch.js', included: true, watched: false},
      {pattern: 'node_modules/zone.js/dist/async-test.js', included: true, watched: false},
      {pattern: 'node_modules/zone.js/dist/fake-async-test.js', included: true, watched: false},
      {pattern: 'node_modules/hammerjs/hammer.min.js', included: true, watched: false},
      {pattern: 'node_modules/hammerjs/hammer.min.js.map', included: false, watched: false},
      {pattern: 'node_modules/moment/min/moment-with-locales.min.js', included: true, watched: false},

      // Include all Angular dependencies
      {pattern: 'node_modules/@angular/**/*', included: false, watched: false},
      {pattern: 'node_modules/rxjs/**/*', included: false, watched: false},

      {pattern: 'test/karma-test-shim.js', included: true, watched: false},

      // Include a Material theme in the test suite.
      {pattern: 'dist/packages/**/core/theming/prebuilt/indigo-pink.css', included: true, watched: true},

      // Includes all package tests and source files into karma. Those files will be watched.
      // This pattern also matches all all sourcemap files and TypeScript files for debugging.
      {pattern: 'dist/packages/**/*', included: false, watched: true},
    ],

    customLaunchers: customLaunchers,

    preprocessors: {
      'dist/packages/**/*.js': ['sourcemap']
    },

    reporters: ['dots'],
    autoWatch: false,

    coverageReporter: {
      type : 'json-summary',
      dir : 'dist/coverage/',
      subdir: '.'
    },

    // TODO(josephperrott): Determine how to properly disable extra output on ci.
    specReporter: {
      maxLogLines: Infinity, // Log out the entire stack trace on errors and failures.
      suppressSkipped: true,
      showSpecTiming: true,
    },

    sauceLabs: {
      testName: 'material2',
      startConnect: false,
      recordVideo: false,
      recordScreenshots: false,
      idleTimeout: 600,
      commandTimeout: 600,
      maxDuration: 5400,
    },

    browserStack: {
      project: 'material2',
      startTunnel: false,
      retryLimit: 1,
      timeout: 1800,
      pollingTimeout: 20000,
      video: false,
    },

    browserDisconnectTimeout: 180000,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 300000,
    captureTimeout: 180000,
    browsers: ['ChromeHeadlessLocal'],

    singleRun: false,

    browserConsoleLogOptions: {
      terminal: true,
      level: 'log'
    },

    client: {
      jasmine: {
        // TODO(jelbourn): re-enable random test order once we can de-flake existing issues.
        random: false
      }
    }
  });

  if (process.env['TRAVIS']) {
    const buildId = `TRAVIS #${process.env.TRAVIS_BUILD_NUMBER} (${process.env.TRAVIS_BUILD_ID})`;

    if (process.env['TRAVIS_PULL_REQUEST'] === 'false' &&
        process.env['MODE'] === "travis_required") {

      config.preprocessors['dist/packages/**/!(*+(.|-)spec).js'] = ['coverage'];
      config.reporters.push('coverage');
      // Hide passed tests from logs while on travis.
      config.specReporter.suppressPassed = true;
    }

    // The MODE variable is the indicator of what row in the test matrix we're running.
    // It will look like <platform>_<target>, where platform is one of 'saucelabs', 'browserstack'
    // or 'travis'. The target is a reference to different collections of browsers that can run
    // in the previously specified platform.
    const [platform, target] = process.env.MODE.split('_');

    if (platform === 'saucelabs') {
      config.sauceLabs.build = buildId;
      config.sauceLabs.tunnelIdentifier = process.env.TRAVIS_JOB_ID;
    } else if (platform === 'browserstack') {
      config.browserStack.build = buildId;
      config.browserStack.tunnelIdentifier = process.env.TRAVIS_JOB_ID;
    } else if (platform !== 'travis') {
      throw new Error(`Platform "${platform}" unknown, but Travis specified. Exiting.`);
    }

    // Set the browser list to be the same browser 3 times, to shard tests into three instances.
    config.browsers = (new Array(3)).fill(platformMap[platform][target.toLowerCase()][0]);
  }
};
