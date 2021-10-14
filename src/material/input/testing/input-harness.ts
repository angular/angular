/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate, parallel} from '@angular/cdk/testing';
import {MatFormFieldControlHarness} from '@angular/material/form-field/testing/control';
import {InputHarnessFilters} from './input-harness-filters';

/** Harness for interacting with a standard Material inputs in tests. */
export class MatInputHarness extends MatFormFieldControlHarness {
  // TODO: We do not want to handle `select` elements with `matNativeControl` because
  // not all methods of this harness work reasonably for native select elements.
  // For more details. See: https://github.com/angular/components/pull/18221.
  static hostSelector = '[matInput], input[matNativeControl], textarea[matNativeControl]';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatInputHarness` that meets
   * certain criteria.
   * @param options Options for filtering which input instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: InputHarnessFilters = {}): HarnessPredicate<MatInputHarness> {
    return new HarnessPredicate(MatInputHarness, options)
      .addOption('value', options.value, (harness, value) => {
        return HarnessPredicate.stringMatches(harness.getValue(), value);
      })
      .addOption('placeholder', options.placeholder, (harness, placeholder) => {
        return HarnessPredicate.stringMatches(harness.getPlaceholder(), placeholder);
      });
  }

  /** Whether the input is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await this.host()).getProperty<boolean>('disabled');
  }

  /** Whether the input is required. */
  async isRequired(): Promise<boolean> {
    return (await this.host()).getProperty<boolean>('required');
  }

  /** Whether the input is readonly. */
  async isReadonly(): Promise<boolean> {
    return (await this.host()).getProperty<boolean>('readOnly');
  }

  /** Gets the value of the input. */
  async getValue(): Promise<string> {
    // The "value" property of the native input is never undefined.
    return await (await this.host()).getProperty<string>('value');
  }

  /** Gets the name of the input. */
  async getName(): Promise<string> {
    // The "name" property of the native input is never undefined.
    return await (await this.host()).getProperty<string>('name');
  }

  /**
   * Gets the type of the input. Returns "textarea" if the input is
   * a textarea.
   */
  async getType(): Promise<string> {
    // The "type" property of the native input is never undefined.
    return await (await this.host()).getProperty<string>('type');
  }

  /** Gets the placeholder of the input. */
  async getPlaceholder(): Promise<string> {
    const host = await this.host();
    const [nativePlaceholder, fallback] = await parallel(() => [
      host.getProperty('placeholder'),
      host.getAttribute('data-placeholder'),
    ]);
    return nativePlaceholder || fallback || '';
  }

  /** Gets the id of the input. */
  async getId(): Promise<string> {
    // The input directive always assigns a unique id to the input in
    // case no id has been explicitly specified.
    return await (await this.host()).getProperty<string>('id');
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

  /** Whether the input is focused. */
  async isFocused(): Promise<boolean> {
    return (await this.host()).isFocused();
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

    // Some input types won't respond to key presses (e.g. `color`) so to be sure that the
    // value is set, we also set the property after the keyboard sequence. Note that we don't
    // want to do it before, because it can cause the value to be entered twice.
    await inputEl.setInputValue(newValue);
  }
}
