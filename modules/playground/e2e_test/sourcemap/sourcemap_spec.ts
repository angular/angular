/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */



var fs = require('fs');
var sourceMap = require('source-map');

describe('sourcemaps', function() {
  var URL = 'all/playground/src/sourcemap/index.html';

  it('should map sources', function() {
    browser.get(URL);

    $('error-app .errorButton').click();

    // TODO(tbosch): Bug in ChromeDriver: Need to execute at least one command
    // so that the browser logs can be read out!
    browser.executeScript('1+1');
    browser.manage().logs().get('browser').then(function(logs) {
      var errorLine: number = null;
      var errorColumn: number = null;
      logs.forEach(function(log) {
        const match = log.message.match(/\.createError\s+\(.+:(\d+):(\d+)/m);
        if (match) {
          errorLine = parseInt(match[1]);
          errorColumn = parseInt(match[2]);
        }
      });

      expect(errorLine).not.toBeNull();
      expect(errorColumn).not.toBeNull();


      const content =
          fs.readFileSync('dist/all/playground/src/sourcemap/index.js').toString('utf8');
      const marker = '//# sourceMappingURL=data:application/json;base64,';
      const index = content.indexOf(marker);
      const sourceMapData =
          new Buffer(content.substring(index + marker.length), 'base64').toString('utf8');

      var decoder = new sourceMap.SourceMapConsumer(JSON.parse(sourceMapData));

      var originalPosition = decoder.originalPositionFor({line: errorLine, column: errorColumn});

      var sourceCodeLines = fs.readFileSync('modules/playground/src/sourcemap/index.ts', {
                                encoding: 'UTF-8'
                              }).split('\n');
      expect(sourceCodeLines[originalPosition.line - 1])
          .toMatch(/throw new Error\(\'Sourcemap test\'\)/);
    });
  });
});
