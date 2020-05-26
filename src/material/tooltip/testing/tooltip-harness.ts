/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {TooltipHarnessFilters} from './tooltip-harness-filters';

/** Harness for interacting with a standard mat-tooltip in tests. */
export class MatTooltipHarness extends ComponentHarness {
  private _optionalPanel = this.documentRootLocatorFactory().locatorForOptional('.mat-tooltip');
  static hostSelector = '.mat-tooltip-trigger';

  /**
   * Gets a `HarnessPredicate` that can be used to search
   * for a tooltip trigger with specific attributes.
   * @param options Options for narrowing the search.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: TooltipHarnessFilters = {}): HarnessPredicate<MatTooltipHarness> {
    return new HarnessPredicate(MatTooltipHarness, options);
  }

  /** Shows the tooltip. */
  async show(): Promise<void> {
    return (await this.host()).hover();
  }

  /** Hides the tooltip. */
  async hide(): Promise<void> {
    const host = await this.host();
    await host.mouseAway();
    await this.forceStabilize(); // Needed in order to flush the `hide` animation.
  }

  /** Gets whether the tooltip is open. */
  async isOpen(): Promise<boolean> {
    return !!(await this._optionalPanel());
  }

  /** Gets a promise for the tooltip panel's text. */
  async getTooltipText(): Promise<string> {
    const panel = await this._optionalPanel();
    return panel ? panel.text() : '';
  }
}
