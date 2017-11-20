/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgZone} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {ScrollStrategy, getMatScrollStrategyAlreadyAttachedError} from './scroll-strategy';
import {OverlayRef} from '../overlay-ref';
import {ScrollDispatcher, ViewportRuler} from '@angular/cdk/scrolling';
import {isElementScrolledOutsideView} from '../position/scroll-clip';

/**
 * Config options for the RepositionScrollStrategy.
 */
export interface RepositionScrollStrategyConfig {
  /** Time in milliseconds to throttle the scroll events. */
  scrollThrottle?: number;

  /** Whether to close the overlay once the user has scrolled away completely. */
  autoClose?: boolean;
}

/**
 * Strategy that will update the element position as the user is scrolling.
 */
export class RepositionScrollStrategy implements ScrollStrategy {
  private _scrollSubscription: Subscription|null = null;
  private _overlayRef: OverlayRef;

  constructor(
    private _scrollDispatcher: ScrollDispatcher,
    private _viewportRuler: ViewportRuler,
    private _ngZone: NgZone,
    private _config?: RepositionScrollStrategyConfig) { }

  /** Attaches this scroll strategy to an overlay. */
  attach(overlayRef: OverlayRef) {
    if (this._overlayRef) {
      throw getMatScrollStrategyAlreadyAttachedError();
    }

    this._overlayRef = overlayRef;
  }

  /** Enables repositioning of the attached overlay on scroll. */
  enable() {
    if (!this._scrollSubscription) {
      const throttle = this._config ? this._config.scrollThrottle : 0;

      this._scrollSubscription = this._scrollDispatcher.scrolled(throttle).subscribe(() => {
        this._overlayRef.updatePosition();

        // TODO(crisbeto): make `close` on by default once all components can handle it.
        if (this._config && this._config.autoClose) {
          const overlayRect = this._overlayRef.overlayElement.getBoundingClientRect();
          const {width, height} = this._viewportRuler.getViewportSize();

          // TODO(crisbeto): include all ancestor scroll containers here once
          // we have a way of exposing the trigger element to the scroll strategy.
          const parentRects = [{width, height, bottom: height, right: width, top: 0, left: 0}];

          if (isElementScrolledOutsideView(overlayRect, parentRects)) {
            this.disable();
            this._ngZone.run(() => this._overlayRef.detach());
          }
        }
      });
    }
  }

  /** Disables repositioning of the attached overlay on scroll. */
  disable() {
    if (this._scrollSubscription) {
      this._scrollSubscription.unsubscribe();
      this._scrollSubscription = null;
    }
  }
}
