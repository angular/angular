/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarnessConstructor, HarnessPredicate} from '@angular/cdk/testing';
import {
  FormFieldHarnessFilters,
  _MatFormFieldHarnessBase,
} from '@angular/material/form-field/testing';
import {MatInputHarness} from '@angular/material-experimental/mdc-input/testing';
import {MatSelectHarness} from '@angular/material-experimental/mdc-select/testing';
import {
  MatDatepickerInputHarness,
  MatDateRangeInputHarness,
} from '@angular/material/datepicker/testing';

// TODO(devversion): support support chip list harness
/** Possible harnesses of controls which can be bound to a form-field. */
export type FormFieldControlHarness =
  | MatInputHarness
  | MatSelectHarness
  | MatDatepickerInputHarness
  | MatDateRangeInputHarness;

/** Harness for interacting with a MDC-based form-field's in tests. */
export class MatFormFieldHarness extends _MatFormFieldHarnessBase<FormFieldControlHarness> {
  static hostSelector = '.mat-mdc-form-field';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a form field with specific
   * attributes.
   * @param options Options for filtering which form field instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatFormFieldHarness>(
    this: ComponentHarnessConstructor<T>,
    options: FormFieldHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options)
      .addOption('floatingLabelText', options.floatingLabelText, async (harness, text) =>
        HarnessPredicate.stringMatches(await harness.getLabel(), text),
      )
      .addOption(
        'hasErrors',
        options.hasErrors,
        async (harness, hasErrors) => (await harness.hasErrors()) === hasErrors,
      );
  }

  protected _prefixContainer = this.locatorForOptional('.mat-mdc-form-field-text-prefix');
  protected _suffixContainer = this.locatorForOptional('.mat-mdc-form-field-text-suffix');
  protected _label = this.locatorForOptional('.mdc-floating-label');
  protected _errors = this.locatorForAll('.mat-mdc-form-field-error');
  protected _hints = this.locatorForAll('.mat-mdc-form-field-hint');
  protected _inputControl = this.locatorForOptional(MatInputHarness);
  protected _selectControl = this.locatorForOptional(MatSelectHarness);
  protected _datepickerInputControl = this.locatorForOptional(MatDatepickerInputHarness);
  protected _dateRangeInputControl = this.locatorForOptional(MatDateRangeInputHarness);
  private _mdcTextField = this.locatorFor('.mat-mdc-text-field-wrapper');

  /** Gets the appearance of the form-field. */
  async getAppearance(): Promise<'fill' | 'outline'> {
    const textFieldEl = await this._mdcTextField();
    if (await textFieldEl.hasClass('mdc-text-field--outlined')) {
      return 'outline';
    }
    return 'fill';
  }

  /** Whether the form-field has a label. */
  async hasLabel(): Promise<boolean> {
    return (await this._label()) !== null;
  }

  /** Whether the label is currently floating. */
  async isLabelFloating(): Promise<boolean> {
    const labelEl = await this._label();
    return labelEl !== null ? await labelEl.hasClass('mdc-floating-label--float-above') : false;
  }
}
