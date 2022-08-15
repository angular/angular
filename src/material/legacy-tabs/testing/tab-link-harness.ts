/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {LegacyTabLinkHarnessFilters} from './tab-harness-filters';

/** Harness for interacting with a standard Angular Material tab link in tests. */
export class MatLegacyTabLinkHarness extends ComponentHarness {
  /** The selector for the host element of a `MatTabLink` instance. */
  static hostSelector = '.mat-tab-link';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatTabLinkHarness` that meets
   * certain criteria.
   * @param options Options for filtering which tab link instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(
    options: LegacyTabLinkHarnessFilters = {},
  ): HarnessPredicate<MatLegacyTabLinkHarness> {
    return new HarnessPredicate(MatLegacyTabLinkHarness, options).addOption(
      'label',
      options.label,
      (harness, label) => HarnessPredicate.stringMatches(harness.getLabel(), label),
    );
  }

  /** Gets the label of the link. */
  async getLabel(): Promise<string> {
    return (await this.host()).text();
  }

  /** Whether the link is active. */
  async isActive(): Promise<boolean> {
    const host = await this.host();
    return host.hasClass('mat-tab-label-active');
  }

  /** Whether the link is disabled. */
  async isDisabled(): Promise<boolean> {
    const host = await this.host();
    return host.hasClass('mat-tab-disabled');
  }

  /** Clicks on the link. */
  async click(): Promise<void> {
    await (await this.host()).click();
  }
}
