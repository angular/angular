// Karma configuration
// Generated on Thu Sep 25 2014 11:52:02 GMT-0700 (PDT)

module.exports = function(config) {
  config.set({

    frameworks: ['jasmine'],

    files: [
      'node_modules/traceur/bin/traceur-runtime.js',
      './karma-mock-annotations.js',
      'modules/**/test_lib/**/*.es6',
      'modules/**/*.js',
      'modules/**/*.es6',
      'test-main.js'
    ],

    preprocessors: {
      'modules/**/*.js': ['traceur'],
      'modules/**/*.es6': ['traceur']
    },

    traceurPreprocessor: {
      options: {
        outputLanguage: 'es5',
        script: false,
        modules: 'register',
        types: true,
        // TODO: turn this on!
        // typeAssertions: true,
        // typeAssertionModule: 'assert',
        annotations: true
      },
      resolveModuleName: function(fileName) {
        var moduleName = fileName
          .replace(/.*\/modules\//, '')
          .replace(/\/src\//, '/')
          .replace(/\/test\//, '/');
        return moduleName;
      },
      transformPath: function(fileName) {
        return fileName.replace('.es6', '');
      }
    },

    browsers: ['Chrome']
  });

  config.plugins.push(require('./tools/js2dart/karma-traceur-preprocessor'));
};
