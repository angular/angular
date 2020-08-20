/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {MatStepHarness} from './step-harness';
import {
  StepperHarnessFilters,
  StepHarnessFilters,
  StepperOrientation,
} from './step-harness-filters';

/** Harness for interacting with a standard Material stepper in tests. */
export class MatStepperHarness extends ComponentHarness {
  /** The selector for the host element of a `MatStepper` instance. */
  static hostSelector = '.mat-stepper-horizontal, .mat-stepper-vertical';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatStepperHarness` that meets
   * certain criteria.
   * @param options Options for filtering which stepper instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: StepperHarnessFilters = {}): HarnessPredicate<MatStepperHarness> {
    return new HarnessPredicate(MatStepperHarness, options)
        .addOption('orientation', options.orientation,
            async (harness, orientation) => (await harness.getOrientation()) === orientation);
  }

  /**
   * Gets the list of steps in the stepper.
   * @param filter Optionally filters which steps are included.
   */
  async getSteps(filter: StepHarnessFilters = {}): Promise<MatStepHarness[]> {
    return this.locatorForAll(MatStepHarness.with(filter))();
  }

  /** Gets the orientation of the stepper. */
  async getOrientation(): Promise<StepperOrientation> {
    const host = await this.host();
    return (await host.hasClass('mat-stepper-horizontal')) ?
        StepperOrientation.HORIZONTAL : StepperOrientation.VERTICAL;
  }

  /**
   * Selects a step in this stepper.
   * @param filter An optional filter to apply to the child steps. The first step matching the
   *    filter will be selected.
   */
  async selectStep(filter: StepHarnessFilters = {}): Promise<void> {
    const steps = await this.getSteps(filter);
    if (!steps.length) {
      throw Error(`Cannot find mat-step matching filter ${JSON.stringify(filter)}`);
    }
    await steps[0].select();
  }
}
