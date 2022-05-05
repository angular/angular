/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ComponentHarnessConstructor,
  ContentContainerComponentHarness,
  HarnessPredicate,
} from '@angular/cdk/testing';
import {CardHarnessFilters} from './card-harness-filters';

/** Selectors for different sections of the mat-card that can container user content. */
export const enum MatCardSection {
  HEADER = '.mat-mdc-card-header',
  CONTENT = '.mat-mdc-card-content',
  ACTIONS = '.mat-mdc-card-actions',
  FOOTER = '.mat-mdc-card-footer',
}

/** Harness for interacting with an MDC-based mat-card in tests. */
export class MatCardHarness extends ContentContainerComponentHarness<MatCardSection> {
  /** The selector for the host element of a `MatCard` instance. */
  static hostSelector = '.mat-mdc-card';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a card with specific attributes.
   * @param options Options for filtering which card instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatCardHarness>(
    this: ComponentHarnessConstructor<T>,
    options: CardHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options)
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

  private _title = this.locatorForOptional('.mat-mdc-card-title');
  private _subtitle = this.locatorForOptional('.mat-mdc-card-subtitle');

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
