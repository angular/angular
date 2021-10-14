/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate, parallel} from '@angular/cdk/testing';
import {MatFormFieldControlHarness} from '@angular/material/form-field/testing/control';
import {MatNativeOptionHarness} from './native-option-harness';
import {
  NativeOptionHarnessFilters,
  NativeSelectHarnessFilters,
} from './native-select-harness-filters';

/** Harness for interacting with a native `select` in tests. */
export class MatNativeSelectHarness extends MatFormFieldControlHarness {
  static hostSelector = 'select[matNativeControl]';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatNativeSelectHarness` that meets
   * certain criteria.
   * @param options Options for filtering which select instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: NativeSelectHarnessFilters = {}): HarnessPredicate<MatNativeSelectHarness> {
    return new HarnessPredicate(MatNativeSelectHarness, options);
  }

  /** Gets a boolean promise indicating if the select is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await this.host()).getProperty<boolean>('disabled');
  }

  /** Gets a boolean promise indicating if the select is required. */
  async isRequired(): Promise<boolean> {
    return (await this.host()).getProperty<boolean>('required');
  }

  /** Gets a boolean promise indicating if the select is in multi-selection mode. */
  async isMultiple(): Promise<boolean> {
    return (await this.host()).getProperty<boolean>('multiple');
  }

  /** Gets the name of the select. */
  async getName(): Promise<string> {
    // The "name" property of the native select is never undefined.
    return await (await this.host()).getProperty<string>('name');
  }

  /** Gets the id of the select. */
  async getId(): Promise<string> {
    // We're guaranteed to have an id, because the `matNativeControl` always assigns one.
    return await (await this.host()).getProperty<string>('id');
  }

  /** Focuses the select and returns a void promise that indicates when the action is complete. */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /** Blurs the select and returns a void promise that indicates when the action is complete. */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }

  /** Whether the select is focused. */
  async isFocused(): Promise<boolean> {
    return (await this.host()).isFocused();
  }

  /** Gets the options inside the select panel. */
  async getOptions(filter: NativeOptionHarnessFilters = {}): Promise<MatNativeOptionHarness[]> {
    return this.locatorForAll(MatNativeOptionHarness.with(filter))();
  }

  /**
   * Selects the options that match the passed-in filter. If the select is in multi-selection
   * mode all options will be clicked, otherwise the harness will pick the first matching option.
   */
  async selectOptions(filter: NativeOptionHarnessFilters = {}): Promise<void> {
    const [isMultiple, options] = await parallel(() => {
      return [this.isMultiple(), this.getOptions(filter)];
    });

    if (options.length === 0) {
      throw Error('Select does not have options matching the specified filter');
    }

    const [host, optionIndexes] = await parallel(() => [
      this.host(),
      parallel(() => options.slice(0, isMultiple ? undefined : 1).map(option => option.getIndex())),
    ]);

    await host.selectOptions(...optionIndexes);
  }
}
