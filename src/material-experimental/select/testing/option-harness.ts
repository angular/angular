/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate, BaseHarnessFilters} from '@angular/cdk/testing';

// TODO(crisbeto): combine these with the ones in `mat-autocomplete`
// and expand to cover all states once we have experimental/core.

export interface OptionHarnessFilters extends BaseHarnessFilters {
  text?: string;
}

export interface OptionGroupHarnessFilters extends BaseHarnessFilters {
  labelText?: string;
}

/**
 * Harness for interacting with a the `mat-option` for a `mat-select` in tests.
 * @dynamic
 */
export class MatSelectOptionHarness extends ComponentHarness {
  // TODO(crisbeto): things to add here when adding a common option harness:
  // - isDisabled
  // - isSelected
  // - isActive
  // - isMultiple

  static with(options: OptionHarnessFilters = {}) {
    return new HarnessPredicate(MatSelectOptionHarness, options)
        .addOption('text', options.text,
            async (harness, title) =>
                HarnessPredicate.stringMatches(await harness.getText(), title));
  }

  static hostSelector = '.mat-select-panel .mat-option';

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
 * Harness for interacting with a the `mat-optgroup` for a `mat-select` in tests.
 * @dynamic
 */
export class MatSelectOptionGroupHarness extends ComponentHarness {
  private _label = this.locatorFor('.mat-optgroup-label');
  static hostSelector = '.mat-select-panel .mat-optgroup';

  static with(options: OptionGroupHarnessFilters = {}) {
    return new HarnessPredicate(MatSelectOptionGroupHarness, options)
        .addOption('labelText', options.labelText,
            async (harness, title) =>
                HarnessPredicate.stringMatches(await harness.getLabelText(), title));
  }

  /** Gets a promise for the option group's label text. */
  async getLabelText(): Promise<string> {
    return (await this._label()).text();
  }
}

