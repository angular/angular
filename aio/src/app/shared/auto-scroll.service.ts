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
   * Scroll the contents of the container
   * to the element with id extracted from the current location hash fragment
   */
  scroll(container: HTMLElement) {
    const hash = this.getCurrentHash();
    const element: HTMLElement = this.document.getElementById(hash);
    if (element) {
      element.scrollIntoView();
    } else {
      container.scrollTop = 0;
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
