/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk-experimental/testing';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {MatMenuItemHarness} from './mdc-menu-item-harness';
import {MenuHarnessFilters} from './menu-harness-filters';


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
   *   - `label` finds a menu with specific label text.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: MenuHarnessFilters = {}): HarnessPredicate<MatMenuHarness> {
    return new HarnessPredicate(MatMenuHarness)
        .addOption('text', options.triggerText,
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

  async getItems(): Promise<MatMenuItemHarness[]> {
    throw Error('not implemented');
  }

  async getItemLabels(): Promise<string[]> {
    throw Error('not implemented');
  }

  async getItemByLabel(): Promise<MatMenuItemHarness> {
    throw Error('not implemented');
  }

  async getItemByIndex(): Promise<MatMenuItemHarness> {
    throw Error('not implemented');
  }

  async getFocusedItem(): Promise<MatMenuItemHarness> {
    throw Error('not implemented');
  }
}
