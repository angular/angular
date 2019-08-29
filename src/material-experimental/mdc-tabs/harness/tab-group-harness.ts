/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk-experimental/testing';
import {TabGroupHarnessFilters} from './tab-group-harness-filters';
import {MatTabHarness} from './tab-harness';

/**
 * Harness for interacting with a standard mat-tab-group in tests.
 * @dynamic
 */
export class MatTabGroupHarness extends ComponentHarness {
  static hostSelector = '.mat-tab-group';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a radio-button with
   * specific attributes.
   * @param options Options for narrowing the search
   *   - `selector` finds a tab-group whose host element matches the given selector.
   *   - `selectedTabLabel` finds a tab-group with a selected tab that matches the
   *      specified tab label.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: TabGroupHarnessFilters = {}): HarnessPredicate<MatTabGroupHarness> {
    return new HarnessPredicate(MatTabGroupHarness, options)
        .addOption('selectedTabLabel', options.selectedTabLabel, async (harness, label) => {
          const selectedTab = await harness.getSelectedTab();
          return HarnessPredicate.stringMatches(await selectedTab.getLabel(), label);
        });
  }

  private _tabs = this.locatorForAll(MatTabHarness);

  /** Gets all tabs of the tab group. */
  async getTabs(): Promise<MatTabHarness[]> {
    return this._tabs();
  }

  /** Gets the selected tab of the tab group. */
  async getSelectedTab(): Promise<MatTabHarness> {
    const tabs = await this.getTabs();
    const isSelected = await Promise.all(tabs.map(t => t.isSelected()));
    for (let i = 0; i < tabs.length; i++) {
      if (isSelected[i]) {
        return tabs[i];
      }
    }
    throw new Error('No selected tab could be found.');
  }
}
