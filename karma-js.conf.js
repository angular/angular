var browserProvidersConf = require('./browser-providers.conf.js');
var internalAngularReporter = require('./tools/karma/reporter.js');

// Karma configuration
// Generated on Thu Sep 25 2014 11:52:02 GMT-0700 (PDT)
module.exports = function(config) {
  config.set({

    frameworks: ['jasmine'],

    files: [
      // Sources and specs.
      // Loaded through the System loader, in `test-main.js`.
      {pattern: 'dist/js/dev/es5/**', included: false, watched: false},

      'node_modules/es6-shim/es6-shim.js',
      // include Angular v1 for upgrade module testing
      'node_modules/angular/angular.min.js',

      'node_modules/zone.js/dist/zone.js',
      'node_modules/zone.js/dist/long-stack-trace-zone.js',
      'node_modules/zone.js/dist/jasmine-patch.js',
      'node_modules/zone.js/dist/async-test.js',
      'node_modules/zone.js/dist/fake-async-test.js',

      // Including systemjs because it defines `__eval`, which produces correct stack traces.
      'modules/angular2/src/testing/shims_for_IE.js',
      'node_modules/systemjs/dist/system.src.js',
      {pattern: 'node_modules/rxjs/**', included: false, watched: false, served: true},
      'node_modules/reflect-metadata/Reflect.js',
      'tools/build/file2modulename.js',
      'test-main.js',
      {pattern: 'modules/**/test/**/static_assets/**', included: false, watched: false}
    ],

    exclude: ['dist/js/dev/es5/**/e2e_test/**', 'dist/js/dev/es5/angular2/examples/**', 'dist/angular1_router.js'],

    customLaunchers: browserProvidersConf.customLaunchers,

    plugins: [
      'karma-jasmine',
      'karma-browserstack-launcher',
      'karma-sauce-launcher',
      'karma-chrome-launcher',
      'karma-sourcemap-loader',
      'karma-dart',
      internalAngularReporter
    ],

    preprocessors: {
      '**/*.js': ['sourcemap']
    },

    reporters: ['internal-angular'],
    sauceLabs: {
      testName: 'Angular2',
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
      project: 'Angular2',
      startTunnel: false,
      retryLimit: 1,
      timeout: 600,
      pollingTimeout: 10000
    },

    browsers: ['Chrome'],

    port: 9876
  });

  if (process.env.TRAVIS) {
    var buildId = 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')';
    if (process.env.MODE.startsWith('saucelabs')) {
      config.sauceLabs.build = buildId;
      config.sauceLabs.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;

      // TODO(mlaval): remove once SauceLabs supports websockets.
      // This speeds up the capturing a bit, as browsers don't even try to use websocket.
      console.log('>>>> setting socket.io transport to polling <<<<');
      config.transports = ['polling'];
    }

    if (process.env.MODE.startsWith('browserstack')) {
      config.browserStack.build = buildId;
      config.browserStack.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;
    }
  }
};
