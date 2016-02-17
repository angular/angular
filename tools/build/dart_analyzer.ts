/// <reference path="../typings/es6-promise/es6-promise.d.ts" />
/// <reference path="../typings/node/node.d.ts" />

import {travisFoldStart} from '../travis/fold';

import readline = require('readline');
import child_process = require('child_process');
import path = require('path');
import fs = require('fs');

const glob = require('glob');
const yaml = require('js-yaml');


const tempFile = '_analyzer.dart';


/**
 * Call the Dart Analyzer on every dart files below.
 * Specialized for Travis.
 *
 * @param dir The directory to scan.
 * @param command The command to use for dartanalyzer.
 * @param use_ddc Enable strong static type checking (see https://goo.gl/DqcBsw).
 */
export function analyze(dir: string, command: string, use_ddc: boolean = false): Promise<any> {
  var travisFoldEnd = travisFoldStart(`dartanalyzer-${use_ddc ? 'ddc' : ''}-${dir}`);

  var pubspecContents = fs.readFileSync(path.join(dir, 'pubspec.yaml'));
  var pubspec = yaml.safeLoad(pubspecContents);
  var packageName = pubspec.name;

  var libFiles = [].slice.call(glob.sync('lib/**/*.dart', {cwd: dir}));
  var webFiles = [].slice.call(glob.sync('web/**/*.dart', {cwd: dir}));
  var testFiles = [].slice.call(glob.sync('test/**/*_spec.dart', {cwd: dir}));

  var analyzeFile = ['library _analyzer;'];
  libFiles.concat(testFiles).concat(webFiles).forEach((fileName, index) => {
    if (fileName !== tempFile && fileName.indexOf("/packages/") === -1) {
      if (fileName.indexOf('lib') == 0) {
        fileName = 'package:' + packageName + '/' +
          path.relative('lib', fileName).replace(/\\/g, '/');
      }
      analyzeFile.push('import "' + fileName + '" as mod' + index + ';');
    }
  });
  fs.writeFileSync(path.join(dir, tempFile), analyzeFile.join('\n'));

  return new Promise<void>((resolve, reject) => {
    analyze_(command, dir, resolve, use_ddc);
  });
}


function analyze_(command, dirName, done, useDdc) {
  // TODO remove --package-warnings once dartanalyzer handles transitive libraries
  var flags = ['--fatal-warnings', '--format=machine'];

  if (useDdc) {
    console.log('Using DDC analyzer to analyze', dirName);
    flags.push('--strong');
  }

  var args = flags.concat(tempFile);

  var stream = child_process.spawn(command, args, {
    // inherit stdin and stderr, but filter stdout
    stdio: [process.stdin, process.stdout, 'pipe'],
    cwd: dirName
  });
  // Filter out unused imports from our generated file.
  // We don't reexports from the generated file
  // as this could lead to name clashes when two files
  // export the same thing.
  var rl =
    readline.createInterface({input: stream.stderr, output: process.stdout, terminal: false});
  var hintCount = 0;
  var errorCount = 0;
  var warningCount = 0;
  rl.on('line', function(line) {
    if (line == "find: >     bin [: No such file or directory") {
      // Skip bad output from Dart SDK .bat files on Windows
      return;
    }
    var parsedLine = _AnalyzerOutputLine.parse(line);
    if (!parsedLine) {
      errorCount++;
      console.log('Unexpected output: ' + line);
      return;
    }
    // TODO remove once dartanalyzer handles transitive libraries
    // skip errors in third-party packages
    if (parsedLine.sourcePath.indexOf(dirName) == -1) {
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
      errorCount++;
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
  stream.on('error', function(error) { done(error); });
}


// See https://github.com/dart-lang/analyzer_cli/blob/master/lib/src/error_formatter.dart
class _AnalyzerOutputLine {
  severity: string;
  errorType: string;
  errorCode: string;
  sourcePath: string;
  lineNum: number;
  colNum: string;
  asciiLineLength: number;
  errorMsg: string;

  isError: boolean;
  isHint: boolean;
  isWarning: boolean;

  constructor(result: any[]) {
    this.severity = result[1];
    this.errorType = result[2];
    this.errorCode = result[3];
    this.sourcePath = result[4];
    this.lineNum = parseInt(result[5], 10);
    this.colNum = result[6];
    this.asciiLineLength = parseInt(result[7], 10);
    this.errorMsg = result[8];

    this.isError = Boolean(this.severity.match(/ERROR/i));
    this.isHint = Boolean(this.severity.match(/INFO/i));
    this.isWarning = Boolean(this.severity.match(/WARNING/i));
  }

  static parse(line: string) {
    const result = this.analyzerParseRegExp_.exec(line);
    return result ? new this(result) : null;
  }

  private static analyzerParseRegExp_ =
      new RegExp('([^\|]+)\\|' +           // #1, severity (NONE, INFO, WARNING, ERROR)
                 '([^\|]+)\\|' +           // #2, errorCode.type (HINT, *_WARNING, *_ERROR, etc)
                 '([^\|]+)\\|' +           // #3, errorCode (UNUSED_IMPORT, UNUSED_CATCH_STACK, etc)
                 '([^\|]+[^\|\\\\])\\|' +  // #4, sourcePath with '|' chars backslash-escaped.
                 '([^\|]+)\\|' +           // #5, line number
                 '([^\|]+)\\|' +           // #6, column number
                 '([^\|]+)\\|' +           // #7, length of the ASCII line to draw
                 '(.*)$');                 // #8, error message

  /* Maps file path (as string) to file source (an array of strings, one per line). */
  private static cache_ = {};

  private static ERR_NO_SOURCE = '(Could not find source line).';

  toString() {
    var sourceLine = this._getSourceLine();
    var lineText = _AnalyzerOutputLine.ERR_NO_SOURCE;
    if (sourceLine) {
      var repeat = function(str, num) {
        if (str.repeat) return str.repeat(num);
        return Array.prototype.join.call({length: num}, str);
      };

      lineText =
        '\n' + sourceLine + '\n' + repeat(' ', this.colNum) + repeat('^', this.asciiLineLength);
    }
    return '[' + this.severity + '] type: ' + this.errorType + ' ' +
      this.errorMsg + ' (' + this.sourcePath + ', line ' + this.lineNum +
      ', col ' + this.colNum + ')' + lineText;
  }

  shouldIgnore() {
    if (this.errorCode.match(/UNUSED_IMPORT/i)) {
      if (this.sourcePath.match(/_analyzer\.dart/)) {
        return true;
      }
      // TODO remove it once ts2dart properly generates abstract getters
      if (this.errorMsg.match(/unimplemented/)) {
        return true;
      }
    }

    if (this.errorCode.match(/DEPRECATED_MEMBER_USE/i)) {
      return true;
    }

    // TODO: https://github.com/angular/ts2dart/issues/168
    if (this.errorCode.match(/UNUSED_CATCH_STACK/i)) {
      return true;
    }

    // TODOs shouldn't break our build...
    if (this.errorCode.match(/TODO/i)) {
      return true;
    }

    // Don't worry about hints in generated files.
    if (this.isHint && this.sourcePath.match(/generated/i)) {
      return true;
    }
    return false;
  }

  // Reads the source file for the Analyzer output, caching it for future use.
  _getSourceLine() {
    var cache = _AnalyzerOutputLine.cache_;
    var sourceLines = null;
    if (cache.hasOwnProperty(this.sourcePath)) {
      sourceLines = cache[this.sourcePath];
    } else {
      try {
        sourceLines = String(fs.readFileSync(this.sourcePath));
        sourceLines = sourceLines.split('\n');
      } catch (e) {
        sourceLines = null;
      } finally {
        // Even if this fails, cache `null` so we don't try again.
        cache[this.sourcePath] = sourceLines;
      }
    }
    return (sourceLines && this.lineNum <= sourceLines.length) ? sourceLines[this.lineNum - 1] : null;
  }
};

