/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {ErrorHandler, Injectable, VERSION, inject} from '@angular/core';
import {formatErrorForAnalytics} from './analytics-format-error';
import {AnalyticsService} from './analytics.service';
/**
 * Extend the default error handling to report errors to an external service - e.g Google Analytics.
 *
 * Errors outside the Angular application may also be handled by `window.onerror`.
 */
let ReportingErrorHandler = (() => {
  let _classDecorators = [Injectable()];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _classSuper = ErrorHandler;
  var ReportingErrorHandler = class extends _classSuper {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata
          ? Object.create(_classSuper[Symbol.metadata] ?? null)
          : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      ReportingErrorHandler = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    _analytics = inject(AnalyticsService);
    constructor() {
      super();
    }
    /**
     * Send error info to Google Analytics, in addition to the default handling.
     *
     * @param error Information about the error.
     */
    handleError(error) {
      const versionedError = this.prefixErrorWithVersion(error);
      try {
        super.handleError(versionedError);
      } catch (e) {
        this.reportError(e);
      }
      this.reportError(versionedError);
    }
    prefixErrorWithVersion(error) {
      const prefix = `[v${VERSION.full}] `;
      if (error instanceof Error) {
        const oldMessage = error.message;
        const oldStack = error.stack;
        error.message = prefix + oldMessage;
        error.stack = oldStack?.replace(oldMessage, error.message);
      } else if (typeof error === 'string') {
        error = prefix + error;
      }
      // If it is a different type, omit the version to avoid altering the original `error` object.
      return error;
    }
    reportError(error) {
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
  };
  return (ReportingErrorHandler = _classThis);
})();
export {ReportingErrorHandler};
//# sourceMappingURL=reporting-error-handler.js.map
