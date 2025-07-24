/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * A WebDriverAdapter bridges API differences between different WebDriver clients,
 * e.g. JS vs Dart Async vs Dart Sync webdriver.
 * Needs one implementation for every supported WebDriver client.
 */
export abstract class WebDriverAdapter {
  waitFor(callback: Function): Promise<any> {
    throw new Error('NYI');
  }
  executeScript(script: string): Promise<any> {
    throw new Error('NYI');
  }
  executeAsyncScript(script: string): Promise<any> {
    throw new Error('NYI');
  }
  capabilities(): Promise<{[key: string]: any}> {
    throw new Error('NYI');
  }
  logs(type: string): Promise<any[]> {
    throw new Error('NYI');
  }
}
