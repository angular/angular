import { List } from 'angular2/src/facade/collection';
import {
  ABSTRACT, BaseException
} from 'angular2/src/facade/lang';

import { MeasureValues } from './measure_values';

/**
 * A Validator calculates a valid sample out of the complete sample.
 * A valid sample is a sample that represents the population that should be observed
 * in the correct way.
 */
@ABSTRACT()
export class Validator {
  /**
   * Calculates a valid sample out of the complete sample
   */
  validate(completeSample:List<MeasureValues>):List<MeasureValues> {
    throw new BaseException('NYI');
  }

  /**
   * Returns a Map that describes the properties of the validator
   * (e.g. sample size, ...)
   */
  describe():any {
    throw new BaseException('NYI');
  }
}