var util = require('./util');
var spawn = require('child_process').spawn;
var path = require('path');

module.exports = {
  dir: pubGetDir,
  subDir: pubGetSubDir
};

function pubGetDir(gulp, plugins, config) {
  return function() {
    return util.processToPromise(spawn(config.command, ['upgrade'], {
      stdio: 'inherit',
      cwd: config.dir
    }));
  };
};

function pubGetSubDir(gulp, plugins, config) {
  return function() {
    // We need to execute pubspec serially as otherwise we can get into trouble
    // with the pub cache...
    return util.forEachSubDirSequential(config.dir, function(subDir) {
      return util.processToPromise(spawn(config.command, ['upgrade'], {
        stdio: 'inherit',
        cwd: subDir
      }));
    });
  };
};
