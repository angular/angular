/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as webdriver from 'selenium-webdriver';

import {WebDriverAdapter} from '../web_driver_adapter';

/**
 * Adapter for the selenium-webdriver.
 */
export class SeleniumWebDriverAdapter extends WebDriverAdapter {
  static PROTRACTOR_PROVIDERS = [{
    provide: WebDriverAdapter,
    useFactory: () => new SeleniumWebDriverAdapter((<any>global).browser)
  }];

  constructor(private _driver: any) { super(); }

  /** @internal */
  private _convertPromise(thenable: PromiseLike<any>) {
    var resolve: (result: any) => void;
    var reject: (error: any) => void;
    var promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    thenable.then(
        // selenium-webdriver uses an own Node.js context,
        // so we need to convert data into objects of this context.
        (data: any) => resolve(convertToLocalProcess(data)), reject);
    return promise;
  }

  waitFor(callback: () => any): Promise<any> {
    return this._convertPromise(this._driver.controlFlow().execute(callback));
  }

  executeScript(script: string): Promise<any> {
    return this._convertPromise(this._driver.executeScript(script));
  }

  executeAsyncScript(script: string): Promise<any> {
    return this._convertPromise(this._driver.executeAsyncScript(script));
  }

  capabilities(): Promise<any> {
    return this._convertPromise(
        this._driver.getCapabilities().then((capsObject: any) => capsObject.serialize()));
  }

  logs(type: string): Promise<any> {
    // Needed as selenium-webdriver does not forward
    // performance logs in the correct way via manage().logs
    return this._convertPromise(this._driver.schedule(
        new webdriver.Command(webdriver.CommandName.GET_LOG).setParameter('type', type),
        'WebDriver.manage().logs().get(' + type + ')'));
  }
}

function convertToLocalProcess(data: any): Object {
  var serialized = JSON.stringify(data);
  if ('' + serialized === 'undefined') {
    return undefined;
  }
  return JSON.parse(serialized);
}
