var Q = require('q');
var readline = require('readline');
var spawn = require('child_process').spawn;
var path = require('path');
var glob = require('glob');
var fs = require('fs');
var util = require('./util');

module.exports = function(gulp, plugins, config) {
  return function() {
    var dartModuleFolders = [].slice.call(glob.sync(config.dest + '/*'));
    var tempFile = '_analyzer.dart';
    // analyze in parallel!
    return Q.all(dartModuleFolders.map(function(dir) {
      var srcFiles = [].slice.call(glob.sync(util.filterByFile(config.srcFolderMapping, dir + '/pubspec.yaml') + '/**/*.dart', {
        cwd: dir
      }));
      var testFiles = [].slice.call(glob.sync('test/**/*_spec.dart', {
        cwd: dir
      }));
      var analyzeFile = ['library _analyzer;'];
      srcFiles.concat(testFiles).forEach(function(fileName, index) {
        if (fileName !== tempFile) {
          analyzeFile.push('import "./'+fileName+'" as mod'+index+';');
        }
      });
      fs.writeFileSync(path.join(dir, tempFile), analyzeFile.join('\n'));
      var defer = Q.defer();
      analyze(dir, defer.makeNodeResolver());
      return defer.promise;
    }));

    function analyze(dirName, done) {
      var stream = spawn(config.command, ['--fatal-warnings', tempFile], {
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
      rl.on('line', function(line) {
        if (line.match(/Unused import/)) {
          return;
        }
        if (line.match(/\[hint\]/)) {
          hintCount++;
        }
        console.log(dirName + ':' + line);
      });
      stream.on('close', function(code) {
        var error;
        if (code !== 0) {
          error = new Error('Dartanalyzer failed with exit code ' + code);
        }
        if (hintCount > 0) {
          error = new Error('Dartanalyzer showed hints');
        }
        done(error);
      });
    }
  };
};
