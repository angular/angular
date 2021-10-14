/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Platform} from '@angular/cdk/platform';
import {Injectable, NgZone, OnDestroy, Optional, Inject} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {auditTime} from 'rxjs/operators';
import {DOCUMENT} from '@angular/common';

/** Time in ms to throttle the resize events by default. */
export const DEFAULT_RESIZE_TIME = 20;

/** Object that holds the scroll position of the viewport in each direction. */
export interface ViewportScrollPosition {
  top: number;
  left: number;
}

/**
 * Simple utility for getting the bounds of the browser viewport.
 * @docs-private
 */
@Injectable({providedIn: 'root'})
export class ViewportRuler implements OnDestroy {
  /** Cached viewport dimensions. */
  private _viewportSize: {width: number; height: number} | null;

  /** Stream of viewport change events. */
  private readonly _change = new Subject<Event>();

  /** Event listener that will be used to handle the viewport change events. */
  private _changeListener = (event: Event) => {
    this._change.next(event);
  };

  /** Used to reference correct document/window */
  protected _document: Document;

  constructor(
    private _platform: Platform,
    ngZone: NgZone,
    @Optional() @Inject(DOCUMENT) document: any,
  ) {
    this._document = document;

    ngZone.runOutsideAngular(() => {
      if (_platform.isBrowser) {
        const window = this._getWindow();

        // Note that bind the events ourselves, rather than going through something like RxJS's
        // `fromEvent` so that we can ensure that they're bound outside of the NgZone.
        window.addEventListener('resize', this._changeListener);
        window.addEventListener('orientationchange', this._changeListener);
      }

      // Clear the cached position so that the viewport is re-measured next time it is required.
      // We don't need to keep track of the subscription, because it is completed on destroy.
      this.change().subscribe(() => (this._viewportSize = null));
    });
  }

  ngOnDestroy() {
    if (this._platform.isBrowser) {
      const window = this._getWindow();
      window.removeEventListener('resize', this._changeListener);
      window.removeEventListener('orientationchange', this._changeListener);
    }

    this._change.complete();
  }

  /** Returns the viewport's width and height. */
  getViewportSize(): Readonly<{width: number; height: number}> {
    if (!this._viewportSize) {
      this._updateViewportSize();
    }

    const output = {width: this._viewportSize!.width, height: this._viewportSize!.height};

    // If we're not on a browser, don't cache the size since it'll be mocked out anyway.
    if (!this._platform.isBrowser) {
      this._viewportSize = null!;
    }

    return output;
  }

  /** Gets a ClientRect for the viewport's bounds. */
  getViewportRect() {
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
  getViewportScrollPosition(): ViewportScrollPosition {
    // While we can get a reference to the fake document
    // during SSR, it doesn't have getBoundingClientRect.
    if (!this._platform.isBrowser) {
      return {top: 0, left: 0};
    }

    // The top-left-corner of the viewport is determined by the scroll position of the document
    // body, normally just (scrollLeft, scrollTop). However, Chrome and Firefox disagree about
    // whether `document.body` or `document.documentElement` is the scrolled element, so reading
    // `scrollTop` and `scrollLeft` is inconsistent. However, using the bounding rect of
    // `document.documentElement` works consistently, where the `top` and `left` values will
    // equal negative the scroll position.
    const document = this._document;
    const window = this._getWindow();
    const documentElement = document.documentElement!;
    const documentRect = documentElement.getBoundingClientRect();

    const top =
      -documentRect.top ||
      document.body.scrollTop ||
      window.scrollY ||
      documentElement.scrollTop ||
      0;

    const left =
      -documentRect.left ||
      document.body.scrollLeft ||
      window.scrollX ||
      documentElement.scrollLeft ||
      0;

    return {top, left};
  }

  /**
   * Returns a stream that emits whenever the size of the viewport changes.
   * This stream emits outside of the Angular zone.
   * @param throttleTime Time in milliseconds to throttle the stream.
   */
  change(throttleTime: number = DEFAULT_RESIZE_TIME): Observable<Event> {
    return throttleTime > 0 ? this._change.pipe(auditTime(throttleTime)) : this._change;
  }

  /** Use defaultView of injected document if available or fallback to global window reference */
  private _getWindow(): Window {
    return this._document.defaultView || window;
  }

  /** Updates the cached viewport size. */
  private _updateViewportSize() {
    const window = this._getWindow();
    this._viewportSize = this._platform.isBrowser
      ? {width: window.innerWidth, height: window.innerHeight}
      : {width: 0, height: 0};
  }
}
