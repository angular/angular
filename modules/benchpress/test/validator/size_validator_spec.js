import {describe, ddescribe, it, iit, xit, expect, beforeEach, afterEach} from 'angular2/test_lib';

import {
  Validator, SizeValidator, Injector, bind
} from 'benchpress/benchpress';

export function main() {
  describe('size validator', () => {
    var validator;

    function createValidator(size) {
      validator = new Injector([
        SizeValidator.BINDINGS,
        bind(SizeValidator.SAMPLE_SIZE).toValue(size)
      ]).get(Validator);
    }

    it('should return sampleSize as description', () => {
      createValidator(2);
      expect(validator.describe()).toEqual({
        'sampleSize': 2
      });
    });

    it('should return null while the completeSample is smaller than the given size', () => {
      createValidator(2);
      expect(validator.validate([])).toBe(null);
      expect(validator.validate([{}])).toBe(null);
    });

    it('should return the last sampleSize runs when it has at least the given size', () => {
      createValidator(2);
      expect(validator.validate([{'a':1}, {'b':2}])).toEqual([{'a':1}, {'b':2}]);
      expect(validator.validate([{'a':1}, {'b':2}, {'c':3}])).toEqual([{'b':2}, {'c':3}]);
    });

  });
}