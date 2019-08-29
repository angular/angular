/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk-experimental/testing';
import {SidenavHarnessFilters} from './sidenav-harness-filters';

/**
 * Harness for interacting with a standard mat-sidenav in tests.
 * @dynamic
 */
export class MatSidenavHarness extends ComponentHarness {
  static hostSelector = '.mat-sidenav';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a sidenav with
   * specific attributes.
   * @param options Options for narrowing the search.
   * @return `HarnessPredicate` configured with the given options.
   */
  static with(options: SidenavHarnessFilters = {}): HarnessPredicate<MatSidenavHarness> {
    return new HarnessPredicate(MatSidenavHarness, options);
  }

  /** Gets whether the sidenav is open. */
  async isOpen(): Promise<boolean> {
    return (await this.host()).hasClass('mat-drawer-opened');
  }

  /** Gets the position of the sidenav inside its container. */
  async getPosition(): Promise<'start'|'end'> {
    const host = await this.host();
    return (await host.hasClass('mat-drawer-end')) ? 'end' : 'start';
  }

  /** Gets the mode that the sidenav is in. */
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

  /** Gets whether the sidenav is fixed in the viewport. */
  async isFixedInViewport(): Promise<boolean> {
    return (await this.host()).hasClass('mat-sidenav-fixed');
  }
}
