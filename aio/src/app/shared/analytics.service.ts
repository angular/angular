import { Inject, Injectable } from '@angular/core';

import { trustedResourceUrl, unwrapResourceUrl } from 'safevalues';

import { formatErrorEventForAnalytics } from './analytics-format-error';
import { WindowToken } from '../shared/window';
import { environment } from '../../environments/environment';

/** Extension of `Window` with potential Google Analytics fields. */
interface WindowWithAnalytics extends Window {
  dataLayer?: any[];
  gtag?(...args: any[]): void;
  /** Legacy Universal Analytics `analytics.js` field. */
  ga?(...args: any[]): void;
};

@Injectable()
/**
 * Google Analytics Service - captures app behaviors and sends them to Google Analytics.
 *
 * Note: Presupposes that the legacy `analytics.js` script has been loaded on the
 * host web page.
 *
 * Associates data with properties determined from the environment configurations:
 *   - Data is uploaded to a legacy Universal Analytics property
 *   - Data is uploaded to our main Google Analytics 4+ property.
 */
export class AnalyticsService {
  /** Whether the application runs in e2e tests using Protractor. */
  private readonly isProtractor = this.window.name.includes('NG_DEFER_BOOTSTRAP');

  /** Previously reported URL. Cached to allow for duplicates being filtered. */
  private previousUrl: string;

  constructor(@Inject(WindowToken) private window: WindowWithAnalytics) {
    this._installGlobalSiteTag();
    this._installWindowErrorHandler();

    // TODO: Remove this when we fully switch to Google Analytics 4+.
    this._legacyGa('create', environment.legacyUniversalAnalyticsId , 'auto');
    this._legacyGa('set', 'anonymizeIp', true);
  }

  reportError(description: string, fatal = true) {
    // Limit descriptions to maximum of 150 characters.
    // See: https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters#exd.
    description = description.substring(0, 150);

    this._legacyGa('send', 'exception', {exDescription: description, exFatal: fatal});
    this._gtag('event', 'exception', {description, fatal});
  }

  locationChanged(url: string) {
    this._sendPage(url);
  }

  sendEvent(name: string, parameters: Record<string, string|boolean|number>) {
    this._gtag('event', name, parameters);
  }

  private _sendPage(url: string) {
    // Won't re-send if the url hasn't changed.
    if (url === this.previousUrl) { return; }
    this.previousUrl = url;

    this._legacyGa('set', 'page', '/' + url);
    this._legacyGa('send', 'pageview');
  }

  private _gtag(...args: any[]) {
    if (this.window.gtag) {
      this.window.gtag(...args);
    }
  }

  private _legacyGa(...args: any[]) {
    if (this.window.ga) {
      this.window.ga(...args);
    }
  }

  private _installGlobalSiteTag() {
    const window = this.window;
    const url: TrustedScriptURL =
      trustedResourceUrl`https://www.googletagmanager.com/gtag/js?id=${environment.googleAnalyticsId}`;

    // Note: This cannot be an arrow function as `gtag.js` expects an actual `Arguments`
    // instance with e.g. `callee` to be set. Do not attempt to change this and keep this
    // as much as possible in sync with the tracking code snippet suggested by the Google
    // Analytics 4 web UI under `Data Streams`.
    window.dataLayer = this.window.dataLayer || [];
    window.gtag = function() { window.dataLayer?.push(arguments); };
    window.gtag('js', new Date());

    // Configure properties before loading the script. This is necessary to avoid
    // loading multiple instances of the gtag JS scripts.
    window.gtag('config', environment.googleAnalyticsId);

    // do not load the library when we are running in an e2e protractor test.
    if (this.isProtractor) {
      return;
    }

    const el = window.document.createElement('script');
    el.async = true;
    el.src = unwrapResourceUrl(url) as string;
    window.document.head.appendChild(el);
  }

  private _installWindowErrorHandler() {
    this.window.addEventListener('error', event =>
      this.reportError(formatErrorEventForAnalytics(event), true));
  }
}
