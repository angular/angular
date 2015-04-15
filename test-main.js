// Use "register" extension from systemjs.
// That's what Traceur outputs: `System.register()`.
register(System);
cjs(System);

jasmine.DEFAULT_TIMEOUT_INTERVAL = 100;

// Cancel Karma's synchronous start,
// we will call `__karma__.start()` later, once all the specs are loaded.
__karma__.loaded = function() {};


System.baseURL = '/base/modules/';

// So that we can import packages like `core/foo`, instead of `core/src/foo`.
System.paths = {
  '*': './*.js',
  'transpiler/*': '../tools/transpiler/*.js',
  'rx/*': '../node_modules/rx/*.js'
}

// Import all the specs, execute their `main()` method and kick off Karma (Jasmine).
System.import('angular2/src/dom/browser_adapter').then(function(browser_adapter) {
  browser_adapter.BrowserDomAdapter.makeCurrent();
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
  console.error(error.stack || error);
  __karma__.start();
});


function onlySpecFiles(path) {
  return /_spec\.js$/.test(path);
}
