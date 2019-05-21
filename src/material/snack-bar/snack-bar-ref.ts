/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OverlayRef} from '@angular/cdk/overlay';
import {Observable, Subject} from 'rxjs';
import {MatSnackBarContainer} from './snack-bar-container';


/** Event that is emitted when a snack bar is dismissed. */
export interface MatSnackBarDismiss {
  /** Whether the snack bar was dismissed using the action button. */
  dismissedByAction: boolean;
}

/**
 * Reference to a snack bar dispatched from the snack bar service.
 */
export class MatSnackBarRef<T> {
  /** The instance of the component making up the content of the snack bar. */
  instance: T;

  /**
   * The instance of the component making up the content of the snack bar.
   * @docs-private
   */
  containerInstance: MatSnackBarContainer;

  /** Subject for notifying the user that the snack bar has been dismissed. */
  private readonly _afterDismissed = new Subject<MatSnackBarDismiss>();

  /** Subject for notifying the user that the snack bar has opened and appeared. */
  private readonly _afterOpened = new Subject<void>();

  /** Subject for notifying the user that the snack bar action was called. */
  private readonly _onAction = new Subject<void>();

  /**
   * Timeout ID for the duration setTimeout call. Used to clear the timeout if the snackbar is
   * dismissed before the duration passes.
   */
  private _durationTimeoutId: number;

  /** Whether the snack bar was dismissed using the action button. */
  private _dismissedByAction = false;

  constructor(containerInstance: MatSnackBarContainer,
              private _overlayRef: OverlayRef) {
    this.containerInstance = containerInstance;
    // Dismiss snackbar on action.
    this.onAction().subscribe(() => this.dismiss());
    containerInstance._onExit.subscribe(() => this._finishDismiss());
  }

  /** Dismisses the snack bar. */
  dismiss(): void {
    if (!this._afterDismissed.closed) {
      this.containerInstance.exit();
    }
    clearTimeout(this._durationTimeoutId);
  }

  /** Marks the snackbar action clicked. */
  dismissWithAction(): void {
    if (!this._onAction.closed) {
      this._dismissedByAction = true;
      this._onAction.next();
      this._onAction.complete();
    }
  }


  /**
   * Marks the snackbar action clicked.
   * @deprecated Use `dismissWithAction` instead.
   * @breaking-change 8.0.0
   */
  closeWithAction(): void {
    this.dismissWithAction();
  }

  /** Dismisses the snack bar after some duration */
  _dismissAfter(duration: number): void {
    this._durationTimeoutId = setTimeout(() => this.dismiss(), duration);
  }

  /** Marks the snackbar as opened */
  _open(): void {
    if (!this._afterOpened.closed) {
      this._afterOpened.next();
      this._afterOpened.complete();
    }
  }

  /** Cleans up the DOM after closing. */
  private _finishDismiss(): void {
    this._overlayRef.dispose();

    if (!this._onAction.closed) {
      this._onAction.complete();
    }

    this._afterDismissed.next({dismissedByAction: this._dismissedByAction});
    this._afterDismissed.complete();
    this._dismissedByAction = false;
  }

  /** Gets an observable that is notified when the snack bar is finished closing. */
  afterDismissed(): Observable<MatSnackBarDismiss> {
    return this._afterDismissed.asObservable();
  }

  /** Gets an observable that is notified when the snack bar has opened and appeared. */
  afterOpened(): Observable<void> {
    return this.containerInstance._onEnter;
  }

  /** Gets an observable that is notified when the snack bar action is called. */
  onAction(): Observable<void> {
    return this._onAction.asObservable();
  }
}
