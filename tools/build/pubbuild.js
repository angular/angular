var util = require('./util');
var Q = require('q');
var spawn = require('child_process').spawn;
var through2 = require('through2');
var path = require('path');
var glob = require('glob');

module.exports = function(gulp, plugins, config) {
  return function() {
    var webFolders = [].slice.call(glob.sync(path.join(config.src, '*/web')));
    return nextFolder();

    function nextFolder() {
      if (!webFolders.length) {
        return;
      }
      var folder = getParentFolder(webFolders.shift());
      var destFolder = path.resolve(path.join(config.dest, path.basename(folder)));
      return util.processToPromise(spawn(config.command, ['build', '-o', destFolder], {
        stdio: 'inherit',
        cwd: folder
      })).then(function() {
        return replaceDartWithJsScripts(gulp, destFolder);
      }).then(nextFolder);
    }
  };
};

function getParentFolder(folder) {
  var parts = folder.split(path.sep);
  parts.pop();
  return parts.join(path.sep);
}

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