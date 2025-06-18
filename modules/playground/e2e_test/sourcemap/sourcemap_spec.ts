/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runfiles} from '@bazel/runfiles';
import {readFileSync} from 'fs';
import {$, browser} from 'protractor';
import {logging} from 'selenium-webdriver';
import {RawSourceMap, SourceMapConsumer} from 'source-map';

describe('sourcemaps', function () {
  const URL = '/';

  it('should map sources', async function () {
    await browser.get(URL);

    await $('error-app .errorButton').click();

    const logs = await browser.manage().logs().get(logging.Type.BROWSER);

    let errorLine: number | null = null;
    let errorColumn: number | null = null;
    logs.forEach(function (log: any) {
      const match = log.message.match(/\.createError\s+\(.+:(\d+):(\d+)/m);
      if (match) {
        errorLine = parseInt(match[1]);
        errorColumn = parseInt(match[2]);
      }
    });

    expect(errorLine).not.toBeNull();
    expect(errorColumn).not.toBeNull();

    const mapContent = readFileSync(
      runfiles.resolvePackageRelative('../../src/sourcemap/bundles/main.js.map'),
    ).toString('utf8');
    const decoder = await new SourceMapConsumer(JSON.parse(mapContent) as RawSourceMap);
    const originalPosition = decoder.originalPositionFor({line: errorLine!, column: errorColumn!});
    const sourceCodeLines = readFileSync(
      runfiles.resolvePackageRelative('../../src/sourcemap/main.ts'),
      {
        encoding: 'utf-8',
      },
    ).split('\n');
    expect(sourceCodeLines[originalPosition.line! - 1]).toMatch(
      /throw new Error\(\'Sourcemap test\'\)/,
    );
  });
});
