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
  ContentContainerComponentHarness,
  HarnessPredicate,
  parallel,
} from '@angular/cdk/testing';
import {BaseListItemHarnessFilters, SubheaderHarnessFilters} from './list-harness-filters';

const iconSelector = '.mat-mdc-list-icon';
const avatarSelector = '.mat-mdc-list-avatar';

/**
 * Gets a `HarnessPredicate` that applies the given `BaseListItemHarnessFilters` to the given
 * list item harness.
 * @template H The type of list item harness to create a predicate for.
 * @param harnessType A constructor for a list item harness.
 * @param options An instance of `BaseListItemHarnessFilters` to apply.
 * @return A `HarnessPredicate` for the given harness type with the given options applied.
 */
export function getListItemPredicate<H extends MatListItemHarnessBase>(
  harnessType: ComponentHarnessConstructor<H>,
  options: BaseListItemHarnessFilters,
): HarnessPredicate<H> {
  return new HarnessPredicate(harnessType, options).addOption(
    'text',
    options.text,
    (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text),
  );
}

/** Harness for interacting with a MDC-based list subheader. */
export class MatSubheaderHarness extends ComponentHarness {
  static hostSelector = '.mat-mdc-subheader';

  static with(options: SubheaderHarnessFilters = {}): HarnessPredicate<MatSubheaderHarness> {
    return new HarnessPredicate(MatSubheaderHarness, options).addOption(
      'text',
      options.text,
      (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text),
    );
  }

  /** Gets the full text content of the list item (including text from any font icons). */
  async getText(): Promise<string> {
    return (await this.host()).text();
  }
}

/** Selectors for the various list item sections that may contain user content. */
export const enum MatListItemSection {
  CONTENT = '.mdc-list-item__content',
}

/**
 * Shared behavior among the harnesses for the various `MatListItem` flavors.
 * @docs-private
 */
export abstract class MatListItemHarnessBase extends ContentContainerComponentHarness<MatListItemSection> {
  private _lines = this.locatorForAll('.mat-line');
  private _avatar = this.locatorForOptional('.mat-mdc-list-avatar');
  private _icon = this.locatorForOptional('.mat-mdc-list-icon');

  /** Gets the full text content of the list item. */
  async getText(): Promise<string> {
    return (await this.host()).text({exclude: `${iconSelector}, ${avatarSelector}`});
  }

  /** Gets the lines of text (`mat-line` elements) in this nav list item. */
  async getLinesText(): Promise<string[]> {
    const lines = await this._lines();
    return parallel(() => lines.map(l => l.text()));
  }

  /** Whether this list item has an avatar. */
  async hasAvatar(): Promise<boolean> {
    return !!(await this._avatar());
  }

  /** Whether this list item has an icon. */
  async hasIcon(): Promise<boolean> {
    return !!(await this._icon());
  }
}
