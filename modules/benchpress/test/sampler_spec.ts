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

import {
  isBlank,
  isPresent,
  BaseException,
  stringify,
  Date,
  DateWrapper
} from 'angular2/src/facade/lang';
import {ListWrapper, List} from 'angular2/src/facade/collection';
import {PromiseWrapper, Promise} from 'angular2/src/facade/async';

import {
  Sampler,
  WebDriverAdapter,
  Validator,
  Metric,
  Reporter,
  bind,
  Injector,
  Options,
  MeasureValues
} from 'benchpress/common';

export function main() {
  var EMPTY_EXECUTE = () => {};

  describe('sampler', () => {
    var sampler;

    function createSampler({driver, metric, reporter, validator, prepare, execute}: {
      driver?: any,
      metric?: Metric,
      reporter?: Reporter,
      validator?: Validator,
      prepare?: any,
      execute?: any
    } = {}) {
      var time = 1000;
      if (isBlank(metric)) {
        metric = new MockMetric([]);
      }
      if (isBlank(reporter)) {
        reporter = new MockReporter([]);
      }
      if (isBlank(driver)) {
        driver = new MockDriverAdapter([]);
      }
      var bindings = [
        Options.DEFAULT_BINDINGS,
        Sampler.BINDINGS,
        bind(Metric).toValue(metric),
        bind(Reporter).toValue(reporter),
        bind(WebDriverAdapter).toValue(driver),
        bind(Options.EXECUTE).toValue(execute),
        bind(Validator).toValue(validator),
        bind(Options.NOW).toValue(() => DateWrapper.fromMillis(time++))
      ];
      if (isPresent(prepare)) {
        ListWrapper.push(bindings, bind(Options.PREPARE).toValue(prepare));
      }

      sampler = Injector.resolveAndCreate(bindings).get(Sampler);
    }

    it('should call the prepare and execute callbacks using WebDriverAdapter.waitFor',
       inject([AsyncTestCompleter], (async) => {
         var log = [];
         var count = 0;
         var driver = new MockDriverAdapter([], (callback) => {
           var result = callback();
           ListWrapper.push(log, result);
           return PromiseWrapper.resolve(result);
         });
         createSampler({
           driver: driver,
           validator: createCountingValidator(2),
           prepare: () => { return count++; },
           execute: () => { return count++; }
         });
         sampler.sample().then((_) => {
           expect(count).toBe(4);
           expect(log).toEqual([0, 1, 2, 3]);
           async.done();
         });

       }));

    it('should call prepare, beginMeasure, execute, endMeasure for every iteration',
       inject([AsyncTestCompleter], (async) => {
         var workCount = 0;
         var log = [];
         createSampler({
           metric: createCountingMetric(log),
           validator: createCountingValidator(2),
           prepare: () => { ListWrapper.push(log, `p${workCount++}`); },
           execute: () => { ListWrapper.push(log, `w${workCount++}`); }
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
           async.done();
         });
       }));

    it('should call execute, endMeasure for every iteration if there is no prepare callback',
       inject([AsyncTestCompleter], (async) => {
         var log = [];
         var workCount = 0;
         createSampler({
           metric: createCountingMetric(log),
           validator: createCountingValidator(2),
           execute: () => { ListWrapper.push(log, `w${workCount++}`); },
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
           async.done();
         });
       }));

    it('should only collect metrics for execute and ignore metrics from prepare',
       inject([AsyncTestCompleter], (async) => {
         var scriptTime = 0;
         var iterationCount = 1;
         createSampler({
           validator: createCountingValidator(2),
           metric: new MockMetric([],
                                  () => {
                                    var result = PromiseWrapper.resolve({'script': scriptTime});
                                    scriptTime = 0;
                                    return result;
                                  }),
           prepare: () => { scriptTime = 1 * iterationCount; },
           execute: () => {
             scriptTime = 10 * iterationCount;
             iterationCount++;
           }
         });
         sampler.sample().then((state) => {
           expect(state.completeSample.length).toBe(2);
           expect(state.completeSample[0]).toEqual(mv(0, 1000, {'script': 10}));
           expect(state.completeSample[1]).toEqual(mv(1, 1001, {'script': 20}));
           async.done();
         });
       }));

    it('should call the validator for every execution and store the valid sample',
       inject([AsyncTestCompleter], (async) => {
         var log = [];
         var validSample = [{}];

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

           async.done();
         });
       }));

    it('should report the metric values', inject([AsyncTestCompleter], (async) => {
         var log = [];
         var validSample = [{}];
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
             'reportSample',
             [mv(0, 1000, {'script': 0}), mv(1, 1001, {'script': 1})],
             validSample
           ]);

           async.done();
         });
       }));

  });
}

function mv(runIndex, time, values) {
  return new MeasureValues(runIndex, DateWrapper.fromMillis(time), values);
}

function createCountingValidator(count, validSample = null, log = null) {
  return new MockValidator(log, (completeSample) => {
    count--;
    if (count === 0) {
      return isPresent(validSample) ? validSample : completeSample;
    } else {
      return null;
    }
  });
}

function createCountingMetric(log = null) {
  var scriptTime = 0;
  return new MockMetric(log, () => { return {'script': scriptTime++}; });
}

class MockDriverAdapter extends WebDriverAdapter {
  private _log: List<any>;
  private _waitFor: Function;
  constructor(log = null, waitFor = null) {
    super();
    if (isBlank(log)) {
      log = [];
    }
    this._log = log;
    this._waitFor = waitFor;
  }
  waitFor(callback: Function): Promise<any> {
    if (isPresent(this._waitFor)) {
      return this._waitFor(callback);
    } else {
      return PromiseWrapper.resolve(callback());
    }
  }
}


class MockValidator extends Validator {
  private _log: List<any>;
  constructor(log = null, private _validate: Function = null) {
    super();
    if (isBlank(log)) {
      log = [];
    }
    this._log = log;
  }
  validate(completeSample: List<MeasureValues>): List<MeasureValues> {
    var stableSample = isPresent(this._validate) ? this._validate(completeSample) : completeSample;
    ListWrapper.push(this._log, ['validate', completeSample, stableSample]);
    return stableSample;
  }
}

class MockMetric extends Metric {
  private _log: List<any>;
  constructor(log = null, private _endMeasure: Function = null) {
    super();
    if (isBlank(log)) {
      log = [];
    }
    this._log = log;
  }
  beginMeasure() {
    ListWrapper.push(this._log, ['beginMeasure']);
    return PromiseWrapper.resolve(null);
  }
  endMeasure(restart) {
    var measureValues = isPresent(this._endMeasure) ? this._endMeasure() : {};
    ListWrapper.push(this._log, ['endMeasure', restart, measureValues]);
    return PromiseWrapper.resolve(measureValues);
  }
}

class MockReporter extends Reporter {
  _log: List<any>;
  constructor(log = null) {
    super();
    if (isBlank(log)) {
      log = [];
    }
    this._log = log;
  }
  reportMeasureValues(values): Promise<any> {
    ListWrapper.push(this._log, ['reportMeasureValues', values]);
    return PromiseWrapper.resolve(null);
  }
  reportSample(completeSample, validSample): Promise<any> {
    ListWrapper.push(this._log, ['reportSample', completeSample, validSample]);
    return PromiseWrapper.resolve(null);
  }
}
