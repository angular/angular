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

const iconSelector = '.mat-mdc-list-item-icon';
const avatarSelector = '.mat-mdc-list-item-avatar';

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
  return new HarnessPredicate(harnessType, options)
    .addOption('text', options.text, (harness, text) =>
      HarnessPredicate.stringMatches(harness.getText(), text),
    )
    .addOption('fullText', options.fullText, (harness, fullText) =>
      HarnessPredicate.stringMatches(harness.getFullText(), fullText),
    )
    .addOption('title', options.title, (harness, title) =>
      HarnessPredicate.stringMatches(harness.getTitle(), title),
    )
    .addOption('secondaryText', options.secondaryText, (harness, secondaryText) =>
      HarnessPredicate.stringMatches(harness.getSecondaryText(), secondaryText),
    )
    .addOption('tertiaryText', options.tertiaryText, (harness, tertiaryText) =>
      HarnessPredicate.stringMatches(harness.getTertiaryText(), tertiaryText),
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

/** Enum describing the possible variants of a list item. */
export const enum MatListItemType {
  ONE_LINE_ITEM,
  TWO_LINE_ITEM,
  THREE_LINE_ITEM,
}

/**
 * Shared behavior among the harnesses for the various `MatListItem` flavors.
 * @docs-private
 */
export abstract class MatListItemHarnessBase extends ContentContainerComponentHarness<MatListItemSection> {
  private _lines = this.locatorForAll('.mat-mdc-list-item-line');
  private _primaryText = this.locatorFor('.mdc-list-item__primary-text');
  private _avatar = this.locatorForOptional('.mat-mdc-list-item-avatar');
  private _icon = this.locatorForOptional('.mat-mdc-list-item-icon');
  private _unscopedTextContent = this.locatorFor('.mat-mdc-list-item-unscoped-content');

  /** Gets the type of the list item, currently describing how many lines there are. */
  async getType(): Promise<MatListItemType> {
    const host = await this.host();
    const [isOneLine, isTwoLine] = await parallel(() => [
      host.hasClass('mdc-list-item--with-one-line'),
      host.hasClass('mdc-list-item--with-two-lines'),
    ]);
    if (isOneLine) {
      return MatListItemType.ONE_LINE_ITEM;
    } else if (isTwoLine) {
      return MatListItemType.TWO_LINE_ITEM;
    } else {
      return MatListItemType.THREE_LINE_ITEM;
    }
  }

  /**
   * Gets the full text content of the list item, excluding text
   * from icons and avatars.
   *
   * @deprecated Use the `getFullText` method instead.
   * @breaking-change 16.0.0
   */
  async getText(): Promise<string> {
    return this.getFullText();
  }

  /**
   * Gets the full text content of the list item, excluding text
   * from icons and avatars.
   */
  async getFullText(): Promise<string> {
    return (await this.host()).text({exclude: `${iconSelector}, ${avatarSelector}`});
  }

  /** Gets the title of the list item. */
  async getTitle(): Promise<string> {
    return (await this._primaryText()).text();
  }

  /** Whether the list item is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await this.host()).hasClass('mdc-list-item--disabled');
  }

  /**
   * Gets the secondary line text of the list item. Null if the list item
   * does not have a secondary line.
   */
  async getSecondaryText(): Promise<string | null> {
    const type = await this.getType();
    if (type === MatListItemType.ONE_LINE_ITEM) {
      return null;
    }

    const [lines, unscopedTextContent] = await parallel(() => [
      this._lines(),
      this._unscopedTextContent(),
    ]);

    // If there is no explicit line for the secondary text, the unscoped text content
    // is rendered as the secondary text (with potential text wrapping enabled).
    if (lines.length >= 1) {
      return lines[0].text();
    } else {
      return unscopedTextContent.text();
    }
  }

  /**
   * Gets the tertiary line text of the list item. Null if the list item
   * does not have a tertiary line.
   */
  async getTertiaryText(): Promise<string | null> {
    const type = await this.getType();
    if (type !== MatListItemType.THREE_LINE_ITEM) {
      return null;
    }

    const [lines, unscopedTextContent] = await parallel(() => [
      this._lines(),
      this._unscopedTextContent(),
    ]);

    // First we check if there is an explicit line for the tertiary text. If so, we return it.
    // If there is at least an explicit secondary line though, then we know that the unscoped
    // text content corresponds to the tertiary line. If there are no explicit lines at all,
    // we know that the unscoped text content from the secondary text just wraps into the third
    // line, but there *no* actual dedicated tertiary text.
    if (lines.length === 2) {
      return lines[1].text();
    } else if (lines.length === 1) {
      return unscopedTextContent.text();
    }
    return null;
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
