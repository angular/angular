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
import {ExpansionPanelHarnessFilters} from './expansion-harness-filters';

/** Selectors for the various `mat-expansion-panel` sections that may contain user content. */
export const enum MatExpansionPanelSection {
  HEADER = '.mat-expansion-panel-header',
  TITLE = '.mat-expansion-panel-header-title',
  DESCRIPTION = '.mat-expansion-panel-header-description',
  CONTENT = '.mat-expansion-panel-content',
}

/** Harness for interacting with a standard mat-expansion-panel in tests. */
export class MatExpansionPanelHarness extends ContentContainerComponentHarness<MatExpansionPanelSection> {
  static hostSelector = '.mat-expansion-panel';

  private _header = this.locatorFor(MatExpansionPanelSection.HEADER);
  private _title = this.locatorForOptional(MatExpansionPanelSection.TITLE);
  private _description = this.locatorForOptional(MatExpansionPanelSection.DESCRIPTION);
  private _expansionIndicator = this.locatorForOptional('.mat-expansion-indicator');
  private _content = this.locatorFor(MatExpansionPanelSection.CONTENT);

  /**
   * Gets a `HarnessPredicate` that can be used to search for an expansion-panel
   * with specific attributes.
   * @param options Options for narrowing the search:
   *   - `title` finds an expansion-panel with a specific title text.
   *   - `description` finds an expansion-panel with a specific description text.
   *   - `expanded` finds an expansion-panel that is currently expanded.
   *   - `disabled` finds an expansion-panel that is disabled.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(
    options: ExpansionPanelHarnessFilters = {},
  ): HarnessPredicate<MatExpansionPanelHarness> {
    return new HarnessPredicate(MatExpansionPanelHarness, options)
      .addOption('title', options.title, (harness, title) =>
        HarnessPredicate.stringMatches(harness.getTitle(), title),
      )
      .addOption('description', options.description, (harness, description) =>
        HarnessPredicate.stringMatches(harness.getDescription(), description),
      )
      .addOption('content', options.content, (harness, content) =>
        HarnessPredicate.stringMatches(harness.getTextContent(), content),
      )
      .addOption(
        'expanded',
        options.expanded,
        async (harness, expanded) => (await harness.isExpanded()) === expanded,
      )
      .addOption(
        'disabled',
        options.disabled,
        async (harness, disabled) => (await harness.isDisabled()) === disabled,
      );
  }

  /** Whether the panel is expanded. */
  async isExpanded(): Promise<boolean> {
    return (await this.host()).hasClass('mat-expanded');
  }

  /**
   * Gets the title text of the panel.
   * @returns Title text or `null` if no title is set up.
   */
  async getTitle(): Promise<string | null> {
    const titleEl = await this._title();
    return titleEl ? titleEl.text() : null;
  }

  /**
   * Gets the description text of the panel.
   * @returns Description text or `null` if no description is set up.
   */
  async getDescription(): Promise<string | null> {
    const descriptionEl = await this._description();
    return descriptionEl ? descriptionEl.text() : null;
  }

  /** Whether the panel is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await (await this._header()).getAttribute('aria-disabled')) === 'true';
  }

  /**
   * Toggles the expanded state of the panel by clicking on the panel
   * header. This method will not work if the panel is disabled.
   */
  async toggle(): Promise<void> {
    await (await this._header()).click();
  }

  /** Expands the expansion panel if collapsed. */
  async expand(): Promise<void> {
    if (!(await this.isExpanded())) {
      await this.toggle();
    }
  }

  /** Collapses the expansion panel if expanded. */
  async collapse(): Promise<void> {
    if (await this.isExpanded()) {
      await this.toggle();
    }
  }

  /** Gets the text content of the panel. */
  async getTextContent(): Promise<string> {
    return (await this._content()).text();
  }

  /**
   * Gets a `HarnessLoader` that can be used to load harnesses for
   * components within the panel's content area.
   * @deprecated Use either `getChildLoader(MatExpansionPanelSection.CONTENT)`, `getHarness` or
   *    `getAllHarnesses` instead.
   * @breaking-change 12.0.0
   */
  async getHarnessLoaderForContent(): Promise<HarnessLoader> {
    return this.getChildLoader(MatExpansionPanelSection.CONTENT);
  }

  /** Focuses the panel. */
  async focus(): Promise<void> {
    return (await this._header()).focus();
  }

  /** Blurs the panel. */
  async blur(): Promise<void> {
    return (await this._header()).blur();
  }

  /** Whether the panel is focused. */
  async isFocused(): Promise<boolean> {
    return (await this._header()).isFocused();
  }

  /** Whether the panel has a toggle indicator displayed. */
  async hasToggleIndicator(): Promise<boolean> {
    return (await this._expansionIndicator()) !== null;
  }

  /** Gets the position of the toggle indicator. */
  async getToggleIndicatorPosition(): Promise<'before' | 'after'> {
    // By default the expansion indicator will show "after" the panel header content.
    if (await (await this._header()).hasClass('mat-expansion-toggle-indicator-before')) {
      return 'before';
    }
    return 'after';
  }
}
