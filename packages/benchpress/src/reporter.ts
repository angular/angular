/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {MeasureValues} from './measure_values';

/**
 * A reporter reports measure values and the valid sample.
 */
export abstract class Reporter {
  reportMeasureValues(values: MeasureValues): Promise<any> {
    throw new Error('NYI');
  }

  reportSample(completeSample: MeasureValues[], validSample: MeasureValues[]): Promise<any> {
    throw new Error('NYI');
  }
}
