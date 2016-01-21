// Tun on full stack traces in errors to help debugging
Error.stackTraceLimit=Infinity;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 100;

// Cancel Karma's synchronous start,
// we will call `__karma__.start()` later, once all the specs are loaded.
__karma__.loaded = function() {};

System.config({
  baseURL: '/base/',
  defaultJSExtensions: true,
  paths: {
    'benchpress/*': 'dist/js/dev/es5/benchpress/*.js',
    'angular2/*': 'dist/js/dev/es5/angular2/*.js',
    'rxjs/*': 'node_modules/rxjs/*.js'
  }
});

// Set up the test injector, then import all the specs, execute their `main()`
// method and kick off Karma (Jasmine).
System.import('angular2/testing').then(function(testing) {
  return System.import('angular2/platform/testing/browser').then(function(testing_platform_browser) {
    testing.setBaseTestProviders(testing_platform_browser.TEST_BROWSER_PLATFORM_PROVIDERS,
                                 testing_platform_browser.TEST_BROWSER_APPLICATION_PROVIDERS);
  });
}).then(function() {
  return Promise.all(
    Object.keys(window.__karma__.files) // All files served by Karma.
    .filter(onlySpecFiles)
    .map(window.file2moduleName)        // Normalize paths to module names.
    .map(function(path) {
      return System.import(path).then(function(module) {
        if (module.hasOwnProperty('main')) {
          module.main();
        } else {
          throw new Error('Module ' + path + ' does not implement main() method.');
        }
      });
    }));
})
.then(function() {
  __karma__.start();
}, function(error) {
  __karma__.error(error.stack || error);
});


function onlySpecFiles(path) {
  return /_spec\.js$/.test(path);
}
