/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, NgZone, OnDestroy, Inject} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {normalizePassiveListenerOptions} from '@angular/cdk/platform';
import {Subject} from 'rxjs';
import {toggleNativeDragInteractions} from './drag-styling';

/** Event options that can be used to bind an active event. */
const activeEventOptions = normalizePassiveListenerOptions({passive: false});

/** Handler for a pointer event callback. */
type PointerEventHandler = (event: TouchEvent | MouseEvent) => void;

/**
 * Service that keeps track of all the drag item and drop container
 * instances, and manages global event listeners on the `document`.
 * @docs-private
 */
// Note: this class is generic, rather than referencing CdkDrag and CdkDropList directly, in order
// to avoid circular imports. If we were to reference them here, importing the registry into the
// classes that are registering themselves will introduce a circular import.
@Injectable({providedIn: 'root'})
export class DragDropRegistry<I, C extends {id: string}> implements OnDestroy {
  private _document: Document;

  /** Registered drop container instances. */
  private _dropInstances = new Set<C>();

  /** Registered drag item instances. */
  private _dragInstances = new Set<I>();

  /** Drag item instances that are currently being dragged. */
  private _activeDragInstances = new Set<I>();

  /** Keeps track of the event listeners that we've bound to the `document`. */
  private _globalListeners = new Map<'touchmove' | 'mousemove' | 'touchend' | 'mouseup', {
    handler: PointerEventHandler,
    options?: any
  }>();

  /**
   * Emits the `touchmove` or `mousemove` events that are dispatched
   * while the user is dragging a drag item instance.
   */
  readonly pointerMove: Subject<TouchEvent | MouseEvent> = new Subject<TouchEvent | MouseEvent>();

  /**
   * Emits the `touchend` or `mouseup` events that are dispatched
   * while the user is dragging a drag item instance.
   */
  readonly pointerUp: Subject<TouchEvent | MouseEvent> = new Subject<TouchEvent | MouseEvent>();

  constructor(
    private _ngZone: NgZone,
    @Inject(DOCUMENT) _document: any) {
    this._document = _document;
  }

  /** Adds a drop container to the registry. */
  registerDropContainer(drop: C) {
    if (!this._dropInstances.has(drop)) {
      if (this.getDropContainer(drop.id)) {
        throw Error(`Drop instance with id "${drop.id}" has already been registered.`);
      }

      this._dropInstances.add(drop);
    }
  }

  /** Adds a drag item instance to the registry. */
  registerDragItem(drag: I) {
    this._dragInstances.add(drag);

    if (this._dragInstances.size === 1) {
      this._ngZone.runOutsideAngular(() => {
        // The event handler has to be explicitly active, because
        // newer browsers make it passive by default.
        this._document.addEventListener('touchmove', this._preventScrollListener,
            activeEventOptions);
      });
    }
  }

  /** Removes a drop container from the registry. */
  removeDropContainer(drop: C) {
    this._dropInstances.delete(drop);
  }

  /** Removes a drag item instance from the registry. */
  removeDragItem(drag: I) {
    this._dragInstances.delete(drag);
    this.stopDragging(drag);

    if (this._dragInstances.size === 0) {
      this._document.removeEventListener('touchmove', this._preventScrollListener,
          activeEventOptions as any);
    }
  }

  /**
   * Starts the dragging sequence for a drag instance.
   * @param drag Drag instance which is being dragged.
   * @param event Event that initiated the dragging.
   */
  startDragging(drag: I, event: TouchEvent | MouseEvent) {
    this._activeDragInstances.add(drag);

    if (this._activeDragInstances.size === 1) {
      const isTouchEvent = event.type.startsWith('touch');
      const moveEvent = isTouchEvent ? 'touchmove' : 'mousemove';
      const upEvent = isTouchEvent ? 'touchend' : 'mouseup';

      // We need to disable the native interactions on the entire body, because
      // the user can start marking text if they drag too far in Safari.
      toggleNativeDragInteractions(this._document.body, false);

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

  /** Stops dragging a drag item instance. */
  stopDragging(drag: I) {
    this._activeDragInstances.delete(drag);

    if (this._activeDragInstances.size === 0) {
      this._clearGlobalListeners();
      toggleNativeDragInteractions(this._document.body, true);
    }
  }

  /** Gets whether a drag item instance is currently being dragged. */
  isDragging(drag: I) {
    return this._activeDragInstances.has(drag);
  }

  /** Gets a drop container by its id. */
  getDropContainer(id: string): C | undefined {
    return Array.from(this._dropInstances).find(instance => instance.id === id);
  }

  ngOnDestroy() {
    this._dragInstances.forEach(instance => this.removeDragItem(instance));
    this._dropInstances.forEach(instance => this.removeDropContainer(instance));
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
