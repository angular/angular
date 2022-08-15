/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ContentContainerComponentHarness,
  HarnessLoader,
  HarnessPredicate,
} from '@angular/cdk/testing';
import {LegacyTabHarnessFilters} from './tab-harness-filters';

/** Harness for interacting with a standard Angular Material tab-label in tests. */
export class MatLegacyTabHarness extends ContentContainerComponentHarness<string> {
  /** The selector for the host element of a `MatTab` instance. */
  static hostSelector = '.mat-tab-label';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatTabHarness` that meets
   * certain criteria.
   * @param options Options for filtering which tab instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: LegacyTabHarnessFilters = {}): HarnessPredicate<MatLegacyTabHarness> {
    return new HarnessPredicate(MatLegacyTabHarness, options).addOption(
      'label',
      options.label,
      (harness, label) => HarnessPredicate.stringMatches(harness.getLabel(), label),
    );
  }

  /** Gets the label of the tab. */
  async getLabel(): Promise<string> {
    return (await this.host()).text();
  }

  /** Gets the aria-label of the tab. */
  async getAriaLabel(): Promise<string | null> {
    return (await this.host()).getAttribute('aria-label');
  }

  /** Gets the value of the "aria-labelledby" attribute. */
  async getAriaLabelledby(): Promise<string | null> {
    return (await this.host()).getAttribute('aria-labelledby');
  }

  /** Whether the tab is selected. */
  async isSelected(): Promise<boolean> {
    const hostEl = await this.host();
    return (await hostEl.getAttribute('aria-selected')) === 'true';
  }

  /** Whether the tab is disabled. */
  async isDisabled(): Promise<boolean> {
    const hostEl = await this.host();
    return (await hostEl.getAttribute('aria-disabled')) === 'true';
  }

  /** Selects the given tab by clicking on the label. Tab cannot be selected if disabled. */
  async select(): Promise<void> {
    await (await this.host()).click();
  }

  /** Gets the text content of the tab. */
  async getTextContent(): Promise<string> {
    const contentId = await this._getContentId();
    const contentEl = await this.documentRootLocatorFactory().locatorFor(`#${contentId}`)();
    return contentEl.text();
  }

  protected override async getRootHarnessLoader(): Promise<HarnessLoader> {
    const contentId = await this._getContentId();
    return this.documentRootLocatorFactory().harnessLoaderFor(`#${contentId}`);
  }

  /** Gets the element id for the content of the current tab. */
  private async _getContentId(): Promise<string> {
    const hostEl = await this.host();
    // Tabs never have an empty "aria-controls" attribute.
    return (await hostEl.getAttribute('aria-controls'))!;
  }
}
