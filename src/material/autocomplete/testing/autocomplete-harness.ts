/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {
  MatOptgroupHarness,
  MatOptionHarness,
  OptgroupHarnessFilters,
  OptionHarnessFilters
} from '@angular/material/core/testing';
import {AutocompleteHarnessFilters} from './autocomplete-harness-filters';

/** Selector for the autocomplete panel. */
const PANEL_SELECTOR = '.mat-autocomplete-panel';

/** Harness for interacting with a standard mat-autocomplete in tests. */
export class MatAutocompleteHarness extends ComponentHarness {
  private _documentRootLocator = this.documentRootLocatorFactory();
  private _optionalPanel = this._documentRootLocator.locatorForOptional(PANEL_SELECTOR);

  /** The selector for the host element of a `MatAutocomplete` instance. */
  static hostSelector = '.mat-autocomplete-trigger';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatAutocompleteHarness` that meets
   * certain criteria.
   * @param options Options for filtering which autocomplete instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: AutocompleteHarnessFilters = {}): HarnessPredicate<MatAutocompleteHarness> {
    return new HarnessPredicate(MatAutocompleteHarness, options)
        .addOption('value', options.value,
            (harness, value) => HarnessPredicate.stringMatches(harness.getValue(), value));
  }

  /** Gets the value of the autocomplete input. */
  async getValue(): Promise<string> {
    return (await this.host()).getProperty('value');
  }

  /** Whether the autocomplete input is disabled. */
  async isDisabled(): Promise<boolean> {
    const disabled = (await this.host()).getAttribute('disabled');
    return coerceBooleanProperty(await disabled);
  }

  /** Focuses the autocomplete input. */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /** Blurs the autocomplete input. */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }

  /** Enters text into the autocomplete. */
  async enterText(value: string): Promise<void> {
    return (await this.host()).sendKeys(value);
  }

  /** Gets the options inside the autocomplete panel. */
  async getOptions(filters: Omit<OptionHarnessFilters, 'ancestor'> = {}):
    Promise<MatOptionHarness[]> {
    return this._documentRootLocator.locatorForAll(MatOptionHarness.with({
      ...filters,
      ancestor: PANEL_SELECTOR
    }))();
  }

  /** Gets the option groups inside the autocomplete panel. */
  async getOptionGroups(filters: Omit<OptgroupHarnessFilters, 'ancestor'> = {}):
    Promise<MatOptgroupHarness[]> {
    return this._documentRootLocator.locatorForAll(MatOptgroupHarness.with({
      ...filters,
      ancestor: PANEL_SELECTOR
    }))();
  }

  /** Selects the first option matching the given filters. */
  async selectOption(filters: OptionHarnessFilters): Promise<void> {
    await this.focus(); // Focus the input to make sure the autocomplete panel is shown.
    const options = await this.getOptions(filters);
    if (!options.length) {
      throw Error(`Could not find a mat-option matching ${JSON.stringify(filters)}`);
    }
    await options[0].click();
  }

  /** Whether the autocomplete is open. */
  async isOpen(): Promise<boolean> {
    const panel = await this._optionalPanel();
    return !!panel && await panel.hasClass('mat-autocomplete-visible');
  }
}
