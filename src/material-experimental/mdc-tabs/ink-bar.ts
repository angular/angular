/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementRef, QueryList} from '@angular/core';
import {
  MDCSlidingTabIndicatorFoundation,
  MDCTabIndicatorAdapter,
  MDCTabIndicatorFoundation,
} from '@material/tab-indicator';

/**
 * Item inside a tab header relative to which the ink bar can be aligned.
 * @docs-private
 */
export interface MatInkBarItem {
  _foundation: MatInkBarFoundation;
  elementRef: ElementRef<HTMLElement>;
}

/**
 * Abstraction around the MDC tab indicator that acts as the tab header's ink bar.
 * @docs-private
 */
export class MatInkBar {
  /** Item to which the ink bar is aligned currently. */
  private _currentItem: MatInkBarItem | undefined;

  constructor(private _items: QueryList<MatInkBarItem>) {}

  /** Hides the ink bar. */
  hide() {
    this._items.forEach(item => item._foundation.deactivate());
  }

  /** Aligns the ink bar to a DOM node. */
  alignToElement(element: HTMLElement) {
    const correspondingItem = this._items.find(item => item.elementRef.nativeElement === element);
    const currentItem = this._currentItem;

    if (currentItem) {
      currentItem._foundation.deactivate();
    }

    if (correspondingItem) {
      const clientRect = currentItem
        ? currentItem._foundation.computeContentClientRect()
        : undefined;

      // The ink bar won't animate unless we give it the `ClientRect` of the previous item.
      correspondingItem._foundation.activate(clientRect);
      this._currentItem = correspondingItem;
    }
  }
}

/**
 * Implementation of MDC's sliding tab indicator (ink bar) foundation.
 * @docs-private
 */
export class MatInkBarFoundation {
  private _destroyed: boolean;
  private _foundation: MDCTabIndicatorFoundation;
  private _inkBarElement: HTMLElement;
  private _inkBarContentElement: HTMLElement;
  private _fitToContent = false;
  private _adapter: MDCTabIndicatorAdapter = {
    addClass: className => {
      if (!this._destroyed) {
        this._hostElement.classList.add(className);
      }
    },
    removeClass: className => {
      if (!this._destroyed) {
        this._hostElement.classList.remove(className);
      }
    },
    setContentStyleProperty: (propName, value) => {
      if (!this._destroyed) {
        this._inkBarContentElement.style.setProperty(propName, value);
      }
    },
    computeContentClientRect: () => {
      // `getBoundingClientRect` isn't available on the server.
      return this._destroyed || !this._inkBarContentElement.getBoundingClientRect
        ? ({
            width: 0,
            height: 0,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            x: 0,
            y: 0,
          } as ClientRect)
        : this._inkBarContentElement.getBoundingClientRect();
    },
  };

  constructor(private _hostElement: HTMLElement, private _document: Document) {
    this._foundation = new MDCSlidingTabIndicatorFoundation(this._adapter);
  }

  /** Aligns the ink bar to the current item. */
  activate(clientRect?: ClientRect) {
    this._foundation.activate(clientRect);
  }

  /** Removes the ink bar from the current item. */
  deactivate() {
    this._foundation.deactivate();
  }

  /** Gets the ClientRect of the ink bar. */
  computeContentClientRect() {
    return this._foundation.computeContentClientRect();
  }

  /** Initializes the foundation. */
  init() {
    this._createInkBarElement();
    this._foundation.init();
  }

  /** Destroys the foundation. */
  destroy() {
    this._inkBarElement.remove();
    this._hostElement = this._inkBarElement = this._inkBarContentElement = null!;
    this._foundation.destroy();
    this._destroyed = true;
  }

  /**
   * Sets whether the ink bar should be appended to the content, which will cause the ink bar
   * to match the width of the content rather than the tab host element.
   */
  setFitToContent(fitToContent: boolean) {
    if (this._fitToContent !== fitToContent) {
      this._fitToContent = fitToContent;
      if (this._inkBarElement) {
        this._appendInkBarElement();
      }
    }
  }

  /**
   * Gets whether the ink bar should be appended to the content, which will cause the ink bar
   * to match the width of the content rather than the tab host element.
   */
  getFitToContent(): boolean {
    return this._fitToContent;
  }

  /** Creates and appends the ink bar element. */
  private _createInkBarElement() {
    this._inkBarElement = this._document.createElement('span');
    this._inkBarContentElement = this._document.createElement('span');

    this._inkBarElement.className = 'mdc-tab-indicator';
    this._inkBarContentElement.className =
      'mdc-tab-indicator__content' + ' mdc-tab-indicator__content--underline';

    this._inkBarElement.appendChild(this._inkBarContentElement);
    this._appendInkBarElement();
  }

  /**
   * Appends the ink bar to the tab host element or content, depending on whether
   * the ink bar should fit to content.
   */
  private _appendInkBarElement() {
    if (!this._inkBarElement && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error('Ink bar element has not been created and cannot be appended');
    }

    const parentElement = this._fitToContent
      ? this._hostElement.querySelector('.mdc-tab__content')
      : this._hostElement;

    if (!parentElement && (typeof ngDevMode === 'undefined' || ngDevMode)) {
      throw Error('Missing element to host the ink bar');
    }

    parentElement!.appendChild(this._inkBarElement);
  }
}
