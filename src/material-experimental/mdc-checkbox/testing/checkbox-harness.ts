/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarnessConstructor, HarnessPredicate} from '@angular/cdk/testing';
import {CheckboxHarnessFilters, _MatCheckboxHarnessBase} from '@angular/material/checkbox/testing';

/** Harness for interacting with a MDC-based mat-checkbox in tests. */
export class MatCheckboxHarness extends _MatCheckboxHarnessBase {
  static hostSelector = '.mat-mdc-checkbox';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a checkbox with specific attributes.
   * @param options Options for narrowing the search:
   *   - `selector` finds a checkbox whose host element matches the given selector.
   *   - `label` finds a checkbox with specific label text.
   *   - `name` finds a checkbox with specific name.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatCheckboxHarness>(
    this: ComponentHarnessConstructor<T>,
    options: CheckboxHarnessFilters = {},
  ): HarnessPredicate<T> {
    return (
      new HarnessPredicate(this, options)
        .addOption('label', options.label, (harness, label) =>
          HarnessPredicate.stringMatches(harness.getLabelText(), label),
        )
        // We want to provide a filter option for "name" because the name of the checkbox is
        // only set on the underlying input. This means that it's not possible for developers
        // to retrieve the harness of a specific checkbox with name through a CSS selector.
        .addOption(
          'name',
          options.name,
          async (harness, name) => (await harness.getName()) === name,
        )
        .addOption(
          'checked',
          options.checked,
          async (harness, checked) => (await harness.isChecked()) == checked,
        )
    );
  }

  protected _input = this.locatorFor('input');
  protected _label = this.locatorFor('label');
  private _inputContainer = this.locatorFor('.mdc-checkbox');

  async toggle(): Promise<void> {
    const elToClick = (await this.isDisabled()) ? this._inputContainer() : this._input();
    return (await elToClick).click();
  }
}
