Error.stackTraceLimit = Infinity;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 2000;

__karma__.loaded = function() {};


/**
 * Gets map of module alias to location or package.
 * @param dir Directory name under `src/` for create a map for.
 */
function getPathsMap(dir) {
  return Object.keys(window.__karma__.files)
    .filter(not(isSpecFile))
    .filter(function(x) { return new RegExp('^/base/dist/' + dir + '/.*\\.js$').test(x); })
    .reduce(function(pathsMapping, appPath) {
      var pathToReplace = new RegExp('^/base/dist/' + dir + '/');
      var moduleName = appPath.replace(pathToReplace, './').replace(/\.js$/, '');
      pathsMapping[moduleName] = appPath + '?' + window.__karma__.files[appPath];
      return pathsMapping;
    }, {});
}

System.config({
  packages: {
    'base/dist/components': {
      defaultExtension: false,
      format: 'register',
      map: getPathsMap('components')
    },
    'base/dist/core': {
      defaultExtension: false,
      format: 'register',
      map: getPathsMap('core')
    },
    'base/dist/directives': {
      defaultExtension: false,
      format: 'register',
      map: getPathsMap('directives')
    },
  }
});

System.import('angular2/platform/browser').then(function(browser_adapter) {
  // TODO: once beta is out we should change this code to use a "test platform"
  browser_adapter.BrowserDomAdapter.makeCurrent();
}).then(function() {
  return Promise.all(
    Object.keys(window.__karma__.files)
      .filter(isSpecFile)
      .map(function(moduleName) {
        return System.import(moduleName).then(function(module) {
          if (module.hasOwnProperty('main')) {
            return module.main();
          } else {
            return module;
          }
        });
      }));
}).then(function() {
  __karma__.start();
}, function(error) {
  __karma__.error(error.stack || error);
});

function isSpecFile(path) {
  return /\.spec\.js$/.test(path);
}

function not(fn) {
  return function() {
    return !fn.apply(this, arguments);
  };
}
