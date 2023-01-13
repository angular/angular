/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, Metric, MultiMetric} from '../../index';

(function() {
function createMetric(ids: any[]) {
  const m = Injector
                .create({
                  providers: [
                    ids.map(id => ({provide: id, useValue: new MockMetric(id)})),
                    MultiMetric.provideWith(ids)
                  ]
                })
                .get<MultiMetric>(MultiMetric);
  return Promise.resolve(m);
}

describe('multi metric', () => {
  it('should merge descriptions', done => {
    createMetric(['m1', 'm2']).then((m) => {
      expect(m.describe()).toEqual({'m1': 'describe', 'm2': 'describe'});
      done();
    });
  });

  it('should merge all beginMeasure calls', done => {
    createMetric(['m1', 'm2']).then((m) => m.beginMeasure()).then((values) => {
      expect(values).toEqual(['m1_beginMeasure', 'm2_beginMeasure']);
      done();
    });
  });

  [false, true].forEach((restartFlag) => {
    it(`should merge all endMeasure calls for restart=${restartFlag}`, done => {
      createMetric(['m1', 'm2']).then((m) => m.endMeasure(restartFlag)).then((values) => {
        expect(values).toEqual({'m1': {'restart': restartFlag}, 'm2': {'restart': restartFlag}});
        done();
      });
    });
  });
});
})();

class MockMetric extends Metric {
  constructor(private _id: string) {
    super();
  }

  override beginMeasure(): Promise<string> {
    return Promise.resolve(`${this._id}_beginMeasure`);
  }

  override endMeasure(restart: boolean): Promise<{[key: string]: any}> {
    const result: {[key: string]: any} = {};
    result[this._id] = {'restart': restart};
    return Promise.resolve(result);
  }

  override describe(): {[key: string]: string} {
    const result: {[key: string]: string} = {};
    result[this._id] = 'describe';
    return result;
  }
}
