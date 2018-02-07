import { ErrorHandler, Inject, Injectable } from '@angular/core';
import { WindowToken } from './window';

/**
 * Extend the default error handling to report errors to an external service - e.g Google Analytics.
 *
 * Errors outside the Angular application may also be handled by `window.onerror`.
 */
@Injectable()
export class ReportingErrorHandler extends ErrorHandler {

  constructor(@Inject(WindowToken) private window: Window) {
    super();
  }

  /**
   * Send error info to Google Analytics, in addition to the default handling.
   * @param error Information about the error.
   */
  handleError(error: string | Error) {

    try {
      super.handleError(error);
    } catch (e) {
      this.reportError(e);
    }
    this.reportError(error);
  }

  private reportError(error: string | Error) {
    if (typeof error === 'string') {
      this.window.onerror(error);
    } else {
      this.window.onerror(error.message, undefined, undefined, undefined, error);
    }
  }
}
