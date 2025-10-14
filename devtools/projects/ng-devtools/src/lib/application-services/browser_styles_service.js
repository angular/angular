/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {inject, Injectable, RendererFactory2} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {Platform} from '@angular/cdk/platform';
// If for some reason we are unable to properly
// detect the browser, we are defaulting
// to Chrome's styles.
// Keep class names in sync with _theme.scss and _browser.scss
const BROWSER_CLASS_NAME = {
  'chrome': 'chrome-ui',
  'firefox': 'firefox-ui',
  'unknown': 'chrome-ui',
};
const BROWSER_STYLES = {
  'chrome': 'chrome.css',
  'firefox': 'firefox.css',
  'unknown': 'chrome.css',
};
let BrowserStylesService = class BrowserStylesService {
  constructor() {
    this.doc = inject(DOCUMENT);
    this.rendererFactory = inject(RendererFactory2);
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.platform = inject(Platform);
    this.browser = this.detectBrowser();
  }
  initBrowserSpecificStyles() {
    this.addBrowserUiClass();
    this.loadBrowserStyle();
  }
  /** Add the browser class to the document body */
  addBrowserUiClass() {
    const browserClass = BROWSER_CLASS_NAME[this.browser];
    this.renderer.addClass(this.doc.body, browserClass);
  }
  /** Load browser-specific styles */
  loadBrowserStyle() {
    const fileName = BROWSER_STYLES[this.browser];
    const head = this.doc.getElementsByTagName('head')[0];
    const style = this.renderer.createElement('link');
    style.rel = 'stylesheet';
    style.href = `./styles/${fileName}`;
    head.appendChild(style);
  }
  detectBrowser() {
    if (this.platform.BLINK) {
      return 'chrome';
    }
    if (this.platform.FIREFOX) {
      return 'firefox';
    }
    return 'unknown';
  }
};
BrowserStylesService = __decorate(
  [
    Injectable({
      providedIn: 'root',
    }),
  ],
  BrowserStylesService,
);
export {BrowserStylesService};
//# sourceMappingURL=browser_styles_service.js.map
