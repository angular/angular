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
        var srcFiles = [].slice.call(glob.sync('web/**/*.dart', {
          cwd: dir
        }));

        var testFiles = [].slice.call(glob.sync('test/**/*_spec.dart', {
          cwd: dir
        }));
        var analyzeFile = ['library _analyzer;'];
        srcFiles.concat(testFiles).forEach(function(fileName, index) {
          if (fileName !== tempFile && fileName.indexOf("/packages/") === -1) {
            analyzeFile.push('import "./' + fileName + '" as mod' + index + ';');
          }
        });
        fs.writeFileSync(path.join(dir, tempFile), analyzeFile.join('\n'));
        var defer = Q.defer();
        analyze(dir, defer.makeNodeResolver());
        return defer.promise;
      }
    );

    function analyze(dirName, done) {
      // analyze files in lib directly – or you mess up package: urls
      var sources = [].slice.call(glob.sync('lib/**/*.dart', {
        cwd: dirName
      }));

      sources.push(tempFile);

      //TODO remove --package-warnings once dartanalyzer handles transitive libraries
      var args = ['--fatal-warnings', '--package-warnings'].concat(sources);

      var stream = spawn(config.command, args, {
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
      var warningCount = 0;
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
        }

        var skip = false;
        if (!skip) {
          if (line.match(/\[hint\]/)) {
            hintCount++;
          } else if (line.match(/\[warning\]/)) {
            warningCount++;
          } else {
            errorCount ++;
          }
        }
        console.log(dirName + ':' + line);
      });
      stream.on('close', function() {
        var error;
        var report = [];
        if (errorCount > 0) {
          report.push(errorCount + ' error(s)');
        }
        if (warningCount > 0) {
          report.push(warningCount + ' warning(s)');
        }
        if (hintCount > 0) {
          report.push(hintCount + ' hint(s)');
        }
        if (report.length > 0) {
          error = 'Dartanalyzer showed ' + report.join(', ');
        }
        done(error);
      });
    }
  };
};
