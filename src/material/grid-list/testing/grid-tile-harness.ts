/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ContentContainerComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {GridTileHarnessFilters} from './grid-list-harness-filters';

/** Selectors for the various `mat-grid-tile` sections that may contain user content. */
export const enum MatGridTileSection {
  HEADER = '.mat-grid-tile-header',
  FOOTER = '.mat-grid-tile-footer',
}

/** Harness for interacting with a standard `MatGridTitle` in tests. */
export class MatGridTileHarness extends ContentContainerComponentHarness<MatGridTileSection> {
  /** The selector for the host element of a `MatGridTile` instance. */
  static hostSelector = '.mat-grid-tile';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatGridTileHarness`
   * that meets certain criteria.
   * @param options Options for filtering which dialog instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: GridTileHarnessFilters = {}): HarnessPredicate<MatGridTileHarness> {
    return new HarnessPredicate(MatGridTileHarness, options)
      .addOption('headerText', options.headerText, (harness, pattern) =>
        HarnessPredicate.stringMatches(harness.getHeaderText(), pattern),
      )
      .addOption('footerText', options.footerText, (harness, pattern) =>
        HarnessPredicate.stringMatches(harness.getFooterText(), pattern),
      );
  }

  private _header = this.locatorForOptional(MatGridTileSection.HEADER);
  private _footer = this.locatorForOptional(MatGridTileSection.FOOTER);
  private _avatar = this.locatorForOptional('.mat-grid-avatar');

  /** Gets the amount of rows that the grid-tile takes up. */
  async getRowspan(): Promise<number> {
    return Number(await (await this.host()).getAttribute('rowspan'));
  }

  /** Gets the amount of columns that the grid-tile takes up. */
  async getColspan(): Promise<number> {
    return Number(await (await this.host()).getAttribute('colspan'));
  }

  /** Whether the grid-tile has a header. */
  async hasHeader(): Promise<boolean> {
    return (await this._header()) !== null;
  }

  /** Whether the grid-tile has a footer. */
  async hasFooter(): Promise<boolean> {
    return (await this._footer()) !== null;
  }

  /** Whether the grid-tile has an avatar. */
  async hasAvatar(): Promise<boolean> {
    return (await this._avatar()) !== null;
  }

  /** Gets the text of the header if present. */
  async getHeaderText(): Promise<string | null> {
    // For performance reasons, we do not use "hasHeader" as
    // we would then need to query twice for the header.
    const headerEl = await this._header();
    return headerEl ? headerEl.text() : null;
  }

  /** Gets the text of the footer if present. */
  async getFooterText(): Promise<string | null> {
    // For performance reasons, we do not use "hasFooter" as
    // we would then need to query twice for the footer.
    const headerEl = await this._footer();
    return headerEl ? headerEl.text() : null;
  }
}
