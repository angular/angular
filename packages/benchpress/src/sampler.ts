/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable} from '@angular/core';

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
@Injectable()
export class Sampler {
  static PROVIDERS = [Sampler];

  constructor(
      private _driver: WebDriverAdapter, private _metric: Metric, private _reporter: Reporter,
      private _validator: Validator, @Inject(Options.PREPARE) private _prepare: Function,
      @Inject(Options.EXECUTE) private _execute: Function,
      @Inject(Options.NOW) private _now: Function) {}

  sample(): Promise<SampleState> {
    const loop = (lastState: SampleState): Promise<SampleState> => {
      return this._iterate(lastState).then((newState) => {
        if (newState.validSample != null) {
          return newState;
        } else {
          return loop(newState);
        }
      });
    };
    return loop(new SampleState([], null));
  }

  private _iterate(lastState: SampleState): Promise<SampleState> {
    let resultPromise: Promise<SampleState|null>;
    if (this._prepare !== Options.NO_PREPARE) {
      resultPromise = this._driver.waitFor(this._prepare);
    } else {
      resultPromise = Promise.resolve(null);
    }
    if (this._prepare !== Options.NO_PREPARE || lastState.completeSample.length === 0) {
      resultPromise = resultPromise.then((_) => this._metric.beginMeasure());
    }
    return resultPromise.then((_) => this._driver.waitFor(this._execute))
        .then((_) => this._metric.endMeasure(this._prepare === Options.NO_PREPARE))
        .then((measureValues) => this._report(lastState, measureValues));
  }

  private _report(state: SampleState, metricValues: {[key: string]: any}): Promise<SampleState> {
    const measureValues = new MeasureValues(state.completeSample.length, this._now(), metricValues);
    const completeSample = state.completeSample.concat([measureValues]);
    const validSample = this._validator.validate(completeSample);
    let resultPromise = this._reporter.reportMeasureValues(measureValues);
    if (validSample != null) {
      resultPromise =
          resultPromise.then((_) => this._reporter.reportSample(completeSample, validSample));
    }
    return resultPromise.then((_) => new SampleState(completeSample, validSample));
  }
}

export class SampleState {
  constructor(public completeSample: MeasureValues[], public validSample: MeasureValues[]|null) {}
}
