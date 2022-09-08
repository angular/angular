/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceNumberProperty} from '@angular/cdk/coercion';
import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {LegacyProgressSpinnerMode} from '@angular/material/legacy-progress-spinner';
import {ProgressSpinnerHarnessFilters} from '@angular/material/progress-spinner/testing';

/**
 * Harness for interacting with a standard mat-progress-spinner in tests.
 * @deprecated Use `MatProgressSpinnerHarness` from `@angular/material/progress-spinner/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export class MatLegacyProgressSpinnerHarness extends ComponentHarness {
  /** The selector for the host element of a Progress Spinner instance. */
  static hostSelector = '.mat-progress-spinner';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatProgressSpinnerHarness` that
   * meets certain criteria.
   * @param options Options for filtering which progress spinner instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(
    options: ProgressSpinnerHarnessFilters = {},
  ): HarnessPredicate<MatLegacyProgressSpinnerHarness> {
    return new HarnessPredicate(MatLegacyProgressSpinnerHarness, options);
  }

  /** Gets the progress spinner's value. */
  async getValue(): Promise<number | null> {
    const host = await this.host();
    const ariaValue = await host.getAttribute('aria-valuenow');
    return ariaValue ? coerceNumberProperty(ariaValue) : null;
  }

  /** Gets the progress spinner's mode. */
  async getMode(): Promise<LegacyProgressSpinnerMode> {
    const modeAttr = (await this.host()).getAttribute('mode');
    return (await modeAttr) as LegacyProgressSpinnerMode;
  }
}
