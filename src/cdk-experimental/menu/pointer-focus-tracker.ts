/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {QueryList, ElementRef} from '@angular/core';
import {fromEvent, Observable, defer, Subject} from 'rxjs';
import {mapTo, mergeAll, takeUntil, startWith, mergeMap} from 'rxjs/operators';

/** Item to track for mouse focus events. */
export interface FocusableElement {
  /** A reference to the element to be tracked. */
  _elementRef: ElementRef<HTMLElement>;
}

/**
 * PointerFocusTracker keeps track of the currently active item under mouse focus. It also has
 * observables which emit when the users mouse enters and leaves a tracked element.
 */
export class PointerFocusTracker<T extends FocusableElement> {
  /** Emits when an element is moused into. */
  readonly entered: Observable<T> = this._getItemPointerEntries();

  /** Emits when an element is moused out. */
  readonly exited: Observable<T> = this._getItemPointerExits();

  /** The element currently under mouse focus. */
  activeElement?: T;

  /** The element previously under mouse focus. */
  previousElement?: T;

  /** Emits when this is destroyed. */
  private readonly _destroyed: Subject<void> = new Subject();

  constructor(private readonly _items: QueryList<T>) {
    this.entered.subscribe(element => (this.activeElement = element));
    this.exited.subscribe(() => {
      this.previousElement = this.activeElement;
      this.activeElement = undefined;
    });
  }

  /**
   * Gets a stream of pointer (mouse) entries into the given items.
   * This should typically run outside the Angular zone.
   */
  private _getItemPointerEntries(): Observable<T> {
    return defer(() =>
      this._items.changes.pipe(
        startWith(this._items),
        mergeMap((list: QueryList<T>) =>
          list.map(element =>
            fromEvent(element._elementRef.nativeElement, 'mouseenter').pipe(
              mapTo(element),
              takeUntil(this._items.changes)
            )
          )
        ),
        mergeAll()
      )
    );
  }

  /**
   * Gets a stream of pointer (mouse) exits out of the given items.
   * This should typically run outside the Angular zone.
   */
  private _getItemPointerExits() {
    return defer(() =>
      this._items.changes.pipe(
        startWith(this._items),
        mergeMap((list: QueryList<T>) =>
          list.map(element =>
            fromEvent(element._elementRef.nativeElement, 'mouseout').pipe(
              mapTo(element),
              takeUntil(this._items.changes)
            )
          )
        ),
        mergeAll()
      )
    );
  }

  /** Stop the managers listeners. */
  destroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }
}
