/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Platform} from '@angular/cdk/platform';
import {DOCUMENT} from '@angular/common';
import {Inject, Injectable} from '@angular/core';


/** Set of possible high-contrast mode backgrounds. */
export const enum HighContrastMode {
  NONE,
  BLACK_ON_WHITE,
  WHITE_ON_BLACK,
}

/** CSS class applied to the document body when in black-on-white high-contrast mode. */
export const BLACK_ON_WHITE_CSS_CLASS = 'cdk-high-contrast-black-on-white';

/** CSS class applied to the document body when in white-on-black high-contrast mode. */
export const WHITE_ON_BLACK_CSS_CLASS = 'cdk-high-contrast-white-on-black';

/** CSS class applied to the document body when in high-contrast mode. */
export const HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS = 'cdk-high-contrast-active';

/**
 * Service to determine whether the browser is currently in a high-constrast-mode environment.
 *
 * Microsoft Windows supports an accessibility feature called "High Contrast Mode". This mode
 * changes the appearance of all applications, including web applications, to dramatically increase
 * contrast.
 *
 * IE, Edge, and Firefox currently support this mode. Chrome does not support Windows High Contrast
 * Mode. This service does not detect high-contrast mode as added by the Chrome "High Contrast"
 * browser extension.
 */
@Injectable({providedIn: 'root'})
export class HighContrastModeDetector {
  private _document: Document;

  constructor(private _platform: Platform, @Inject(DOCUMENT) document: any) {
    this._document = document;
  }

  /** Gets the current high-constrast-mode for the page. */
  getHighContrastMode(): HighContrastMode {
    if (!this._platform.isBrowser) {
      return HighContrastMode.NONE;
    }

    // Create a test element with an arbitrary background-color that is neither black nor
    // white; high-contrast mode will coerce the color to either black or white. Also ensure that
    // appending the test element to the DOM does not affect layout by absolutely positioning it
    const testElement = this._document.createElement('div');
    testElement.style.backgroundColor = 'rgb(1,2,3)';
    testElement.style.position = 'absolute';
    this._document.body.appendChild(testElement);

    // Get the computed style for the background color, collapsing spaces to normalize between
    // browsers. Once we get this color, we no longer need the test element. Access the `window`
    // via the document so we can fake it in tests.
    const documentWindow = this._document.defaultView!;
    const computedColor =
        (documentWindow.getComputedStyle(testElement).backgroundColor || '').replace(/ /g, '');
    this._document.body.removeChild(testElement);

    switch (computedColor) {
      case 'rgb(0,0,0)': return HighContrastMode.WHITE_ON_BLACK;
      case 'rgb(255,255,255)': return HighContrastMode.BLACK_ON_WHITE;
    }
    return HighContrastMode.NONE;
  }

  /** Applies CSS classes indicating high-contrast mode to document body (browser-only). */
  _applyBodyHighContrastModeCssClasses(): void {
    if (this._platform.isBrowser && this._document.body) {
      const bodyClasses = this._document.body.classList;
      // IE11 doesn't support `classList` operations with multiple arguments
      bodyClasses.remove(HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS);
      bodyClasses.remove(BLACK_ON_WHITE_CSS_CLASS);
      bodyClasses.remove(WHITE_ON_BLACK_CSS_CLASS);

      const mode = this.getHighContrastMode();
      if (mode === HighContrastMode.BLACK_ON_WHITE) {
        bodyClasses.add(HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS);
        bodyClasses.add(BLACK_ON_WHITE_CSS_CLASS);
      } else if (mode === HighContrastMode.WHITE_ON_BLACK) {
        bodyClasses.add(HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS);
        bodyClasses.add(WHITE_ON_BLACK_CSS_CLASS);
      }
    }
  }
}
