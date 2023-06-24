/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, MeasureValues, MultiReporter, Reporter} from '../../index';

(function() {
function createReporters(ids: any[]) {
  const r = Injector
                .create({
                  providers: [
                    ids.map(id => ({provide: id, useValue: new MockReporter(id)})),
                    MultiReporter.provideWith(ids)
                  ]
                })
                .get<MultiReporter>(MultiReporter);
  return Promise.resolve(r);
}

describe('multi reporter', () => {
  it('should reportMeasureValues to all', done => {
    const mv = new MeasureValues(0, new Date(), {});
    createReporters(['m1', 'm2']).then((r) => r.reportMeasureValues(mv)).then((values) => {
      expect(values).toEqual([{'id': 'm1', 'values': mv}, {'id': 'm2', 'values': mv}]);
      done();
    });
  });

  it('should reportSample to call', done => {
    const completeSample =
        [new MeasureValues(0, new Date(), {}), new MeasureValues(1, new Date(), {})];
    const validSample = [completeSample[1]];

    createReporters(['m1', 'm2'])
        .then((r) => r.reportSample(completeSample, validSample))
        .then((values) => {
          expect(values).toEqual([
            {'id': 'm1', 'completeSample': completeSample, 'validSample': validSample},
            {'id': 'm2', 'completeSample': completeSample, 'validSample': validSample}
          ]);
          done();
        });
  });
});
})();

class MockReporter extends Reporter {
  constructor(private _id: string) {
    super();
  }

  override reportMeasureValues(values: MeasureValues): Promise<{[key: string]: any}> {
    return Promise.resolve({'id': this._id, 'values': values});
  }

  override reportSample(completeSample: MeasureValues[], validSample: MeasureValues[]):
      Promise<{[key: string]: any}> {
    return Promise.resolve(
        {'id': this._id, 'completeSample': completeSample, 'validSample': validSample});
  }
}
