var fs = require('fs');
var path = require('path');

module.exports = function(gulp, plugins, config) {
  return function() {
    var nodeModulesDir = path.join(config.dir, 'node_modules');
    if (!fs.existsSync(nodeModulesDir)) {
      fs.mkdirSync(nodeModulesDir);
    }
    getSubdirs(config.dir).forEach(function(relativeFolder) {
      if (relativeFolder === 'node_modules') {
        return;
      }
      var sourceDir = path.join('..', relativeFolder);
      var linkDir = path.join(nodeModulesDir, relativeFolder);
      if (!fs.existsSync(linkDir)) {
        console.log('creating link', linkDir, sourceDir);
        fs.symlinkSync(sourceDir, linkDir, 'dir');
      }
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