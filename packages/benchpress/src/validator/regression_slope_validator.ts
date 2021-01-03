/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, InjectionToken} from '@angular/core';

import {MeasureValues} from '../measure_values';
import {Statistic} from '../statistic';
import {Validator} from '../validator';

/**
 * A validator that checks the regression slope of a specific metric.
 * Waits for the regression slope to be >=0.
 */
@Injectable()
export class RegressionSlopeValidator extends Validator {
  static SAMPLE_SIZE = new InjectionToken('RegressionSlopeValidator.sampleSize');
  static METRIC = new InjectionToken('RegressionSlopeValidator.metric');
  static PROVIDERS = [
    {
      provide: RegressionSlopeValidator,
      deps: [RegressionSlopeValidator.SAMPLE_SIZE, RegressionSlopeValidator.METRIC]
    },
    {provide: RegressionSlopeValidator.SAMPLE_SIZE, useValue: 10},
    {provide: RegressionSlopeValidator.METRIC, useValue: 'scriptTime'}
  ];

  constructor(
      @Inject(RegressionSlopeValidator.SAMPLE_SIZE) private _sampleSize: number,
      @Inject(RegressionSlopeValidator.METRIC) private _metric: string) {
    super();
  }

  describe(): {[key: string]: any} {
    return {'sampleSize': this._sampleSize, 'regressionSlopeMetric': this._metric};
  }

  validate(completeSample: MeasureValues[]): MeasureValues[]|null {
    if (completeSample.length >= this._sampleSize) {
      const latestSample =
          completeSample.slice(completeSample.length - this._sampleSize, completeSample.length);
      const xValues: number[] = [];
      const yValues: number[] = [];
      for (let i = 0; i < latestSample.length; i++) {
        // For now, we only use the array index as x value.
        // TODO(tbosch): think about whether we should use time here instead
        xValues.push(i);
        yValues.push(latestSample[i].values[this._metric]);
      }
      const regressionSlope = Statistic.calculateRegressionSlope(
          xValues, Statistic.calculateMean(xValues), yValues, Statistic.calculateMean(yValues));
      return regressionSlope >= 0 ? latestSample : null;
    } else {
      return null;
    }
  }
}
