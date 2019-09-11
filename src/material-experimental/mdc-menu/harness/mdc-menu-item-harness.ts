/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {MenuItemHarnessFilters} from './menu-harness-filters';


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
    return new HarnessPredicate(MatMenuItemHarness, options);
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
}
