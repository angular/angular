var which = require('which');
var spawnSync = require('child_process').spawnSync;

module.exports.detect = function(gulp) {
  var DART_SDK = false;
  try {
    which.sync('dart');
    if (process.platform === 'win32') {
      DART_SDK = {
        ANALYZER: 'dartanalyzer.bat',
        DARTDOCGEN: 'dartdoc.bat',
        DARTFMT: 'dartfmt.bat',
        PUB: 'pub.bat',
        VM: 'dart.exe'
      };
    } else {
      DART_SDK = {
        ANALYZER: 'dartanalyzer',
        DARTDOCGEN: 'dartdoc',
        DARTFMT: 'dartfmt',
        PUB: 'pub',
        VM: 'dart'
      };
    }
    console.log('Dart SDK detected:');
  } catch (e) {
    console.log('Dart SDK is not available, Dart tasks will be skipped.');
    var gulpTaskFn = gulp.task.bind(gulp);
    gulp.task = function (name, deps, fn) {
      if (name.indexOf('.dart') === -1) {
        return gulpTaskFn(name, deps, fn);
      } else {
        return gulpTaskFn(name, function() {
          console.log('Dart SDK is not available. Skipping task: ' + name);
        });
      }
    };
  }
  return DART_SDK;
};


module.exports.checkMinVersion = function (dartSdk, min, doThrow) {
  var dartVersion = /^.*([0-9]+\.[0-9]+\.[0-9]+).*$/.exec(spawnSync(dartSdk.VM, ['--version']).stderr.toString().replace(/\n/g, ''))[1];
  var pubVersion = /^.*([0-9]+\.[0-9]+\.[0-9]+).*$/.exec(spawnSync(dartSdk.PUB, ['--version']).stdout.toString().replace(/\n/g, ''))[1];

  ['dart', 'pub'].forEach((bin) => {
    var actualVersion = bin === 'dart' ? dartVersion : pubVersion;
    var errorMsg = `Invalid ${bin} version. Minimum version is ${min}, got: ${actualVersion}`;
    var successMsg = `${bin} version ${actualVersion} meets minimum requirement of ${min}`;
    if (!verifyVersion(actualVersion, min)) {
      if (doThrow) throw new Error(errorMsg);
      console.error(errorMsg);
    } else {
      console.log(successMsg);
    }
  });

};

function verifyVersion(actual, min) {
  var cursor = 0;
  actual = splitVersion(actual)
  min = splitVersion(min);
  while (cursor<3) {
    if (!(Number.isInteger(actual[cursor]) && Number.isInteger(min[cursor]))) return false;
    if (actual[cursor] < min[cursor]) return false;
    cursor++;
  }
  return true;
}

function splitVersion (str) {
  return str.split('.').map(v => parseInt(v));
}
