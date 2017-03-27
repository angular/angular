// Configuration for the Wallaby Visual Studio Code testing extension
// https://marketplace.visualstudio.com/items?itemName=WallabyJs.wallaby-vscode
// Note: Wallaby is not open source and costs money

module.exports = function () {
  return {
    files: [
      // System.js for module loading
      {pattern: 'node_modules/systemjs/dist/system.js', instrument: false},
      {pattern: 'systemjs.config.js', instrument: false},
      {pattern: 'systemjs.config.extras.js', instrument: false},

      // Polyfills
      {pattern: 'node_modules/core-js/client/shim.min.js', instrument: false},

      // zone.js
      {pattern: 'node_modules/zone.js/dist/zone.js', instrument: false},
      {pattern: 'node_modules/zone.js/dist/long-stack-trace-zone.js', instrument: false},
      {pattern: 'node_modules/zone.js/dist/proxy.js', instrument: false},
      {pattern: 'node_modules/zone.js/dist/sync-test.js', instrument: false},
      {pattern: 'node_modules/zone.js/dist/jasmine-patch.js', instrument: false},
      {pattern: 'node_modules/zone.js/dist/async-test.js', instrument: false},
      {pattern: 'node_modules/zone.js/dist/fake-async-test.js', instrument: false},

      // application (but not specs) loaded via module imports
      {pattern: 'app/**/*+(ts|html|css)', load: false},
      {pattern: 'app/**/*.spec.ts', ignore: true},

      {pattern: 'testing/**/*+(ts|html|css)', load: false},
    ],

    tests: [
      {pattern: 'app/**/*.spec.ts', load: false}
    ],

    middleware: function (app, express) {
      app.use('/node_modules', express.static(require('path').join(__dirname, 'node_modules')));
    },

    testFramework: 'jasmine',

    debug: true,

    bootstrap: bootstrap
  };
};

// Like karma-test-shim.js
function bootstrap (wallaby) {
  wallaby.delayStart();

  System.config({
    // Extend usual application package list with test folder
    packages: { 'testing': { main: 'index.js', defaultExtension: 'js' } },

    // Assume npm: is set in `paths` in systemjs.config
    // Map the angular testing umd bundles
    map: {
      '@angular/core/testing': 'npm:@angular/core/bundles/core-testing.umd.js',
      '@angular/common/testing': 'npm:@angular/common/bundles/common-testing.umd.js',
      '@angular/compiler/testing': 'npm:@angular/compiler/bundles/compiler-testing.umd.js',
      '@angular/platform-browser/testing': 'npm:@angular/platform-browser/bundles/platform-browser-testing.umd.js',
      '@angular/platform-browser-dynamic/testing': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic-testing.umd.js',
      '@angular/http/testing': 'npm:@angular/http/bundles/http-testing.umd.js',
      '@angular/router/testing': 'npm:@angular/router/bundles/router-testing.umd.js',
      '@angular/forms/testing': 'npm:@angular/forms/bundles/forms-testing.umd.js',
    },
  });

  System.import('systemjs.config.js')
    .then(importSystemJsExtras)
    .then(initTestBed)
    .then(initTesting);

  /** Optional SystemJS configuration extras. Keep going w/o it */
  function importSystemJsExtras(){
    return System.import('systemjs.config.extras.js')
    .catch(function(reason) {
      console.log(
        'Warning: System.import could not load the optional "systemjs.config.extras.js". Did you omit it by accident? Continuing without it.'
      );
      console.log(reason);
    });
  }

  function initTestBed(){
    return Promise.all([
      System.import('@angular/core/testing'),
      System.import('@angular/platform-browser-dynamic/testing')
    ])

    .then(function (providers) {
      var coreTesting    = providers[0];
      var browserTesting = providers[1];

      coreTesting.TestBed.initTestEnvironment(
        browserTesting.BrowserDynamicTestingModule,
        browserTesting.platformBrowserDynamicTesting());
    })
  }

  // Load all spec files and start wallaby
  function initTesting () {
    return Promise.all(
      wallaby.tests.map(function (specFile) {
        return System.import(specFile);
      })
    )
    .then(function () {
      wallaby.start();
    })
    .catch(function (e) {
      setTimeout(function () {
        throw e;
      }, 0);
    });
  }
}
