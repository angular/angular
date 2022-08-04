/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ComponentHarnessConstructor,
  ContentContainerComponentHarness,
  HarnessPredicate,
  TestKey,
} from '@angular/cdk/testing';
import {DialogHarnessFilters} from './dialog-harness-filters';
import {DialogRole} from '@angular/material/dialog';

/** Selectors for different sections of the mat-dialog that can contain user content. */
export const enum MatDialogSection {
  TITLE = '.mat-mdc-dialog-title',
  CONTENT = '.mat-mdc-dialog-content',
  ACTIONS = '.mat-mdc-dialog-actions',
}

/** Base class for the `MatDialogHarness` implementation. */
export class _MatDialogHarnessBase
  // @breaking-change 14.0.0 change generic type to MatDialogSection.
  extends ContentContainerComponentHarness<MatDialogSection | string>
{
  protected _title = this.locatorForOptional(MatDialogSection.TITLE);
  protected _content = this.locatorForOptional(MatDialogSection.CONTENT);
  protected _actions = this.locatorForOptional(MatDialogSection.ACTIONS);

  /** Gets the id of the dialog. */
  async getId(): Promise<string | null> {
    const id = await (await this.host()).getAttribute('id');
    // In case no id has been specified, the "id" property always returns
    // an empty string. To make this method more explicit, we return null.
    return id !== '' ? id : null;
  }

  /** Gets the role of the dialog. */
  async getRole(): Promise<DialogRole | null> {
    return (await this.host()).getAttribute('role') as Promise<DialogRole | null>;
  }

  /** Gets the value of the dialog's "aria-label" attribute. */
  async getAriaLabel(): Promise<string | null> {
    return (await this.host()).getAttribute('aria-label');
  }

  /** Gets the value of the dialog's "aria-labelledby" attribute. */
  async getAriaLabelledby(): Promise<string | null> {
    return (await this.host()).getAttribute('aria-labelledby');
  }

  /** Gets the value of the dialog's "aria-describedby" attribute. */
  async getAriaDescribedby(): Promise<string | null> {
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

  /** Gets te dialog's text. */
  async getText() {
    return (await this.host()).text();
  }

  /** Gets the dialog's title text. This only works if the dialog is using mat-dialog-title. */
  async getTitleText() {
    return (await this._title())?.text() ?? '';
  }

  /** Gets the dialog's content text. This only works if the dialog is using mat-dialog-content. */
  async getContentText() {
    return (await this._content())?.text() ?? '';
  }

  /** Gets the dialog's actions text. This only works if the dialog is using mat-dialog-actions. */
  async getActionsText() {
    return (await this._actions())?.text() ?? '';
  }
}

/** Harness for interacting with a standard `MatDialog` in tests. */
export class MatDialogHarness extends _MatDialogHarnessBase {
  /** The selector for the host element of a `MatDialog` instance. */
  static hostSelector = '.mat-mdc-dialog-container';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a dialog with specific attributes.
   * @param options Options for filtering which dialog instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatDialogHarness>(
    this: ComponentHarnessConstructor<T>,
    options: DialogHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options);
  }
}
