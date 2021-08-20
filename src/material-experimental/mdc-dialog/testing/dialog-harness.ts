/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate} from '@angular/cdk/testing';
import {
  DialogHarnessFilters,
  MatDialogHarness as NonMdcDialogHarness
} from '@angular/material/dialog/testing';

/** Selectors for different sections of the mat-dialog that can contain user content. */
export const enum MatDialogSection {
  TITLE = '.mat-mdc-dialog-title',
  CONTENT = '.mat-mdc-dialog-content',
  ACTIONS = '.mat-mdc-dialog-actions'
}

/** Harness for interacting with a standard `MatDialog` in tests. */
export class MatDialogHarness extends NonMdcDialogHarness {
  /** The selector for the host element of a `MatDialog` instance. */
  static override hostSelector = '.mat-mdc-dialog-container';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatDialogHarness` that meets
   * certain criteria.
   * @param options Options for filtering which dialog instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static override with(options: DialogHarnessFilters = {}): HarnessPredicate<MatDialogHarness> {
    return new HarnessPredicate(MatDialogHarness, options);
  }

  protected override _title = this.locatorForOptional(MatDialogSection.TITLE);
  protected override _content = this.locatorForOptional(MatDialogSection.CONTENT);
  protected override _actions = this.locatorForOptional(MatDialogSection.ACTIONS);
}
