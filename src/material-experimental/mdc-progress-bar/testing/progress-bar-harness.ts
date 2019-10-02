/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceNumberProperty} from '@angular/cdk/coercion';
import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {ProgressBarHarnessFilters} from '@angular/material/progress-bar/testing';

/**
 * Harness for interacting with an MDC-based `mat-progress-bar` in tests.
 * @dynamic
 */
export class MatProgressBarHarness extends ComponentHarness {
  static hostSelector = 'mat-progress-bar';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a progress bar with specific
   * attributes.
   */
  static with(options: ProgressBarHarnessFilters = {}): HarnessPredicate<MatProgressBarHarness> {
    return new HarnessPredicate(MatProgressBarHarness, options);
  }

  /** Gets a promise for the progress bar's value. */
  async getValue(): Promise<number|null> {
    const host = await this.host();
    const ariaValue = await host.getAttribute('aria-valuenow');
    return ariaValue ? coerceNumberProperty(ariaValue) : null;
  }

  /** Gets a promise for the progress bar's mode. */
  async getMode(): Promise<string|null> {
    return (await this.host()).getAttribute('mode');
  }
}
