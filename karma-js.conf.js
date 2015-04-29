// Karma configuration
// Generated on Thu Sep 25 2014 11:52:02 GMT-0700 (PDT)
var file2moduleName = require('./tools/build/file2modulename');

module.exports = function(config) {
  config.set({

    frameworks: ['jasmine'],

    files: [
      // Sources and specs.
      // Loaded through the es6-module-loader, in `test-main.js`.
      {pattern: 'dist/js/dev/es5/**', included: false, watched: false},

      'node_modules/traceur/bin/traceur-runtime.js',
      'node_modules/es6-module-loader/dist/es6-module-loader-sans-promises.src.js',
      // Including systemjs because it defines `__eval`, which produces correct stack traces.
      'node_modules/systemjs/dist/system.src.js',
      'node_modules/systemjs/lib/extension-register.js',
      'node_modules/systemjs/lib/extension-cjs.js',
      'node_modules/rx/dist/rx.all.js',
      'node_modules/reflect-metadata/Reflect.js',
      'node_modules/zone.js/zone.js',
      'node_modules/zone.js/long-stack-trace-zone.js',

      'tools/build/file2modulename.js',
      'test-main.js'
    ],

    exclude: [
      'dist/js/dev/es5/**/e2e_test/**',
    ],

    customLaunchers: {
      DartiumWithWebPlatform: {
        base: 'Dartium',
        flags: ['--enable-experimental-web-platform-features'] },
      ChromeNoSandbox: {
        base: 'Chrome',
        flags: ['--no-sandbox'] }
    },
    browsers: ['ChromeCanary'],

    port: 9876
  });
};
