/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate, parallel} from '@angular/cdk/testing';
import {
  MatDatepickerInputHarness,
  MatDateRangeInputHarness,
} from '@angular/material/datepicker/testing';
import {
  FormFieldHarnessFilters,
  _MatFormFieldHarnessBase,
} from '@angular/material/form-field/testing';
import {MatLegacyInputHarness} from '@angular/material/legacy-input/testing';
import {MatLegacySelectHarness} from '@angular/material/legacy-select/testing';
import {MatLegacyErrorHarness} from './error-harness';

// TODO(devversion): support support chip list harness
/**
 * Possible harnesses of controls which can be bound to a form-field.
 * @deprecated Use `FormFieldControlHarness` from `@angular/material/form-field/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export type LegacyFormFieldControlHarness =
  | MatLegacyInputHarness
  | MatLegacySelectHarness
  | MatDatepickerInputHarness
  | MatDateRangeInputHarness;

/**
 * Harness for interacting with a standard Material form-field's in tests.
 * @deprecated Use `MatFormFieldHarness` from `@angular/material/form-field/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export class MatLegacyFormFieldHarness extends _MatFormFieldHarnessBase<
  LegacyFormFieldControlHarness,
  typeof MatLegacyErrorHarness
> {
  static hostSelector = '.mat-form-field';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatFormFieldHarness` that meets
   * certain criteria.
   * @param options Options for filtering which form field instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: FormFieldHarnessFilters = {}): HarnessPredicate<MatLegacyFormFieldHarness> {
    return new HarnessPredicate(MatLegacyFormFieldHarness, options)
      .addOption('floatingLabelText', options.floatingLabelText, async (harness, text) =>
        HarnessPredicate.stringMatches(await harness.getLabel(), text),
      )
      .addOption(
        'hasErrors',
        options.hasErrors,
        async (harness, hasErrors) => (await harness.hasErrors()) === hasErrors,
      );
  }

  protected _prefixContainer = this.locatorForOptional('.mat-form-field-prefix');
  protected _suffixContainer = this.locatorForOptional('.mat-form-field-suffix');
  protected _label = this.locatorForOptional('.mat-form-field-label');
  protected _errors = this.locatorForAll('.mat-error');
  protected _hints = this.locatorForAll('mat-hint, .mat-hint');
  protected _inputControl = this.locatorForOptional(MatLegacyInputHarness);
  protected _selectControl = this.locatorForOptional(MatLegacySelectHarness);
  protected _datepickerInputControl = this.locatorForOptional(MatDatepickerInputHarness);
  protected _dateRangeInputControl = this.locatorForOptional(MatDateRangeInputHarness);
  protected _errorHarness = MatLegacyErrorHarness;

  /** Gets the appearance of the form-field. */
  async getAppearance(): Promise<'legacy' | 'standard' | 'fill' | 'outline'> {
    const hostClasses = await (await this.host()).getAttribute('class');
    if (hostClasses !== null) {
      const appearanceMatch = hostClasses.match(
        /mat-form-field-appearance-(legacy|standard|fill|outline)(?:$| )/,
      );
      if (appearanceMatch) {
        return appearanceMatch[1] as 'legacy' | 'standard' | 'fill' | 'outline';
      }
    }
    throw Error('Could not determine appearance of form-field.');
  }

  /** Whether the form-field has a label. */
  async hasLabel(): Promise<boolean> {
    return (await this.host()).hasClass('mat-form-field-has-label');
  }

  /** Whether the label is currently floating. */
  async isLabelFloating(): Promise<boolean> {
    const host = await this.host();
    const [hasLabel, shouldFloat] = await parallel(() => [
      this.hasLabel(),
      host.hasClass('mat-form-field-should-float'),
    ]);
    // If there is no label, the label conceptually can never float. The `should-float` class
    // is just always set regardless of whether the label is displayed or not.
    return hasLabel && shouldFloat;
  }
}
