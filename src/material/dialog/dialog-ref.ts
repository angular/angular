/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusOrigin} from '@angular/cdk/a11y';
import {ESCAPE, hasModifierKey} from '@angular/cdk/keycodes';
import {GlobalPositionStrategy, OverlayRef} from '@angular/cdk/overlay';
import {Observable, Subject} from 'rxjs';
import {filter, take} from 'rxjs/operators';
import {DialogPosition} from './dialog-config';
import {_MatDialogContainerBase} from './dialog-container';


// TODO(jelbourn): resizing

// Counter for unique dialog ids.
let uniqueId = 0;

/** Possible states of the lifecycle of a dialog. */
export const enum MatDialogState {OPEN, CLOSING, CLOSED}

/**
 * Reference to a dialog opened via the MatDialog service.
 */
export class MatDialogRef<T, R = any> {
  /** The instance of component opened into the dialog. */
  componentInstance: T;

  /** Whether the user is allowed to close the dialog. */
  disableClose: boolean | undefined = this._containerInstance._config.disableClose;

  /** Subject for notifying the user that the dialog has finished opening. */
  private readonly _afterOpened = new Subject<void>();

  /** Subject for notifying the user that the dialog has finished closing. */
  private readonly _afterClosed = new Subject<R | undefined>();

  /** Subject for notifying the user that the dialog has started closing. */
  private readonly _beforeClosed = new Subject<R | undefined>();

  /** Result to be passed to afterClosed. */
  private _result: R | undefined;

  /** Handle to the timeout that's running as a fallback in case the exit animation doesn't fire. */
  private _closeFallbackTimeout: number;

  /** Current state of the dialog. */
  private _state = MatDialogState.OPEN;

  constructor(
    private _overlayRef: OverlayRef,
    public _containerInstance: _MatDialogContainerBase,
    /** Id of the dialog. */
    readonly id: string = `mat-dialog-${uniqueId++}`) {

    // Pass the id along to the container.
    _containerInstance._id = id;

    // Emit when opening animation completes
    _containerInstance._animationStateChanged.pipe(
      filter(event => event.state === 'opened'),
      take(1)
    )
    .subscribe(() => {
      this._afterOpened.next();
      this._afterOpened.complete();
    });

    // Dispose overlay when closing animation is complete
    _containerInstance._animationStateChanged.pipe(
      filter(event => event.state === 'closed'),
      take(1)
    ).subscribe(() => {
      clearTimeout(this._closeFallbackTimeout);
      this._finishDialogClose();
    });

    _overlayRef.detachments().subscribe(() => {
      this._beforeClosed.next(this._result);
      this._beforeClosed.complete();
      this._afterClosed.next(this._result);
      this._afterClosed.complete();
      this.componentInstance = null!;
      this._overlayRef.dispose();
    });

    _overlayRef.keydownEvents()
      .pipe(filter(event => {
        return event.keyCode === ESCAPE && !this.disableClose && !hasModifierKey(event);
      }))
      .subscribe(event => {
        event.preventDefault();
        _closeDialogVia(this, 'keyboard');
      });

    _overlayRef.backdropClick().subscribe(() => {
      if (this.disableClose) {
        this._containerInstance._recaptureFocus();
      } else {
        _closeDialogVia(this, 'mouse');
      }
    });
  }

  /**
   * Close the dialog.
   * @param dialogResult Optional result to return to the dialog opener.
   */
  close(dialogResult?: R): void {
    this._result = dialogResult;

    // Transition the backdrop in parallel to the dialog.
    this._containerInstance._animationStateChanged.pipe(
      filter(event => event.state === 'closing'),
      take(1)
    )
    .subscribe(event => {
      this._beforeClosed.next(dialogResult);
      this._beforeClosed.complete();
      this._overlayRef.detachBackdrop();

      // The logic that disposes of the overlay depends on the exit animation completing, however
      // it isn't guaranteed if the parent view is destroyed while it's running. Add a fallback
      // timeout which will clean everything up if the animation hasn't fired within the specified
      // amount of time plus 100ms. We don't need to run this outside the NgZone, because for the
      // vast majority of cases the timeout will have been cleared before it has the chance to fire.
      this._closeFallbackTimeout = setTimeout(() => this._finishDialogClose(),
          event.totalTime + 100);
    });

    this._state = MatDialogState.CLOSING;
    this._containerInstance._startExitAnimation();
  }

  /**
   * Gets an observable that is notified when the dialog is finished opening.
   */
  afterOpened(): Observable<void> {
    return this._afterOpened;
  }

  /**
   * Gets an observable that is notified when the dialog is finished closing.
   */
  afterClosed(): Observable<R | undefined> {
    return this._afterClosed;
  }

  /**
   * Gets an observable that is notified when the dialog has started closing.
   */
  beforeClosed(): Observable<R | undefined> {
    return this._beforeClosed;
  }

  /**
   * Gets an observable that emits when the overlay's backdrop has been clicked.
   */
  backdropClick(): Observable<MouseEvent> {
    return this._overlayRef.backdropClick();
  }

  /**
   * Gets an observable that emits when keydown events are targeted on the overlay.
   */
  keydownEvents(): Observable<KeyboardEvent> {
    return this._overlayRef.keydownEvents();
  }

  /**
   * Updates the dialog's position.
   * @param position New dialog position.
   */
  updatePosition(position?: DialogPosition): this {
    let strategy = this._getPositionStrategy();

    if (position && (position.left || position.right)) {
      position.left ? strategy.left(position.left) : strategy.right(position.right);
    } else {
      strategy.centerHorizontally();
    }

    if (position && (position.top || position.bottom)) {
      position.top ? strategy.top(position.top) : strategy.bottom(position.bottom);
    } else {
      strategy.centerVertically();
    }

    this._overlayRef.updatePosition();

    return this;
  }

  /**
   * Updates the dialog's width and height.
   * @param width New width of the dialog.
   * @param height New height of the dialog.
   */
  updateSize(width: string = '', height: string = ''): this {
    this._overlayRef.updateSize({width, height});
    this._overlayRef.updatePosition();
    return this;
  }

  /** Add a CSS class or an array of classes to the overlay pane. */
  addPanelClass(classes: string | string[]): this {
    this._overlayRef.addPanelClass(classes);
    return this;
  }

  /** Remove a CSS class or an array of classes from the overlay pane. */
  removePanelClass(classes: string | string[]): this {
    this._overlayRef.removePanelClass(classes);
    return this;
  }

  /** Gets the current state of the dialog's lifecycle. */
  getState(): MatDialogState {
    return this._state;
  }

  /**
   * Finishes the dialog close by updating the state of the dialog
   * and disposing the overlay.
   */
  private _finishDialogClose() {
    this._state = MatDialogState.CLOSED;
    this._overlayRef.dispose();
  }

  /** Fetches the position strategy object from the overlay ref. */
  private _getPositionStrategy(): GlobalPositionStrategy {
    return this._overlayRef.getConfig().positionStrategy as GlobalPositionStrategy;
  }
}

/**
 * Closes the dialog with the specified interaction type. This is currently not part of
 * `MatDialogRef` as that would conflict with custom dialog ref mocks provided in tests.
 * More details. See: https://github.com/angular/components/pull/9257#issuecomment-651342226.
 */
// TODO: TODO: Move this back into `MatDialogRef` when we provide an official mock dialog ref.
export function _closeDialogVia<R>(ref: MatDialogRef<R>, interactionType: FocusOrigin, result?: R) {
  // Some mock dialog ref instances in tests do not have the `_containerInstance` property.
  // For those, we keep the behavior as is and do not deal with the interaction type.
  if (ref._containerInstance !== undefined) {
    ref._containerInstance._closeInteractionType = interactionType;
  }
  return ref.close(result);
}
