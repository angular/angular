/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate} from '@angular/cdk/testing';
import {
  MatFormFieldControlHarness
} from '@angular/material-experimental/form-field/testing/control';
import {InputHarnessFilters} from './input-harness-filters';

/**
 * Harness for interacting with a standard Material inputs in tests.
 * @dynamic
 */
export class MatInputHarness extends MatFormFieldControlHarness {
  static hostSelector = '[matInput]';

  /**
   * Gets a `HarnessPredicate` that can be used to search for an input with
   * specific attributes.
   * @param options Options for narrowing the search:
   *   - `name` finds an input with specific name.
   *   - `id` finds an input with specific id.
   *   - `value` finds an input with specific value.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: InputHarnessFilters = {}): HarnessPredicate<MatInputHarness> {
    return new HarnessPredicate(MatInputHarness, options)
        .addOption(
            'value', options.value, async (harness, value) => (await harness.getValue()) === value);
  }

  /** Whether the input is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await this.host()).getProperty('disabled')!;
  }

  /** Whether the input is required. */
  async isRequired(): Promise<boolean> {
    return (await this.host()).getProperty('required')!;
  }

  /** Whether the input is readonly. */
  async isReadonly(): Promise<boolean> {
    return (await this.host()).getProperty('readOnly')!;
  }

  /** Gets the value of the input. */
  async getValue(): Promise<string> {
    // The "value" property of the native input is never undefined.
    return (await (await this.host()).getProperty('value'))!;
  }

  /** Gets the name of the input. */
  async getName(): Promise<string> {
    // The "name" property of the native input is never undefined.
    return (await (await this.host()).getProperty('name'))!;
  }

  /**
   * Gets the type of the input. Returns "textarea" if the input is
   * a textarea.
   */
  async getType(): Promise<string> {
    // The "type" property of the native input is never undefined.
    return (await (await this.host()).getProperty('type'))!;
  }

  /** Gets the placeholder of the input. / */
  async getPlaceholder(): Promise<string> {
    // The "placeholder" property of the native input is never undefined.
    return (await (await this.host()).getProperty('placeholder'))!;
  }

  /** Gets the id of the input. */
  async getId(): Promise<string> {
    // The input directive always assigns a unique id to the input in
    // case no id has been explicitly specified.
    return (await (await this.host()).getProperty('id'))!;
  }

  /**
   * Focuses the input and returns a promise that indicates when the
   * action is complete.
   */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /**
   * Blurs the input and returns a promise that indicates when the
   * action is complete.
   */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }

  /**
   * Sets the value of the input. The value will be set by simulating
   * keypresses that correspond to the given value.
   */
  async setValue(newValue: string): Promise<void> {
    const inputEl = await this.host();
    await inputEl.clear();
    // We don't want to send keys for the value if the value is an empty
    // string in order to clear the value. Sending keys with an empty string
    // still results in unnecessary focus events.
    if (newValue) {
      await inputEl.sendKeys(newValue);
    }
  }
}
