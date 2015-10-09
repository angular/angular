import * as testUtil from 'angular2/src/testing/e2e_util';

var fs = require('fs');
var sourceMap = require('source-map');

describe('sourcemaps', function() {
  var URL = 'playground/src/sourcemap/index.html';

  it('should map sources', function() {
    browser.get(URL);

    $('error-app .errorButton').click();

    // TODO(tbosch): Bug in ChromeDriver: Need to execute at least one command
    // so that the browser logs can be read out!
    browser.executeScript('1+1');
    browser.manage().logs().get('browser').then(function(logs) {
      var errorLine = null;
      var errorColumn = null;
      logs.forEach(function(log) {
        var match = /\.createError\s+\(.+:(\d+):(\d+)/m.exec(log.message);
        if (match) {
          errorLine = parseInt(match[1]);
          errorColumn = parseInt(match[2]);
        }
      });

      expect(errorLine).not.toBeNull();
      expect(errorColumn).not.toBeNull();


      var sourceMapData = fs.readFileSync('dist/js/prod/es5/playground/src/sourcemap/index.js.map');
      var decoder = new sourceMap.SourceMapConsumer(JSON.parse(sourceMapData));

      var originalPosition = decoder.originalPositionFor({line: errorLine, column: errorColumn});

      var sourceCodeLines =
          fs.readFileSync('modules/playground/src/sourcemap/index.ts', {encoding: 'UTF-8'})
              .split('\n');
      expect(sourceCodeLines[originalPosition.line - 1])
          .toMatch(/throw new BaseException\(\'Sourcemap test\'\)/);
    });
  });
});
