var util = require('./util');
var path = require('path');
var benchpress = require('angular-benchpress/lib/cli');
var through2 = require('through2');
var Q = require('q');
var path = require('path');

module.exports = function(gulp, plugins, config) {
  return function() {
    var benchmarkParentFolders = {};
    var createBpConfStream = util.streamToPromise(
      gulp.src(path.join(config.buildDir, config.mainHtmls))
      .pipe(through2.obj(function(file, enc, done) {
        file.path = path.join(path.dirname(file.path), config.configFile.name);
        file.contents = new Buffer(config.configFile.content);
        this.push(file);
        benchmarkParentFolders[getParentFolder(file.path)] = true;
        done();
      }))
      .pipe(gulp.dest(config.buildDir)));

    return createBpConfStream.then(function() {
      return Promise.all(Object.keys(benchmarkParentFolders).map(function(benchmarkParentPath) {
        var defer = Q.defer();
        benchpress.build({
          benchmarksPath: benchmarkParentPath,
          buildPath: path.join(benchmarkParentPath, path.join('../', config.outputFolderName))
        }, defer.makeNodeResolver());
        return defer.promise;
      }));
    });
  };
};

function getParentFolder(file) {
  var parts = path.dirname(file).split(path.sep);
  parts.pop();
  return parts.join(path.sep);
}