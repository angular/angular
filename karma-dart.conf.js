var sauceConf = require('./sauce.conf');

var packageSources = {
  // Dependencies installed with `pub install`.
  'unittest': 'packages/unittest',
  'guinness': 'packages/guinness',
  'matcher': 'packages/matcher',
  'stack_trace': 'packages/stack_trace',
  'collection': 'packages/collection',
  'path': 'packages/path',
  'observe': 'packages/observe',
  'quiver': 'packages/quiver',
  'intl': 'packages/intl',
  'smoke': 'packages/smoke',
  'logging': 'packages/logging',
  'utf': 'packages/utf',

  // Local dependencies, transpiled from the source.
  'angular2/test/': 'dist/dart/angular2/test/',
  'angular2': 'dist/dart/angular2/lib',
  'http': 'dist/dart/http/lib',
  'angular2_material': 'dist/dart/angular2_material/lib',
  'benchpress': 'dist/dart/benchpress/lib',
  'examples': 'dist/dart/examples/lib'
};

var proxyPaths = {};
Object.keys(packageSources).map(function(packageName) {
  var filePath = packageSources[packageName];
  proxyPaths['/packages/'+packageName] = '/base/'+filePath;
});

// Karma configuration
// Generated on Thu Sep 25 2014 11:52:02 GMT-0700 (PDT)
module.exports = function(config) {
  config.set({

    frameworks: ['dart-unittest', 'dart-evalcache'],

    files: [
      // Init and configure guiness.
      {pattern: 'test-init.dart', included: true},
      // Unit test files needs to be included.
      {pattern: 'dist/dart/**/*_spec.dart', included: true, watched: false},

      // Karma-dart via the dart-unittest framework generates
      // `__adapter_unittest.dart` that imports these files.
      {pattern: 'dist/dart/**', included: false, watched: false},

      // Dependencies, installed with `pub install`.
      {pattern: 'packages/**/*.dart', included: false, watched: false},

      // Init and configure guiness.
      {pattern: 'test-main.dart', included: true},
      {pattern: 'modules/**/test/**/static_assets/**', included: false, watched: false},
    ],

    exclude: [
      'dist/dart/**/packages/**',
      'modules/angular1_router/**'
    ],

    karmaDartImports: {
      guinness: 'package:guinness/guinness_html.dart'
    },

    // Map packages to the correct urls where Karma serves them.
    proxies: proxyPaths,

    customLaunchers: sauceConf.customLaunchers,
    browsers: ['DartiumWithWebPlatform'],

    port: 9877,

    plugins: [
      require('karma-dart'),
      require('karma-chrome-launcher'),
      require('karma-sauce-launcher'),
      require('./karma-dart-evalcache')(packageSources)
    ]
  });
};
