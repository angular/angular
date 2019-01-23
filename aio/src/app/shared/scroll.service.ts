import { Injectable, Inject } from '@angular/core';
import { Location, PlatformLocation, ViewportScroller } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import { fromEvent } from 'rxjs';

export const topMargin = 16;
/**
 * A service that scrolls document elements into view
 */
@Injectable()
export class ScrollService {

  private _topOffset: number | null;
  private _topOfPageElement: Element;

  // true when popState event has been fired.
  popStateFired = false;
  // scroll position which has to be restored after the popState event
  scrollPosition: [number, number] = [0, 0];
  // true when the browser supports `scrollTo`, `scrollX`, `scrollY` and `scrollRestoration`
  supportManualScrollRestoration: boolean;

  // Offset from the top of the document to bottom of any static elements
  // at the top (e.g. toolbar) + some margin
  get topOffset() {
    if (!this._topOffset) {
      const toolbar = this.document.querySelector('.app-toolbar');
      this._topOffset = (toolbar && toolbar.clientHeight || 0) + topMargin;
    }
    return this._topOffset!;
  }

  get topOfPageElement() {
    if (!this._topOfPageElement) {
      this._topOfPageElement = this.document.getElementById('top-of-page') || this.document.body;
    }
    return this._topOfPageElement;
  }

  constructor(
      @Inject(DOCUMENT) private document: any,
      private platformLocation: PlatformLocation,
      private viewportScroller: ViewportScroller,
      private location: Location) {
    // On resize, the toolbar might change height, so "invalidate" the top offset.
    fromEvent(window, 'resize').subscribe(() => this._topOffset = null);

    try {
      this.supportManualScrollRestoration = !!window && !!window.scrollTo && 'scrollX' in window
        && 'scrollY' in window && !!history && !!history.scrollRestoration;
    } catch {
      this.supportManualScrollRestoration = false;
    }

    // Change scroll restoration strategy to `manual` if it's supported
    if (this.supportManualScrollRestoration) {
      history.scrollRestoration = 'manual';
      // we have to detect forward and back navigation thanks to popState event
      this.location.subscribe(event => {
        // the type is `hashchange` when the fragment identifier of the URL has changed. It allows us to go to position
        // just before a click on an anchor
        if (event.type === 'hashchange') {
          this.scrollToPosition();
        } else {
          // The popstate event is always triggered by doing a browser action such as a click on the back or forward button.
          // It can be follow by a event of type `hashchange`.
          this.popStateFired = true;
          // we always should have a scrollPosition in our state history
          this.scrollPosition = event.state ? event.state['scrollPosition'] : null;
        }
      });
    }
  }

  /**
   * Scroll to the element with id extracted from the current location hash fragment.
   * Scroll to top if no hash.
   * Don't scroll if hash not found.
   */
  scroll() {
    const hash = this.getCurrentHash();
    const element: HTMLElement = hash
        ? this.document.getElementById(hash)
        : this.topOfPageElement;
    this.scrollToElement(element);
  }

  /**
   * test if the current location has a hash
   */
  isLocationWithHash(): boolean {
    return !!this.getCurrentHash();
  }

  /**
   * When we load a document, we have to scroll to the correct position depending on whether this is a new location,
   * a back/forward in the history, or a refresh
   * @param delay before we scroll to the good position
   */
  scrollAfterRender(delay: number) {
    // If we do rendering following a refresh, we use the scroll position from the storage.
    const storedScrollPosition = this.getStoredScrollPosition();
    if (storedScrollPosition) {
      this.viewportScroller.scrollToPosition(storedScrollPosition);
    } else {
      if (this.needToFixScrollPosition()) {
        // The document was reloaded following a popState `event` (called by the forward/back button), so we manage
        // the scroll position
        this.scrollToPosition();
      } else {
        // The document was loaded either of the following cases: a direct navigation via typing the URL in the
        // address bar or a click on a link. If the location contains a hash, we have to wait for async
        // layout.
        if (this.isLocationWithHash()) {
          // Scroll 500ms after the new document has been inserted into the doc-viewer.
          // The delay is to allow time for async layout to complete.
          setTimeout(() => this.scroll(), delay);
        } else {
          // If the location doesn't contain a hash, we scroll to the top of the page.
          this.scrollToTop();
        }
      }
    }
  }

  /**
   * Scroll to the element.
   * Don't scroll if no element.
   */
  scrollToElement(element: Element|null) {
    if (element) {
      element.scrollIntoView();

      if (window && window.scrollBy) {
        // Scroll as much as necessary to align the top of `element` at `topOffset`.
        // (Usually, `.top` will be 0, except for cases where the element cannot be scrolled all the
        //  way to the top, because the viewport is larger than the height of the content after the
        //  element.)
        window.scrollBy(0, element.getBoundingClientRect().top - this.topOffset);

        // If we are very close to the top (<20px), then scroll all the way up.
        // (This can happen if `element` is at the top of the page, but has a small top-margin.)
        if (window.pageYOffset < 20) {
          window.scrollBy(0, -window.pageYOffset);
        }
      }
    }
  }

  /** Scroll to the top of the document. */
  scrollToTop() {
    this.scrollToElement(this.topOfPageElement);
  }

  scrollToPosition() {
    this.viewportScroller.scrollToPosition(this.scrollPosition);
    this.popStateFired = false;
  }

  /**
   * Update the state with scroll position into history.
   */
  updateScrollPositionInHistory() {
    if (this.supportManualScrollRestoration) {
      const currentScrollPosition = this.viewportScroller.getScrollPosition();
      this.location.replaceState(this.location.path(true), undefined, {scrollPosition: currentScrollPosition});
      window.sessionStorage.setItem('scrollPosition', currentScrollPosition.toString());
    }
  }

  getStoredScrollPosition(): [number, number] | null {
    const position = window.sessionStorage.getItem('scrollPosition');
    return position ? JSON.parse('[' + position + ']') : null;
  }

  removeStoredScrollPosition() {
    window.sessionStorage.removeItem('scrollPosition');
  }

  /**
   * Check if the scroll position need to be manually fixed after popState event
   */
  needToFixScrollPosition(): boolean {
    return this.popStateFired && this.scrollPosition && this.supportManualScrollRestoration;
  }

  /**
   * Return the hash fragment from the `PlatformLocation`, minus the leading `#`.
   */
  private getCurrentHash() {
    return decodeURIComponent(this.platformLocation.hash.replace(/^#/, ''));
  }
}
