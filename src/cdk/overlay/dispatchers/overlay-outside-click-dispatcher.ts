/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {Inject, Injectable} from '@angular/core';
import {OverlayReference} from '../overlay-reference';
import {Platform, _getEventTarget} from '@angular/cdk/platform';
import {BaseOverlayDispatcher} from './base-overlay-dispatcher';

/**
 * Service for dispatching mouse click events that land on the body to appropriate overlay ref,
 * if any. It maintains a list of attached overlays to determine best suited overlay based
 * on event target and order of overlay opens.
 */
@Injectable({providedIn: 'root'})
export class OverlayOutsideClickDispatcher extends BaseOverlayDispatcher {
  private _cursorOriginalValue: string;
  private _cursorStyleIsSet = false;
  private _pointerDownEventTarget: EventTarget | null;

  constructor(@Inject(DOCUMENT) document: any, private _platform: Platform) {
    super(document);
  }

  /** Add a new overlay to the list of attached overlay refs. */
  override add(overlayRef: OverlayReference): void {
    super.add(overlayRef);

    // Safari on iOS does not generate click events for non-interactive
    // elements. However, we want to receive a click for any element outside
    // the overlay. We can force a "clickable" state by setting
    // `cursor: pointer` on the document body. See:
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/click_event#Safari_Mobile
    // https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/HandlingEvents/HandlingEvents.html
    if (!this._isAttached) {
      const body = this._document.body;
      body.addEventListener('pointerdown', this._pointerDownListener, true);
      body.addEventListener('click', this._clickListener, true);
      body.addEventListener('auxclick', this._clickListener, true);
      body.addEventListener('contextmenu', this._clickListener, true);

      // click event is not fired on iOS. To make element "clickable" we are
      // setting the cursor to pointer
      if (this._platform.IOS && !this._cursorStyleIsSet) {
        this._cursorOriginalValue = body.style.cursor;
        body.style.cursor = 'pointer';
        this._cursorStyleIsSet = true;
      }

      this._isAttached = true;
    }
  }

  /** Detaches the global keyboard event listener. */
  protected detach() {
    if (this._isAttached) {
      const body = this._document.body;
      body.removeEventListener('pointerdown', this._pointerDownListener, true);
      body.removeEventListener('click', this._clickListener, true);
      body.removeEventListener('auxclick', this._clickListener, true);
      body.removeEventListener('contextmenu', this._clickListener, true);
      if (this._platform.IOS && this._cursorStyleIsSet) {
        body.style.cursor = this._cursorOriginalValue;
        this._cursorStyleIsSet = false;
      }
      this._isAttached = false;
    }
  }

  /** Store pointerdown event target to track origin of click. */
  private _pointerDownListener = (event: PointerEvent) => {
    this._pointerDownEventTarget = _getEventTarget(event);
  };

  /** Click event listener that will be attached to the body propagate phase. */
  private _clickListener = (event: MouseEvent) => {
    const target = _getEventTarget(event);
    // In case of a click event, we want to check the origin of the click
    // (e.g. in case where a user starts a click inside the overlay and
    // releases the click outside of it).
    // This is done by using the event target of the preceding pointerdown event.
    // Every click event caused by a pointer device has a preceding pointerdown
    // event, unless the click was programmatically triggered (e.g. in a unit test).
    const origin =
      event.type === 'click' && this._pointerDownEventTarget
        ? this._pointerDownEventTarget
        : target;
    // Reset the stored pointerdown event target, to avoid having it interfere
    // in subsequent events.
    this._pointerDownEventTarget = null;

    // We copy the array because the original may be modified asynchronously if the
    // outsidePointerEvents listener decides to detach overlays resulting in index errors inside
    // the for loop.
    const overlays = this._attachedOverlays.slice();

    // Dispatch the mouse event to the top overlay which has subscribers to its mouse events.
    // We want to target all overlays for which the click could be considered as outside click.
    // As soon as we reach an overlay for which the click is not outside click we break off
    // the loop.
    for (let i = overlays.length - 1; i > -1; i--) {
      const overlayRef = overlays[i];
      if (overlayRef._outsidePointerEvents.observers.length < 1 || !overlayRef.hasAttached()) {
        continue;
      }

      // If it's a click inside the overlay, just break - we should do nothing
      // If it's an outside click (both origin and target of the click) dispatch the mouse event,
      // and proceed with the next overlay
      if (
        overlayRef.overlayElement.contains(target as Node) ||
        overlayRef.overlayElement.contains(origin as Node)
      ) {
        break;
      }

      overlayRef._outsidePointerEvents.next(event);
    }
  };
}
