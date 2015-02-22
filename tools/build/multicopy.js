/**
 * A utility that allows copying one file to multiple directories, such
 * as the LICENSE file.
 */
var path = require('path');
var fs = require('fs');

module.exports = function(gulp, plugins, config) {
  return function() {
    var subDirs = getSubdirs(config.dest);
    config.src.forEach(function(srcFile) {
      var content = fs.readFileSync(srcFile);
      subDirs.forEach(function(subDir) {
        var destFile = path.join(config.dest, subDir, path.basename(srcFile));
        fs.writeFileSync(destFile, content);
      });
    });
  };
};

function getSubdirs(rootDir) {
  return fs.readdirSync(rootDir).filter(function(file) {
    if (file[0] === '.') {
      return false;
    }
    var dirPath = path.join(rootDir, file);
    return fs.statSync(dirPath).isDirectory();
  });
}
