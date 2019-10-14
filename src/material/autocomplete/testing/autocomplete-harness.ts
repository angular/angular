/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {AutocompleteHarnessFilters} from './autocomplete-harness-filters';
import {
  MatAutocompleteOptionGroupHarness,
  MatAutocompleteOptionHarness,
  OptionGroupHarnessFilters,
  OptionHarnessFilters
} from './option-harness';

/** Selector for the autocomplete panel. */
const PANEL_SELECTOR = '.mat-autocomplete-panel';

/**
 * Harness for interacting with a standard mat-autocomplete in tests.
 * @dynamic
 */
export class MatAutocompleteHarness extends ComponentHarness {
  private _documentRootLocator = this.documentRootLocatorFactory();
  private _optionalPanel = this._documentRootLocator.locatorForOptional(PANEL_SELECTOR);

  static hostSelector = '.mat-autocomplete-trigger';

  /**
   * Gets a `HarnessPredicate` that can be used to search for an autocomplete with
   * specific attributes.
   * @param options Options for narrowing the search:
   *   - `name` finds an autocomplete with a specific name.
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

  /** Gets a boolean promise indicating if the autocomplete input is disabled. */
  async isDisabled(): Promise<boolean> {
    const disabled = (await this.host()).getAttribute('disabled');
    return coerceBooleanProperty(await disabled);
  }

  /** Focuses the input and returns a void promise that indicates when the action is complete. */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /** Blurs the input and returns a void promise that indicates when the action is complete. */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }

  /** Enters text into the autocomplete. */
  async enterText(value: string): Promise<void> {
    return (await this.host()).sendKeys(value);
  }

  /** Gets the options inside the autocomplete panel. */
  async getOptions(filters: OptionHarnessFilters = {}): Promise<MatAutocompleteOptionHarness[]> {
    return this._documentRootLocator.locatorForAll(MatAutocompleteOptionHarness.with(filters))();
  }

  /** Gets the groups of options inside the panel. */
  async getOptionGroups(filters: OptionGroupHarnessFilters = {}):
      Promise<MatAutocompleteOptionGroupHarness[]> {
    return this._documentRootLocator.locatorForAll(
        MatAutocompleteOptionGroupHarness.with(filters))();
  }

  /** Selects the first option matching the given filters. */
  async selectOption(filters: OptionHarnessFilters): Promise<void> {
    await this.focus(); // Focus the input to make sure the autocomplete panel is shown.
    const options = await this.getOptions(filters);
    if (!options.length) {
      throw Error(`Could not find a mat-option matching ${JSON.stringify(filters)}`);
    }
    await options[0].select();
  }

  /** Gets whether the autocomplete is open. */
  async isOpen(): Promise<boolean> {
    const panel = await this._optionalPanel();
    return !!panel && await panel.hasClass('mat-autocomplete-visible');
  }
}
