// Karma configuration
// Generated on Thu Sep 25 2014 11:52:02 GMT-0700 (PDT)
var file2moduleName = require('./file2modulename');

module.exports = function(config) {
  config.set({

    frameworks: ['dart-unittest'],

    files: [
      // Unit test files needs to be included.
      // Karma-dart generates `__adapter_unittest.dart` that imports these files.
      {pattern: 'modules/*/test/**/*_spec.js', included: true},
      {pattern: 'tools/transpiler/spec/**/*_spec.js', included: true},

      // These files are not included, they are imported by the unit tests above.
      {pattern: 'modules/**', included: false},
      {pattern: 'tools/transpiler/spec/**/*', included: false},

      // Dependencies, installed with `pub install`.
      {pattern: 'packages/**/*.dart', included: false, watched: false},

      // Init and configure guiness.
      {pattern: 'test-main.dart', included: true}
    ],

    karmaDartImports: {
      guinness: 'package:guinness/guinness_html.dart'
    },

    // TODO(vojta): Remove the localhost:9877 from urls, once the proxy fix is merged:
    // https://github.com/karma-runner/karma/pull/1207
    //
    // Map packages to the correct urls where Karma serves them.
    proxies: {
      // Dependencies installed with `pub install`.
      '/packages/unittest': 'http://localhost:9877/base/packages/unittest',
      '/packages/guinness': 'http://localhost:9877/base/packages/guinness',
      '/packages/matcher': 'http://localhost:9877/base/packages/matcher',
      '/packages/stack_trace': 'http://localhost:9877/base/packages/stack_trace',
      '/packages/collection': 'http://localhost:9877/base/packages/collection',
      '/packages/path': 'http://localhost:9877/base/packages/path',

      // Local dependencies, transpiled from the source.
      '/packages/core': 'http://localhost:9877/base/modules/core/src',
      '/packages/change_detection': 'http://localhost:9877/base/modules/change_detection/src',
      '/packages/di': 'http://localhost:9877/base/modules/di/src',
      '/packages/facade': 'http://localhost:9877/base/modules/facade/src',
      '/packages/test_lib': 'http://localhost:9877/base/modules/test_lib/src',
    },

    preprocessors: {
      'modules/**/*.js': ['traceur'],
      'tools/**/*.js': ['traceur']
    },

    traceurPreprocessor: {
      options: {
        outputLanguage: 'dart',
        sourceMaps: true,
        script: false,
        modules: 'register',
        types: true,
        // typeAssertions: true,
        // typeAssertionModule: 'assert',
        annotations: true
      },
      resolveModuleName: file2moduleName,
      transformPath: function(fileName) {
        return fileName.replace('.js', '.dart');
      }
    },

    customLaunchers: {
      DartiumWithWebPlatform: {
        base: 'Dartium',
        flags: ['--enable-experimental-web-platform-features'] }
    },
    browsers: ['DartiumWithWebPlatform'],

    port: 9877
  });


  config.plugins.push(require('./tools/transpiler/karma-traceur-preprocessor'));
};
