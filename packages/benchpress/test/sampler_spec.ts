/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, MeasureValues, Metric, Options, Reporter, Sampler, Validator, WebDriverAdapter} from '../index';

{
  const EMPTY_EXECUTE = () => {};

  describe('sampler', () => {
    let sampler: Sampler;

    function createSampler({driver, metric, reporter, validator, prepare, execute}: {
      driver?: any,
      metric?: Metric,
      reporter?: Reporter,
      validator?: Validator,
      prepare?: any,
      execute?: any
    } = {}) {
      let time = 1000;
      if (!metric) {
        metric = new MockMetric([]);
      }
      if (!reporter) {
        reporter = new MockReporter([]);
      }
      if (driver == null) {
        driver = new MockDriverAdapter([]);
      }
      const providers = [
        Options.DEFAULT_PROVIDERS, Sampler.PROVIDERS, {provide: Metric, useValue: metric},
        {provide: Reporter, useValue: reporter}, {provide: WebDriverAdapter, useValue: driver},
        {provide: Options.EXECUTE, useValue: execute}, {provide: Validator, useValue: validator},
        {provide: Options.NOW, useValue: () => new Date(time++)}
      ];
      if (prepare != null) {
        providers.push({provide: Options.PREPARE, useValue: prepare});
      }

      sampler = Injector.create(providers).get(Sampler);
    }

    it('should call the prepare and execute callbacks using WebDriverAdapter.waitFor', done => {
      const log: any[] = [];
      let count = 0;
      const driver = new MockDriverAdapter([], (callback: Function) => {
        const result = callback();
        log.push(result);
        return Promise.resolve(result);
      });
      createSampler({
        driver: driver,
        validator: createCountingValidator(2),
        prepare: () => count++,
        execute: () => count++,
      });
      sampler.sample().then((_) => {
        expect(count).toBe(4);
        expect(log).toEqual([0, 1, 2, 3]);
        done();
      });
    });

    it('should call prepare, beginMeasure, execute, endMeasure for every iteration', done => {
      let workCount = 0;
      const log: any[] = [];
      createSampler({
        metric: createCountingMetric(log),
        validator: createCountingValidator(2),
        prepare: () => {
          log.push(`p${workCount++}`);
        },
        execute: () => {
          log.push(`w${workCount++}`);
        }
      });
      sampler.sample().then((_) => {
        expect(log).toEqual([
          'p0',
          ['beginMeasure'],
          'w1',
          ['endMeasure', false, {'script': 0}],
          'p2',
          ['beginMeasure'],
          'w3',
          ['endMeasure', false, {'script': 1}],
        ]);
        done();
      });
    });

    it('should call execute, endMeasure for every iteration if there is no prepare callback',
       done => {
         const log: any[] = [];
         let workCount = 0;
         createSampler({
           metric: createCountingMetric(log),
           validator: createCountingValidator(2),
           execute: () => {
             log.push(`w${workCount++}`);
           },
           prepare: null
         });
         sampler.sample().then((_) => {
           expect(log).toEqual([
             ['beginMeasure'],
             'w0',
             ['endMeasure', true, {'script': 0}],
             'w1',
             ['endMeasure', true, {'script': 1}],
           ]);
           done();
         });
       });

    it('should only collect metrics for execute and ignore metrics from prepare', done => {
      let scriptTime = 0;
      let iterationCount = 1;
      createSampler({
        validator: createCountingValidator(2),
        metric: new MockMetric(
            [],
            () => {
              const result = Promise.resolve({'script': scriptTime});
              scriptTime = 0;
              return result;
            }),
        prepare: () => {
          scriptTime = 1 * iterationCount;
        },
        execute: () => {
          scriptTime = 10 * iterationCount;
          iterationCount++;
        }
      });
      sampler.sample().then((state) => {
        expect(state.completeSample.length).toBe(2);
        expect(state.completeSample[0]).toEqual(mv(0, 1000, {'script': 10}));
        expect(state.completeSample[1]).toEqual(mv(1, 1001, {'script': 20}));
        done();
      });
    });

    it('should call the validator for every execution and store the valid sample', done => {
      const log: any[] = [];
      const validSample = [mv(null!, null!, {})];

      createSampler({
        metric: createCountingMetric(),
        validator: createCountingValidator(2, validSample, log),
        execute: EMPTY_EXECUTE
      });
      sampler.sample().then((state) => {
        expect(state.validSample).toBe(validSample);
        // TODO(tbosch): Why does this fail??
        // expect(log).toEqual([
        //   ['validate', [{'script': 0}], null],
        //   ['validate', [{'script': 0}, {'script': 1}], validSample]
        // ]);

        expect(log.length).toBe(2);
        expect(log[0]).toEqual(['validate', [mv(0, 1000, {'script': 0})], null]);
        expect(log[1]).toEqual(
            ['validate', [mv(0, 1000, {'script': 0}), mv(1, 1001, {'script': 1})], validSample]);

        done();
      });
    });

    it('should report the metric values', done => {
      const log: any[] = [];
      const validSample = [mv(null!, null!, {})];
      createSampler({
        validator: createCountingValidator(2, validSample),
        metric: createCountingMetric(),
        reporter: new MockReporter(log),
        execute: EMPTY_EXECUTE
      });
      sampler.sample().then((_) => {
        // TODO(tbosch): Why does this fail??
        // expect(log).toEqual([
        //   ['reportMeasureValues', 0, {'script': 0}],
        //   ['reportMeasureValues', 1, {'script': 1}],
        //   ['reportSample', [{'script': 0}, {'script': 1}], validSample]
        // ]);
        expect(log.length).toBe(3);
        expect(log[0]).toEqual(['reportMeasureValues', mv(0, 1000, {'script': 0})]);
        expect(log[1]).toEqual(['reportMeasureValues', mv(1, 1001, {'script': 1})]);
        expect(log[2]).toEqual([
          'reportSample', [mv(0, 1000, {'script': 0}), mv(1, 1001, {'script': 1})], validSample
        ]);

        done();
      });
    });
  });
}

function mv(runIndex: number, time: number, values: {[key: string]: number}) {
  return new MeasureValues(runIndex, new Date(time), values);
}

function createCountingValidator(count: number, validSample?: MeasureValues[], log: any[] = []) {
  return new MockValidator(log, (completeSample: MeasureValues[]) => {
    count--;
    if (count === 0) {
      return validSample || completeSample;
    } else {
      return null;
    }
  });
}

function createCountingMetric(log: any[] = []) {
  let scriptTime = 0;
  return new MockMetric(log, () => ({'script': scriptTime++}));
}

class MockDriverAdapter extends WebDriverAdapter {
  constructor(private _log: any[] = [], private _waitFor: Function|null = null) {
    super();
  }
  override waitFor(callback: Function): Promise<any> {
    if (this._waitFor != null) {
      return this._waitFor(callback);
    } else {
      return Promise.resolve(callback());
    }
  }
}


class MockValidator extends Validator {
  constructor(private _log: any[] = [], private _validate: Function|null = null) {
    super();
  }
  override validate(completeSample: MeasureValues[]): MeasureValues[] {
    const stableSample = this._validate != null ? this._validate(completeSample) : completeSample;
    this._log.push(['validate', completeSample, stableSample]);
    return stableSample;
  }
}

class MockMetric extends Metric {
  constructor(private _log: any[] = [], private _endMeasure: Function|null = null) {
    super();
  }
  override beginMeasure() {
    this._log.push(['beginMeasure']);
    return Promise.resolve(null);
  }
  override endMeasure(restart: boolean) {
    const measureValues = this._endMeasure != null ? this._endMeasure() : {};
    this._log.push(['endMeasure', restart, measureValues]);
    return Promise.resolve(measureValues);
  }
}

class MockReporter extends Reporter {
  constructor(private _log: any[] = []) {
    super();
  }
  override reportMeasureValues(values: MeasureValues): Promise<any> {
    this._log.push(['reportMeasureValues', values]);
    return Promise.resolve(null);
  }
  override reportSample(completeSample: MeasureValues[], validSample: MeasureValues[]):
      Promise<any> {
    this._log.push(['reportSample', completeSample, validSample]);
    return Promise.resolve(null);
  }
}
