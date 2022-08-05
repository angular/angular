/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate, ComponentHarness, TestKey} from '@angular/cdk/testing';
import {ChipInputHarnessFilters} from './chip-harness-filters';

/** Harness for interacting with a standard Material chip inputs in tests. */
export class MatLegacyChipInputHarness extends ComponentHarness {
  static hostSelector = '.mat-chip-input';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatChipInputHarness` that meets
   * certain criteria.
   * @param options Options for filtering which input instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: ChipInputHarnessFilters = {}): HarnessPredicate<MatLegacyChipInputHarness> {
    return new HarnessPredicate(MatLegacyChipInputHarness, options)
      .addOption('value', options.value, async (harness, value) => {
        return (await harness.getValue()) === value;
      })
      .addOption('placeholder', options.placeholder, async (harness, placeholder) => {
        return (await harness.getPlaceholder()) === placeholder;
      });
  }

  /** Whether the input is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await this.host()).getProperty('disabled')!;
  }

  /** Whether the input is required. */
  async isRequired(): Promise<boolean> {
    return (await this.host()).getProperty('required')!;
  }

  /** Gets the value of the input. */
  async getValue(): Promise<string> {
    // The "value" property of the native input is never undefined.
    return (await (await this.host()).getProperty('value'))!;
  }

  /** Gets the placeholder of the input. */
  async getPlaceholder(): Promise<string> {
    return await (await this.host()).getProperty('placeholder');
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
  }

  /** Sends a chip separator key to the input element. */
  async sendSeparatorKey(key: TestKey | string): Promise<void> {
    const inputEl = await this.host();
    return inputEl.sendKeys(key);
  }
}
