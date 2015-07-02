// Karma configuration
// Generated on Thu Sep 25 2014 11:52:02 GMT-0700 (PDT)
module.exports = function(config) {
  config.set({

    frameworks: ['dart-unittest'],

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
    ],

    karmaDartImports: {
      guinness: 'package:guinness/guinness_html.dart'
    },

    // Map packages to the correct urls where Karma serves them.
    proxies: {
      // Dependencies installed with `pub install`.
      '/packages/unittest': '/base/packages/unittest',
      '/packages/guinness': '/base/packages/guinness',
      '/packages/matcher': '/base/packages/matcher',
      '/packages/stack_trace': '/base/packages/stack_trace',
      '/packages/collection': '/base/packages/collection',
      '/packages/path': '/base/packages/path',

      // Local dependencies, transpiled from the source.
      '/packages/angular2': '/base/dist/dart/angular2/lib',
      '/packages/angular2_material': '/base/dist/dart/angular2_material/lib',
      '/packages/benchpress': '/base/dist/dart/benchpress/lib',
      '/packages/examples': '/base/dist/dart/examples/lib'
    },

    customLaunchers: {
      DartiumWithWebPlatform: {
        base: 'Dartium',
        flags: ['--enable-experimental-web-platform-features'] }
    },
    browsers: ['DartiumWithWebPlatform'],

    port: 9877
  });
};
