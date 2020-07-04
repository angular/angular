/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AsyncTestCompleter, describe, expect, inject, it} from '@angular/core/testing/src/testing_internal';

import {Injector, Metric, Options, Runner, SampleDescription, Sampler, SampleState, Validator, WebDriverAdapter} from '../index';

{
  describe('runner', () => {
    let injector: Injector;
    let runner: Runner;

    function createRunner(defaultProviders?: any[]): Runner {
      if (!defaultProviders) {
        defaultProviders = [];
      }
      runner = new Runner([
        defaultProviders, {
          provide: Sampler,
          useFactory: (_injector: Injector) => {
            injector = _injector;
            return new MockSampler();
          },
          deps: [Injector]
        },
        {provide: Metric, useFactory: () => new MockMetric(), deps: []},
        {provide: Validator, useFactory: () => new MockValidator(), deps: []},
        {provide: WebDriverAdapter, useFactory: () => new MockWebDriverAdapter(), deps: []}
      ]);
      return runner;
    }

    it('should set SampleDescription.id',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         createRunner()
             .sample({id: 'someId'})
             .then((_) => injector.get(SampleDescription))
             .then((desc) => {
               expect(desc.id).toBe('someId');
               async.done();
             });
       }));

    it('should merge SampleDescription.description',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         createRunner([{provide: Options.DEFAULT_DESCRIPTION, useValue: {'a': 1}}])
             .sample({
               id: 'someId',
               providers: [{provide: Options.SAMPLE_DESCRIPTION, useValue: {'b': 2}}]
             })
             .then((_) => injector.get(SampleDescription))
             .then((desc) => {
               expect(desc.description)
                   .toEqual(
                       {'forceGc': false, 'userAgent': 'someUserAgent', 'a': 1, 'b': 2, 'v': 11});
               async.done();
             });
       }));

    it('should fill SampleDescription.metrics from the Metric',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         createRunner()
             .sample({id: 'someId'})
             .then((_) => injector.get(SampleDescription))
             .then((desc) => {
               expect(desc.metrics).toEqual({'m1': 'some metric'});
               async.done();
             });
       }));

    it('should provide Options.EXECUTE',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const execute = () => {};
         createRunner().sample({id: 'someId', execute: execute}).then((_) => {
           expect(injector.get(Options.EXECUTE)).toEqual(execute);
           async.done();
         });
       }));

    it('should provide Options.PREPARE',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         const prepare = () => {};
         createRunner().sample({id: 'someId', prepare: prepare}).then((_) => {
           expect(injector.get(Options.PREPARE)).toEqual(prepare);
           async.done();
         });
       }));

    it('should provide Options.MICRO_METRICS',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         createRunner().sample({id: 'someId', microMetrics: {'a': 'b'}}).then((_) => {
           expect(injector.get(Options.MICRO_METRICS)).toEqual({'a': 'b'});
           async.done();
         });
       }));

    it('should overwrite providers per sample call',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         createRunner([{provide: Options.DEFAULT_DESCRIPTION, useValue: {'a': 1}}])
             .sample({
               id: 'someId',
               providers: [{provide: Options.DEFAULT_DESCRIPTION, useValue: {'a': 2}}]
             })
             .then((_) => injector.get(SampleDescription))
             .then((desc) => {
               expect(desc.description['a']).toBe(2);
               async.done();
             });
       }));
  });
}

class MockWebDriverAdapter extends WebDriverAdapter {
  executeScript(script: string): Promise<string> {
    return Promise.resolve('someUserAgent');
  }
  capabilities(): Promise<Map<string, any>> {
    return null!;
  }
}

class MockValidator extends Validator {
  constructor() {
    super();
  }
  describe() {
    return {'v': 11};
  }
}

class MockMetric extends Metric {
  constructor() {
    super();
  }
  describe() {
    return {'m1': 'some metric'};
  }
}

class MockSampler extends Sampler {
  constructor() {
    super(null!, null!, null!, null!, null!, null!, null!);
  }
  sample(): Promise<SampleState> {
    return Promise.resolve(new SampleState([], []));
  }
}
