/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, OpaqueToken} from '@angular/core';
import {StringMapWrapper} from '../facade/collection';

import {Metric} from '../metric';

export class MultiMetric extends Metric {
  static provideWith(childTokens: any[]): any[] {
    return [
      {
        provide: _CHILDREN,
        useFactory: (injector: Injector) => childTokens.map(token => injector.get(token)),
        deps: [Injector]
      },
      {
        provide: MultiMetric,
        useFactory: (children: Metric[]) => new MultiMetric(children),
        deps: [_CHILDREN]
      }
    ];
  }

  constructor(private _metrics: Metric[]) { super(); }

  /**
   * Starts measuring
   */
  beginMeasure(): Promise<any> {
    return Promise.all(this._metrics.map(metric => metric.beginMeasure()));
  }

  /**
   * Ends measuring and reports the data
   * since the begin call.
   * @param restart: Whether to restart right after this.
   */
  endMeasure(restart: boolean): Promise<{[key: string]: any}> {
    return Promise.all(this._metrics.map(metric => metric.endMeasure(restart)))
        .then(values => mergeStringMaps(<any>values));
  }

  /**
   * Describes the metrics provided by this metric implementation.
   * (e.g. units, ...)
   */
  describe(): {[key: string]: any} {
    return mergeStringMaps(this._metrics.map((metric) => metric.describe()));
  }
}

function mergeStringMaps(maps: {[key: string]: string}[]): {[key: string]: string} {
  var result: {[key: string]: string} = {};
  maps.forEach(
      map => { StringMapWrapper.forEach(map, (value, prop) => { result[prop] = value; }); });
  return result;
}

var _CHILDREN = new OpaqueToken('MultiMetric.children');
