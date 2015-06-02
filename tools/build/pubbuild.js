var util = require('./util');
var Q = require('q');
var spawn = require('child_process').spawn;
var through2 = require('through2');
var path = require('path');
var glob = require('glob');
var fs = require('fs');

module.exports = function(gulp, plugins, config) {
  return function() {
    var webFolders = [].slice.call(glob.sync(path.join(config.src, '*/web')));
    return nextFolder();

    function nextFolder() {
      if (!webFolders.length) {
        return;
      }
      var folder = path.resolve(path.join(webFolders.shift(), '..'));
      var destFolder = path.resolve(path.join(config.dest, path.basename(folder)));
      var pubMode = config.mode || 'release';
      var pubArgs = ['build', '--mode', pubMode, '-o', destFolder];

      return util.processToPromise(spawn(config.command, pubArgs, {
        stdio: 'inherit',
        cwd: folder
      })).then(function() {
        return replaceDartWithJsScripts(gulp, destFolder);
      }).then(function() {
        return removeWebFolder(gulp, destFolder);
      }).then(nextFolder);
    }
  };
};

function replaceDartWithJsScripts(gulp, folder) {
  return util.streamToPromise(gulp.src(path.join(folder, '**/*.html'))
    .pipe(through2.obj(function(file, enc, done) {
      var content = file.contents.toString();
      content = content.replace(/\.dart/, '.dart.js');
      content = content.replace(/application\/dart/, 'text/javascript');
      file.contents = new Buffer(content);
      this.push(file);
      done();
    }))
    .pipe(gulp.dest(folder)));
}

function removeWebFolder(gulp, folder) {
  var folders = [].slice.call(glob.sync(path.join(folder, 'web', '*')));
  folders.forEach(function(subFolder) {
    fs.renameSync(subFolder, subFolder.replace(path.sep + 'web' + path.sep, path.sep));
  });
  fs.rmdirSync(path.join(folder, 'web'));
  return Q.resolve();
}
