/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MeasureValues} from './measure_values';

/**
 * A Validator calculates a valid sample out of the complete sample.
 * A valid sample is a sample that represents the population that should be observed
 * in the correct way.
 */
export abstract class Validator {
  /**
   * Calculates a valid sample out of the complete sample
   */
  validate(completeSample: MeasureValues[]): MeasureValues[]|null {
    throw new Error('NYI');
  }

  /**
   * Returns a Map that describes the properties of the validator
   * (e.g. sample size, ...)
   */
  describe(): {[key: string]: any} {
    throw new Error('NYI');
  }
}
