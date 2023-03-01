import { ErrorHandler, Injectable, VERSION } from '@angular/core';
import { formatErrorForAnalytics } from './analytics-format-error';
import { AnalyticsService } from './analytics.service';

/**
 * Extend the default error handling to report errors to an external service - e.g Google Analytics.
 *
 * Errors outside the Angular application may also be handled by `window.onerror`.
 */
@Injectable()
export class ReportingErrorHandler extends ErrorHandler {

  constructor(private _analytics: AnalyticsService) {
    super();
  }

  /**
   * Send error info to Google Analytics, in addition to the default handling.
   *
   * @param error Information about the error.
   */
  override handleError(error: any) {
    const versionedError = this.prefixErrorWithVersion(error);

    try {
      super.handleError(versionedError);
    } catch (e) {
      this.reportError(e);
    }
    this.reportError(versionedError);
  }

  private prefixErrorWithVersion<T>(error: T): T {
    const prefix = `[v${VERSION.full}] `;

    if (error instanceof Error) {
      const oldMessage = error.message;
      const oldStack = error.stack;

      error.message = prefix + oldMessage;
      error.stack = oldStack?.replace(oldMessage, error.message);
    } else if (typeof error === 'string') {
      error = prefix + error as unknown as T;
    }
    // If it is a different type, omit the version to avoid altering the original `error` object.

    return error;
  }

  private reportError(error: unknown) {
    if (error instanceof Error) {
      this._analytics.reportError(formatErrorForAnalytics(error));
    } else {
      if (typeof error === 'object') {
        try {
          error = JSON.stringify(error);
        } catch {
          // Ignore the error and just let it be stringified.
        }
      }
      this._analytics.reportError(`${error}`);
    }
  }
}
