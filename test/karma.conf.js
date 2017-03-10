const path = require('path');
const {customLaunchers, platformMap} = require('./browser-providers');

module.exports = (config) => {

  config.set({
    basePath: path.join(__dirname, '..'),
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-browserstack-launcher'),
      require('karma-sauce-launcher'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('karma-sourcemap-loader'),
      require('karma-coverage')
    ],
    files: [
      {pattern: 'dist/vendor/core-js/client/core.js', included: true, watched: false},
      {pattern: 'dist/vendor/systemjs/dist/system-polyfills.js', included: true, watched: false},
      {pattern: 'dist/vendor/systemjs/dist/system.src.js', included: true, watched: false},
      {pattern: 'dist/vendor/zone.js/dist/zone.js', included: true, watched: false},
      {pattern: 'dist/vendor/zone.js/dist/proxy.js', included: true, watched: false},
      {pattern: 'dist/vendor/zone.js/dist/sync-test.js', included: true, watched: false},
      {pattern: 'dist/vendor/zone.js/dist/jasmine-patch.js', included: true, watched: false},
      {pattern: 'dist/vendor/zone.js/dist/async-test.js', included: true, watched: false},
      {pattern: 'dist/vendor/zone.js/dist/fake-async-test.js', included: true, watched: false},
      {pattern: 'dist/vendor/hammerjs/hammer.min.js', included: true, watched: false},
      {pattern: 'test/karma-test-shim.js', included: true, watched: false},

      // paths loaded via module imports
      {pattern: 'dist/**/*.js', included: false, watched: true},

      // include one of the themes
      {pattern: 'dist/**/prebuilt/indigo-pink.css', included: true, watched: true},

      // paths loaded via Angular's component compiler
      // (these paths need to be rewritten, see proxies section)
      {pattern: 'dist/**/*.html', included: false, watched: true},
      {pattern: 'dist/**/*.css', included: false, watched: true},

      // paths to support debugging with source maps in dev tools
      {pattern: 'dist/**/*.ts', included: false, watched: false},
      {pattern: 'dist/**/*.js.map', included: false, watched: false}
    ],
    proxies: {
      // required for component assets fetched by Angular's compiler
      '/components/': '/base/dist/components/',
      '/core/': '/base/dist/core/',
    },

    customLaunchers: customLaunchers,

    preprocessors: {
      'dist/@angular/material/**/*.js': ['sourcemap']
    },

    reporters: ['dots'],

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,

    coverageReporter: {
      type : 'json-summary',
      dir : 'dist/coverage/',
      subdir: '.'
    },

    sauceLabs: {
      testName: 'material2',
      startConnect: false,
      recordVideo: false,
      recordScreenshots: false,
      options: {
        'selenium-version': '2.48.2',
        'command-timeout': 600,
        'idle-timeout': 600,
        'max-duration': 5400
      }
    },

    browserStack: {
      project: 'material2',
      startTunnel: false,
      retryLimit: 1,
      timeout: 600,
      pollingTimeout: 20000
    },

    browserDisconnectTimeout: 20000,
    browserNoActivityTimeout: 240000,
    captureTimeout: 120000,
    browsers: ['Chrome_1024x768'],

    singleRun: false,

    browserConsoleLogOptions: {
      terminal: true,
      level: 'log'
    }

  });

  if (process.env['TRAVIS']) {
    let buildId = `TRAVIS #${process.env.TRAVIS_BUILD_NUMBER} (${process.env.TRAVIS_BUILD_ID})`;

    if (process.env['TRAVIS_PULL_REQUEST'] === 'false' &&
        process.env['MODE'] === "browserstack_required") {

      config.preprocessors['dist/@angular/material/**/!(*+(.|-)spec).js'] = ['coverage'];
      config.reporters.push('coverage');
    }

    // The MODE variable is the indicator of what row in the test matrix we're running.
    // It will look like <platform>_<alias>, where platform is one of 'saucelabs' or 'browserstack',
    // and alias is one of the keys in the CI configuration variable declared in
    // browser-providers.ts.
    let [platform, alias] = process.env.MODE.split('_');

    if (platform === 'saucelabs') {
      config.sauceLabs.build = buildId;
      config.sauceLabs.tunnelIdentifier = process.env.TRAVIS_JOB_ID;
    } else if (platform === 'browserstack') {
      config.browserStack.build = buildId;
      config.browserStack.tunnelIdentifier = process.env.TRAVIS_JOB_ID;
    } else {
      throw new Error(`Platform "${platform}" unknown, but Travis specified. Exiting.`);
    }

    config.browsers = platformMap[platform][alias.toLowerCase()];
  }
};
