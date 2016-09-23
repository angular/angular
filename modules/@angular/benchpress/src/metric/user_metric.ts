/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable} from '@angular/core';

import {Options} from '../common_options';
import {StringMapWrapper} from '../facade/collection';
import {isNumber} from '../facade/lang';
import {Metric} from '../metric';
import {WebDriverAdapter} from '../web_driver_adapter';

@Injectable()
export class UserMetric extends Metric {
  static PROVIDERS = [UserMetric];

  constructor(
      @Inject(Options.USER_METRICS) private _userMetrics: {[key: string]: string},
      private _wdAdapter: WebDriverAdapter) {
    super();
  }

  /**
   * Starts measuring
   */
  beginMeasure(): Promise<any> { return Promise.resolve(true); }

  /**
   * Ends measuring.
   */
  endMeasure(restart: boolean): Promise<{[key: string]: any}> {
    let resolve: (result: any) => void;
    let reject: (error: any) => void;
    let promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    let adapter = this._wdAdapter;
    let names = StringMapWrapper.keys(this._userMetrics);

    function getAndClearValues() {
      Promise.all(names.map(name => adapter.executeScript(`return window.${name}`)))
          .then((values: any[]) => {
            if (values.every(isNumber)) {
              Promise.all(names.map(name => adapter.executeScript(`delete window.${name}`)))
                  .then((_: any[]) => {
                    let map: {[k: string]: any} = {};
                    for (let i = 0, n = names.length; i < n; i++) {
                      map[names[i]] = values[i];
                    }
                    resolve(map);
                  }, reject);
            } else {
              <any>setTimeout(getAndClearValues, 100);
            }
          }, reject);
    }
    getAndClearValues();
    return promise;
  }

  /**
   * Describes the metrics provided by this metric implementation.
   * (e.g. units, ...)
   */
  describe(): {[key: string]: any} { return this._userMetrics; }
}
