/*global jasmine, __karma__, window*/
Error.stackTraceLimit = Infinity;

// The default time that jasmine waits for an asynchronous test to finish is five seconds.
// If this timeout is too short the CI may fail randomly because our asynchronous tests can
// take longer in some situations (e.g Saucelabs and Browserstack tunnels)
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

__karma__.loaded = function () {};

var specFiles = Object.keys(window.__karma__.files).filter(isMaterialSpecFile);

// Configure the Angular test bed and run all specs once configured.
configureTestBed()
  .then(runMaterialSpecs)
  .then(__karma__.start, function(error) {
    // Passing in the error object directly to Karma won't log out the stack trace and
    // passing the `originalErr` doesn't work correctly either. We have to log out the
    // stack trace so we can actually debug errors before the tests have started.
    console.error(error.originalErr.stack);
    __karma__.error(error);
  });


/** Runs the Angular Material specs in Karma. */
function runMaterialSpecs() {
  // By importing all spec files, Karma will run the tests directly.
  return Promise.all(specFiles.map(function(fileName) {
    return System.import(fileName);
  }));
}

/** Whether the specified file is part of Angular Material. */
function isMaterialSpecFile(path) {
  return path.slice(-8) === '.spec.js' && path.indexOf('node_modules') === -1;
}

/** Configures Angular's TestBed. */
function configureTestBed() {
  return Promise.all([
    System.import('@angular/core'),
    System.import('@angular/core/testing'),
    System.import('@angular/platform-browser-dynamic/testing')
  ]).then(function (providers) {
    var core = providers[0];
    var testing = providers[1];
    var testingBrowser = providers[2];

    console.log('Running tests using Angular version: ' + core.VERSION.full);

    var testBed = testing.TestBed.initTestEnvironment(
      testingBrowser.BrowserDynamicTestingModule,
      testingBrowser.platformBrowserDynamicTesting(),
      {teardown: {destroyAfterEach: true}}
    );
  });
}
