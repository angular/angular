// Karma configuration
// Generated on Thu Sep 25 2014 11:52:02 GMT-0700 (PDT)
var file2moduleName = require('./tools/build/file2modulename');

module.exports = function(config) {
  config.set({

    frameworks: ['jasmine'],

    files: [
      // Sources and specs.
      // Loaded through the es6-module-loader, in `test-main.js`.
      {pattern: 'modules/**', included: false},
      {pattern: 'tools/transpiler/spec/**', included: false},

      'node_modules/traceur/bin/traceur-runtime.js',
      'node_modules/es6-module-loader/dist/es6-module-loader-sans-promises.src.js',
      // Including systemjs because it defines `__eval`, which produces correct stack traces.
      'node_modules/systemjs/dist/system.src.js',
      'node_modules/systemjs/lib/extension-register.js',
      'node_modules/systemjs/lib/extension-cjs.js',
      'node_modules/rx/dist/rx.all.js',
      'node_modules/zone.js/zone.js',
      'node_modules/zone.js/long-stack-trace-zone.js',

      'tools/build/file2modulename.js',
      'test-main.js'
    ],

    exclude: [
      'modules/**/e2e_test/**'
    ],

    preprocessors: {
      'modules/**/*.js': ['traceur'],
      'modules/**/*.es6': ['traceur'],
      'tools/transpiler/spec/**/*.js': ['traceur'],
      'tools/transpiler/spec/**/*.es6': ['traceur'],
    },

    traceurPreprocessor: {
      options: {
        outputLanguage: 'es5',
        sourceMaps: true,
        script: false,
        memberVariables: true,
        modules: 'instantiate',
        types: true,
        typeAssertions: true,
        typeAssertionModule: 'rtts_assert/rtts_assert',
        annotations: true
      },
      resolveModuleName: file2moduleName,
      transformPath: function(fileName) {
        return fileName.replace(/\.es6$/, '.js');
      }
    },

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

  config.plugins.push(require('./tools/transpiler/karma-traceur-preprocessor'));
};
