/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate} from '@angular/cdk/testing';
import {MatFormFieldControlHarness} from '@angular/material/form-field/testing/control';
import {
  MatOptionHarness,
  MatOptgroupHarness,
  OptionHarnessFilters,
  OptgroupHarnessFilters,
} from '@angular/material/core/testing';
import {SelectHarnessFilters} from './select-harness-filters';

const PANEL_SELECTOR = '.mat-select-panel';

/** Harness for interacting with a standard mat-select in tests. */
export class MatSelectHarness extends MatFormFieldControlHarness {
  private _documentRootLocator = this.documentRootLocatorFactory();
  private _backdrop = this._documentRootLocator.locatorFor('.cdk-overlay-backdrop');
  private _optionalPanel = this._documentRootLocator.locatorForOptional(PANEL_SELECTOR);
  private _trigger = this.locatorFor('.mat-select-trigger');
  private _value = this.locatorFor('.mat-select-value');

  static hostSelector = '.mat-select';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatSelectHarness` that meets
   * certain criteria.
   * @param options Options for filtering which select instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: SelectHarnessFilters = {}): HarnessPredicate<MatSelectHarness> {
    return new HarnessPredicate(MatSelectHarness, options);
  }

  /** Gets a boolean promise indicating if the select is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await this.host()).hasClass('mat-select-disabled');
  }

  /** Gets a boolean promise indicating if the select is valid. */
  async isValid(): Promise<boolean> {
    return !(await (await this.host()).hasClass('ng-invalid'));
  }

  /** Gets a boolean promise indicating if the select is required. */
  async isRequired(): Promise<boolean> {
    return (await this.host()).hasClass('mat-select-required');
  }

  /** Gets a boolean promise indicating if the select is empty (no value is selected). */
  async isEmpty(): Promise<boolean> {
    return (await this.host()).hasClass('mat-select-empty');
  }

  /** Gets a boolean promise indicating if the select is in multi-selection mode. */
  async isMultiple(): Promise<boolean> {
    const ariaMultiselectable = (await this.host()).getAttribute('aria-multiselectable');
    return (await ariaMultiselectable) === 'true';
  }

  /** Gets a promise for the select's value text. */
  async getValueText(): Promise<string> {
    return (await this._value()).text();
  }

  /** Focuses the select and returns a void promise that indicates when the action is complete. */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /** Blurs the select and returns a void promise that indicates when the action is complete. */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }

  /** Gets the options inside the select panel. */
  async getOptions(filter: Omit<OptionHarnessFilters, 'ancestor'> = {}):
    Promise<MatOptionHarness[]> {
    return this._documentRootLocator.locatorForAll(MatOptionHarness.with({
      ...filter,
      ancestor: PANEL_SELECTOR
    }))();
  }

  /** Gets the groups of options inside the panel. */
  async getOptionGroups(filter: Omit<OptgroupHarnessFilters, 'ancestor'> = {}):
    Promise<MatOptgroupHarness[]> {
    return this._documentRootLocator.locatorForAll(MatOptgroupHarness.with({
      ...filter,
      ancestor: PANEL_SELECTOR
    }))();
  }

  /** Gets whether the select is open. */
  async isOpen(): Promise<boolean> {
    return !!(await this._optionalPanel());
  }

  /** Opens the select's panel. */
  async open(): Promise<void> {
    if (!await this.isOpen()) {
      return (await this._trigger()).click();
    }
  }

  /**
   * Clicks the options that match the passed-in filter. If the select is in multi-selection
   * mode all options will be clicked, otherwise the harness will pick the first matching option.
   */
  async clickOptions(filter: OptionHarnessFilters = {}): Promise<void> {
    await this.open();

    const [isMultiple, options] = await Promise.all([this.isMultiple(), this.getOptions(filter)]);

    if (options.length === 0) {
      throw Error('Select does not have options matching the specified filter');
    }

    if (isMultiple) {
      await Promise.all(options.map(option => option.click()));
    } else {
      await options[0].click();
    }
  }

  /** Closes the select's panel. */
  async close(): Promise<void> {
    if (await this.isOpen()) {
      // This is the most consistent way that works both in both single and multi-select modes,
      // but it assumes that only one overlay is open at a time. We should be able to make it
      // a bit more precise after #16645 where we can dispatch an ESCAPE press to the host instead.
      return (await this._backdrop()).click();
    }
  }
}
