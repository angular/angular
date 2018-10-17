/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {
  Inject,
  Injectable,
  InjectionToken,
  OnDestroy,
  Optional,
  SkipSelf,
} from '@angular/core';
import {OverlayRef} from '../overlay-ref';


/**
 * Service for dispatching keyboard events that land on the body to appropriate overlay ref,
 * if any. It maintains a list of attached overlays to determine best suited overlay based
 * on event target and order of overlay opens.
 */
@Injectable({providedIn: 'root'})
export class OverlayKeyboardDispatcher implements OnDestroy {

  /** Currently attached overlays in the order they were attached. */
  _attachedOverlays: OverlayRef[] = [];

  private _document: Document;
  private _isAttached: boolean;

  constructor(@Inject(DOCUMENT) document: any) {
    this._document = document;
  }

  ngOnDestroy() {
    this._detach();
  }

  /** Add a new overlay to the list of attached overlay refs. */
  add(overlayRef: OverlayRef): void {
    // Ensure that we don't get the same overlay multiple times.
    this.remove(overlayRef);

    // Lazily start dispatcher once first overlay is added
    if (!this._isAttached) {
      this._document.body.addEventListener('keydown', this._keydownListener, true);
      this._isAttached = true;
    }

    this._attachedOverlays.push(overlayRef);
  }

  /** Remove an overlay from the list of attached overlay refs. */
  remove(overlayRef: OverlayRef): void {
    const index = this._attachedOverlays.indexOf(overlayRef);

    if (index > -1) {
      this._attachedOverlays.splice(index, 1);
    }

    // Remove the global listener once there are no more overlays.
    if (this._attachedOverlays.length === 0) {
      this._detach();
    }
  }

  /** Detaches the global keyboard event listener. */
  private _detach() {
    if (this._isAttached) {
      this._document.body.removeEventListener('keydown', this._keydownListener, true);
      this._isAttached = false;
    }
  }

  /** Keyboard event listener that will be attached to the body. */
  private _keydownListener = (event: KeyboardEvent) => {
    const overlays = this._attachedOverlays;

    for (let i = overlays.length - 1; i > -1; i--) {
      // Dispatch the keydown event to the top overlay which has subscribers to its keydown events.
      // We want to target the most recent overlay, rather than trying to match where the event came
      // from, because some components might open an overlay, but keep focus on a trigger element
      // (e.g. for select and autocomplete). We skip overlays without keydown event subscriptions,
      // because we don't want overlays that don't handle keyboard events to block the ones below
      // them that do.
      if (overlays[i]._keydownEventSubscriptions > 0) {
        overlays[i]._keydownEvents.next(event);
        break;
      }
    }
  }
}


/** @docs-private @deprecated @breaking-change 8.0.0 */
export function OVERLAY_KEYBOARD_DISPATCHER_PROVIDER_FACTORY(
    dispatcher: OverlayKeyboardDispatcher, _document: any) {
  return dispatcher || new OverlayKeyboardDispatcher(_document);
}

/** @docs-private @deprecated @breaking-change 8.0.0 */
export const OVERLAY_KEYBOARD_DISPATCHER_PROVIDER = {
  // If there is already an OverlayKeyboardDispatcher available, use that.
  // Otherwise, provide a new one.
  provide: OverlayKeyboardDispatcher,
  deps: [
    [new Optional(), new SkipSelf(), OverlayKeyboardDispatcher],

    // Coerce to `InjectionToken` so that the `deps` match the "shape"
    // of the type expected by Angular
    DOCUMENT as InjectionToken<any>
  ],
  useFactory: OVERLAY_KEYBOARD_DISPATCHER_PROVIDER_FACTORY
};
