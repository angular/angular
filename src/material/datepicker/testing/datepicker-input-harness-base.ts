/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarnessConstructor, HarnessPredicate} from '@angular/cdk/testing';
import {MatFormFieldControlHarness} from '@angular/material/form-field/testing/control';
import {DatepickerInputHarnessFilters} from './datepicker-harness-filters';

/** Sets up the filter predicates for a datepicker input harness. */
export function getInputPredicate<T extends MatDatepickerInputHarnessBase>(
  type: ComponentHarnessConstructor<T>,
  options: DatepickerInputHarnessFilters,
): HarnessPredicate<T> {
  return new HarnessPredicate(type, options)
    .addOption('value', options.value, (harness, value) => {
      return HarnessPredicate.stringMatches(harness.getValue(), value);
    })
    .addOption('placeholder', options.placeholder, (harness, placeholder) => {
      return HarnessPredicate.stringMatches(harness.getPlaceholder(), placeholder);
    });
}

/** Base class for datepicker input harnesses. */
export abstract class MatDatepickerInputHarnessBase extends MatFormFieldControlHarness {
  /** Whether the input is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await this.host()).getProperty<boolean>('disabled');
  }

  /** Whether the input is required. */
  async isRequired(): Promise<boolean> {
    return (await this.host()).getProperty<boolean>('required');
  }

  /** Gets the value of the input. */
  async getValue(): Promise<string> {
    // The "value" property of the native input is always defined.
    return await (await this.host()).getProperty<string>('value');
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

    await inputEl.dispatchEvent('change');
  }

  /** Gets the placeholder of the input. */
  async getPlaceholder(): Promise<string> {
    return await (await this.host()).getProperty<string>('placeholder');
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

  /** Gets the formatted minimum date for the input's value. */
  async getMin(): Promise<string | null> {
    return (await this.host()).getAttribute('min');
  }

  /** Gets the formatted maximum date for the input's value. */
  async getMax(): Promise<string | null> {
    return (await this.host()).getAttribute('max');
  }
}
