/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate} from '@angular/cdk/testing';
import {_MatTooltipHarnessBase, TooltipHarnessFilters} from '@angular/material/tooltip/testing';

/**
 * Harness for interacting with a standard mat-tooltip in tests.
 * @deprecated Use `MatTooltipHarness` from `@angular/material/tooltip/testing` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
export class MatLegacyTooltipHarness extends _MatTooltipHarnessBase {
  protected _optionalPanel = this.documentRootLocatorFactory().locatorForOptional('.mat-tooltip');
  protected _hiddenClass = 'mat-tooltip-hide';
  protected _showAnimationName = 'mat-tooltip-show';
  protected _hideAnimationName = 'mat-tooltip-hide';
  static hostSelector = '.mat-tooltip-trigger';

  /**
   * Gets a `HarnessPredicate` that can be used to search
   * for a tooltip trigger with specific attributes.
   * @param options Options for narrowing the search.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: TooltipHarnessFilters = {}): HarnessPredicate<MatLegacyTooltipHarness> {
    return new HarnessPredicate(MatLegacyTooltipHarness, options);
  }
}
