/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate} from '@angular/cdk/testing';
import {
  RadioButtonHarnessFilters,
  RadioGroupHarnessFilters,
  _MatRadioGroupHarnessBase,
  _MatRadioButtonHarnessBase,
} from '@angular/material/radio/testing';

/** Harness for interacting with an MDC-based mat-radio-group in tests. */
export class MatRadioGroupHarness extends _MatRadioGroupHarnessBase<
  typeof MatRadioButtonHarness,
  MatRadioButtonHarness,
  RadioButtonHarnessFilters
> {
  /** The selector for the host element of a `MatRadioGroup` instance. */
  static hostSelector = '.mat-mdc-radio-group';
  protected _buttonClass = MatRadioButtonHarness;

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatRadioGroupHarness` that meets
   * certain criteria.
   * @param options Options for filtering which radio group instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: RadioGroupHarnessFilters = {}): HarnessPredicate<MatRadioGroupHarness> {
    return new HarnessPredicate<MatRadioGroupHarness>(MatRadioGroupHarness, options).addOption(
      'name',
      options.name,
      this._checkRadioGroupName,
    );
  }
}

/** Harness for interacting with an MDC-based mat-radio-button in tests. */
export class MatRadioButtonHarness extends _MatRadioButtonHarnessBase {
  /** The selector for the host element of a `MatRadioButton` instance. */
  static hostSelector = '.mat-mdc-radio-button';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatRadioButtonHarness` that meets
   * certain criteria.
   * @param options Options for filtering which radio button instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: RadioButtonHarnessFilters = {}): HarnessPredicate<MatRadioButtonHarness> {
    return new HarnessPredicate<MatRadioButtonHarness>(MatRadioButtonHarness, options)
      .addOption('label', options.label, (harness, label) =>
        HarnessPredicate.stringMatches(harness.getLabelText(), label),
      )
      .addOption('name', options.name, async (harness, name) => (await harness.getName()) === name)
      .addOption(
        'checked',
        options.checked,
        async (harness, checked) => (await harness.isChecked()) == checked,
      );
  }

  protected _textLabel = this.locatorFor('label');
  protected _clickLabel = this._textLabel;
}
