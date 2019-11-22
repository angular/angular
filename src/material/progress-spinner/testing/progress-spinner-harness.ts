/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceNumberProperty} from '@angular/cdk/coercion';
import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {ProgressSpinnerMode} from '@angular/material/progress-spinner';
import {ProgressSpinnerHarnessFilters} from './progress-spinner-harness-filters';

/** Harness for interacting with a standard mat-progress-spinner in tests. */
export class MatProgressSpinnerHarness extends ComponentHarness {
  /** The selector for the host element of a `MatProgressSpinner` instance. */
  static hostSelector = 'mat-progress-spinner';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatProgressSpinnerHarness` that
   * meets certain criteria.
   * @param options Options for filtering which progress spinner instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: ProgressSpinnerHarnessFilters = {}):
      HarnessPredicate<MatProgressSpinnerHarness> {
    return new HarnessPredicate(MatProgressSpinnerHarness, options);
  }

  /** Gets the progress spinner's value. */
  async getValue(): Promise<number|null> {
    const host = await this.host();
    const ariaValue = await host.getAttribute('aria-valuenow');
    return ariaValue ? coerceNumberProperty(ariaValue) : null;
  }

  /** Gets the progress spinner's mode. */
  async getMode(): Promise<ProgressSpinnerMode> {
    const modeAttr = (await this.host()).getAttribute('mode');
    return await modeAttr as ProgressSpinnerMode;
  }
}
