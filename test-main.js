var TEST_REGEXP = /_spec.*/;

Object.keys(window.__karma__.files).forEach(function(path) {
  if (TEST_REGEXP.test(path)) {
    var moduleName = window.file2moduleName(path);
    var mod = System.get(moduleName);
    if (mod && mod.main) {
      mod.main();
    }
  }
});
