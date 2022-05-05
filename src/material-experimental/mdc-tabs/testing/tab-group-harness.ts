/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessPredicate,
  parallel,
} from '@angular/cdk/testing';
import {TabGroupHarnessFilters, TabHarnessFilters} from './tab-harness-filters';
import {MatTabHarness} from './tab-harness';

/** Harness for interacting with an MDC-based mat-tab-group in tests. */
export class MatTabGroupHarness extends ComponentHarness {
  /** The selector for the host element of a `MatTabGroup` instance. */
  static hostSelector = '.mat-mdc-tab-group';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a tab group with specific attributes.
   * @param options Options for filtering which tab group instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatTabGroupHarness>(
    this: ComponentHarnessConstructor<T>,
    options: TabGroupHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options).addOption(
      'selectedTabLabel',
      options.selectedTabLabel,
      async (harness, label) => {
        const selectedTab = await harness.getSelectedTab();
        return HarnessPredicate.stringMatches(await selectedTab.getLabel(), label);
      },
    );
  }

  /**
   * Gets the list of tabs in the tab group.
   * @param filter Optionally filters which tabs are included.
   */
  async getTabs(filter: TabHarnessFilters = {}): Promise<MatTabHarness[]> {
    return this.locatorForAll(MatTabHarness.with(filter))();
  }

  /** Gets the selected tab of the tab group. */
  async getSelectedTab(): Promise<MatTabHarness> {
    const tabs = await this.getTabs();
    const isSelected = await parallel(() => tabs.map(t => t.isSelected()));
    for (let i = 0; i < tabs.length; i++) {
      if (isSelected[i]) {
        return tabs[i];
      }
    }
    throw new Error('No selected tab could be found.');
  }

  /**
   * Selects a tab in this tab group.
   * @param filter An optional filter to apply to the child tabs. The first tab matching the filter
   *     will be selected.
   */
  async selectTab(filter: TabHarnessFilters = {}): Promise<void> {
    const tabs = await this.getTabs(filter);
    if (!tabs.length) {
      throw Error(`Cannot find mat-tab matching filter ${JSON.stringify(filter)}`);
    }
    await tabs[0].select();
  }
}
