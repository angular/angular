/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarnessConstructor, HarnessPredicate} from '@angular/cdk/testing';
import {
  MatSnackBarHarness as BaseMatSnackBarHarness,
  SnackBarHarnessFilters,
} from '@angular/material/snack-bar/testing';

/** Harness for interacting with an MDC-based mat-snack-bar in tests. */
export class MatSnackBarHarness extends BaseMatSnackBarHarness {
  // Developers can provide a custom component or template for the snackbar. The canonical snack-bar
  // parent is the "MatSnackBarContainer". We use `:not([mat-exit])` to exclude snack bars that
  // are in the process of being dismissed, because the element only gets removed after the
  // animation is finished and since it runs outside of Angular, we don't have a way of being
  // notified when it's done.
  /** The selector for the host element of a `MatSnackBar` instance. */
  static override hostSelector = '.mat-mdc-snack-bar-container:not([mat-exit])';
  protected override _messageSelector = '.mdc-snackbar__label';
  protected override _actionButtonSelector = '.mat-mdc-snack-bar-action';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a snack bar with specific attributes.
   * @param options Options for filtering which snack bar instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static override with<T extends BaseMatSnackBarHarness>(
    this: ComponentHarnessConstructor<T>,
    options: SnackBarHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options);
  }

  protected override async _assertContentAnnotated() {}
}
