/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {BaseHarnessFilters} from '@angular/cdk/testing';

/** Possible orientations for a stepper. */
export const enum StepperOrientation {
  HORIZONTAL,
  VERTICAL,
}

/** A set of criteria that can be used to filter a list of `MatStepHarness` instances. */
export interface StepHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose label matches the given value. */
  label?: string | RegExp;
  /** Only find steps with the given selected state. */
  selected?: boolean;
  /** Only find completed steps. */
  completed?: boolean;
  /** Only find steps that have errors. */
  invalid?: boolean;
}

/** A set of criteria that can be used to filter a list of `MatStepperHarness` instances. */
export interface StepperHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose orientation matches the given value. */
  orientation?: StepperOrientation;
}

/**
 * A set of criteria that can be used to filter a list of
 * `MatStepperNextHarness` and `MatStepperPreviousHarness` instances.
 */
export interface StepperButtonHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose text matches the given value. */
  text?: string | RegExp;
}
