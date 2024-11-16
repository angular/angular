/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable} from '@angular/core';

import {WebDriverAdapter} from '../web_driver_adapter';
import {PerfLogEvent, PerfLogFeatures, WebDriverExtension} from '../web_driver_extension';

@Injectable()
export class FirefoxDriverExtension extends WebDriverExtension {
  static PROVIDERS = [{provide: FirefoxDriverExtension, deps: [WebDriverAdapter]}];

  private _profilerStarted: boolean;

  constructor(private _driver: WebDriverAdapter) {
    super();
    this._profilerStarted = false;
  }

  override gc() {
    return this._driver.executeScript('window.forceGC()');
  }

  override timeBegin(name: string): Promise<any> {
    if (!this._profilerStarted) {
      this._profilerStarted = true;
      this._driver.executeScript('window.startProfiler();');
    }
    return this._driver.executeScript('window.markStart("' + name + '");');
  }

  override timeEnd(name: string, restartName: string | null = null): Promise<any> {
    let script = 'window.markEnd("' + name + '");';
    if (restartName != null) {
      script += 'window.markStart("' + restartName + '");';
    }
    return this._driver.executeScript(script);
  }

  override readPerfLog(): Promise<PerfLogEvent[]> {
    return this._driver.executeAsyncScript('var cb = arguments[0]; window.getProfile(cb);');
  }

  override perfLogFeatures(): PerfLogFeatures {
    return new PerfLogFeatures({render: true, gc: true});
  }

  override supports(capabilities: {[key: string]: any}): boolean {
    return capabilities['browserName'].toLowerCase() === 'firefox';
  }
}
