import { Injectable, Inject } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { DOCUMENT } from '@angular/platform-browser';

export const topMargin = 16;
/**
 * A service that scrolls document elements into view
 */
@Injectable()
export class ScrollService {

  private _topOffset: number;
  private _topOfPageElement: Element;

  constructor(
      @Inject(DOCUMENT) private document: any,
      private location: PlatformLocation) { }

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
   * Scroll to the element.
   * Don't scroll if no element.
   */
  scrollToElement(element: Element) {
    if (element) {
      element.scrollIntoView();
      if (window && window.scrollBy) { window.scrollBy(0, -this.topOffset); }
    }
  }

  /** Scroll to the top of the document. */
  scrollToTop() {
    this.scrollToElement(this.topOfPageElement);
  }

  /**
   * Return the hash fragment from the `PlatformLocation`, minus the leading `#`.
   */
  private getCurrentHash() {
    return this.location.hash.replace(/^#/, '');
  }

  /** Offset from the top of the document to bottom of toolbar + some margin */
  private get topOffset() {
    if (!this._topOffset) {
      const toolbar = document.querySelector('md-toolbar.app-toolbar');
      this._topOffset = (toolbar ? toolbar.clientHeight : 0) + topMargin;
    }
    return this._topOffset;
  }

  private get topOfPageElement() {
    if (!this._topOfPageElement) {
      this._topOfPageElement = this.document.getElementById('top-of-page') || this.document.body;
    }
    return this._topOfPageElement;
  }
}
