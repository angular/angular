/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ContentContainerComponentHarness, HarnessPredicate, parallel} from '@angular/cdk/testing';
import {ToolbarHarnessFilters} from './toolbar-harness-filters';

/** Selectors for different sections of the mat-toolbar that contain user content. */
export const enum MatToolbarSection {
  ROW = '.mat-toolbar-row',
}

/** Harness for interacting with a standard mat-toolbar in tests. */
export class MatToolbarHarness extends ContentContainerComponentHarness<MatToolbarSection> {
  static hostSelector = '.mat-toolbar';

  private _getRows = this.locatorForAll(MatToolbarSection.ROW);

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatToolbarHarness` that meets
   * certain criteria.
   * @param options Options for filtering which card instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: ToolbarHarnessFilters = {}): HarnessPredicate<MatToolbarHarness> {
    return new HarnessPredicate(MatToolbarHarness, options).addOption(
      'text',
      options.text,
      (harness, text) => HarnessPredicate.stringMatches(harness._getText(), text),
    );
  }

  /** Whether the toolbar has multiple rows. */
  async hasMultipleRows(): Promise<boolean> {
    return (await this.host()).hasClass('mat-toolbar-multiple-rows');
  }

  /** Gets all of the toolbar's content as text. */
  private async _getText(): Promise<string> {
    return (await this.host()).text();
  }

  /** Gets the text of each row in the toolbar. */
  async getRowsAsText(): Promise<string[]> {
    const rows = await this._getRows();
    return parallel(() => (rows.length ? rows.map(r => r.text()) : [this._getText()]));
  }
}
