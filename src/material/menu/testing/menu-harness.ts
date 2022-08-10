/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  BaseHarnessFilters,
  ComponentHarness,
  ComponentHarnessConstructor,
  ContentContainerComponentHarness,
  HarnessLoader,
  HarnessPredicate,
  TestElement,
  TestKey,
} from '@angular/cdk/testing';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {MenuHarnessFilters, MenuItemHarnessFilters} from './menu-harness-filters';

export abstract class _MatMenuHarnessBase<
  ItemType extends ComponentHarnessConstructor<Item> & {
    with: (options?: ItemFilters) => HarnessPredicate<Item>;
  },
  Item extends ComponentHarness & {
    click(): Promise<void>;
    getSubmenu(): Promise<_MatMenuHarnessBase<ItemType, Item, ItemFilters> | null>;
  },
  ItemFilters extends BaseHarnessFilters,
> extends ContentContainerComponentHarness<string> {
  private _documentRootLocator = this.documentRootLocatorFactory();
  protected abstract _itemClass: ItemType;

  // TODO: potentially extend MatButtonHarness

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

  /** Whether the menu is focused. */
  async isFocused(): Promise<boolean> {
    return (await this.host()).isFocused();
  }

  /** Opens the menu. */
  async open(): Promise<void> {
    if (!(await this.isOpen())) {
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
  async getItems(filters?: Omit<ItemFilters, 'ancestor'>): Promise<Item[]> {
    const panelId = await this._getPanelId();
    if (panelId) {
      return this._documentRootLocator.locatorForAll(
        this._itemClass.with({
          ...(filters || {}),
          ancestor: `#${panelId}`,
        } as ItemFilters),
      )();
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
    itemFilter: Omit<ItemFilters, 'ancestor'>,
    ...subItemFilters: Omit<ItemFilters, 'ancestor'>[]
  ): Promise<void> {
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
    return menu.clickItem(...(subItemFilters as [Omit<ItemFilters, 'ancestor'>]));
  }

  protected override async getRootHarnessLoader(): Promise<HarnessLoader> {
    const panelId = await this._getPanelId();
    return this.documentRootLocatorFactory().harnessLoaderFor(`#${panelId}`);
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

export abstract class _MatMenuItemHarnessBase<
  MenuType extends ComponentHarnessConstructor<Menu>,
  Menu extends ComponentHarness,
> extends ContentContainerComponentHarness<string> {
  protected abstract _menuClass: MenuType;

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

  /** Whether the menu item is focused. */
  async isFocused(): Promise<boolean> {
    return (await this.host()).isFocused();
  }

  /** Clicks the menu item. */
  async click(): Promise<void> {
    return (await this.host()).click();
  }

  /** Whether this item has a submenu. */
  async hasSubmenu(): Promise<boolean> {
    return (await this.host()).matchesSelector(this._menuClass.hostSelector);
  }

  /** Gets the submenu associated with this menu item, or null if none. */
  async getSubmenu(): Promise<Menu | null> {
    if (await this.hasSubmenu()) {
      return new this._menuClass(this.locatorFactory);
    }
    return null;
  }
}

/** Harness for interacting with an MDC-based mat-menu in tests. */
export class MatMenuHarness extends _MatMenuHarnessBase<
  typeof MatMenuItemHarness,
  MatMenuItemHarness,
  MenuItemHarnessFilters
> {
  /** The selector for the host element of a `MatMenu` instance. */
  static hostSelector = '.mat-mdc-menu-trigger';
  protected _itemClass = MatMenuItemHarness;

  /**
   * Gets a `HarnessPredicate` that can be used to search for a menu with specific attributes.
   * @param options Options for filtering which menu instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatMenuHarness>(
    this: ComponentHarnessConstructor<T>,
    options: MenuHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options).addOption(
      'triggerText',
      options.triggerText,
      (harness, text) => HarnessPredicate.stringMatches(harness.getTriggerText(), text),
    );
  }
}

/** Harness for interacting with an MDC-based mat-menu-item in tests. */
export class MatMenuItemHarness extends _MatMenuItemHarnessBase<
  typeof MatMenuHarness,
  MatMenuHarness
> {
  /** The selector for the host element of a `MatMenuItem` instance. */
  static hostSelector = '.mat-mdc-menu-item';
  protected _menuClass = MatMenuHarness;

  /**
   * Gets a `HarnessPredicate` that can be used to search for a menu item with specific attributes.
   * @param options Options for filtering which menu item instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatMenuItemHarness>(
    this: ComponentHarnessConstructor<T>,
    options: MenuItemHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options)
      .addOption('text', options.text, (harness, text) =>
        HarnessPredicate.stringMatches(harness.getText(), text),
      )
      .addOption(
        'hasSubmenu',
        options.hasSubmenu,
        async (harness, hasSubmenu) => (await harness.hasSubmenu()) === hasSubmenu,
      );
  }
}
