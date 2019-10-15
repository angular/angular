/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {
  MenuHarnessFilters,
  MenuItemHarnessFilters
} from '@angular/material/menu/testing';

/**
 * Harness for interacting with a MDC-based mat-menu in tests.
 * @dynamic
 */
export class MatMenuHarness extends ComponentHarness {
  static hostSelector = '.mat-menu-trigger';

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

  async isOpen(): Promise<boolean> {
    throw Error('not implemented');
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
    throw Error('not implemented');
  }

  async close(): Promise<void> {
    throw Error('not implemented');
  }

  async getItems(filters: Omit<MenuItemHarnessFilters, 'ancestor'> = {}):
      Promise<MatMenuItemHarness[]> {
    throw Error('not implemented');
  }

  async clickItem(filter: Omit<MenuItemHarnessFilters, 'ancestor'>,
                  ...filters: Omit<MenuItemHarnessFilters, 'ancestor'>[]): Promise<void> {
    throw Error('not implemented');
  }
}


/**
 * Harness for interacting with a standard mat-menu in tests.
 * @dynamic
 */
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

  async click(): Promise<void> {
    throw Error('not implemented');
  }

  async hasSubmenu(): Promise<boolean> {
    throw Error('not implemented');
  }

  async getSubmenu(): Promise<MatMenuHarness | null> {
    throw Error('not implemented');
  }
}
