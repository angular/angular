/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {defineInjectable, inject} from '@angular/core';

import {DOCUMENT} from './dom_tokens';

/**
 * Manages the scroll position.
 *
 * @publicApi
 */
export abstract class ViewportScroller {
  // De-sugared tree-shakable injection
  // See #23917
  /** @nocollapse */
  static ngInjectableDef = defineInjectable(
      {providedIn: 'root', factory: () => new BrowserViewportScroller(inject(DOCUMENT), window)});

  /**
   * Configures the top offset used when scrolling to an anchor.
   *
   * When given a tuple with two number, the service will always use the numbers.
   * When given a function, the service will invoke the function every time it restores scroll
   * position.
   */
  abstract setOffset(offset: [number, number]|(() => [number, number])): void;

  /**
   * Returns the current scroll position.
   */
  abstract getScrollPosition(): [number, number];

  /**
   * Sets the scroll position.
   */
  abstract scrollToPosition(position: [number, number]): void;

  /**
   * Scrolls to the provided anchor.
   */
  abstract scrollToAnchor(anchor: string): void;

  /**
   *
   * Disables automatic scroll restoration provided by the browser.
   *
   * See also [window.history.scrollRestoration
   * info](https://developers.google.com/web/updates/2015/09/history-api-scroll-restoration)
   */
  abstract setHistoryScrollRestoration(scrollRestoration: 'auto'|'manual'): void;
}

/**
 * Manages the scroll position.
 */
export class BrowserViewportScroller implements ViewportScroller {
  private offset: () => [number, number] = () => [0, 0];

  constructor(private document: any, private window: any) {}

  /**
   * Configures the top offset used when scrolling to an anchor.
   *
   * * When given a number, the service will always use the number.
   * * When given a function, the service will invoke the function every time it restores scroll
   * position.
   */
  setOffset(offset: [number, number]|(() => [number, number])): void {
    if (Array.isArray(offset)) {
      this.offset = () => offset;
    } else {
      this.offset = offset;
    }
  }

  /**
   * Returns the current scroll position.
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
   */
  scrollToPosition(position: [number, number]): void {
    if (this.supportScrollRestoration()) {
      this.window.scrollTo(position[0], position[1]);
    }
  }

  /**
   * Scrolls to the provided anchor.
   */
  scrollToAnchor(anchor: string): void {
    if (this.supportScrollRestoration()) {
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
    } catch (e) {
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