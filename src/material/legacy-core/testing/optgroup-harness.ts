/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {OptgroupHarnessFilters} from './optgroup-harness-filters';
import {MatLegacyOptionHarness} from './option-harness';
import {OptionHarnessFilters} from './option-harness-filters';

/** Harness for interacting with a `mat-optgroup` in tests. */
export class MatLegacyOptgroupHarness extends ComponentHarness {
  /** Selector used to locate option group instances. */
  static hostSelector = '.mat-optgroup';
  private _label = this.locatorFor('.mat-optgroup-label');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatOptgroupHarness` that meets
   * certain criteria.
   * @param options Options for filtering which option instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: OptgroupHarnessFilters = {}) {
    return new HarnessPredicate(MatLegacyOptgroupHarness, options).addOption(
      'labelText',
      options.labelText,
      async (harness, title) => HarnessPredicate.stringMatches(await harness.getLabelText(), title),
    );
  }

  /** Gets the option group's label text. */
  async getLabelText(): Promise<string> {
    return (await this._label()).text();
  }

  /** Gets whether the option group is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await this.host()).hasClass('mat-optgroup-disabled');
  }

  /**
   * Gets the options that are inside the group.
   * @param filter Optionally filters which options are included.
   */
  async getOptions(filter: OptionHarnessFilters = {}): Promise<MatLegacyOptionHarness[]> {
    return this.locatorForAll(MatLegacyOptionHarness.with(filter))();
  }
}
