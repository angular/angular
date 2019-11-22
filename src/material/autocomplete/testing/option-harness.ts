/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate, BaseHarnessFilters} from '@angular/cdk/testing';

// TODO(crisbeto): combine these with the ones in `mat-select`
// and expand to cover all states once we have experimental/core.

/**
 * A set of criteria that can be used to filter a list of `MatAutocompleteOptionHarness` instances
 */
export interface OptionHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose text matches the given value. */
  text?: string | RegExp;
}

/**
 * A set of criteria that can be used to filter a list of `MatAutocompleteOptionGroupHarness`
 * instances.
 */
export interface OptionGroupHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose label text matches the given value. */
  labelText?: string | RegExp;
}

/** Harness for interacting with a the `mat-option` for a `mat-autocomplete` in tests. */
export class MatAutocompleteOptionHarness extends ComponentHarness {
  /** The selector for the host element of an autocomplete `MatOption` instance. */
  static hostSelector = '.mat-autocomplete-panel .mat-option';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatAutocompleteOptionHarness` that
   * meets certain criteria.
   * @param options Options for filtering which option instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: OptionHarnessFilters = {}) {
    return new HarnessPredicate(MatAutocompleteOptionHarness, options)
        .addOption('text', options.text,
            (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text));
  }

  /** Clicks the option. */
  async select(): Promise<void> {
    return (await this.host()).click();
  }

  /** Gets the option's label text. */
  async getText(): Promise<string> {
    return (await this.host()).text();
  }
}

/** Harness for interacting with a the `mat-optgroup` for a `mat-autocomplete` in tests. */
export class MatAutocompleteOptionGroupHarness extends ComponentHarness {
  private _label = this.locatorFor('.mat-optgroup-label');

  /** The selector for the host element of an autocomplete `MatOptionGroup` instance. */
  static hostSelector = '.mat-autocomplete-panel .mat-optgroup';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatAutocompleteOptionGroupHarness`
   * that meets certain criteria.
   * @param options Options for filtering which option group instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: OptionGroupHarnessFilters = {}) {
    return new HarnessPredicate(MatAutocompleteOptionGroupHarness, options)
        .addOption('labelText', options.labelText,
            (harness, label) => HarnessPredicate.stringMatches(harness.getLabelText(), label));
  }

  /** Gets the option group's label text. */
  async getLabelText(): Promise<string> {
    return (await this._label()).text();
  }
}
