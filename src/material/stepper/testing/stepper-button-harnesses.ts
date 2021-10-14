/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {StepperButtonHarnessFilters} from './step-harness-filters';

/** Base class for stepper button harnesses. */
abstract class StepperButtonHarness extends ComponentHarness {
  /** Gets the text of the button. */
  async getText(): Promise<string> {
    return (await this.host()).text();
  }

  /** Clicks the button. */
  async click(): Promise<void> {
    return (await this.host()).click();
  }
}

/** Harness for interacting with a standard Angular Material stepper next button in tests. */
export class MatStepperNextHarness extends StepperButtonHarness {
  /** The selector for the host element of a `MatStep` instance. */
  static hostSelector = '.mat-stepper-next';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatStepperNextHarness` that meets
   * certain criteria.
   * @param options Options for filtering which steps are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: StepperButtonHarnessFilters = {}): HarnessPredicate<MatStepperNextHarness> {
    return new HarnessPredicate(MatStepperNextHarness, options).addOption(
      'text',
      options.text,
      (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text),
    );
  }
}

/** Harness for interacting with a standard Angular Material stepper previous button in tests. */
export class MatStepperPreviousHarness extends StepperButtonHarness {
  /** The selector for the host element of a `MatStep` instance. */
  static hostSelector = '.mat-stepper-previous';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatStepperPreviousHarness`
   * that meets certain criteria.
   * @param options Options for filtering which steps are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(
    options: StepperButtonHarnessFilters = {},
  ): HarnessPredicate<MatStepperPreviousHarness> {
    return new HarnessPredicate(MatStepperPreviousHarness, options).addOption(
      'text',
      options.text,
      (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text),
    );
  }
}
