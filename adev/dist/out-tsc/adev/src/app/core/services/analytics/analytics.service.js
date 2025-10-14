/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {inject, Injectable, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {WINDOW, ENVIRONMENT, LOCAL_STORAGE, STORAGE_KEY, setCookieConsent} from '@angular/docs';
import {formatErrorEventForAnalytics} from './analytics-format-error';
let AnalyticsService = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var AnalyticsService = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      AnalyticsService = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    environment = inject(ENVIRONMENT);
    window = inject(WINDOW);
    localStorage = inject(LOCAL_STORAGE);
    isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    constructor() {
      if (this.isBrowser) {
        this._installGlobalSiteTag();
        this._installWindowErrorHandler();
      }
    }
    reportError(description, fatal = true) {
      // Limit descriptions to maximum of 150 characters.
      // See: https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters#exd.
      description = description.substring(0, 150);
      this._gtag('event', 'exception', {description, fatal});
    }
    sendEvent(name, parameters) {
      this._gtag('event', name, parameters);
    }
    _gtag(...args) {
      if (this.window.gtag) {
        this.window.gtag(...args);
      }
    }
    _installGlobalSiteTag() {
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
        el.src = url;
        el.id = 'gtag-script';
        window.document.head.appendChild(el);
      }
    }
    _installWindowErrorHandler() {
      this.window.addEventListener('error', (event) =>
        this.reportError(formatErrorEventForAnalytics(event), true),
      );
    }
  };
  return (AnalyticsService = _classThis);
})();
export {AnalyticsService};
//# sourceMappingURL=analytics.service.js.map
