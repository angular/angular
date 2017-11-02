/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgZone} from '@angular/core';
import {ScrollStrategy, getMatScrollStrategyAlreadyAttachedError} from './scroll-strategy';
import {OverlayRef} from '../overlay-ref';
import {Subscription} from 'rxjs/Subscription';
import {ScrollDispatcher} from '@angular/cdk/scrolling';


/**
 * Strategy that will close the overlay as soon as the user starts scrolling.
 */
export class CloseScrollStrategy implements ScrollStrategy {
  private _scrollSubscription: Subscription|null = null;
  private _overlayRef: OverlayRef;

  constructor(private _scrollDispatcher: ScrollDispatcher, private _ngZone: NgZone) { }

  /** Attaches this scroll strategy to an overlay. */
  attach(overlayRef: OverlayRef) {
    if (this._overlayRef) {
      throw getMatScrollStrategyAlreadyAttachedError();
    }

    this._overlayRef = overlayRef;
  }

  /** Enables the closing of the attached on scroll. */
  enable() {
    if (!this._scrollSubscription) {
      this._scrollSubscription = this._scrollDispatcher.scrolled(0).subscribe(() => {
        this._ngZone.run(() => {
          this.disable();

          if (this._overlayRef.hasAttached()) {
            this._overlayRef.detach();
          }
        });
      });
    }
  }

  /** Disables the closing the attached overlay on scroll. */
  disable() {
    if (this._scrollSubscription) {
      this._scrollSubscription.unsubscribe();
      this._scrollSubscription = null;
    }
  }
}
