/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate, TestElement} from '@angular/cdk-experimental/testing';
import {SelectHarnessFilters} from './select-harness-filters';

/** Selector for the select panel. */
const PANEL_SELECTOR = '.mat-select-panel';

/**
 * Harness for interacting with a standard mat-select in tests.
 * @dynamic
 */
export class MatSelectHarness extends ComponentHarness {
  private _documentRootLocator = this.documentRootLocatorFactory();
  private _panel = this._documentRootLocator.locatorFor(PANEL_SELECTOR);
  private _backdrop = this._documentRootLocator.locatorFor('.cdk-overlay-backdrop');
  private _optionalPanel = this._documentRootLocator.locatorForOptional(PANEL_SELECTOR);
  private _options = this._documentRootLocator.locatorForAll(`${PANEL_SELECTOR} .mat-option`);
  private _groups = this._documentRootLocator.locatorForAll(`${PANEL_SELECTOR} .mat-optgroup`);
  private _trigger = this.locatorFor('.mat-select-trigger');
  private _value = this.locatorFor('.mat-select-value');

  static hostSelector = '.mat-select';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a select with
   * specific attributes.
   * @param options Options for narrowing the search.
   * @return `HarnessPredicate` configured with the given options.
   */
  static with(options: SelectHarnessFilters = {}): HarnessPredicate<MatSelectHarness> {
    return new HarnessPredicate(MatSelectHarness)
        .addOption('id', options.id, async (harness, id) => {
          const harnessId = (await harness.host()).getAttribute('id');
          return (await harnessId) === id;
        });
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

  /** Gets the select panel. */
  async getPanel(): Promise<TestElement> {
    return this._panel();
  }

  /** Gets the options inside the select panel. */
  async getOptions(): Promise<TestElement[]> {
    return this._options();
  }

  /** Gets the groups of options inside the panel. */
  async getOptionGroups(): Promise<TestElement[]> {
    return this._groups();
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
