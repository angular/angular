/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, MeasureValues, RegressionSlopeValidator} from '../../index';

describe('regression slope validator', () => {
  let validator: RegressionSlopeValidator;

  function createValidator({size, metric}: {size: number; metric: string}) {
    validator = Injector.create({
      providers: [
        RegressionSlopeValidator.PROVIDERS,
        {provide: RegressionSlopeValidator.METRIC, useValue: metric},
        {provide: RegressionSlopeValidator.SAMPLE_SIZE, useValue: size},
      ],
    }).get(RegressionSlopeValidator);
  }

  it('should return sampleSize and metric as description', () => {
    createValidator({size: 2, metric: 'script'});
    expect(validator.describe()).toEqual({'sampleSize': 2, 'regressionSlopeMetric': 'script'});
  });

  it('should return null while the completeSample is smaller than the given size', () => {
    createValidator({size: 2, metric: 'script'});
    expect(validator.validate([])).toBe(null);
    expect(validator.validate([mv(0, 0, {})])).toBe(null);
  });

  it('should return null while the regression slope is < 0', () => {
    createValidator({size: 2, metric: 'script'});
    expect(validator.validate([mv(0, 0, {'script': 2}), mv(1, 1, {'script': 1})])).toBe(null);
  });

  it('should return the last sampleSize runs when the regression slope is ==0', () => {
    createValidator({size: 2, metric: 'script'});
    const sample = [mv(0, 0, {'script': 1}), mv(1, 1, {'script': 1}), mv(2, 2, {'script': 1})];
    expect(validator.validate(sample.slice(0, 2))).toEqual(sample.slice(0, 2));
    expect(validator.validate(sample)).toEqual(sample.slice(1, 3));
  });

  it('should return the last sampleSize runs when the regression slope is >0', () => {
    createValidator({size: 2, metric: 'script'});
    const sample = [mv(0, 0, {'script': 1}), mv(1, 1, {'script': 2}), mv(2, 2, {'script': 3})];
    expect(validator.validate(sample.slice(0, 2))).toEqual(sample.slice(0, 2));
    expect(validator.validate(sample)).toEqual(sample.slice(1, 3));
  });
});

function mv(runIndex: number, time: number, values: {[key: string]: number}) {
  return new MeasureValues(runIndex, new Date(time), values);
}
