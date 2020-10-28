/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AriaLivePoliteness} from '@angular/cdk/a11y';
import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {SnackBarHarnessFilters} from './snack-bar-harness-filters';

/** Harness for interacting with an MDC-based mat-snack-bar in tests. */
export class MatSnackBarHarness extends ComponentHarness {
  // Developers can provide a custom component or template for the
  // snackbar. The canonical snack-bar parent is the "MatSnackBarContainer".
  // We use `:not([mat-exit])` to exclude snack bars that are in the process of being dismissed,
  // because the element only gets removed after the animation is finished and since it runs
  // outside of Angular, we don't have a way of being notified when it's done.
  /** The selector for the host element of a `MatSnackBar` instance. */
  static hostSelector = '.mat-mdc-snack-bar-container:not([mat-exit])';

  private _simpleSnackBar = this.locatorForOptional('.mat-mdc-simple-snack-bar');
  private _simpleSnackBarLiveRegion = this.locatorFor('[aria-live]');
  private _simpleSnackBarMessage =
      this.locatorFor('.mat-mdc-simple-snack-bar .mat-mdc-snack-bar-label');
  private _simpleSnackBarActionButton =
      this.locatorForOptional('.mat-mdc-simple-snack-bar .mat-mdc-snack-bar-action');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatSnackBarHarness` that meets
   * certain criteria.
   * @param options Options for filtering which snack bar instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: SnackBarHarnessFilters = {}): HarnessPredicate<MatSnackBarHarness> {
    return new HarnessPredicate(MatSnackBarHarness, options);
  }

  /**
   * Gets the role of the snack-bar. The role of a snack-bar is determined based
   * on the ARIA politeness specified in the snack-bar config.
   * @deprecated Use `getAriaLive` instead.
   * @breaking-change 13.0.0
   */
  async getRole(): Promise<'alert'|'status'|null> {
    return (await this.host()).getAttribute('role') as Promise<'alert'|'status'|null>;
  }

  /**
   * Gets the aria-live of the snack-bar's live region. The aria-live of a snack-bar is
   * determined based on the ARIA politeness specified in the snack-bar config.
   */
  async getAriaLive(): Promise<AriaLivePoliteness> {
    return (await this._simpleSnackBarLiveRegion())
        .getAttribute('aria-live') as Promise<AriaLivePoliteness>;
  }

  /**
   * Whether the snack-bar has an action. Method cannot be used for snack-bar's with custom content.
   */
  async hasAction(): Promise<boolean> {
    await this._assertSimpleSnackBar();
    return (await this._simpleSnackBarActionButton()) !== null;
  }

  /**
   * Gets the description of the snack-bar. Method cannot be used for snack-bar's without action or
   * with custom content.
   */
  async getActionDescription(): Promise<string> {
    await this._assertSimpleSnackBarWithAction();
    return (await this._simpleSnackBarActionButton())!.text();
  }


  /**
   * Dismisses the snack-bar by clicking the action button. Method cannot be used for snack-bar's
   * without action or with custom content.
   */
  async dismissWithAction(): Promise<void> {
    await this._assertSimpleSnackBarWithAction();
    await (await this._simpleSnackBarActionButton())!.click();
  }

  /**
   * Gets the message of the snack-bar. Method cannot be used for snack-bar's with custom content.
   */
  async getMessage(): Promise<string> {
    await this._assertSimpleSnackBar();
    return (await this._simpleSnackBarMessage()).text();
  }

  /** Gets whether the snack-bar has been dismissed. */
  async isDismissed(): Promise<boolean> {
    // We consider the snackbar dismissed if it's not in the DOM. We can assert that the
    // element isn't in the DOM by seeing that its width and height are zero.

    const host = await this.host();
    const [exit, dimensions] = await Promise.all([
      // The snackbar container is marked with the "exit" attribute after it has been dismissed
      // but before the animation has finished (after which it's removed from the DOM).
      host.getAttribute('mat-exit'),
      host.getDimensions(),
    ]);

    return exit != null || (!!dimensions && dimensions.height === 0 && dimensions.width === 0);
  }

  /**
   * Asserts that the current snack-bar does not use custom content. Promise rejects if
   * custom content is used.
   */
  private async _assertSimpleSnackBar(): Promise<void> {
    if (!await this._isSimpleSnackBar()) {
      throw Error('Method cannot be used for snack-bar with custom content.');
    }
  }

  /**
   * Asserts that the current snack-bar does not use custom content and has
   * an action defined. Otherwise the promise will reject.
   */
  private async _assertSimpleSnackBarWithAction(): Promise<void> {
    await this._assertSimpleSnackBar();
    if (!await this.hasAction()) {
      throw Error('Method cannot be used for standard snack-bar without action.');
    }
  }

  /** Whether the snack-bar is using the default content template. */
  private async _isSimpleSnackBar(): Promise<boolean> {
    return await this._simpleSnackBar() !== null;
  }
}
