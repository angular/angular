var browserProvidersConf = require('../../../browser-providers.conf.js');

// Karma configuration
module.exports = function(config) {
  config.set({

    basePath: '../../../',

    frameworks: ['jasmine'],

    files: [
      // Polyfills.
      'node_modules/core-js/client/core.js',
      'node_modules/reflect-metadata/Reflect.js',

      // System.js for module loading
      'node_modules/systemjs/dist/system-polyfills.js',
      'node_modules/systemjs/dist/system.src.js',

      // Zone.js dependencies
      'node_modules/zone.js/dist/zone.js',
      'node_modules/zone.js/dist/long-stack-trace-zone.js',
      'node_modules/zone.js/dist/proxy.js',
      'node_modules/zone.js/dist/sync-test.js',
      'node_modules/zone.js/dist/jasmine-patch.js',
      'node_modules/zone.js/dist/async-test.js',
      'node_modules/zone.js/dist/fake-async-test.js',

      // RxJs.
      { pattern: 'node_modules/rxjs/**/*.js', included: false, watched: false },
      { pattern: 'node_modules/rxjs/**/*.js.map', included: false, watched: false },

      // shim
      {pattern: 'modules/@angular/router/karma-test-shim.js', included: true, watched: true },

      // Angular modules
      {pattern: 'modules/@angular/core/*.js', included: false, watched: false},
      {pattern: 'modules/@angular/core/src/**/*.js', included: false, watched: false},
      {pattern: 'modules/@angular/core/testing/**/*.js', included: false, watched: false},

      {pattern: 'modules/@angular/common/*.js', included: false, watched: false},
      {pattern: 'modules/@angular/common/src/**/*.js', included: false, watched: false},
      {pattern: 'modules/@angular/common/testing/**/*.js', included: false, watched: false},

      {pattern: 'modules/@angular/compiler/*.js', included: false, watched: false},
      {pattern: 'modules/@angular/compiler/src/**/*.js', included: false, watched: false},
      {pattern: 'modules/@angular/compiler/testing/**/*.js', included: false, watched: false},

      {pattern: 'modules/@angular/platform-browser/*.js', included: false, watched: false},
      {pattern: 'modules/@angular/platform-browser/src/**/*.js', included: false, watched: false},
      {pattern: 'modules/@angular/platform-browser/testing/**/*.js', included: false, watched: false},

      {pattern: 'modules/@angular/platform-browser-dynamic/*.js', included: false, watched: false},
      {pattern: 'modules/@angular/platform-browser-dynamic/src/**/*.js', included: false, watched: false},
      {pattern: 'modules/@angular/platform-browser-dynamic/testing/**/*.js', included: false, watched: false},

      // Router
      {pattern: 'modules/@angular/router/**/*.js', included: false, watched: true}
    ],

    customLaunchers: browserProvidersConf.customLaunchers,

    plugins: [
      'karma-jasmine',
      'karma-browserstack-launcher',
      'karma-sauce-launcher',
      'karma-chrome-launcher',
      'karma-sourcemap-loader'
    ],

    preprocessors: {
      '**/*.js': ['sourcemap']
    },

    reporters: ['dots'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['Chrome'],
    singleRun: false
  })
};
