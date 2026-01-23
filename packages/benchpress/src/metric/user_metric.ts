/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Inject, Injectable, StaticProvider} from '@angular/core';

import {Options} from '../common_options';
import {Metric} from '../metric';
import {WebDriverAdapter} from '../web_driver_adapter';

@Injectable()
export class UserMetric extends Metric {
  static PROVIDERS = <StaticProvider[]>[
    {provide: UserMetric, deps: [Options.USER_METRICS, WebDriverAdapter]},
  ];

  constructor(
    @Inject(Options.USER_METRICS) private _userMetrics: {[key: string]: string},
    private _wdAdapter: WebDriverAdapter,
  ) {
    super();
  }

  /**
   * Starts measuring
   */
  override beginMeasure(): Promise<any> {
    return Promise.resolve(true);
  }

  /**
   * Ends measuring.
   */
  override endMeasure(restart: boolean): Promise<{[key: string]: any}> {
    let resolve: (result: any) => void;
    let reject: (error: any) => void;
    const promise = new Promise<{[key: string]: any}>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    const adapter = this._wdAdapter;
    const names = Object.keys(this._userMetrics);

    function getAndClearValues() {
      Promise.all(names.map((name) => adapter.executeScript(`return window.${name}`))).then(
        (values: any[]) => {
          if (values.every((v) => typeof v === 'number')) {
            Promise.all(names.map((name) => adapter.executeScript(`delete window.${name}`))).then(
              (_: any[]) => {
                const map: {[k: string]: any} = {};
                for (let i = 0, n = names.length; i < n; i++) {
                  map[names[i]] = values[i];
                }
                resolve(map);
              },
              reject,
            );
          } else {
            <any>setTimeout(getAndClearValues, 100);
          }
        },
        reject,
      );
    }
    getAndClearValues();
    return promise;
  }

  /**
   * Describes the metrics provided by this metric implementation.
   * (e.g. units, ...)
   */
  override describe(): {[key: string]: any} {
    return this._userMetrics;
  }
}
