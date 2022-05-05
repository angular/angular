/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarnessConstructor, HarnessPredicate} from '@angular/cdk/testing';
import {_MatTooltipHarnessBase, TooltipHarnessFilters} from '@angular/material/tooltip/testing';

/** Harness for interacting with a standard mat-tooltip in tests. */
export class MatTooltipHarness extends _MatTooltipHarnessBase {
  protected _optionalPanel =
    this.documentRootLocatorFactory().locatorForOptional('.mat-mdc-tooltip');
  static hostSelector = '.mat-mdc-tooltip-trigger';
  protected _hiddenClass = 'mat-mdc-tooltip-hide';
  protected _showAnimationName = 'mat-mdc-tooltip-show';
  protected _hideAnimationName = 'mat-mdc-tooltip-hide';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a tooltip trigger with specific
   * attributes.
   * @param options Options for narrowing the search.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatTooltipHarness>(
    this: ComponentHarnessConstructor<T>,
    options: TooltipHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options);
  }
}
