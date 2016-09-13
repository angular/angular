/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {WebDriverAdapter} from '../web_driver_adapter';

/**
 * Adapter for WebdriverIO.
 */
export class WebdriverIOAdapter extends WebDriverAdapter {
  isTestrunner: boolean;

  static WEBDRIVERIO_PROVIDERS = [
    {provide: WebDriverAdapter, useFactory: () => new WebdriverIOAdapter((<any>global).browser)}
  ];

  constructor(private _driver: any) {
    super();
    this.isTestrunner = Boolean(_driver.options.isWDIO);
  }

  waitFor(callback: () => any): Promise<any> {
    /**
     * execute synchronous with wdio testrunner
     * wdioSync is a global function that gets registered by wdio-sync, see
     * (https://github.com/webdriverio/wdio-sync/blob/master/index.js#L123-L138)
     */
    if (this.isTestrunner) {
      return new Promise((resolve) => (<any>global).wdioSync(callback, resolve)());
    }

    return callback();
  }

  executeScript(script: string): Promise<any> {
    const res = this._driver.execute(script);

    /**
     * handle command asynchronously if in standalone mode or after loosing fibers context
     */
    if (typeof res.then === 'function') {
      return res.then((response: any) => response.value);
    }

    return new Promise((resolve) => resolve(res.value));
  }

  executeAsyncScript(script: string): Promise<any> {
    const res = this._driver.executeAsync(script);

    /**
     * handle command asynchronously if in standalone mode or after loosing fibers context
     */
    if (typeof res.then === 'function') {
      return res.then((response: any) => response.value);
    }

    return new Promise((resolve: any) => resolve(res.value));
  }

  capabilities(): Promise<any> {
    return new Promise((resolve) => resolve(this._driver.desiredCapabilities));
  }

  /**
   * is executed not in the same eventloop and therefor looses fiber context
   * if testrunner is used
   */
  logs(type: string): Promise<any> {
    return this._driver.log(type).then((response: any) => response.value);
  }
}
