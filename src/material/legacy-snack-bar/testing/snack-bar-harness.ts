/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {HarnessPredicate} from '@angular/cdk/testing';
import {_MatSnackBarHarnessBase, SnackBarHarnessFilters} from '@angular/material/snack-bar/testing';

/** Harness for interacting with a standard mat-snack-bar in tests. */
export class MatLegacySnackBarHarness extends _MatSnackBarHarnessBase {
  // Developers can provide a custom component or template for the snackbar. The canonical snack-bar
  // parent is the "MatSnackBarContainer". We use `:not([mat-exit])` to exclude snack bars that
  // are in the process of being dismissed, because the element only gets removed after the
  // animation is finished and since it runs outside of Angular, we don't have a way of being
  // notified when it's done.
  /** The selector for the host element of a `MatSnackBar` instance. */
  static hostSelector = '.mat-snack-bar-container';
  protected override _messageSelector = '.mat-simple-snackbar > span';
  protected override _actionButtonSelector = '.mat-simple-snackbar-action > button';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a snack bar with specific attributes.
   * @param options Options for filtering which snack bar instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: SnackBarHarnessFilters = {}): HarnessPredicate<MatLegacySnackBarHarness> {
    return new HarnessPredicate(MatLegacySnackBarHarness, options);
  }

  protected override async _assertContentAnnotated() {
    if (!(await this._isSimpleSnackBar())) {
      throw Error('Method cannot be used for snack-bar with custom content.');
    }
  }

  /** Whether the snack-bar is using the default content template. */
  private async _isSimpleSnackBar(): Promise<boolean> {
    return (await this.locatorForOptional('.mat-simple-snackbar')()) !== null;
  }
}
