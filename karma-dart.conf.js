// Karma configuration
// Generated on Thu Sep 25 2014 11:52:02 GMT-0700 (PDT)
var file2moduleName = require('./file2modulename');

module.exports = function(config) {
  config.set({

    frameworks: ['dart-unittest'],

    files: [
      {pattern: 'modules/**/*_spec.js', included: true},
      {pattern: 'modules/*/src/**/*', included: false},
      {pattern: 'modules/*/test/**/*', included: false},
      {pattern: 'tools/transpiler/spec/**/*_spec.js', included: true},
      {pattern: 'tools/transpiler/spec/**/*', included: false},
      'test-main.dart'
    ],

    karmaDartImports: {
      guinness: 'package:guinness/guinness_html.dart'
    },

    preprocessors: {
      'modules/**/*.js': ['traceur'],
      'tools/**/*.js': ['traceur']
    },
    traceurPreprocessor: {
      options: {
        outputLanguage: 'dart',
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
  });


  config.plugins.push(require('./tools/transpiler/karma-traceur-preprocessor'));
};
