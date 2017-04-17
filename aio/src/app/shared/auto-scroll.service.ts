import { Injectable, Inject, InjectionToken } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { DOCUMENT } from '@angular/platform-browser';

/**
 * A service that supports automatically scrolling elements into view
 */
@Injectable()
export class AutoScrollService {
  constructor(
      @Inject(DOCUMENT) private document: any,
      private location: PlatformLocation) { }

  /**
   * Scroll to the element with id extracted from the current location hash fragment
   * Scroll to top if no hash
   * Don't scroll if hash not found
   */
  scroll() {
    const hash = this.getCurrentHash();
    const element: HTMLElement = hash
        ? this.document.getElementById(hash)
        : this.document.getElementById('top-of-page') || this.document.body;
    if (element) {
      element.scrollIntoView();
      if (window && window.scrollBy) { window.scrollBy(0, -80); }
    }
  }

  /**
   * We can get the hash fragment from the `PlatformLocation` but
   * it needs the `#` char removing from the front.
   */
  private getCurrentHash() {
    return this.location.hash.replace(/^#/, '');
  }
}
