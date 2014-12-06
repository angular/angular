var Q = require('q');
var minimatch = require('minimatch');

module.exports = {
  processToPromise: processToPromise,
  streamToPromise: streamToPromise,
  renameSrcFolder: renameSrcFolder,
  filterByFile: filterByFile
};

function filterByFile(valuesWithPatterns, fileName) {
  var match = null;
  for (var pattern in valuesWithPatterns) {
    if (pattern !== 'default' && minimatch(fileName, pattern)) {
      match = valuesWithPatterns[pattern];
    }
  }
  return match || valuesWithPatterns['default'];
}

function processToPromise(process) {
  var defer = Q.defer();
  process.on('close', function(code) {
    if (code) {
      defer.reject(code);
    } else {
      defer.resolve();
    }
  });
  return defer.promise;
}

function streamToPromise(stream) {
  var defer = Q.defer();
  stream.on('end', defer.resolve);
  stream.on('error', defer.reject);
  return defer.promise;
}

function renameSrcFolder(plugins, srcFolderMapping) {
  return plugins.rename(function(file) {
    var srcOutputFolder = filterByFile(srcFolderMapping, file.dirname);
    file.dirname = file.dirname.replace(/\bsrc\b/, srcOutputFolder);
  });
}
