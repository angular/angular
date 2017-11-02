/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, Optional, SkipSelf, NgZone, OnDestroy} from '@angular/core';
import {Platform} from '@angular/cdk/platform';
import {Observable} from 'rxjs/Observable';
import {fromEvent} from 'rxjs/observable/fromEvent';
import {merge} from 'rxjs/observable/merge';
import {auditTime} from 'rxjs/operators/auditTime';
import {Subscription} from 'rxjs/Subscription';
import {of as observableOf} from 'rxjs/observable/of';

/** Time in ms to throttle the resize events by default. */
export const DEFAULT_RESIZE_TIME = 20;

/**
 * Simple utility for getting the bounds of the browser viewport.
 * @docs-private
 */
@Injectable()
export class ViewportRuler implements OnDestroy {
  /** Cached viewport dimensions. */
  private _viewportSize: {width: number; height: number};

  /** Stream of viewport change events. */
  private _change: Observable<Event>;

  /** Subscription to streams that invalidate the cached viewport dimensions. */
  private _invalidateCache: Subscription;

  constructor(platform: Platform, ngZone: NgZone) {
    this._change = platform.isBrowser ? ngZone.runOutsideAngular(() => {
      return merge<Event>(fromEvent(window, 'resize'), fromEvent(window, 'orientationchange'));
    }) : observableOf();

    this._invalidateCache = this.change().subscribe(() => this._updateViewportSize());
  }

  ngOnDestroy() {
    this._invalidateCache.unsubscribe();
  }

  /** Returns the viewport's width and height. */
  getViewportSize(): Readonly<{width: number, height: number}> {
    if (!this._viewportSize) {
      this._updateViewportSize();
    }

    return {width: this._viewportSize.width, height: this._viewportSize.height};
  }

  /** Gets a ClientRect for the viewport's bounds. */
  getViewportRect(): ClientRect {
    // Use the document element's bounding rect rather than the window scroll properties
    // (e.g. pageYOffset, scrollY) due to in issue in Chrome and IE where window scroll
    // properties and client coordinates (boundingClientRect, clientX/Y, etc.) are in different
    // conceptual viewports. Under most circumstances these viewports are equivalent, but they
    // can disagree when the page is pinch-zoomed (on devices that support touch).
    // See https://bugs.chromium.org/p/chromium/issues/detail?id=489206#c4
    // We use the documentElement instead of the body because, by default (without a css reset)
    // browsers typically give the document body an 8px margin, which is not included in
    // getBoundingClientRect().
    const scrollPosition = this.getViewportScrollPosition();
    const {width, height} = this.getViewportSize();

    return {
      top: scrollPosition.top,
      left: scrollPosition.left,
      bottom: scrollPosition.top + height,
      right: scrollPosition.left + width,
      height,
      width,
    };
  }

  /** Gets the (top, left) scroll position of the viewport. */
  getViewportScrollPosition() {
    // The top-left-corner of the viewport is determined by the scroll position of the document
    // body, normally just (scrollLeft, scrollTop). However, Chrome and Firefox disagree about
    // whether `document.body` or `document.documentElement` is the scrolled element, so reading
    // `scrollTop` and `scrollLeft` is inconsistent. However, using the bounding rect of
    // `document.documentElement` works consistently, where the `top` and `left` values will
    // equal negative the scroll position.
    const documentRect = document.documentElement.getBoundingClientRect();

    const top = -documentRect.top || document.body.scrollTop || window.scrollY ||
                 document.documentElement.scrollTop || 0;

    const left = -documentRect.left || document.body.scrollLeft || window.scrollX ||
                  document.documentElement.scrollLeft || 0;

    return {top, left};
  }

  /**
   * Returns a stream that emits whenever the size of the viewport changes.
   * @param throttle Time in milliseconds to throttle the stream.
   */
  change(throttleTime: number = DEFAULT_RESIZE_TIME): Observable<Event> {
    return throttleTime > 0 ? this._change.pipe(auditTime(throttleTime)) : this._change;
  }

  /** Updates the cached viewport size. */
  private _updateViewportSize() {
    this._viewportSize = {width: window.innerWidth, height: window.innerHeight};
  }
}

/** @docs-private */
export function VIEWPORT_RULER_PROVIDER_FACTORY(parentRuler: ViewportRuler,
                                                platform: Platform,
                                                ngZone: NgZone) {
  return parentRuler || new ViewportRuler(platform, ngZone);
}

/** @docs-private */
export const VIEWPORT_RULER_PROVIDER = {
  // If there is already a ViewportRuler available, use that. Otherwise, provide a new one.
  provide: ViewportRuler,
  deps: [[new Optional(), new SkipSelf(), ViewportRuler], Platform, NgZone],
  useFactory: VIEWPORT_RULER_PROVIDER_FACTORY
};
