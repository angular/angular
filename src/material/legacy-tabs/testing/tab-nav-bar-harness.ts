/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate, parallel} from '@angular/cdk/testing';
import {
  LegacyTabNavBarHarnessFilters,
  LegacyTabNavPanelHarnessFilters,
  LegacyTabLinkHarnessFilters,
} from './tab-harness-filters';
import {MatLegacyTabLinkHarness} from './tab-link-harness';
import {MatLegacyTabNavPanelHarness} from './tab-nav-panel-harness';

/** Harness for interacting with a standard mat-tab-nav-bar in tests. */
export class MatLegacyTabNavBarHarness extends ComponentHarness {
  /** The selector for the host element of a `MatTabNavBar` instance. */
  static hostSelector = '.mat-tab-nav-bar';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatTabNavBar` that meets
   * certain criteria.
   * @param options Options for filtering which tab nav bar instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(
    options: LegacyTabNavBarHarnessFilters = {},
  ): HarnessPredicate<MatLegacyTabNavBarHarness> {
    return new HarnessPredicate(MatLegacyTabNavBarHarness, options);
  }

  /**
   * Gets the list of links in the nav bar.
   * @param filter Optionally filters which links are included.
   */
  async getLinks(filter: LegacyTabLinkHarnessFilters = {}): Promise<MatLegacyTabLinkHarness[]> {
    return this.locatorForAll(MatLegacyTabLinkHarness.with(filter))();
  }

  /** Gets the active link in the nav bar. */
  async getActiveLink(): Promise<MatLegacyTabLinkHarness> {
    const links = await this.getLinks();
    const isActive = await parallel(() => links.map(t => t.isActive()));
    for (let i = 0; i < links.length; i++) {
      if (isActive[i]) {
        return links[i];
      }
    }
    throw new Error('No active link could be found.');
  }

  /**
   * Clicks a link inside the nav bar.
   * @param filter An optional filter to apply to the child link. The first link matching the filter
   *     will be clicked.
   */
  async clickLink(filter: LegacyTabLinkHarnessFilters = {}): Promise<void> {
    const tabs = await this.getLinks(filter);
    if (!tabs.length) {
      throw Error(`Cannot find mat-tab-link matching filter ${JSON.stringify(filter)}`);
    }
    await tabs[0].click();
  }

  /** Gets the panel associated with the nav bar. */
  async getPanel(): Promise<MatLegacyTabNavPanelHarness> {
    const link = await this.getActiveLink();
    const host = await link.host();
    const panelId = await host.getAttribute('aria-controls');
    if (!panelId) {
      throw Error('No panel is controlled by the nav bar.');
    }

    const filter: LegacyTabNavPanelHarnessFilters = {selector: `#${panelId}`};
    return await this.documentRootLocatorFactory().locatorFor(
      MatLegacyTabNavPanelHarness.with(filter),
    )();
  }
}
