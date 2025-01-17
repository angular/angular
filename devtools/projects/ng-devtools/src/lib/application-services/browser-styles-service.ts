/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject, Injectable, RendererFactory2} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {Platform} from '@angular/cdk/platform';

// Update for with newly supported browser
export type Browser = 'chrome' | 'firefox' | 'unknown';

// If for some reason we are unable to properly
// detect the browser, we are defaulting
// to Chrome's styles.

// Keep class names in sync with _theme.scss and _browser.scss
const BROWSER_CLASS_NAME: {[key in Browser]: string} = {
  'chrome': 'chrome-ui',
  'firefox': 'firefox-ui',
  'unknown': 'chrome-ui',
};

const BROWSER_STYLES: {[key in Browser]: string} = {
  'chrome': 'chrome.css',
  'firefox': 'firefox.css',
  'unknown': 'chrome.css',
};

@Injectable({
  providedIn: 'root',
})
export class BrowserStylesService {
  private readonly _doc = inject(DOCUMENT);
  private readonly _rendererFactory = inject(RendererFactory2);
  private readonly _renderer = this._rendererFactory.createRenderer(null, null);
  private readonly _platform = inject(Platform);

  private _browser: Browser = 'unknown';

  initBrowserSpecificStyles() {
    this._browser = this._detectBrowser();

    this._addBrowserUiClass();
    this._loadBrowserStyle();
  }

  /** Add the browser class to the document body */
  private _addBrowserUiClass() {
    const browserClass = BROWSER_CLASS_NAME[this._browser];
    this._renderer.addClass(this._doc.body, browserClass);
  }

  /** Load browser-specific styles */
  private _loadBrowserStyle() {
    const fileName = BROWSER_STYLES[this._browser];
    const head = this._doc.getElementsByTagName('head')[0];

    const style = this._renderer.createElement('link');
    style.rel = 'stylesheet';
    style.href = `./styles/${fileName}`;

    head.appendChild(style);
  }

  private _detectBrowser(): Browser {
    if (this._platform.BLINK) {
      return 'chrome';
    }
    if (this._platform.FIREFOX) {
      return 'firefox';
    }
    return 'unknown';
  }
}
