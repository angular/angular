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
  static hostSelector = '.mat-menu-trigger';

  private _documentRootLocator = this.documentRootLocatorFactory();

  // TODO: potentially extend MatButtonHarness

  /**
   * Gets a `HarnessPredicate` that can be used to search for a menu with specific attributes.
   * @param options Options for narrowing the search:
   *   - `selector` finds a menu whose host element matches the given selector.
   *   - `label` finds a menu with specific label text.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: MenuHarnessFilters = {}): HarnessPredicate<MatMenuHarness> {
    return new HarnessPredicate(MatMenuHarness, options)
        .addOption('triggerText', options.triggerText,
            (harness, text) => HarnessPredicate.stringMatches(harness.getTriggerText(), text));
  }

  /** Gets a boolean promise indicating if the menu is disabled. */
  async isDisabled(): Promise<boolean> {
    const disabled = (await this.host()).getAttribute('disabled');
    return coerceBooleanProperty(await disabled);
  }

  /** Whether the menu is open. */
  async isOpen(): Promise<boolean> {
    return !!(await this._getMenuPanel());
  }

  async getTriggerText(): Promise<string> {
    return (await this.host()).text();
  }

  /** Focuses the menu and returns a void promise that indicates when the action is complete. */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /** Blurs the menu and returns a void promise that indicates when the action is complete. */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }

  async open(): Promise<void> {
    if (!await this.isOpen()) {
      return (await this.host()).click();
    }
  }

  async close(): Promise<void> {
    const panel = await this._getMenuPanel();
    if (panel) {
      return panel.sendKeys(TestKey.ESCAPE);
    }
  }

  async getItems(filters: Omit<MenuItemHarnessFilters, 'ancestor'> = {}):
      Promise<MatMenuItemHarness[]> {
    const panelId = await this._getPanelId();
    if (panelId) {
      return this._documentRootLocator.locatorForAll(
          MatMenuItemHarness.with({...filters, ancestor: `#${panelId}`}))();
    }
    return [];
  }

  async clickItem(filter: Omit<MenuItemHarnessFilters, 'ancestor'>,
                  ...filters: Omit<MenuItemHarnessFilters, 'ancestor'>[]): Promise<void> {
    await this.open();
    const items = await this.getItems(filter);
    if (!items.length) {
      throw Error(`Could not find item matching ${JSON.stringify(filter)}`);
    }

    if (!filters.length) {
      return await items[0].click();
    }

    const menu = await items[0].getSubmenu();
    if (!menu) {
      throw Error(`Item matching ${JSON.stringify(filter)} does not have a submenu`);
    }
    return menu.clickItem(...filters as [Omit<MenuItemHarnessFilters, 'ancestor'>]);
  }

  private async _getMenuPanel(): Promise<TestElement | null> {
    const panelId = await this._getPanelId();
    return panelId ? this._documentRootLocator.locatorForOptional(`#${panelId}`)() : null;
  }

  private async _getPanelId(): Promise<string | null> {
    const panelId = await (await this.host()).getAttribute('aria-controls');
    return panelId || null;
  }
}


/** Harness for interacting with a standard mat-menu-item in tests. */
export class MatMenuItemHarness extends ComponentHarness {
  static hostSelector = '.mat-menu-item';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a menu with specific attributes.
   * @param options Options for narrowing the search:
   *   - `selector` finds a menu item whose host element matches the given selector.
   *   - `label` finds a menu item with specific label text.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: MenuItemHarnessFilters = {}): HarnessPredicate<MatMenuItemHarness> {
    return new HarnessPredicate(MatMenuItemHarness, options)
        .addOption('text', options.text,
            (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text))
        .addOption('hasSubmenu', options.hasSubmenu,
            async (harness, hasSubmenu) => (await harness.hasSubmenu()) === hasSubmenu);
  }

  /** Gets a boolean promise indicating if the menu is disabled. */
  async isDisabled(): Promise<boolean> {
    const disabled = (await this.host()).getAttribute('disabled');
    return coerceBooleanProperty(await disabled);
  }

  async getText(): Promise<string> {
    return (await this.host()).text();
  }

  /** Focuses the menu and returns a void promise that indicates when the action is complete. */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /** Blurs the menu and returns a void promise that indicates when the action is complete. */
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
