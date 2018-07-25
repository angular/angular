/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, NgZone, OnDestroy, Inject} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {supportsPassiveEventListeners} from '@angular/cdk/platform';
import {Subject} from 'rxjs';
import {CdkDrop} from './drop';
import {CdkDrag} from './drag';

/** Event options that can be used to bind an active event. */
const activeEventOptions = supportsPassiveEventListeners() ? {passive: false} : false;

/** Handler for a pointer event callback. */
type PointerEventHandler = (event: TouchEvent | MouseEvent) => void;

/**
 * Service that keeps track of all the `CdkDrag` and `CdkDrop` instances, and
 * manages global event listeners on the `document`.
 * @docs-private
 */
@Injectable({providedIn: 'root'})
export class CdkDragDropRegistry implements OnDestroy {
  private _document: Document;

  /** Registered `CdkDrop` instances. */
  private _dropInstances = new Set<CdkDrop>();

  /** Registered `CdkDrag` instances. */
  private _dragInstances = new Set<CdkDrag>();

  /** `CdkDrag` instances that are currently being dragged. */
  private _activeDragInstances = new Set<CdkDrag>();

  /** Keeps track of the event listeners that we've bound to the `document`. */
  private _globalListeners = new Map<string, {handler: PointerEventHandler, options?: any}>();

  /**
   * Emits the `touchmove` or `mousemove` events that are dispatched
   * while the user is dragging a `CdkDrag` instance.
   */
  readonly pointerMove: Subject<TouchEvent | MouseEvent> = new Subject<TouchEvent | MouseEvent>();

  /**
   * Emits the `touchend` or `mouseup` events that are dispatched
   * while the user is dragging a `CdkDrag` instance.
   */
  readonly pointerUp: Subject<TouchEvent | MouseEvent> = new Subject<TouchEvent | MouseEvent>();

  constructor(
    private _ngZone: NgZone,
    @Inject(DOCUMENT) _document: any) {
    this._document = _document;
  }

  /** Adds a `CdkDrop` instance to the registry. */
  register(drop: CdkDrop);

  /** Adds a `CdkDrag` instance to the registry. */
  register(drag: CdkDrag);

  register(instance: CdkDrop | CdkDrag) {
    if (instance instanceof CdkDrop) {
      if (!this._dropInstances.has(instance)) {
        if (this.getDropContainer(instance.id)) {
          throw Error(`Drop instance with id "${instance.id}" has already been registered.`);
        }

        this._dropInstances.add(instance);
      }
    } else {
      this._dragInstances.add(instance);

      if (this._dragInstances.size === 1) {
        this._ngZone.runOutsideAngular(() => {
          // The event handler has to be explicitly active, because
          // newer browsers make it passive by default.
          this._document.addEventListener('touchmove', this._preventScrollListener,
              activeEventOptions);
        });
      }
    }
  }

  /** Removes a `CdkDrop` instance from the registry. */
  remove(drop: CdkDrop);

  /** Removes a `CdkDrag` instance from the registry. */
  remove(drag: CdkDrag);

  remove(instance: CdkDrop | CdkDrag) {
    if (instance instanceof CdkDrop) {
      this._dropInstances.delete(instance);
    } else {
      this._dragInstances.delete(instance);
      this.stopDragging(instance);

      if (this._dragInstances.size === 0) {
        this._document.removeEventListener('touchmove', this._preventScrollListener,
            activeEventOptions as any);
      }
    }
  }

  /**
   * Starts the dragging sequence for a drag instance.
   * @param drag Drag instance which is being dragged.
   * @param event Event that initiated the dragging.
   */
  startDragging(drag: CdkDrag, event: TouchEvent | MouseEvent) {
    this._activeDragInstances.add(drag);

    if (this._activeDragInstances.size === 1) {
      const isTouchEvent = event.type.startsWith('touch');
      const moveEvent = isTouchEvent ? 'touchmove' : 'mousemove';
      const upEvent = isTouchEvent ? 'touchend' : 'mouseup';

      // We explicitly bind __active__ listeners here, because newer browsers will default to
      // passive ones for `mousemove` and `touchmove`. The events need to be active, because we
      // use `preventDefault` to prevent the page from scrolling while the user is dragging.
      this._globalListeners
        .set(moveEvent, {handler: e => this.pointerMove.next(e), options: activeEventOptions})
        .set(upEvent, {handler: e => this.pointerUp.next(e)})
        .forEach((config, name) => {
          this._ngZone.runOutsideAngular(() => {
            this._document.addEventListener(name, config.handler, config.options);
          });
        });
    }
  }

  /** Stops dragging a `CdkDrag` instance. */
  stopDragging(drag: CdkDrag) {
    this._activeDragInstances.delete(drag);

    if (this._activeDragInstances.size === 0) {
      this._clearGlobalListeners();
    }
  }

  /** Gets whether a `CdkDrag` instance is currently being dragged. */
  isDragging(drag: CdkDrag) {
    return this._activeDragInstances.has(drag);
  }

  /** Gets a `CdkDrop` instance by its id. */
  getDropContainer<T = any>(id: string): CdkDrop<T> | undefined {
    return Array.from(this._dropInstances).find(instance => instance.id === id);
  }

  ngOnDestroy() {
    this._dragInstances.forEach(instance => this.remove(instance));
    this._dropInstances.forEach(instance => this.remove(instance));
    this._clearGlobalListeners();
    this.pointerMove.complete();
    this.pointerUp.complete();
  }

  /**
   * Listener used to prevent `touchmove` events while the element is being dragged.
   * This gets bound once, ahead of time, because WebKit won't preventDefault on a
   * dynamically-added `touchmove` listener. See https://bugs.webkit.org/show_bug.cgi?id=184250.
   */
  private _preventScrollListener = (event: TouchEvent) => {
    if (this._activeDragInstances.size) {
      event.preventDefault();
    }
  }

  /** Clears out the global event listeners from the `document`. */
  private _clearGlobalListeners() {
    this._globalListeners.forEach((config, name) => {
      this._document.removeEventListener(name, config.handler, config.options);
    });

    this._globalListeners.clear();
  }
}
