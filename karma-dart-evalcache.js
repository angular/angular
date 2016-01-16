// This module provides a customFileHandler for karma
// that serves files with urls like /packages_<timestamp>/...
// with maximum cache.
// We are using these urls when we spawn isolates
// so that the isolates don't reload files every time.

var common = require('karma/lib/middleware/common');
var fs = require('fs');

var DART_EVAL_PATH_RE = /.*\/packages_\d+\/(.*)$/;

module.exports = createFactory;

function createFactory(proxyPaths) {
  return {
    'framework:dart-evalcache': ['factory', dartEvalCacheFactory]
  };

  function dartEvalCacheFactory(emitter, logger, customFileHandlers) {
    var filesPromise = new common.PromiseContainer();
    emitter.on('file_list_modified', function(files) {
      filesPromise.set(Promise.resolve(files));
    });

    var serveFile = common.createServeFile(fs);
    var log = logger.create('dart-evalcache');

    customFileHandlers.push({
      urlRegex: DART_EVAL_PATH_RE,
      handler: handler
    });

    // See source_files handler
    function handler(request, response, fa, fb, basePath) {
      return filesPromise.then(function(files) {
        try {
          var requestedFilePath = mapUrlToFile(request.url, proxyPaths, basePath, log);
          // TODO(vojta): change served to be a map rather then an array
          var file = findByPath(files.served, requestedFilePath);
          if (file) {
            serveFile(file.contentPath || file.path, response, function() {
              common.setHeavyCacheHeaders(response);
            }, file.content);
          } else {
            response.writeHead(404);
            response.end('Not found');
          }
        } catch (e) {
          log.error(e.stack);
          response.writeHead(500);
          response.end('Error', e.stack);
        }
      });
    }
  };
}

function mapUrlToFile(url, proxyPaths, basePath, log) {
  var originalUrl = url;
  url = url.indexOf('?') > -1 ? url.substring(0, url.indexOf('?')) : url;
  var match = DART_EVAL_PATH_RE.exec(url);
  var packagePath = match[1];
  var result = null;
  var lastProxyFromLength = 0;
  Object.keys(proxyPaths).forEach(function(proxyFrom) {
    if (startsWith(packagePath, proxyFrom) && proxyFrom.length > lastProxyFromLength) {
      lastProxyFromLength = proxyFrom.length;
      result = proxyPaths[proxyFrom] + packagePath.substring(proxyFrom.length);
    }
  });
  return basePath + '/' + result;
}

function startsWith(string, subString) {
  return string.length >= subString.length && string.slice(0, subString.length) === subString;
}

function findByPath(files, path) {
  for (var i = 0; i < files.length; i++) {
    if (files[i].path === path) {
      return files[i];
    }
  }

  return null;
}
