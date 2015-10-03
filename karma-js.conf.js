var sauceConf = require('./sauce.conf');

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

      // zone-microtask must be included first as it contains a Promise monkey patch
      'node_modules/zone.js/dist/zone-microtask.js',
      'node_modules/zone.js/dist/long-stack-trace-zone.js',
      'node_modules/zone.js/dist/jasmine-patch.js',

      // Including systemjs because it defines `__eval`, which produces correct stack traces.
      'modules/angular2/src/test_lib/shims_for_IE.js',
      'node_modules/systemjs/dist/system.src.js',
      {pattern: 'node_modules/@reactivex/rxjs/dist/cjs/**', included: false, watched: false, served: true},
      'node_modules/reflect-metadata/Reflect.js',
      'tools/build/file2modulename.js',
      'test-main.js',
      {pattern: 'modules/**/test/**/static_assets/**', included: false, watched: false}
    ],

    exclude: ['dist/js/dev/es5/**/e2e_test/**', 'dist/angular1_router.js'],

    customLaunchers: sauceConf.customLaunchers,

    sauceLabs: {
      testName: 'Angular2',
      startConnect: false,
      recordVideo: false,
      recordScreenshots: false,
      options: {
        'selenium-version': '2.47.1',
        'command-timeout': 600,
        'idle-timeout': 600,
        'max-duration': 5400
      }
    },

    browsers: ['Chrome'],

    port: 9876
  });

  if (process.env.TRAVIS) {
    config.sauceLabs.build = 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')';
    config.sauceLabs.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;

    // TODO(mlaval): remove once SauceLabs supports websockets.
    // This speeds up the capturing a bit, as browsers don't even try to use websocket.
    config.transports = ['polling'];
  }
};
