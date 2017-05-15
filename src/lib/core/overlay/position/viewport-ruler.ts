import {Injectable, Optional, SkipSelf} from '@angular/core';
import {ScrollDispatcher} from '../scroll/scroll-dispatcher';


/**
 * Simple utility for getting the bounds of the browser viewport.
 * @docs-private
 */
@Injectable()
export class ViewportRuler {

  /** Cached document client rectangle. */
  private _documentRect?: ClientRect;

  constructor(scrollDispatcher: ScrollDispatcher) {
    // Subscribe to scroll and resize events and update the document rectangle on changes.
    scrollDispatcher.scrolled(null, () => this._cacheViewportGeometry());
  }

  /** Gets a ClientRect for the viewport's bounds. */
  getViewportRect(documentRect = this._documentRect): ClientRect {
    // Cache the document bounding rect so that we don't recompute it for multiple calls.
    if (!documentRect) {
      this._cacheViewportGeometry();
      documentRect = this._documentRect;
    }

    // Use the document element's bounding rect rather than the window scroll properties
    // (e.g. pageYOffset, scrollY) due to in issue in Chrome and IE where window scroll
    // properties and client coordinates (boundingClientRect, clientX/Y, etc.) are in different
    // conceptual viewports. Under most circumstances these viewports are equivalent, but they
    // can disagree when the page is pinch-zoomed (on devices that support touch).
    // See https://bugs.chromium.org/p/chromium/issues/detail?id=489206#c4
    // We use the documentElement instead of the body because, by default (without a css reset)
    // browsers typically give the document body an 8px margin, which is not included in
    // getBoundingClientRect().
    const scrollPosition = this.getViewportScrollPosition(documentRect);
    const height = window.innerHeight;
    const width = window.innerWidth;

    return {
      top: scrollPosition.top,
      left: scrollPosition.left,
      bottom: scrollPosition.top + height,
      right: scrollPosition.left + width,
      height,
      width,
    };
  }


  /**
   * Gets the (top, left) scroll position of the viewport.
   * @param documentRect
   */
  getViewportScrollPosition(documentRect = this._documentRect) {
    // Cache the document bounding rect so that we don't recompute it for multiple calls.
    if (!documentRect) {
      this._cacheViewportGeometry();
      documentRect = this._documentRect;
    }

    // The top-left-corner of the viewport is determined by the scroll position of the document
    // body, normally just (scrollLeft, scrollTop). However, Chrome and Firefox disagree about
    // whether `document.body` or `document.documentElement` is the scrolled element, so reading
    // `scrollTop` and `scrollLeft` is inconsistent. However, using the bounding rect of
    // `document.documentElement` works consistently, where the `top` and `left` values will
    // equal negative the scroll position.
    const top = -documentRect.top || document.body.scrollTop || window.scrollY ||
                  document.documentElement.scrollTop || 0;

    const left = -documentRect.left || document.body.scrollLeft || window.scrollX ||
                  document.documentElement.scrollLeft || 0;

    return {top, left};
  }

  /** Caches the latest client rectangle of the document element. */
  _cacheViewportGeometry?() {
    this._documentRect = document.documentElement.getBoundingClientRect();
  }

}

export function VIEWPORT_RULER_PROVIDER_FACTORY(parentRuler: ViewportRuler,
                                                scrollDispatcher: ScrollDispatcher) {
  return parentRuler || new ViewportRuler(scrollDispatcher);
}

export const VIEWPORT_RULER_PROVIDER = {
  // If there is already a ViewportRuler available, use that. Otherwise, provide a new one.
  provide: ViewportRuler,
  deps: [[new Optional(), new SkipSelf(), ViewportRuler], ScrollDispatcher],
  useFactory: VIEWPORT_RULER_PROVIDER_FACTORY
};
