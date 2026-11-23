/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/* tslint:disable:no-console  */
import * as fs from 'fs';
import * as path from 'path';
import * as webdriver from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome.js';

declare const jasmine: any;
if (typeof jasmine !== 'undefined') {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
}

function resolveRunfile(filePath: string): string {
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  const runfilesDir = process.env['JS_BINARY__RUNFILES'] || process.env['RUNFILES_DIR'];
  if (runfilesDir) {
    const candidates = [
      path.join(runfilesDir, filePath),
      path.join(runfilesDir, '_main', filePath),
      path.join(runfilesDir, filePath.replace(/^(\.\.\/)+/, '')),
      path.join(runfilesDir, '_main', filePath.replace(/^(\.\.\/)+/, '')),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        return c;
      }
    }
  }
  return filePath;
}

export interface E2eContext {
  driver: webdriver.WebDriver;
  baseUrl: string;
}

let serviceInitialized = false;

export async function createWebDriver(): Promise<E2eContext> {
  const port = process.env['TEST_SERVER_PORT'] || '8080';
  const baseUrl = `http://localhost:${port}`;

  if (!serviceInitialized && process.env['CHROMEDRIVER']) {
    const chromeDriverPath = resolveRunfile(process.env['CHROMEDRIVER']);
    const service = new chrome.ServiceBuilder(chromeDriverPath).build();
    chrome.setDefaultService(service);
    serviceInitialized = true;
  }

  const options = new chrome.Options();
  if (process.env['CHROME_HEADLESS_BIN']) {
    options.setChromeBinaryPath(resolveRunfile(process.env['CHROME_HEADLESS_BIN']));
  }
  options.headless();
  options.addArguments('--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage');

  const builder = new webdriver.Builder().forBrowser('chrome').setChromeOptions(options);

  const driver = await builder.build();
  return {driver, baseUrl};
}

export async function collectBrowserLogs(
  driver: webdriver.WebDriver,
  loggingLevel: webdriver.logging.Level,
  collectMoreSevereErrors: boolean = false,
): Promise<webdriver.logging.Entry[]> {
  const browserLog = await driver.manage().logs().get('browser');
  const collectedLogs: webdriver.logging.Entry[] = [];

  browserLog.forEach((logEntry) => {
    const msg = logEntry.message;

    console.log('>> ' + msg, logEntry);

    if (
      (!collectMoreSevereErrors && logEntry.level.value === loggingLevel.value) ||
      (collectMoreSevereErrors && logEntry.level.value >= loggingLevel.value)
    ) {
      collectedLogs.push(logEntry);
    }
  });
  return collectedLogs;
}

export async function waitForBrowserLogs(
  driver: webdriver.WebDriver,
  loggingLevel: webdriver.logging.Level,
  minCount: number,
  timeoutMs: number = 10000,
  filterFn?: (entry: webdriver.logging.Entry) => boolean,
  collectMoreSevereErrors: boolean = false,
): Promise<webdriver.logging.Entry[]> {
  const collectedLogs: webdriver.logging.Entry[] = [];
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    const newLogs = await collectBrowserLogs(driver, loggingLevel, collectMoreSevereErrors);
    const filtered = filterFn ? newLogs.filter(filterFn) : newLogs;
    collectedLogs.push(...filtered);
    if (collectedLogs.length >= minCount) {
      return collectedLogs;
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  return collectedLogs;
}

export async function verifyNoBrowserErrors(driver: webdriver.WebDriver) {
  const logs = await collectBrowserLogs(
    driver,
    webdriver.logging.Level.INFO,
    true /* collect more severe errors too */,
  );
  expect(logs).toEqual([]);
}
