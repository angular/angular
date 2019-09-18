/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {SnackBarHarnessFilters} from './snack-bar-harness-filters';

/**
 * Harness for interacting with a standard mat-snack-bar in tests.
 * @dynamic
 */
export class MatSnackBarHarness extends ComponentHarness {
  // Developers can provide a custom component or template for the
  // snackbar. The canonical snack-bar parent is the "MatSnackBarContainer".
  static hostSelector = '.mat-snack-bar-container';

  private _simpleSnackBar = this.locatorForOptional('.mat-simple-snackbar');
  private _simpleSnackBarMessage = this.locatorFor('.mat-simple-snackbar > span');
  private _simpleSnackBarActionButton =
      this.locatorForOptional('.mat-simple-snackbar-action > button');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a snack-bar with
   * specific attributes.
   * @param options Options for narrowing the search.
   *   - `selector` finds a snack-bar that matches the given selector. Note that the
   *                selector must match the snack-bar container element.
   * @return `HarnessPredicate` configured with the given options.
   */
  static with(options: SnackBarHarnessFilters = {}): HarnessPredicate<MatSnackBarHarness> {
    return new HarnessPredicate(MatSnackBarHarness, options);
  }

  /**
   * Gets the role of the snack-bar. The role of a snack-bar is determined based
   * on the ARIA politeness specified in the snack-bar config.
   */
  async getRole(): Promise<'alert'|'status'|null> {
    return (await this.host()).getAttribute('role') as Promise<'alert'|'status'|null>;
  }

  /**
   * Gets whether the snack-bar has an action. Method cannot be
   * used for snack-bar's with custom content.
   */
  async hasAction(): Promise<boolean> {
    await this._assertSimpleSnackBar();
    return (await this._simpleSnackBarActionButton()) !== null;
  }

  /**
   * Gets the description of the snack-bar. Method cannot be
   * used for snack-bar's without action or with custom content.
   */
  async getActionDescription(): Promise<string> {
    await this._assertSimpleSnackBarWithAction();
    return (await this._simpleSnackBarActionButton())!.text();
  }


  /**
   * Dismisses the snack-bar by clicking the action button. Method cannot
   * be used for snack-bar's without action or with custom content.
   */
  async dismissWithAction(): Promise<void> {
    await this._assertSimpleSnackBarWithAction();
    await (await this._simpleSnackBarActionButton())!.click();
  }

  /**
   * Gets the message of the snack-bar. Method cannot be used for
   * snack-bar's with custom content.
   */
  async getMessage(): Promise<string> {
    await this._assertSimpleSnackBar();
    return (await this._simpleSnackBarMessage()).text();
  }

  /**
   * Asserts that the current snack-bar does not use custom content. Throws if
   * custom content is used.
   */
  private async _assertSimpleSnackBar(): Promise<void> {
    if (!await this._isSimpleSnackBar()) {
      throw new Error('Method cannot be used for snack-bar with custom content.');
    }
  }

  /**
   * Asserts that the current snack-bar does not use custom content and has
   * an action defined. Otherwise an error will be thrown.
   */
  private async _assertSimpleSnackBarWithAction(): Promise<void> {
    await this._assertSimpleSnackBar();
    if (!await this.hasAction()) {
      throw new Error('Method cannot be used for standard snack-bar without action.');
    }
  }

  /** Gets whether the snack-bar is using the default content template. */
  private async _isSimpleSnackBar(): Promise<boolean> {
    return await this._simpleSnackBar() !== null;
  }
}
