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

export async function waitForAngular(driver: webdriver.WebDriver): Promise<void> {
  try {
    await driver.executeAsyncScript(`
      var done = arguments[arguments.length - 1];
      setTimeout(function() {
        var testabilities = [];
        if (window.getAllAngularTestabilities) {
          try {
            testabilities = testabilities.concat(window.getAllAngularTestabilities());
          } catch (e) {}
        }
        if (window.angular) {
          try {
            var ng1Roots = document.querySelectorAll('[ng-app], [ng\\\\:app], [x-ng-app], body');
            for (var i = 0; i < ng1Roots.length; i++) {
              var el = window.angular.element(ng1Roots[i]);
              if (el && el.injector && el.injector()) {
                var $browser = el.injector().get('$browser');
                if ($browser && $browser.notifyWhenNoOutstandingRequests) {
                  testabilities.push({
                    whenStable: function(cb) { $browser.notifyWhenNoOutstandingRequests(cb); }
                  });
                  break;
                }
              }
            }
          } catch (e) {}
        }
        if (testabilities.length > 0) {
          var count = testabilities.length;
          var decrement = function() {
            if (--count === 0) {
              done();
            }
          };
          testabilities.forEach(function(t) {
            try {
              t.whenStable(decrement);
            } catch (e) {
              decrement();
            }
          });
          return;
        }
        done();
      }, 50);
    `);
  } catch {
    // Ignore errors if testability is not present
  }
}

export async function openBrowser(
  driver: webdriver.WebDriver,
  baseUrl: string,
  urlPath: string,
  params?: {name: string; value: any}[],
): Promise<void> {
  const urlParams: string[] = [];
  if (params) {
    params.forEach((param) => urlParams.push(param.name + '=' + param.value));
  }
  const relative = urlPath.startsWith('/') ? urlPath : '/' + urlPath;
  const fullUrl = encodeURI(
    `${baseUrl}${relative}${urlParams.length ? '?' + urlParams.join('&') : ''}`,
  );
  await driver.get(fullUrl);
  await waitForAngular(driver);
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
    if (
      (!collectMoreSevereErrors && logEntry.level.value === loggingLevel.value) ||
      (collectMoreSevereErrors && logEntry.level.value >= loggingLevel.value)
    ) {
      collectedLogs.push(logEntry);
    }
  });
  return collectedLogs;
}

export async function verifyNoBrowserErrors(driver: webdriver.WebDriver): Promise<void> {
  const logs = await collectBrowserLogs(
    driver,
    webdriver.logging.Level.WARNING,
    true /* collect more severe errors too */,
  );
  expect(logs).toEqual([]);
}
