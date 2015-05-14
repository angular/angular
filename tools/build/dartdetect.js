var which = require('which');

module.exports = function(gulp) {
  var DART_SDK = false;
  try {
    which.sync('dart');
    console.log('Dart SDK detected');
    if (process.platform === 'win32') {
      DART_SDK = {
        ANALYZER: 'dartanalyzer.bat',
        DARTFMT: 'dartfmt.bat',
        PUB: 'pub.bat',
        VM: 'dart.bat'
      };
    } else {
      DART_SDK = {
        ANALYZER: 'dartanalyzer',
        DARTFMT: 'dartfmt',
        PUB: 'pub',
        VM: 'dart'
      };
    }
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
}
