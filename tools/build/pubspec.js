var util = require('./util');
var Q = require('q');
var spawn = require('child_process').spawn;
var through2 = require('through2');
var path = require('path');

module.exports = function(gulp, plugins, config) {
  return function() {
    var files = [];
    var pubSpecCopy = util.streamToPromise(gulp.src(config.src)
      .pipe(plugins.changed(config.dest)) // Only forward files that changed.
      .pipe(through2.obj(function(file, enc, done) {
        files.push(path.resolve(process.cwd(), config.dest, file.relative));
        this.push(file);
        done();
      }))
      .pipe(gulp.dest(config.dest)));

    // We need to wait for all pubspecs to be present before executing
    // `pub get` as it checks the folders of the dependencies!
    // We need to execute pubspec serially as otherwise we can get into trouble
    // with the pub cache...
    return pubSpecCopy.then(nextFile);

    function nextFile() {
      if (!files.length) {
        return;
      }
      var file = files.shift();
      return util.processToPromise(spawn(config.command, ['get'], {
        stdio: 'inherit',
        cwd: path.dirname(file)
      })).then(nextFile);
    }
  };
};

