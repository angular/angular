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
import {BaseOverlayDispatcher} from './base-overlay-dispatcher';

/**
 * Service for dispatching keyboard events that land on the body to appropriate overlay ref,
 * if any. It maintains a list of attached overlays to determine best suited overlay based
 * on event target and order of overlay opens.
 */
@Injectable({providedIn: 'root'})
export class OverlayKeyboardDispatcher extends BaseOverlayDispatcher {
  constructor(@Inject(DOCUMENT) document: any) {
    super(document);
  }

  /** Add a new overlay to the list of attached overlay refs. */
  override add(overlayRef: OverlayReference): void {
    super.add(overlayRef);

    // Lazily start dispatcher once first overlay is added
    if (!this._isAttached) {
      this._document.body.addEventListener('keydown', this._keydownListener);
      this._isAttached = true;
    }
  }

  /** Detaches the global keyboard event listener. */
  protected detach() {
    if (this._isAttached) {
      this._document.body.removeEventListener('keydown', this._keydownListener);
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
      if (overlays[i]._keydownEvents.observers.length > 0) {
        overlays[i]._keydownEvents.next(event);
        break;
      }
    }
  };
}
