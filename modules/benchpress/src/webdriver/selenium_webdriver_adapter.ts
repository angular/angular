import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {bind, Binding} from 'angular2/di';
import {WebDriverAdapter} from '../web_driver_adapter';

import webdriver = require('selenium-webdriver');

/**
 * Adapter for the selenium-webdriver.
 */
export class SeleniumWebDriverAdapter extends WebDriverAdapter {
  static get PROTRACTOR_BINDINGS(): List<Binding> { return _PROTRACTOR_BINDINGS; }

  constructor(private _driver: any) { super(); }

  _convertPromise(thenable) {
    var completer = PromiseWrapper.completer();
    thenable.then(
        // selenium-webdriver uses an own Node.js context,
        // so we need to convert data into objects of this context.
        // (e.g. otherwise instanceof checks of rtts_assert would fail)
        (data) => completer.resolve(convertToLocalProcess(data)), completer.reject);
    return completer.promise;
  }

  waitFor(callback): Promise<any> {
    return this._convertPromise(this._driver.controlFlow().execute(callback));
  }

  executeScript(script: string): Promise<any> {
    return this._convertPromise(this._driver.executeScript(script));
  }

  capabilities(): Promise<any> {
    return this._convertPromise(
        this._driver.getCapabilities().then((capsObject) => capsObject.toJSON()));
  }

  logs(type: string): Promise<any> {
    // Needed as selenium-webdriver does not forward
    // performance logs in the correct way via manage().logs
    return this._convertPromise(this._driver.schedule(
        new webdriver.Command(webdriver.CommandName.GET_LOG).setParameter('type', type),
        'WebDriver.manage().logs().get(' + type + ')'));
  }
}

function convertToLocalProcess(data): Object {
  var serialized = JSON.stringify(data);
  if ('' + serialized === 'undefined') {
    return undefined;
  }
  return JSON.parse(serialized);
}

var _PROTRACTOR_BINDINGS =
    [bind(WebDriverAdapter).toFactory(() => new SeleniumWebDriverAdapter(global.browser), [])];
