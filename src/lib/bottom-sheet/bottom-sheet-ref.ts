/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {OverlayRef} from '@angular/cdk/overlay';
import {ESCAPE} from '@angular/cdk/keycodes';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {merge} from 'rxjs/observable/merge';
import {filter} from 'rxjs/operators/filter';
import {take} from 'rxjs/operators/take';
import {MatBottomSheetContainer} from './bottom-sheet-container';

/**
 * Reference to a bottom sheet dispatched from the bottom sheet service.
 */
export class MatBottomSheetRef<T = any> {
  /** Instance of the component making up the content of the bottom sheet. */
  instance: T;

  /**
   * Instance of the component into which the bottom sheet content is projected.
   * @docs-private
   */
  containerInstance: MatBottomSheetContainer;

  /** Subject for notifying the user that the bottom sheet has been dismissed. */
  private readonly _afterDismissed = new Subject<void>();

  /** Subject for notifying the user that the bottom sheet has opened and appeared. */
  private readonly _afterOpened = new Subject<void>();

  constructor(containerInstance: MatBottomSheetContainer, private _overlayRef: OverlayRef) {
    this.containerInstance = containerInstance;

    // Emit when opening animation completes
    containerInstance._animationStateChanged.pipe(
      filter(event => event.phaseName === 'done' && event.toState === 'visible'),
      take(1)
    )
    .subscribe(() => {
      this._afterOpened.next();
      this._afterOpened.complete();
    });

    // Dispose overlay when closing animation is complete
    containerInstance._animationStateChanged.pipe(
      filter(event => event.phaseName === 'done' && event.toState === 'hidden'),
      take(1)
    )
    .subscribe(() => {
      this._overlayRef.dispose();
      this._afterDismissed.next();
      this._afterDismissed.complete();
    });

    if (!containerInstance.bottomSheetConfig.disableClose) {
      merge(
        _overlayRef.backdropClick(),
        _overlayRef._keydownEvents.pipe(filter(event => event.keyCode === ESCAPE))
      ).subscribe(() => this.dismiss());
    }
  }

  /** Dismisses the bottom sheet. */
  dismiss(): void {
    if (!this._afterDismissed.closed) {
      // Transition the backdrop in parallel to the bottom sheet.
      this.containerInstance._animationStateChanged.pipe(
        filter(event => event.phaseName === 'start'),
        take(1)
      ).subscribe(() => this._overlayRef.detachBackdrop());

      this.containerInstance.exit();
    }
  }

  /** Gets an observable that is notified when the bottom sheet is finished closing. */
  afterDismissed(): Observable<void> {
    return this._afterDismissed.asObservable();
  }

  /** Gets an observable that is notified when the bottom sheet has opened and appeared. */
  afterOpened(): Observable<void> {
    return this._afterOpened.asObservable();
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
}
