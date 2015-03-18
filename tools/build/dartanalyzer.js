var Q = require('q');
var readline = require('readline');
var spawn = require('child_process').spawn;
var path = require('path');
var glob = require('glob');
var fs = require('fs');
var util = require('./util');

module.exports = function(gulp, plugins, config) {
  return function() {
    var tempFile = '_analyzer.dart';
    return util.forEachSubDirSequential(
      config.dest,
      function(dir) {
        var srcFiles = [].slice.call(glob.sync('{/lib,/web}/**/*.dart', {
          cwd: dir
        }));
        var testFiles = [].slice.call(glob.sync('test/**/*_spec.dart', {
          cwd: dir
        }));
        var analyzeFile = ['library _analyzer;'];
        srcFiles.concat(testFiles).forEach(function(fileName, index) {
          if (fileName !== tempFile && fileName.indexOf("/packages/") === -1) {
            analyzeFile.push('import "./'+fileName+'" as mod'+index+';');
          }
        });
        fs.writeFileSync(path.join(dir, tempFile), analyzeFile.join('\n'));
        var defer = Q.defer();
        analyze(dir, defer.makeNodeResolver());
        return defer.promise;
      }
    );

    function analyze(dirName, done) {
      //TODO remove --package-warnings once dartanalyzer handles transitive libraries
      var stream = spawn(config.command, ['--fatal-warnings', '--package-warnings', tempFile], {
        // inherit stdin and stderr, but filter stdout
        stdio: [process.stdin, 'pipe', process.stderr],
        cwd: dirName
      });
      // Filter out unused imports from our generated file.
      // We don't reexports from the generated file
      // as this could lead to name clashes when two files
      // export the same thing.
      var rl = readline.createInterface({
        input: stream.stdout,
        output: process.stdout,
        terminal: false
      });
      var hintCount = 0;
      var errorCount = 0;
      rl.on('line', function(line) {
        //TODO remove once dartanalyzer handles transitive libraries
        //skip errors in third-party packages
        if (line.indexOf(dirName) == -1) {
          return;
        }
        if (line.match(/Unused import/)) {
          if (line.match(/_analyzer\.dart/)) {
            return;
          }

          //TODO: remove this work-around once #704 is fixed
          if (line.match(/\/test\/core\/compiler\/view_.*spec\.dart/)) {
            return;
          }
          if (line.match(/\/test_lib_spec\.dart/)) {
            return;
          }
        }
        if (line.match(/\[hint\]/)) {
          hintCount++;
        } else {
          errorCount ++;
        }
        console.log(dirName + ':' + line);
      });
      stream.on('close', function() {
        var error;
        if (errorCount > 0) {
          error = new Error('Dartanalyzer showed errors');
        }
        if (hintCount > 0) {
          error = new Error('Dartanalyzer showed hints');
        }
        done(error);
      });
    }
  };
};
