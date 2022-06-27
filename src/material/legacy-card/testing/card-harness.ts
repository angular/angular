/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate, ContentContainerComponentHarness} from '@angular/cdk/testing';
import {LegacyCardHarnessFilters} from './card-harness-filters';

/** Selectors for different sections of the mat-card that can container user content. */
export const enum MatLegacyCardSection {
  HEADER = '.mat-card-header',
  CONTENT = '.mat-card-content',
  ACTIONS = '.mat-card-actions',
  FOOTER = '.mat-card-footer',
}

/** Harness for interacting with a standard mat-card in tests. */
export class MatLegacyCardHarness extends ContentContainerComponentHarness<MatLegacyCardSection> {
  /** The selector for the host element of a `MatCard` instance. */
  static hostSelector = '.mat-card';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatCardHarness` that meets
   * certain criteria.
   * @param options Options for filtering which card instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: LegacyCardHarnessFilters = {}): HarnessPredicate<MatLegacyCardHarness> {
    return new HarnessPredicate(MatLegacyCardHarness, options)
      .addOption('text', options.text, (harness, text) =>
        HarnessPredicate.stringMatches(harness.getText(), text),
      )
      .addOption('title', options.title, (harness, title) =>
        HarnessPredicate.stringMatches(harness.getTitleText(), title),
      )
      .addOption('subtitle', options.subtitle, (harness, subtitle) =>
        HarnessPredicate.stringMatches(harness.getSubtitleText(), subtitle),
      );
  }

  private _title = this.locatorForOptional('.mat-card-title');
  private _subtitle = this.locatorForOptional('.mat-card-subtitle');

  /** Gets all of the card's content as text. */
  async getText(): Promise<string> {
    return (await this.host()).text();
  }

  /** Gets the cards's title text. */
  async getTitleText(): Promise<string> {
    return (await this._title())?.text() ?? '';
  }

  /** Gets the cards's subtitle text. */
  async getSubtitleText(): Promise<string> {
    return (await this._subtitle())?.text() ?? '';
  }
}
