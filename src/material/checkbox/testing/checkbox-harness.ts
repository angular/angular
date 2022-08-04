/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AsyncFactoryFn,
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessPredicate,
  TestElement,
} from '@angular/cdk/testing';
import {CheckboxHarnessFilters} from './checkbox-harness-filters';
import {coerceBooleanProperty} from '@angular/cdk/coercion';

export abstract class _MatCheckboxHarnessBase extends ComponentHarness {
  protected abstract _input: AsyncFactoryFn<TestElement>;
  protected abstract _label: AsyncFactoryFn<TestElement>;

  /** Whether the checkbox is checked. */
  async isChecked(): Promise<boolean> {
    const checked = (await this._input()).getProperty<boolean>('checked');
    return coerceBooleanProperty(await checked);
  }

  /** Whether the checkbox is in an indeterminate state. */
  async isIndeterminate(): Promise<boolean> {
    const indeterminate = (await this._input()).getProperty<string>('indeterminate');
    return coerceBooleanProperty(await indeterminate);
  }

  /** Whether the checkbox is disabled. */
  async isDisabled(): Promise<boolean> {
    const disabled = (await this._input()).getAttribute('disabled');
    return coerceBooleanProperty(await disabled);
  }

  /** Whether the checkbox is required. */
  async isRequired(): Promise<boolean> {
    const required = (await this._input()).getProperty<boolean>('required');
    return coerceBooleanProperty(await required);
  }

  /** Whether the checkbox is valid. */
  async isValid(): Promise<boolean> {
    const invalid = (await this.host()).hasClass('ng-invalid');
    return !(await invalid);
  }

  /** Gets the checkbox's name. */
  async getName(): Promise<string | null> {
    return (await this._input()).getAttribute('name');
  }

  /** Gets the checkbox's value. */
  async getValue(): Promise<string | null> {
    return (await this._input()).getProperty<string | null>('value');
  }

  /** Gets the checkbox's aria-label. */
  async getAriaLabel(): Promise<string | null> {
    return (await this._input()).getAttribute('aria-label');
  }

  /** Gets the checkbox's aria-labelledby. */
  async getAriaLabelledby(): Promise<string | null> {
    return (await this._input()).getAttribute('aria-labelledby');
  }

  /** Gets the checkbox's label text. */
  async getLabelText(): Promise<string> {
    return (await this._label()).text();
  }

  /** Focuses the checkbox. */
  async focus(): Promise<void> {
    return (await this._input()).focus();
  }

  /** Blurs the checkbox. */
  async blur(): Promise<void> {
    return (await this._input()).blur();
  }

  /** Whether the checkbox is focused. */
  async isFocused(): Promise<boolean> {
    return (await this._input()).isFocused();
  }

  /**
   * Toggles the checked state of the checkbox.
   *
   * Note: This attempts to toggle the checkbox as a user would, by clicking it. Therefore if you
   * are using `MAT_CHECKBOX_DEFAULT_OPTIONS` to change the behavior on click, calling this method
   * might not have the expected result.
   */
  abstract toggle(): Promise<void>;

  /**
   * Puts the checkbox in a checked state by toggling it if it is currently unchecked, or doing
   * nothing if it is already checked.
   *
   * Note: This attempts to check the checkbox as a user would, by clicking it. Therefore if you
   * are using `MAT_CHECKBOX_DEFAULT_OPTIONS` to change the behavior on click, calling this method
   * might not have the expected result.
   */
  async check(): Promise<void> {
    if (!(await this.isChecked())) {
      await this.toggle();
    }
  }

  /**
   * Puts the checkbox in an unchecked state by toggling it if it is currently checked, or doing
   * nothing if it is already unchecked.
   *
   * Note: This attempts to uncheck the checkbox as a user would, by clicking it. Therefore if you
   * are using `MAT_CHECKBOX_DEFAULT_OPTIONS` to change the behavior on click, calling this method
   * might not have the expected result.
   */
  async uncheck(): Promise<void> {
    if (await this.isChecked()) {
      await this.toggle();
    }
  }
}

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
