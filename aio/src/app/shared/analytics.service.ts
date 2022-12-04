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

  constructor(@Inject(WindowToken) private window: WindowWithAnalytics) {
  }

  reportError(description: string, fatal = true) {
  }

  locationChanged(url: string) {
  }

  sendEvent() {
  }
}
