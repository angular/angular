/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AsyncTestCompleter, describe, expect, inject, it} from '@angular/core/testing/src/testing_internal';

import {Injector, Metric, MultiMetric} from '../../index';

(function() {
function createMetric(ids: any[]) {
  const m = Injector
                .create([
                  ids.map(id => ({provide: id, useValue: new MockMetric(id)})),
                  MultiMetric.provideWith(ids)
                ])
                .get<MultiMetric>(MultiMetric);
  return Promise.resolve(m);
}

describe('multi metric', () => {
  it('should merge descriptions', inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
       createMetric(['m1', 'm2']).then((m) => {
         expect(m.describe()).toEqual({'m1': 'describe', 'm2': 'describe'});
         async.done();
       });
     }));

  it('should merge all beginMeasure calls',
     inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
       createMetric(['m1', 'm2']).then((m) => m.beginMeasure()).then((values) => {
         expect(values).toEqual(['m1_beginMeasure', 'm2_beginMeasure']);
         async.done();
       });
     }));

  [false, true].forEach((restartFlag) => {
    it(`should merge all endMeasure calls for restart=${restartFlag}`,
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         createMetric(['m1', 'm2']).then((m) => m.endMeasure(restartFlag)).then((values) => {
           expect(values).toEqual({'m1': {'restart': restartFlag}, 'm2': {'restart': restartFlag}});
           async.done();
         });
       }));
  });
});
})();

class MockMetric extends Metric {
  constructor(private _id: string) {
    super();
  }

  beginMeasure(): Promise<string> {
    return Promise.resolve(`${this._id}_beginMeasure`);
  }

  endMeasure(restart: boolean): Promise<{[key: string]: any}> {
    const result: {[key: string]: any} = {};
    result[this._id] = {'restart': restart};
    return Promise.resolve(result);
  }

  describe(): {[key: string]: string} {
    const result: {[key: string]: string} = {};
    result[this._id] = 'describe';
    return result;
  }
}
