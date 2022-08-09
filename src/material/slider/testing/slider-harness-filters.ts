/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {BaseHarnessFilters} from '@angular/cdk/testing';

/** Possible positions of a slider thumb. */
export const enum ThumbPosition {
  START,
  END,
}

/** A set of criteria that can be used to filter a list of `MatSliderHarness` instances. */
export interface SliderHarnessFilters extends BaseHarnessFilters {
  /** Filters out only range/non-range sliders. */
  isRange?: boolean;
}

/** A set of criteria that can be used to filter a list of `MatSliderThumbHarness` instances. */
export interface SliderThumbHarnessFilters extends BaseHarnessFilters {
  /** Filters out slider thumbs with a particular position. */
  position?: ThumbPosition;
}
