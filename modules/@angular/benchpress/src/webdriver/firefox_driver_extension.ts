/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';

import {StringWrapper, isPresent} from '../facade/lang';
import {WebDriverAdapter} from '../web_driver_adapter';
import {PerfLogEvent, PerfLogFeatures, WebDriverExtension} from '../web_driver_extension';

@Injectable()
export class FirefoxDriverExtension extends WebDriverExtension {
  static PROVIDERS = [FirefoxDriverExtension];

  private _profilerStarted: boolean;

  constructor(private _driver: WebDriverAdapter) {
    super();
    this._profilerStarted = false;
  }

  gc() { return this._driver.executeScript('window.forceGC()'); }

  timeBegin(name: string): Promise<any> {
    if (!this._profilerStarted) {
      this._profilerStarted = true;
      this._driver.executeScript('window.startProfiler();');
    }
    return this._driver.executeScript('window.markStart("' + name + '");');
  }

  timeEnd(name: string, restartName: string = null): Promise<any> {
    var script = 'window.markEnd("' + name + '");';
    if (isPresent(restartName)) {
      script += 'window.markStart("' + restartName + '");';
    }
    return this._driver.executeScript(script);
  }

  readPerfLog(): Promise<PerfLogEvent> {
    return this._driver.executeAsyncScript('var cb = arguments[0]; window.getProfile(cb);');
  }

  perfLogFeatures(): PerfLogFeatures { return new PerfLogFeatures({render: true, gc: true}); }

  supports(capabilities: {[key: string]: any}): boolean {
    return StringWrapper.equals(capabilities['browserName'].toLowerCase(), 'firefox');
  }
}
