/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate, TestElement} from '@angular/cdk-experimental/testing';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {AutocompleteHarnessFilters} from './autocomplete-harness-filters';

/** Selector for the autocomplete panel. */
const PANEL_SELECTOR = '.mat-autocomplete-panel';

/**
 * Harness for interacting with a standard mat-autocomplete in tests.
 * @dynamic
 */
export class MatAutocompleteHarness extends ComponentHarness {
  private _documentRootLocator = this.documentRootLocatorFactory();
  private _panel = this._documentRootLocator.locatorFor(PANEL_SELECTOR);
  private _optionalPanel = this._documentRootLocator.locatorForOptional(PANEL_SELECTOR);
  private _options = this._documentRootLocator.locatorForAll(`${PANEL_SELECTOR} .mat-option`);
  private _groups = this._documentRootLocator.locatorForAll(`${PANEL_SELECTOR} .mat-optgroup`);

  static hostSelector = '.mat-autocomplete-trigger';

  /**
   * Gets a `HarnessPredicate` that can be used to search for an autocomplete with
   * specific attributes.
   * @param options Options for narrowing the search:
   *   - `name` finds an autocomplete with a specific name.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: AutocompleteHarnessFilters = {}): HarnessPredicate<MatAutocompleteHarness> {
    return new HarnessPredicate(MatAutocompleteHarness)
        .addOption('name', options.name,
            async (harness, name) => (await harness.getAttribute('name')) === name)
        .addOption('id', options.id,
             async (harness, id) => (await harness.getAttribute('id')) === id);
  }

  async getAttribute(attributeName: string): Promise<string|null> {
    return (await this.host()).getAttribute(attributeName);
  }

  /** Gets a boolean promise indicating if the autocomplete input is disabled. */
  async isDisabled(): Promise<boolean> {
    const disabled = (await this.host()).getAttribute('disabled');
    return coerceBooleanProperty(await disabled);
  }

  /** Gets a promise for the autocomplete's text. */
  async getText(): Promise<string> {
    return (await this.host()).getProperty('value');
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

  /** Gets the autocomplete panel. */
  async getPanel(): Promise<TestElement> {
    return this._panel();
  }

  /** Gets the options inside the autocomplete panel. */
  async getOptions(): Promise<TestElement[]> {
    return this._options();
  }

  /** Gets the groups of options inside the panel. */
  async getOptionGroups(): Promise<TestElement[]> {
    return this._groups();
  }

  /** Gets whether the autocomplete panel is visible. */
  async isPanelVisible(): Promise<boolean> {
    return (await this._panel()).hasClass('mat-autocomplete-visible');
  }

  /** Gets whether the autocomplete is open. */
  async isOpen(): Promise<boolean> {
    return !!(await this._optionalPanel());
  }
}
