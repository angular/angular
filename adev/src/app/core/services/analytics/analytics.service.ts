/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject, Injectable, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';

import {WINDOW, ENVIRONMENT, LOCAL_STORAGE, STORAGE_KEY, setCookieConsent} from '@angular/docs';

import {formatErrorEventForAnalytics} from './analytics-format-error';

/** Extension of `Window` with potential Google Analytics fields. */
interface WindowWithAnalytics extends Window {
  dataLayer?: any[];
  gtag?(...args: any[]): void;
}

@Injectable({providedIn: 'root'})
/**
 * Google Analytics Service - captures app behaviors and sends them to Google Analytics.
 *
 * Associates data wi`th properties determined from the environment configurations:
 *   - Data is uploaded to our main Google Analytics 4+ property.
 */
export class AnalyticsService {
  private environment = inject(ENVIRONMENT);
  private window: WindowWithAnalytics = inject(WINDOW);
  private readonly localStorage = inject(LOCAL_STORAGE);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    if (this.isBrowser) {
      this._installGlobalSiteTag();
      this._installWindowErrorHandler();
    }
  }

  reportError(description: string, fatal = true) {
    // Limit descriptions to maximum of 150 characters.
    // See: https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters#exd.
    description = description.substring(0, 150);

    this._gtag('event', 'exception', {description, fatal});
  }

  sendEvent(name: string, parameters: Record<string, string | boolean | number>) {
    this._gtag('event', name, parameters);
  }

  private _gtag(...args: any[]) {
    if (this.window.gtag) {
      this.window.gtag(...args);
    }
  }

  private _installGlobalSiteTag() {
    const window = this.window;
    const url = `https://www.googletagmanager.com/gtag/js?id=${this.environment.googleAnalyticsId}`;

    // Note: This cannot be an arrow function as `gtag.js` expects an actual `Arguments`
    // instance with e.g. `callee` to be set. Do not attempt to change this and keep this
    // as much as possible in sync with the tracking code snippet suggested by the Google
    // Analytics 4 web UI under `Data Streams`.
    window.dataLayer = this.window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer?.push(arguments);
    };

    // Cookie banner consent initial state
    // This code is modified in the @angular/docs package in the cookie-popup component.
    // Docs: https://developers.google.com/tag-platform/security/guides/consent
    if (this.localStorage) {
      if (this.localStorage.getItem(STORAGE_KEY) === 'true') {
        setCookieConsent('granted');
      } else {
        setCookieConsent('denied');
      }
    } else {
      // In case localStorage is not available, we default to denying cookies.
      setCookieConsent('denied');
    }

    window.gtag('js', new Date());

    // Configure properties before loading the script. This is necessary to avoid
    // loading multiple instances of the gtag JS scripts.
    window.gtag('config', this.environment.googleAnalyticsId);

    // Only add the element if `gtag` is not loaded yet. It might already
    // be inlined into the `index.html` via SSR.
    if (window.document.querySelector('#gtag-script') === null) {
      const el = window.document.createElement('script');
      el.async = true;
      el.src = url as string;
      el.id = 'gtag-script';
      window.document.head.appendChild(el);
    }
  }

  private _installWindowErrorHandler() {
    this.window.addEventListener('error', (event) =>
      this.reportError(formatErrorEventForAnalytics(event), true),
    );
  }
}
