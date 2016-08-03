/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PromiseWrapper} from '@angular/facade/src/async';
import {Date, DateWrapper, isBlank, isPresent} from '@angular/facade/src/lang';

import {Options} from './common_options';
import {MeasureValues} from './measure_values';
import {Metric} from './metric';
import {Reporter} from './reporter';
import {Validator} from './validator';
import {WebDriverAdapter} from './web_driver_adapter';


/**
 * The Sampler owns the sample loop:
 * 1. calls the prepare/execute callbacks,
 * 2. gets data from the metric
 * 3. asks the validator for a valid sample
 * 4. reports the new data to the reporter
 * 5. loop until there is a valid sample
 */
export class Sampler {
  // TODO(tbosch): use static values when our transpiler supports them
  static get PROVIDERS(): any[] { return _PROVIDERS; }

  /** @internal */
  private _driver: WebDriverAdapter;
  /** @internal */
  private _metric: Metric;
  /** @internal */
  private _reporter: Reporter;
  /** @internal */
  private _validator: Validator;
  /** @internal */
  private _prepare: Function;
  /** @internal */
  private _execute: Function;
  /** @internal */
  private _now: Function;

  constructor({driver, metric, reporter, validator, prepare, execute, now}: {
    driver?: WebDriverAdapter,
    metric?: Metric,
    reporter?: Reporter,
    validator?: Validator,
    prepare?: Function,
    execute?: Function,
    now?: Function
  } = {}) {
    this._driver = driver;
    this._metric = metric;
    this._reporter = reporter;
    this._validator = validator;
    this._prepare = prepare;
    this._execute = execute;
    this._now = now;
  }

  sample(): Promise<SampleState> {
    var loop;
    loop = (lastState) => {
      return this._iterate(lastState).then((newState) => {
        if (isPresent(newState.validSample)) {
          return newState;
        } else {
          return loop(newState);
        }
      });
    };
    return loop(new SampleState([], null));
  }

  /** @internal */
  private _iterate(lastState): Promise<SampleState> {
    var resultPromise: Promise<any>;
    if (isPresent(this._prepare)) {
      resultPromise = this._driver.waitFor(this._prepare);
    } else {
      resultPromise = PromiseWrapper.resolve(null);
    }
    if (isPresent(this._prepare) || lastState.completeSample.length === 0) {
      resultPromise = resultPromise.then((_) => this._metric.beginMeasure());
    }
    return resultPromise.then((_) => this._driver.waitFor(this._execute))
        .then((_) => this._metric.endMeasure(isBlank(this._prepare)))
        .then((measureValues) => this._report(lastState, measureValues));
  }

  /** @internal */
  private _report(state: SampleState, metricValues: {[key: string]: any}): Promise<SampleState> {
    var measureValues = new MeasureValues(state.completeSample.length, this._now(), metricValues);
    var completeSample = state.completeSample.concat([measureValues]);
    var validSample = this._validator.validate(completeSample);
    var resultPromise = this._reporter.reportMeasureValues(measureValues);
    if (isPresent(validSample)) {
      resultPromise =
          resultPromise.then((_) => this._reporter.reportSample(completeSample, validSample));
    }
    return resultPromise.then((_) => new SampleState(completeSample, validSample));
  }
}

export class SampleState {
  constructor(public completeSample: any[], public validSample: any[]) {}
}

var _PROVIDERS = [{
  provide: Sampler,
  useFactory: (driver, metric, reporter, validator, prepare, execute, now) => new Sampler({
                driver: driver,
                reporter: reporter,
                validator: validator,
                metric: metric,
                // TODO(tbosch): DI right now does not support null/undefined objects
                // Mostly because the cache would have to be initialized with a
                // special null object, which is expensive.
                prepare: prepare !== false ? prepare : null,
                execute: execute,
                now: now
              }),
  deps: [
    WebDriverAdapter, Metric, Reporter, Validator, Options.PREPARE, Options.EXECUTE, Options.NOW
  ]
}];
