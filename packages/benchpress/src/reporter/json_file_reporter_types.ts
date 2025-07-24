/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {MeasureValues} from '../measure_values';
import {SampleDescription} from '../sample_description';

export interface JsonReport {
  description: SampleDescription;
  metricsText: string;
  stats: {[k: string]: string};
  statsText: string;
  completeSample: MeasureValues[];
  validSample: MeasureValues[];
  validSampleTexts: string[];
}
