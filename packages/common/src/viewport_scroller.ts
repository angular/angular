/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵɵdefineInjectable, ɵɵinject} from '@angular/core';

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
  static ɵprov = /** @pureOrBreakMyCode */ ɵɵdefineInjectable({
    token: ViewportScroller,
    providedIn: 'root',
    factory: () => new BrowserViewportScroller(ɵɵinject(DOCUMENT), window)
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

  constructor(private document: Document, private window: Window) {}

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
    if (this.supportsScrolling()) {
      return [this.window.pageXOffset, this.window.pageYOffset];
    } else {
      return [0, 0];
    }
  }

  /**
   * Sets the scroll position.
   * @param position The new position in screen coordinates.
   */
  scrollToPosition(position: [number, number]): void {
    if (this.supportsScrolling()) {
      this.window.scrollTo(position[0], position[1]);
    }
  }

  /**
   * Scrolls to an element and attempts to focus the element.
   *
   * Note that the function name here is misleading in that the target string may be an ID for a
   * non-anchor element.
   *
   * @param target The ID of an element or name of the anchor.
   *
   * @see https://html.spec.whatwg.org/#the-indicated-part-of-the-document
   * @see https://html.spec.whatwg.org/#scroll-to-fragid
   */
  scrollToAnchor(target: string): void {
    if (!this.supportsScrolling()) {
      return;
    }
    // TODO(atscott): The correct behavior for `getElementsByName` would be to also verify that the
    // element is an anchor. However, this could be considered a breaking change and should be
    // done in a major version.
    const elSelected = findAnchorFromDocument(this.document, target);

    if (elSelected) {
      this.scrollToElement(elSelected);
      // After scrolling to the element, the spec dictates that we follow the focus steps for the
      // target. Rather than following the robust steps, simply attempt focus.
      this.attemptFocus(elSelected);
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

  /**
   * Scrolls to an element using the native offset and the specified offset set on this scroller.
   *
   * The offset can be used when we know that there is a floating header and scrolling naively to an
   * element (ex: `scrollIntoView`) leaves the element hidden behind the floating header.
   */
  private scrollToElement(el: HTMLElement): void {
    const rect = el.getBoundingClientRect();
    const left = rect.left + this.window.pageXOffset;
    const top = rect.top + this.window.pageYOffset;
    const offset = this.offset();
    this.window.scrollTo(left - offset[0], top - offset[1]);
  }

  /**
   * Calls `focus` on the `focusTarget` and returns `true` if the element was focused successfully.
   *
   * If `false`, further steps may be necessary to determine a valid substitute to be focused
   * instead.
   *
   * @see https://html.spec.whatwg.org/#get-the-focusable-area
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLOrForeignElement/focus
   * @see https://html.spec.whatwg.org/#focusable-area
   */
  private attemptFocus(focusTarget: HTMLElement): boolean {
    focusTarget.focus();
    return this.document.activeElement === focusTarget;
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
      if (!this.supportsScrolling()) {
        return false;
      }
      // The `scrollRestoration` property could be on the `history` instance or its prototype.
      const scrollRestorationDescriptor = getScrollRestorationProperty(this.window.history) ||
          getScrollRestorationProperty(Object.getPrototypeOf(this.window.history));
      // We can write to the `scrollRestoration` property if it is a writable data field or it has a
      // setter function.
      return !!scrollRestorationDescriptor &&
          !!(scrollRestorationDescriptor.writable || scrollRestorationDescriptor.set);
    } catch {
      return false;
    }
  }

  private supportsScrolling(): boolean {
    try {
      return !!this.window && !!this.window.scrollTo && 'pageXOffset' in this.window;
    } catch {
      return false;
    }
  }
}

function getScrollRestorationProperty(obj: any): PropertyDescriptor|undefined {
  return Object.getOwnPropertyDescriptor(obj, 'scrollRestoration');
}

function findAnchorFromDocument(document: Document, target: string): HTMLElement|null {
  const documentResult = document.getElementById(target) || document.getElementsByName(target)[0];

  if (documentResult) {
    return documentResult;
  }

  // `getElementById` and `getElementsByName` won't pierce through the shadow DOM so we
  // have to traverse the DOM manually and do the lookup through the shadow roots.
  if (typeof document.createTreeWalker === 'function' && document.body &&
      ((document.body as any).createShadowRoot || document.body.attachShadow)) {
    const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
    let currentNode = treeWalker.currentNode as HTMLElement | null;

    while (currentNode) {
      const shadowRoot = currentNode.shadowRoot;

      if (shadowRoot) {
        // Note that `ShadowRoot` doesn't support `getElementsByName`
        // so we have to fall back to `querySelector`.
        const result =
            shadowRoot.getElementById(target) || shadowRoot.querySelector(`[name="${target}"]`);
        if (result) {
          return result;
        }
      }

      currentNode = treeWalker.nextNode() as HTMLElement | null;
    }
  }

  return null;
}

/**
 * Provides an empty implementation of the viewport scroller.
 */
export class NullViewportScroller implements ViewportScroller {
  /**
   * Empty implementation
   */
  setOffset(offset: [number, number]|(() => [number, number])): void {}

  /**
   * Empty implementation
   */
  getScrollPosition(): [number, number] {
    return [0, 0];
  }

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
