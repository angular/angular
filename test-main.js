var TEST_REGEXP = /^\/base\/modules\/[^\/]*\/test\/.*/;

Object.keys(window.__karma__.files).forEach(function(path) {
  if (TEST_REGEXP.test(path)) {
    var moduleName = path
      .replace(/.*\/modules\//, '')
      .replace(/\/src\//, '/')
      .replace(/\/test\//, '/')
      .replace(/\.\w*$/, '');
    var mod = System.get(moduleName);
    if (mod.main) {
      mod.main();
    }
  }
});
