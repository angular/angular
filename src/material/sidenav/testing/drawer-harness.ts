/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {DrawerHarnessFilters} from './drawer-harness-filters';

/** Harness for interacting with a standard mat-drawer in tests. */
export class MatDrawerHarness extends ComponentHarness {
  /** The selector for the host element of a `MatDrawer` instance. */
  static hostSelector = '.mat-drawer';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatDrawerHarness` that meets
   * certain criteria.
   * @param options Options for filtering which drawer instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: DrawerHarnessFilters = {}): HarnessPredicate<MatDrawerHarness> {
    return new HarnessPredicate(MatDrawerHarness, options)
        .addOption('position', options.position,
            async (harness, position) => (await harness.getPosition()) === position);
  }

  /** Whether the drawer is open. */
  async isOpen(): Promise<boolean> {
    return (await this.host()).hasClass('mat-drawer-opened');
  }

  /** Gets the position of the drawer inside its container. */
  async getPosition(): Promise<'start'|'end'> {
    const host = await this.host();
    return (await host.hasClass('mat-drawer-end')) ? 'end' : 'start';
  }

  /** Gets the mode that the drawer is in. */
  async getMode(): Promise<'over'|'push'|'side'> {
    const host = await this.host();

    if (await host.hasClass('mat-drawer-push')) {
      return 'push';
    }

    if (await host.hasClass('mat-drawer-side')) {
      return 'side';
    }

    return 'over';
  }
}
