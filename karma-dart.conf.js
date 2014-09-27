// Karma configuration
// Generated on Thu Sep 25 2014 11:52:02 GMT-0700 (PDT)

module.exports = function(config) {
  config.set({

    frameworks: ['dart-unittest'],

    files: [
      {pattern: 'packages/**/*.dart', included: false},
      {pattern: 'modules/*/src/**/*.js', included: false},
      {pattern: 'modules/*/test/**/*.js', included: true},
      {pattern: 'modules/**/*.dart', included: false},
      'packages/browser/dart.js'
    ],

    karmaDartImports: {
      guinness: 'package:guinness/guinness_html.dart'
    },

    preprocessors: {
      'modules/**/*.js': ['traceur']
    },
    customFileHandlers: [{
      urlRegex: /.*\/packages\/.*$/,
      handler: function(request, response, fa, fb, basePath) {
        var url = request.url;
        var path = url.indexOf('?') > -1 ? url.substring(0, url.indexOf('?')) : url;
        var contets = fs.readFileSync(basePath + path);
        response.writeHead(200);
        response.end(contets);
      }
    }],
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
      resolveModuleName: function(fileName) {
        var moduleName = fileName
          .replace(/.*\/modules\//, '')
          .replace(/\/src\//, '/')
          .replace(/\/test\//, '/');
        return moduleName;
      },
      transformPath: function(fileName) {
        return fileName.replace('.js', '.dart');
      }
    },

    browsers: ['Dartium']
  });


  config.plugins.push(require('./tools/transpiler/karma-traceur-preprocessor'));
};
