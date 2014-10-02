// Karma configuration
// Generated on Thu Sep 25 2014 11:52:02 GMT-0700 (PDT)
var file2moduleName = require('./file2modulename');

module.exports = function(config) {
  config.set({

    frameworks: ['jasmine'],

    files: [
      'node_modules/traceur/bin/traceur-runtime.js',
      'modules/**/test_lib/**/*.es6',
      'modules/**/*.js',
      'modules/**/*.es6',
      'tools/transpiler/spec/**/*.js',
      'tools/transpiler/spec/**/*.es6',
      'file2modulename.js',
      'test-main.js'
    ],

    preprocessors: {
      'modules/**/*.js': ['traceur'],
      'modules/**/*.es6': ['traceur'],
      'tools/transpiler/**/*.js': ['traceur'],
      'tools/transpiler/**/*.es6': ['traceur'],
    },

    traceurPreprocessor: {
      options: {
        outputLanguage: 'es5',
        script: false,
        modules: 'register',
        types: true,
        typeAssertions: true,
        typeAssertionModule: 'rtts_assert/rtts_assert',
        annotations: true
      },
      resolveModuleName: file2moduleName,
      transformPath: function(fileName) {
        return fileName.replace('.es6', '');
      }
    },

    customLaunchers: {
      DartiumWithWebPlatform: {
        base: 'Dartium',
        flags: ['--enable-experimental-web-platform-features'] }
    },
    browsers: ['ChromeCanary'],
  });

  config.plugins.push(require('./tools/transpiler/karma-traceur-preprocessor'));
};
