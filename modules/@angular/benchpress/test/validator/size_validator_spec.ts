/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {describe, expect, it} from '@angular/core/testing/testing_internal';

import {MeasureValues, ReflectiveInjector, SizeValidator} from '../../index';
import {ListWrapper} from '../../src/facade/collection';

export function main() {
  describe('size validator', () => {
    var validator: SizeValidator;

    function createValidator(size: number) {
      validator =
          ReflectiveInjector
              .resolveAndCreate(
                  [SizeValidator.PROVIDERS, {provide: SizeValidator.SAMPLE_SIZE, useValue: size}])
              .get(SizeValidator);
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
      var sample = [mv(0, 0, {'a': 1}), mv(1, 1, {'b': 2}), mv(2, 2, {'c': 3})];
      expect(validator.validate(ListWrapper.slice(sample, 0, 2)))
          .toEqual(ListWrapper.slice(sample, 0, 2));
      expect(validator.validate(sample)).toEqual(ListWrapper.slice(sample, 1, 3));
    });

  });
}

function mv(runIndex: number, time: number, values: {[key: string]: number}) {
  return new MeasureValues(runIndex, new Date(time), values);
}
