/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ErrorHandler, ɵɵdefineInjectable, ɵɵinject} from '@angular/core';

import {DOCUMENT} from './dom_tokens';



/**
 * Defines a scroll position manager. Implemented by `BrowserViewportScroller`.
 *
 * @publicApi
 */
export abstract class ViewportScroller {
  // De-sugared tree-shakable injection
  // See #23917
  /** @nocollapse */
  static ngInjectableDef = ɵɵdefineInjectable({
    token: ViewportScroller,
    providedIn: 'root',
    factory: () => new BrowserViewportScroller(ɵɵinject(DOCUMENT), window, ɵɵinject(ErrorHandler))
  });

  /**
   * Configures the top offset used when scrolling to an anchor.
   * @param offset A position in screen coordinates (a tuple with x and y values)
   * or a function that returns the top offset position.
   *
   */
  abstract setOffset(offset: [number, number]|(() => [number, number])): void;

  /**
   * Retrieves the current scroll position.
   * @returns A position in screen coordinates (a tuple with x and y values).
   */
  abstract getScrollPosition(): [number, number];

  /**
   * Scrolls to a specified position.
   * @param position A position in screen coordinates (a tuple with x and y values).
   */
  abstract scrollToPosition(position: [number, number]): void;

  /**
   * Scrolls to an anchor element.
   * @param anchor The ID of the anchor element.
   */
  abstract scrollToAnchor(anchor: string): void;

  /**
   * Disables automatic scroll restoration provided by the browser.
   * See also [window.history.scrollRestoration
   * info](https://developers.google.com/web/updates/2015/09/history-api-scroll-restoration).
   */
  abstract setHistoryScrollRestoration(scrollRestoration: 'auto'|'manual'): void;
}

/**
 * Manages the scroll position for a browser window.
 */
export class BrowserViewportScroller implements ViewportScroller {
  private offset: () => [number, number] = () => [0, 0];

  constructor(private document: any, private window: any, private errorHandler: ErrorHandler) {}

  /**
   * Configures the top offset used when scrolling to an anchor.
   * @param offset A position in screen coordinates (a tuple with x and y values)
   * or a function that returns the top offset position.
   *
   */
  setOffset(offset: [number, number]|(() => [number, number])): void {
    if (Array.isArray(offset)) {
      this.offset = () => offset;
    } else {
      this.offset = offset;
    }
  }

  /**
   * Retrieves the current scroll position.
   * @returns The position in screen coordinates.
   */
  getScrollPosition(): [number, number] {
    if (this.supportScrollRestoration()) {
      return [this.window.scrollX, this.window.scrollY];
    } else {
      return [0, 0];
    }
  }

  /**
   * Sets the scroll position.
   * @param position The new position in screen coordinates.
   */
  scrollToPosition(position: [number, number]): void {
    if (this.supportScrollRestoration()) {
      this.window.scrollTo(position[0], position[1]);
    }
  }

  /**
   * Scrolls to an anchor element.
   * @param anchor The ID of the anchor element.
   */
  scrollToAnchor(anchor: string): void {
    if (this.supportScrollRestoration()) {
      // Escape anything passed to `querySelector` as it can throw errors and stop the application
      // from working if invalid values are passed.
      if (this.window.CSS && this.window.CSS.escape) {
        anchor = this.window.CSS.escape(anchor);
      } else {
        anchor = anchor.replace(/(\"|\'\ |:|\.|\[|\]|,|=)/g, '\\$1');
      }
      try {
        const elSelectedById = this.document.querySelector(`#${anchor}`);
        if (elSelectedById) {
          this.scrollToElement(elSelectedById);
          return;
        }
        const elSelectedByName = this.document.querySelector(`[name='${anchor}']`);
        if (elSelectedByName) {
          this.scrollToElement(elSelectedByName);
          return;
        }
      } catch (e) {
        this.errorHandler.handleError(e);
      }
    }
  }

  /**
   * Disables automatic scroll restoration provided by the browser.
   */
  setHistoryScrollRestoration(scrollRestoration: 'auto'|'manual'): void {
    if (this.supportScrollRestoration()) {
      const history = this.window.history;
      if (history && history.scrollRestoration) {
        history.scrollRestoration = scrollRestoration;
      }
    }
  }

  private scrollToElement(el: any): void {
    const rect = el.getBoundingClientRect();
    const left = rect.left + this.window.pageXOffset;
    const top = rect.top + this.window.pageYOffset;
    const offset = this.offset();
    this.window.scrollTo(left - offset[0], top - offset[1]);
  }

  /**
   * We only support scroll restoration when we can get a hold of window.
   * This means that we do not support this behavior when running in a web worker.
   *
   * Lifting this restriction right now would require more changes in the dom adapter.
   * Since webworkers aren't widely used, we will lift it once RouterScroller is
   * battle-tested.
   */
  private supportScrollRestoration(): boolean {
    try {
      return !!this.window && !!this.window.scrollTo;
    } catch {
      return false;
    }
  }
}


/**
 * Provides an empty implementation of the viewport scroller. This will
 * live in @angular/common as it will be used by both platform-server and platform-webworker.
 */
export class NullViewportScroller implements ViewportScroller {
  /**
   * Empty implementation
   */
  setOffset(offset: [number, number]|(() => [number, number])): void {}

  /**
   * Empty implementation
   */
  getScrollPosition(): [number, number] { return [0, 0]; }

  /**
   * Empty implementation
   */
  scrollToPosition(position: [number, number]): void {}

  /**
   * Empty implementation
   */
  scrollToAnchor(anchor: string): void {}

  /**
   * Empty implementation
   */
  setHistoryScrollRestoration(scrollRestoration: 'auto'|'manual'): void {}
}
