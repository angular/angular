import {
  afterEach,
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xit,
} from 'angular2/test_lib';

import {ListWrapper} from 'angular2/src/core/facade/collection';
import {PromiseWrapper, Promise} from 'angular2/src/core/facade/async';

import {Metric, MultiMetric, bind, provide, Injector} from 'benchpress/common';

export function main() {
  function createMetric(ids: any[]) {
    var m = Injector.resolveAndCreate([
                      ids.map(id => provide(id, {asValue: new MockMetric(id)})),
                      MultiMetric.createBindings(ids)
                    ])
                .get(MultiMetric);
    return PromiseWrapper.resolve(m);
  }

  describe('multi metric', () => {
    it('should merge descriptions', inject([AsyncTestCompleter], (async) => {
         createMetric(['m1', 'm2'])
             .then((m) => {
               expect(m.describe()).toEqual({'m1': 'describe', 'm2': 'describe'});
               async.done();
             });
       }));

    it('should merge all beginMeasure calls', inject([AsyncTestCompleter], (async) => {
         createMetric(['m1', 'm2'])
             .then((m) => m.beginMeasure())
             .then((values) => {
               expect(values).toEqual(['m1_beginMeasure', 'm2_beginMeasure']);
               async.done();
             });
       }));

    [false, true].forEach((restartFlag) => {
      it(`should merge all endMeasure calls for restart=${restartFlag}`,
         inject([AsyncTestCompleter], (async) => {
           createMetric(['m1', 'm2'])
               .then((m) => m.endMeasure(restartFlag))
               .then((values) => {
                 expect(values)
                     .toEqual({'m1': {'restart': restartFlag}, 'm2': {'restart': restartFlag}});
                 async.done();
               });
         }));
    });

  });
}

class MockMetric extends Metric {
  _id: string;

  constructor(id) {
    super();
    this._id = id;
  }

  beginMeasure(): Promise<string> { return PromiseWrapper.resolve(`${this._id}_beginMeasure`); }

  endMeasure(restart: boolean): Promise<{[key: string]: any}> {
    var result = {};
    result[this._id] = {'restart': restart};
    return PromiseWrapper.resolve(result);
  }

  describe(): {[key: string]: string} {
    var result: {[key: string]: string} = {};
    result[this._id] = 'describe';
    return result;
  }
}
