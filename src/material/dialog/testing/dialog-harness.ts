/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ContentContainerComponentHarness, HarnessPredicate, TestKey} from '@angular/cdk/testing';
import {DialogRole} from '@angular/material/dialog';
import {DialogHarnessFilters} from './dialog-harness-filters';

/** Harness for interacting with a standard `MatDialog` in tests. */
export class MatDialogHarness extends ContentContainerComponentHarness<string> {
  // Developers can provide a custom component or template for the
  // dialog. The canonical dialog parent is the "MatDialogContainer".
  /** The selector for the host element of a `MatDialog` instance. */
  static hostSelector = '.mat-dialog-container';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatDialogHarness` that meets
   * certain criteria.
   * @param options Options for filtering which dialog instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: DialogHarnessFilters = {}): HarnessPredicate<MatDialogHarness> {
    return new HarnessPredicate(MatDialogHarness, options);
  }

  /** Gets the id of the dialog. */
  async getId(): Promise<string|null> {
    const id = await (await this.host()).getAttribute('id');
    // In case no id has been specified, the "id" property always returns
    // an empty string. To make this method more explicit, we return null.
    return id !== '' ? id : null;
  }

  /** Gets the role of the dialog. */
  async getRole(): Promise<DialogRole|null> {
    return (await this.host()).getAttribute('role') as Promise<DialogRole|null>;
  }

  /** Gets the value of the dialog's "aria-label" attribute. */
  async getAriaLabel(): Promise<string|null> {
    return (await this.host()).getAttribute('aria-label');
  }

  /** Gets the value of the dialog's "aria-labelledby" attribute. */
  async getAriaLabelledby(): Promise<string|null> {
    return (await this.host()).getAttribute('aria-labelledby');
  }

  /** Gets the value of the dialog's "aria-describedby" attribute. */
  async getAriaDescribedby(): Promise<string|null> {
    return (await this.host()).getAttribute('aria-describedby');
  }

  /**
   * Closes the dialog by pressing escape.
   *
   * Note: this method does nothing if `disableClose` has been set to `true` for the dialog.
   */
  async close(): Promise<void> {
    await (await this.host()).sendKeys(TestKey.ESCAPE);
  }
}
