/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ContentContainerComponentHarness,
  HarnessPredicate,
  HarnessLoader,
} from '@angular/cdk/testing';
import {StepHarnessFilters} from './step-harness-filters';

/** Harness for interacting with a standard Angular Material step in tests. */
export class MatStepHarness extends ContentContainerComponentHarness<string> {
  /** The selector for the host element of a `MatStep` instance. */
  static hostSelector = '.mat-step-header';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatStepHarness` that meets
   * certain criteria.
   * @param options Options for filtering which steps are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: StepHarnessFilters = {}): HarnessPredicate<MatStepHarness> {
    return new HarnessPredicate(MatStepHarness, options)
      .addOption('label', options.label, (harness, label) =>
        HarnessPredicate.stringMatches(harness.getLabel(), label),
      )
      .addOption(
        'selected',
        options.selected,
        async (harness, selected) => (await harness.isSelected()) === selected,
      )
      .addOption(
        'completed',
        options.completed,
        async (harness, completed) => (await harness.isCompleted()) === completed,
      )
      .addOption(
        'invalid',
        options.invalid,
        async (harness, invalid) => (await harness.hasErrors()) === invalid,
      );
  }

  /** Gets the label of the step. */
  async getLabel(): Promise<string> {
    return (await this.locatorFor('.mat-step-text-label')()).text();
  }

  /** Gets the `aria-label` of the step. */
  async getAriaLabel(): Promise<string | null> {
    return (await this.host()).getAttribute('aria-label');
  }

  /** Gets the value of the `aria-labelledby` attribute. */
  async getAriaLabelledby(): Promise<string | null> {
    return (await this.host()).getAttribute('aria-labelledby');
  }

  /** Whether the step is selected. */
  async isSelected(): Promise<boolean> {
    const host = await this.host();
    return (await host.getAttribute('aria-selected')) === 'true';
  }

  /** Whether the step has been filled out. */
  async isCompleted(): Promise<boolean> {
    const state = await this._getIconState();
    return state === 'done' || (state === 'edit' && !(await this.isSelected()));
  }

  /**
   * Whether the step is currently showing its error state. Note that this doesn't mean that there
   * are or aren't any invalid form controls inside the step, but that the step is showing its
   * error-specific styling which depends on there being invalid controls, as well as the
   * `ErrorStateMatcher` determining that an error should be shown and that the `showErrors`
   * option was enabled through the `STEPPER_GLOBAL_OPTIONS` injection token.
   */
  async hasErrors(): Promise<boolean> {
    return (await this._getIconState()) === 'error';
  }

  /** Whether the step is optional. */
  async isOptional(): Promise<boolean> {
    // If the node with the optional text is present, it means that the step is optional.
    const optionalNode = await this.locatorForOptional('.mat-step-optional')();
    return !!optionalNode;
  }

  /**
   * Selects the given step by clicking on the label. The step may not be selected
   * if the stepper doesn't allow it (e.g. if there are validation errors).
   */
  async select(): Promise<void> {
    await (await this.host()).click();
  }

  protected override async getRootHarnessLoader(): Promise<HarnessLoader> {
    const contentId = await (await this.host()).getAttribute('aria-controls');
    return this.documentRootLocatorFactory().harnessLoaderFor(`#${contentId}`);
  }

  /**
   * Gets the state of the step. Note that we have a `StepState` which we could use to type the
   * return value, but it's basically the same as `string`, because the type has `| string`.
   */
  private async _getIconState(): Promise<string> {
    // The state is exposed on the icon with a class that looks like `mat-step-icon-state-{{state}}`
    const icon = await this.locatorFor('.mat-step-icon')();
    const classes = (await icon.getAttribute('class'))!;
    const match = classes.match(/mat-step-icon-state-([a-z]+)/);

    if (!match) {
      throw Error(`Could not determine step state from "${classes}".`);
    }

    return match[1];
  }
}
