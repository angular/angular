/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ContentContainerComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {DrawerContainerHarnessFilters, DrawerHarnessFilters} from './drawer-harness-filters';
import {MatSidenavContentHarness} from './sidenav-content-harness';
import {MatSidenavHarness} from './sidenav-harness';

/** Harness for interacting with a standard mat-sidenav-container in tests. */
export class MatSidenavContainerHarness extends ContentContainerComponentHarness<string> {
  /** The selector for the host element of a `MatSidenavContainer` instance. */
  static hostSelector = '.mat-sidenav-container';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatSidenavContainerHarness` that
   * meets certain criteria.
   * @param options Options for filtering which container instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(
    options: DrawerContainerHarnessFilters = {},
  ): HarnessPredicate<MatSidenavContainerHarness> {
    return new HarnessPredicate(MatSidenavContainerHarness, options);
  }

  /**
   * Gets sidenavs that match particular criteria within the container.
   * @param filter Optionally filters which chips are included.
   */
  async getSidenavs(filter: DrawerHarnessFilters = {}): Promise<MatSidenavHarness[]> {
    return this.locatorForAll(MatSidenavHarness.with(filter))();
  }

  /** Gets the element that has the container's content. */
  async getContent(): Promise<MatSidenavContentHarness> {
    return this.locatorFor(MatSidenavContentHarness)();
  }
}
