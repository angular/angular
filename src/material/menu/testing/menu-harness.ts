/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate, TestElement, TestKey} from '@angular/cdk/testing';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {MenuHarnessFilters, MenuItemHarnessFilters} from './menu-harness-filters';

/** Harness for interacting with a standard mat-menu in tests. */
export class MatMenuHarness extends ComponentHarness {
  /** The selector for the host element of a `MatMenu` instance. */
  static hostSelector = '.mat-menu-trigger';

  private _documentRootLocator = this.documentRootLocatorFactory();

  // TODO: potentially extend MatButtonHarness

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatMenuHarness` that meets certain
   * criteria.
   * @param options Options for filtering which menu instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: MenuHarnessFilters = {}): HarnessPredicate<MatMenuHarness> {
    return new HarnessPredicate(MatMenuHarness, options)
        .addOption('triggerText', options.triggerText,
            (harness, text) => HarnessPredicate.stringMatches(harness.getTriggerText(), text));
  }

  /** Whether the menu is disabled. */
  async isDisabled(): Promise<boolean> {
    const disabled = (await this.host()).getAttribute('disabled');
    return coerceBooleanProperty(await disabled);
  }

  /** Whether the menu is open. */
  async isOpen(): Promise<boolean> {
    return !!(await this._getMenuPanel());
  }

  /** Gets the text of the menu's trigger element. */
  async getTriggerText(): Promise<string> {
    return (await this.host()).text();
  }

  /** Focuses the menu. */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /** Blurs the menu. */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }

  /** Opens the menu. */
  async open(): Promise<void> {
    if (!await this.isOpen()) {
      return (await this.host()).click();
    }
  }

  /** Closes the menu. */
  async close(): Promise<void> {
    const panel = await this._getMenuPanel();
    if (panel) {
      return panel.sendKeys(TestKey.ESCAPE);
    }
  }

  /**
   * Gets a list of `MatMenuItemHarness` representing the items in the menu.
   * @param filters Optionally filters which menu items are included.
   */
  async getItems(filters: Omit<MenuItemHarnessFilters, 'ancestor'> = {}):
      Promise<MatMenuItemHarness[]> {
    const panelId = await this._getPanelId();
    if (panelId) {
      return this._documentRootLocator.locatorForAll(
          MatMenuItemHarness.with({...filters, ancestor: `#${panelId}`}))();
    }
    return [];
  }

  /**
   * Clicks an item in the menu, and optionally continues clicking items in subsequent sub-menus.
   * @param itemFilter A filter used to represent which item in the menu should be clicked. The
   *     first matching menu item will be clicked.
   * @param subItemFilters A list of filters representing the items to click in any subsequent
   *     sub-menus. The first item in the sub-menu matching the corresponding filter in
   *     `subItemFilters` will be clicked.
   */
  async clickItem(
      itemFilter: Omit<MenuItemHarnessFilters, 'ancestor'>,
      ...subItemFilters: Omit<MenuItemHarnessFilters, 'ancestor'>[]): Promise<void> {
    await this.open();
    const items = await this.getItems(itemFilter);
    if (!items.length) {
      throw Error(`Could not find item matching ${JSON.stringify(itemFilter)}`);
    }

    if (!subItemFilters.length) {
      return await items[0].click();
    }

    const menu = await items[0].getSubmenu();
    if (!menu) {
      throw Error(`Item matching ${JSON.stringify(itemFilter)} does not have a submenu`);
    }
    return menu.clickItem(...subItemFilters as [Omit<MenuItemHarnessFilters, 'ancestor'>]);
  }

  /** Gets the menu panel associated with this menu. */
  private async _getMenuPanel(): Promise<TestElement | null> {
    const panelId = await this._getPanelId();
    return panelId ? this._documentRootLocator.locatorForOptional(`#${panelId}`)() : null;
  }

  /** Gets the id of the menu panel associated with this menu. */
  private async _getPanelId(): Promise<string | null> {
    const panelId = await (await this.host()).getAttribute('aria-controls');
    return panelId || null;
  }
}


/** Harness for interacting with a standard mat-menu-item in tests. */
export class MatMenuItemHarness extends ComponentHarness {
  /** The selector for the host element of a `MatMenuItem` instance. */
  static hostSelector = '.mat-menu-item';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatMenuItemHarness` that meets
   * certain criteria.
   * @param options Options for filtering which menu item instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: MenuItemHarnessFilters = {}): HarnessPredicate<MatMenuItemHarness> {
    return new HarnessPredicate(MatMenuItemHarness, options)
        .addOption('text', options.text,
            (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text))
        .addOption('hasSubmenu', options.hasSubmenu,
            async (harness, hasSubmenu) => (await harness.hasSubmenu()) === hasSubmenu);
  }

  /** Whether the menu is disabled. */
  async isDisabled(): Promise<boolean> {
    const disabled = (await this.host()).getAttribute('disabled');
    return coerceBooleanProperty(await disabled);
  }

  /** Gets the text of the menu item. */
  async getText(): Promise<string> {
    return (await this.host()).text();
  }

  /** Focuses the menu item. */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /** Blurs the menu item. */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }

  /** Clicks the menu item. */
  async click(): Promise<void> {
    return (await this.host()).click();
  }

  /** Whether this item has a submenu. */
  async hasSubmenu(): Promise<boolean> {
    return (await this.host()).matchesSelector(MatMenuHarness.hostSelector);
  }

  /** Gets the submenu associated with this menu item, or null if none. */
  async getSubmenu(): Promise<MatMenuHarness | null> {
    if (await this.hasSubmenu()) {
      return new MatMenuHarness(this.locatorFactory);
    }
    return null;
  }
}
