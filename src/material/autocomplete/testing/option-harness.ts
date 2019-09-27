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

export interface OptionHarnessFilters extends BaseHarnessFilters {
  text?: string;
}

export interface OptionGroupHarnessFilters extends BaseHarnessFilters {
  labelText?: string;
}

/**
 * Harness for interacting with a the `mat-option` for a `mat-autocomplete` in tests.
 * @dynamic
 */
export class MatAutocompleteOptionHarness extends ComponentHarness {
  static hostSelector = '.mat-autocomplete-panel .mat-option';

  static with(options: OptionHarnessFilters = {}) {
    return new HarnessPredicate(MatAutocompleteOptionHarness, options)
        .addOption('text', options.text,
            async (harness, title) =>
                HarnessPredicate.stringMatches(await harness.getText(), title));
  }

  /** Clicks the option. */
  async click(): Promise<void> {
    return (await this.host()).click();
  }

  /** Gets a promise for the option's label text. */
  async getText(): Promise<string> {
    return (await this.host()).text();
  }
}

/**
 * Harness for interacting with a the `mat-optgroup` for a `mat-autocomplete` in tests.
 * @dynamic
 */
export class MatAutocompleteOptionGroupHarness extends ComponentHarness {
  private _label = this.locatorFor('.mat-optgroup-label');
  static hostSelector = '.mat-autocomplete-panel .mat-optgroup';

  static with(options: OptionGroupHarnessFilters = {}) {
    return new HarnessPredicate(MatAutocompleteOptionGroupHarness, options)
        .addOption('labelText', options.labelText,
            async (harness, title) =>
                HarnessPredicate.stringMatches(await harness.getLabelText(), title));
  }

  /** Gets a promise for the option group's label text. */
  async getLabelText(): Promise<string> {
    return (await this._label()).text();
  }
}

