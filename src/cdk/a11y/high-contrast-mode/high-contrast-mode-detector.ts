/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {inject, Inject, Injectable, OnDestroy} from '@angular/core';
import {BreakpointObserver} from '@angular/cdk/layout';
import {Platform} from '@angular/cdk/platform';
import {DOCUMENT} from '@angular/common';
import {Subscription} from 'rxjs';

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
 * Service to determine whether the browser is currently in a high-contrast-mode environment.
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
export class HighContrastModeDetector implements OnDestroy {
  /**
   * Figuring out the high contrast mode and adding the body classes can cause
   * some expensive layouts. This flag is used to ensure that we only do it once.
   */
  private _hasCheckedHighContrastMode: boolean;
  private _document: Document;
  private _breakpointSubscription: Subscription;

  constructor(private _platform: Platform, @Inject(DOCUMENT) document: any) {
    this._document = document;

    this._breakpointSubscription = inject(BreakpointObserver)
      .observe('(forced-colors: active)')
      .subscribe(() => {
        if (this._hasCheckedHighContrastMode) {
          this._hasCheckedHighContrastMode = false;
          this._applyBodyHighContrastModeCssClasses();
        }
      });
  }

  /** Gets the current high-contrast-mode for the page. */
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
    // via the document so we can fake it in tests. Note that we have extra null checks, because
    // this logic will likely run during app bootstrap and throwing can break the entire app.
    const documentWindow = this._document.defaultView || window;
    const computedStyle =
      documentWindow && documentWindow.getComputedStyle
        ? documentWindow.getComputedStyle(testElement)
        : null;
    const computedColor = ((computedStyle && computedStyle.backgroundColor) || '').replace(
      / /g,
      '',
    );
    testElement.remove();

    switch (computedColor) {
      case 'rgb(0,0,0)':
        return HighContrastMode.WHITE_ON_BLACK;
      case 'rgb(255,255,255)':
        return HighContrastMode.BLACK_ON_WHITE;
    }
    return HighContrastMode.NONE;
  }

  ngOnDestroy(): void {
    this._breakpointSubscription.unsubscribe();
  }

  /** Applies CSS classes indicating high-contrast mode to document body (browser-only). */
  _applyBodyHighContrastModeCssClasses(): void {
    if (!this._hasCheckedHighContrastMode && this._platform.isBrowser && this._document.body) {
      const bodyClasses = this._document.body.classList;
      bodyClasses.remove(
        HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS,
        BLACK_ON_WHITE_CSS_CLASS,
        WHITE_ON_BLACK_CSS_CLASS,
      );
      this._hasCheckedHighContrastMode = true;

      const mode = this.getHighContrastMode();
      if (mode === HighContrastMode.BLACK_ON_WHITE) {
        bodyClasses.add(HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS, BLACK_ON_WHITE_CSS_CLASS);
      } else if (mode === HighContrastMode.WHITE_ON_BLACK) {
        bodyClasses.add(HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS, WHITE_ON_BLACK_CSS_CLASS);
      }
    }
  }
}
