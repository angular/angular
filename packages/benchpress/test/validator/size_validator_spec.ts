/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, MeasureValues, SizeValidator} from '../../index';

describe('size validator', () => {
  let validator: SizeValidator;

  function createValidator(size: number) {
    validator = Injector.create({
      providers: [SizeValidator.PROVIDERS, {provide: SizeValidator.SAMPLE_SIZE, useValue: size}],
    }).get(SizeValidator);
  }

  it('should return sampleSize as description', () => {
    createValidator(2);
    expect(validator.describe()).toEqual({'sampleSize': 2});
  });

  it('should return null while the completeSample is smaller than the given size', () => {
    createValidator(2);
    expect(validator.validate([])).toBe(null);
    expect(validator.validate([mv(0, 0, {})])).toBe(null);
  });

  it('should return the last sampleSize runs when it has at least the given size', () => {
    createValidator(2);
    const sample = [mv(0, 0, {'a': 1}), mv(1, 1, {'b': 2}), mv(2, 2, {'c': 3})];
    expect(validator.validate(sample.slice(0, 2))).toEqual(sample.slice(0, 2));
    expect(validator.validate(sample)).toEqual(sample.slice(1, 3));
  });
});

function mv(runIndex: number, time: number, values: {[key: string]: number}) {
  return new MeasureValues(runIndex, new Date(time), values);
}
