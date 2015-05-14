var Q = require('q');
var readline = require('readline');
var spawn = require('child_process').spawn;
var path = require('path');
var glob = require('glob');
var fs = require('fs');
var util = require('./util');
var yaml = require('js-yaml');

module.exports = function(gulp, plugins, config) {
  return function() {
    var tempFile = '_analyzer.dart';
    return util.forEachSubDirSequential(
      config.dest,
      function(dir) {
        var pubspecContents = fs.readFileSync(path.join(dir, 'pubspec.yaml'));
        var pubspec = yaml.safeLoad(pubspecContents);
        var packageName = pubspec.name;

        var libFiles = [].slice.call(glob.sync('lib/**/*.dart', {
          cwd: dir
        }));

        var webFiles = [].slice.call(glob.sync('web/**/*.dart', {
          cwd: dir
        }));

        var testFiles = [].slice.call(glob.sync('test/**/*_spec.dart', {
          cwd: dir
        }));
        var analyzeFile = ['library _analyzer;'];
        libFiles.concat(testFiles).concat(webFiles).forEach(function(fileName, index) {
          if (fileName !== tempFile && fileName.indexOf("/packages/") === -1) {
            if (fileName.indexOf('lib') == 0) {
              fileName = 'package:' + packageName + '/' + path.relative('lib', fileName);
            }
            analyzeFile.push('import "' + fileName + '" as mod' + index + ';');
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
      var args = ['--fatal-warnings', '--package-warnings', '--format=machine'].concat(tempFile);

      var stream = spawn(config.command, args, {
        // inherit stdin and stderr, but filter stdout
        stdio: [process.stdin, process.stdout, 'pipe'],
        cwd: dirName
      });
      // Filter out unused imports from our generated file.
      // We don't reexports from the generated file
      // as this could lead to name clashes when two files
      // export the same thing.
      var rl = readline.createInterface({
        input: stream.stderr,
        output: process.stdout,
        terminal: false
      });
      var hintCount = 0;
      var errorCount = 0;
      var warningCount = 0;
      rl.on('line', function(line) {
        var parsedLine = _AnalyzerOutputLine.parse(line);
        if (!parsedLine) {
          errorCount++;
          console.log('Unexpected output: ' + line);
          return;
        }
        //TODO remove once dartanalyzer handles transitive libraries
        //skip errors in third-party packages
        if (parsedLine.source.indexOf(dirName) == -1) {
          return;
        }
        if (parsedLine.shouldIgnore()) {
          return;
        }

        if (parsedLine.isHint) {
          hintCount++;
        } else if (parsedLine.isWarning) {
          warningCount++;
        } else {
          errorCount ++;
        }
        console.log(dirName + ':' + parsedLine);
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

// See https://github.com/dart-lang/analyzer_cli/blob/master/lib/src/error_formatter.dart
function _AnalyzerOutputLine(result) {
  this.severity = result[1];
  this.errorType = result[2];
  this.errorCode = result[3];
  this.source = result[4];
  this.lineNum = result[5];
  this.colNum = result[6];
  this.errorMsg = result[7];

  this.isError = Boolean(this.severity.match(/ERROR/i));
  this.isHint = Boolean(this.severity.match(/INFO/i));
  this.isWarning = Boolean(this.severity.match(/WARNING/i));
}

_AnalyzerOutputLine.parse = function(line) {
  var result = _AnalyzerOutputLine._analyzerParseRegExp.exec(line);
  return result ? new _AnalyzerOutputLine(result) : null;
};

_AnalyzerOutputLine._analyzerParseRegExp = new RegExp(
    '([^\|]+)\\|' + // #1, severity (NONE, INFO, WARNING, ERROR)
    '([^\|]+)\\|' + // #2, errorCode.type (HINT, *_WARNING, *_ERROR, etc)
    '([^\|]+)\\|' + // #3, errorCode (UNUSED_IMPORT, UNUSED_CATCH_STACK, etc)
    '([^\|]+)\\|' + // #4, source path
    '([^\|]+)\\|' + // #5, line number
    '([^\|]+)\\|' + // #6, column number
    '[^\|]+\\|'   + // length of the ASCII line to draw (ignored)
    '(.*)$');       // #7, error message

_AnalyzerOutputLine.prototype = {
  toString: function() {
    return '[' + this.errorCode + '] ' + this.errorMsg +
        ' (' + this.source + ', line ' + this.lineNum + ', col ' + this.colNum + ')';
  },

  shouldIgnore: function() {
    if (this.errorCode.match(/UNUSED_IMPORT/i)) {
      if (this.source.match(/_analyzer\.dart/)) {
        return true;
      }
    }
    // TODO: https://github.com/angular/ts2dart/issues/168
    if (this.errorCode.match(/UNUSED_CATCH_STACK/i)) {
      return true;
    }

    // Don't worry about hints in generated files.
    if (this.isHint && this.source.match(/generated/i)) {
      return true;
    }
    return false;
  }
};
