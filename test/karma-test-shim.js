/*global jasmine, __karma__, window*/
Error.stackTraceLimit = Infinity;
jasmine.DEFAULT_TIMEOUT_INTERVAL = 3000;

__karma__.loaded = function () {};

var baseDir = '/base/dist/';
var configFile = baseDir + '@angular/material/system-config-spec.js';
var specFiles = Object.keys(window.__karma__.files).filter(isMaterialSpecFile);

// Configure the base path for dist/
System.config({baseURL: baseDir});

// Load the spec SystemJS configuration file.
System.import(configFile)
  .then(configureTestBed)
  .then(runMaterialSpecs)
  .then(__karma__.start, __karma__.error);


/** Runs the Angular Material specs in Karma. */
function runMaterialSpecs() {
  // By importing all spec files, Karma will run the tests directly.
  return Promise.all(specFiles.map(function(fileName) {
    return System.import(fileName);
  }));
}

/** Whether the specified file is part of Angular Material. */
function isMaterialSpecFile(path) {
  return path.slice(-8) === '.spec.js' && path.indexOf('vendor') === -1;
}

/** Configures Angular's TestBed. */
function configureTestBed() {
  return Promise.all([
    System.import('@angular/core/testing'),
    System.import('@angular/platform-browser-dynamic/testing')
  ]).then(function (providers) {
    var testing = providers[0];
    var testingBrowser = providers[1];

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

    testing.TestBed.initTestEnvironment(
      testingBrowser.BrowserDynamicTestingModule,
      testingBrowser.platformBrowserDynamicTesting()
    );
  });
}