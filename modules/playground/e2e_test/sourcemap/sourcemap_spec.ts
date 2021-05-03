/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync} from 'fs';
import {$, browser} from 'protractor';
import {logging} from 'selenium-webdriver';
import {RawSourceMap, SourceMapConsumer} from 'source-map';

describe('sourcemaps', function() {
  const URL = '/';

  it('should map sources', function() {
    browser.get(URL);

    $('error-app .errorButton').click();

    browser.manage().logs().get(logging.Type.BROWSER).then(function(logs: any) {
      let errorLine: number = null;
      let errorColumn: number = null;
      logs.forEach(function(log: any) {
        const match = log.message.match(/\.createError\s+\(.+:(\d+):(\d+)/m);
        if (match) {
          errorLine = parseInt(match[1]);
          errorColumn = parseInt(match[2]);
        }
      });

      expect(errorLine).not.toBeNull();
      expect(errorColumn).not.toBeNull();


      const content =
          readFileSync(require.resolve('../../src/sourcemap/index.js')).toString('utf8');
      const marker = '//# sourceMappingURL=data:application/json;base64,';
      const index = content.indexOf(marker);
      const sourceMapData =
          Buffer.from(content.substring(index + marker.length), 'base64').toString('utf8');

      const decoder = new SourceMapConsumer(JSON.parse(sourceMapData) as RawSourceMap);
      const originalPosition = decoder.originalPositionFor({line: errorLine, column: errorColumn});
      const sourceCodeLines = readFileSync(require.resolve('../../src/sourcemap/index.ts'), {
                                encoding: 'UTF-8'
                              }).split('\n');
      expect(sourceCodeLines[originalPosition.line - 1])
          .toMatch(/throw new Error\(\'Sourcemap test\'\)/);
    });
  });
});
