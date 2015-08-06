var Q = require('q');
var readline = require('readline');
var spawn = require('child_process').spawn;
var util = require('./util');

module.exports = function(gulp, plugins, config) {
  return function() {
    return util.forEachSubDirSequential(config.dest, function(dir) {
      var defer = Q.defer();
      var done = defer.makeNodeResolver();

      var supportedModules = [
        'dist/dart/angular2',
        // TODO: blocked by https://github.com/angular/angular/issues/3518
        // 'dist/dart/angular2_material',
        'dist/dart/benchpress'
      ];

      if (supportedModules.indexOf(dir) === -1) {
        done();
      } else {
        console.log('INFO: running dartdocgen for ', dir);

        var stream = spawn(config.command, ['.'], {
          stdio: [process.stdin, process.stdout, process.stderr],
          cwd: dir
        });

        stream.on('exit', function(code) {
          if (code !== 0) {
            done('ERROR: dartdocgen exited with non-zero status ' + code);
          } else {
            done();
          }
        });

        stream.on('error', function(e) {
          done('ERROR: dartdocgen reported error: ' + e);
        });
      }
      return defer.promise;
    });
  };
};
