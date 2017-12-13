/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OverlayRef, GlobalPositionStrategy} from '@angular/cdk/overlay';
import {filter} from 'rxjs/operators/filter';
import {take} from 'rxjs/operators/take';
import {DialogPosition} from './dialog-config';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {MatDialogContainer} from './dialog-container';


// TODO(jelbourn): resizing

// Counter for unique dialog ids.
let uniqueId = 0;

/**
 * Reference to a dialog opened via the MatDialog service.
 */
export class MatDialogRef<T, R = any> {
  /** The instance of component opened into the dialog. */
  componentInstance: T;

  /** Whether the user is allowed to close the dialog. */
  disableClose = this._containerInstance._config.disableClose;

  /** Subject for notifying the user that the dialog has finished opening. */
  private _afterOpen = new Subject<void>();

  /** Subject for notifying the user that the dialog has finished closing. */
  private _afterClosed = new Subject<R | undefined>();

  /** Subject for notifying the user that the dialog has started closing. */
  private _beforeClose = new Subject<R | undefined>();

  /** Result to be passed to afterClosed. */
  private _result: R | undefined;

  constructor(
    private _overlayRef: OverlayRef,
    private _containerInstance: MatDialogContainer,
    readonly id: string = `mat-dialog-${uniqueId++}`) {

    // Emit when opening animation completes
    _containerInstance._animationStateChanged.pipe(
      filter(event => event.phaseName === 'done' && event.toState === 'enter'),
      take(1)
    )
    .subscribe(() => {
      this._afterOpen.next();
      this._afterOpen.complete();
    });

    // Dispose overlay when closing animation is complete
    _containerInstance._animationStateChanged.pipe(
      filter(event => event.phaseName === 'done' && event.toState === 'exit'),
      take(1)
    )
    .subscribe(() => {
      this._overlayRef.dispose();
      this._afterClosed.next(this._result);
      this._afterClosed.complete();
      this.componentInstance = null!;
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
      filter(event => event.phaseName === 'start'),
      take(1)
    )
    .subscribe(() => {
      this._beforeClose.next(dialogResult);
      this._beforeClose.complete();
      this._overlayRef.detachBackdrop();
    });

    this._containerInstance._startExitAnimation();
  }

  /**
   * Gets an observable that is notified when the dialog is finished opening.
   */
  afterOpen(): Observable<void> {
    return this._afterOpen.asObservable();
  }

  /**
   * Gets an observable that is notified when the dialog is finished closing.
   */
  afterClosed(): Observable<R | undefined> {
    return this._afterClosed.asObservable();
  }

  /**
   * Gets an observable that is notified when the dialog has started closing.
   */
  beforeClose(): Observable<R | undefined> {
    return this._beforeClose.asObservable();
  }

  /**
   * Gets an observable that emits when the overlay's backdrop has been clicked.
   */
  backdropClick(): Observable<void> {
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
  updateSize(width: string = 'auto', height: string = 'auto'): this {
    this._getPositionStrategy().width(width).height(height);
    this._overlayRef.updatePosition();
    return this;
  }

  /** Fetches the position strategy object from the overlay ref. */
  private _getPositionStrategy(): GlobalPositionStrategy {
    return this._overlayRef.getConfig().positionStrategy as GlobalPositionStrategy;
  }
}
