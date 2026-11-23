/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {existsSync, readFileSync} from 'fs';
import {resolve} from 'path';
import * as webdriver from 'selenium-webdriver';
import {RawSourceMap, SourceMapConsumer} from 'source-map';
import {createWebDriver, waitForAngular} from '../../../../packages/examples/test-utils/index.js';

describe('sourcemaps', function () {
  let driver: webdriver.WebDriver;
  let baseUrl: string;

  beforeAll(async () => {
    ({driver, baseUrl} = await createWebDriver());
  });

  afterAll(async () => {
    await driver.quit();
  });

  it('should map sources', async function () {
    await driver.get(`${baseUrl}/`);
    await waitForAngular(driver);

    const errorBtn = await driver.findElement(webdriver.By.css('error-app .errorButton'));
    await errorBtn.click();

    const logs = await driver.manage().logs().get(webdriver.logging.Type.BROWSER);

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

    const mapPath = getFilePath('modules/playground/src/sourcemap/bundles/main.js.map');
    const mapContent = readFileSync(mapPath, 'utf-8');
    const decoder = await new SourceMapConsumer(JSON.parse(mapContent) as RawSourceMap);
    const originalPosition = decoder.originalPositionFor({line: errorLine!, column: errorColumn!});
    const sourcePath = getFilePath('modules/playground/src/sourcemap/main.ts');
    const sourceCodeLines = readFileSync(sourcePath, 'utf-8').split('\n');
    expect(sourceCodeLines[originalPosition.line! - 1]).toMatch(
      /throw new Error\(\'Sourcemap test\'\)/,
    );
  });
});

function getFilePath(relPath: string): string {
  const candidates = [
    resolve(relPath),
    resolve(process.cwd(), relPath),
    process.env['TEST_SRCDIR'] ? resolve(process.env['TEST_SRCDIR'], '_main', relPath) : null,
    process.env['TEST_SRCDIR'] ? resolve(process.env['TEST_SRCDIR'], relPath) : null,
  ].filter((p): p is string => Boolean(p));

  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return resolve(relPath);
}
