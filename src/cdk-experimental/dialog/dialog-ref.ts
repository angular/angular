/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {OverlayRef, GlobalPositionStrategy, OverlaySizeConfig} from '@angular/cdk/overlay';
import {ESCAPE} from '@angular/cdk/keycodes';
import {Observable} from 'rxjs/Observable';
import {map} from 'rxjs/operators/map';
import {filter} from 'rxjs/operators/filter';
import {DialogPosition} from './dialog-config';
import {CdkDialogContainer} from './dialog-container';

/** Unique id for the created dialog. */
let uniqueId = 0;

/**
 * Reference to a dialog opened via the Dialog service.
 */
export class DialogRef<T, R = any> {
  /** The instance of the component in the dialog. */
  componentInstance: T;

  /** Whether the user is allowed to close the dialog. */
  disableClose: boolean | undefined;

  /** Result to be passed to afterClosed. */
  private _result: R | undefined;

  constructor(
    public _overlayRef: OverlayRef,
    protected _containerInstance: CdkDialogContainer,
    readonly id: string = `dialog-${uniqueId++}`) {

    // If the dialog has a backdrop, handle clicks from the backdrop.
    if (_containerInstance._config.hasBackdrop) {
      _overlayRef.backdropClick().subscribe(() => {
        if (!this.disableClose) {
          this.close();
        }
      });
    }

    this.beforeClose().subscribe(() => {
      this._overlayRef.detachBackdrop();
    });

    this.afterClosed().subscribe(() => {
      this._overlayRef.detach();
      this._overlayRef.dispose();
      this.componentInstance = null!;
    });

    // Close when escape keydown event occurs
    _overlayRef.keydownEvents()
      .pipe(filter(event => event.keyCode === ESCAPE && !this.disableClose))
      .subscribe(() => this.close());
  }

  /** Gets an observable that emits when the overlay's backdrop has been clicked. */
  backdropClick(): Observable<void> {
    return this._overlayRef.backdropClick();
  }

  /**
   * Close the dialog.
   * @param dialogResult Optional result to return to the dialog opener.
   */
  close(dialogResult?: R): void {
    this._result = dialogResult;
    this._containerInstance._startExiting();
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
   * Gets an observable that emits when keydown events are targeted on the overlay.
   */
  keydownEvents(): Observable<KeyboardEvent> {
    return this._overlayRef.keydownEvents();
  }

  /**
   * Updates the dialog's width and height, defined, min and max.
   * @param size New size for the overlay.
   */
  updateSize(size: OverlaySizeConfig): this {
    if (size.width) {
      this._getPositionStrategy().width(size.width.toString());
    }
    if (size.height) {
      this._getPositionStrategy().height(size.height.toString());
    }
    this._overlayRef.updateSize(size);
    this._overlayRef.updatePosition();
    return this;
  }

  /** Fetches the position strategy object from the overlay ref. */
  private _getPositionStrategy(): GlobalPositionStrategy {
    return this._overlayRef.getConfig().positionStrategy as GlobalPositionStrategy;
  }

  /** Gets an observable that emits when dialog begins opening. */
  beforeOpen(): Observable<void> {
    return this._containerInstance._beforeEnter.asObservable();
  }

  /** Gets an observable that emits when dialog is finished opening. */
  afterOpen(): Observable<void> {
    return this._containerInstance._afterEnter.asObservable();
  }

  /** Gets an observable that emits when dialog begins closing. */
  beforeClose(): Observable<R | undefined> {
    return this._containerInstance._beforeExit.pipe(map(() => this._result));
  }

  /** Gets an observable that emits when dialog is finished closing. */
  afterClosed(): Observable<R | undefined> {
    return this._containerInstance._afterExit.pipe(map(() => this._result));
  }
}
