// Use "register" extension from systemjs.
// That's what Traceur outputs: `System.register()`.
register(System);


// Cancel Karma's synchronous start,
// we will call `__karma__.start()` later, once all the specs are loaded.
__karma__.loaded = function() {};


System.baseURL = '/base/modules/';

// So that we can import packages like `core/foo`, instead of `core/src/foo`.
System.paths = {
  'core/*': './core/src/*.js',
  'core/test/*': './core/test/*.js',

  'change_detection/*': './change_detection/src/*.js',
  'change_detection/test/*': './change_detection/test/*.js',

  'facade/*': './facade/src/*.js',
  'facade/test/*': './facade/test/*.js',

  'di/*': './di/src/*.js',
  'di/test/*': './di/test/*.js',

  'rtts_assert/*': './rtts_assert/src/*.js',
  'rtts_assert/test/*': './rtts_assert/test/*.js',

  'test_lib/*': './test_lib/src/*.js',
  'test_lib/test/*': './test_lib/test/*.js',

  'transpiler/*': '../tools/transpiler/*.js'
}


// Import all the specs, execute their `main()` method and kick off Karma (Jasmine).
Promise.all(
  Object.keys(window.__karma__.files) // All files served by Karma.
  .filter(onlySpecFiles)
  .map(window.file2moduleName)        // Normalize paths to module names.
  .map(function(path) {
    return System.import(path).then(function(module) {
      if (module.hasOwnProperty('main')) {
        module.main()
      } else {
        throw new Error('Module ' + path + ' does not implement main() method.');
      }
    });
  })).then(function() {
  __karma__.start();
}, function(error) {
  console.error(error.stack || error)
  __karma__.start();
});


function onlySpecFiles(path) {
  return /_spec\.js$/.test(path);
}
