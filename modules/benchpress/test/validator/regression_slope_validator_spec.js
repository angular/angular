import {describe, ddescribe, it, iit, xit, expect, beforeEach, afterEach} from 'angular2/test_lib';

import {
  Validator, RegressionSlopeValidator, Injector, bind
} from 'benchpress/benchpress';

export function main() {
  describe('regression slope validator', () => {
    var validator;

    function createValidator({size, metric}) {
      validator = new Injector([
        RegressionSlopeValidator.BINDINGS,
        bind(RegressionSlopeValidator.METRIC).toValue(metric),
        bind(RegressionSlopeValidator.SAMPLE_SIZE).toValue(size)
      ]).get(Validator);
    }

    it('should return sampleSize and metric as description', () => {
      createValidator({size: 2, metric: 'script'});
      expect(validator.describe()).toEqual({
        'sampleSize': 2,
        'regressionSlopeMetric': 'script'
      });
    });

    it('should return null while the completeSample is smaller than the given size', () => {
      createValidator({size: 2, metric: 'script'});
      expect(validator.validate([])).toBe(null);
      expect(validator.validate([{}])).toBe(null);
    });

    it('should return null while the regression slope is < 0', () => {
      createValidator({size: 2, metric: 'script'});
      expect(validator.validate([{'script':2}, {'script':1}])).toBe(null);
    });

    it('should return the last sampleSize runs when the regression slope is ==0', () => {
      createValidator({size: 2, metric: 'script'});
      expect(validator.validate([{'script':1}, {'script':1}])).toEqual([{'script':1}, {'script':1}]);
      expect(validator.validate([{'script':1}, {'script':1}, {'script':1}])).toEqual([{'script':1}, {'script':1}]);
    });

    it('should return the last sampleSize runs when the regression slope is >0', () => {
      createValidator({size: 2, metric: 'script'});
      expect(validator.validate([{'script':1}, {'script':2}])).toEqual([{'script':1}, {'script':2}]);
      expect(validator.validate([{'script':1}, {'script':2}, {'script':3}])).toEqual([{'script':2}, {'script':3}]);
    });

  });
}