/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {ɵparseCookieValue as parseCookieValue} from '../../index';
import {inject, Injectable, InjectionToken, runInInjectionContext} from '@angular/core';
export const XSRF_ENABLED = new InjectionToken(
  typeof ngDevMode !== undefined && ngDevMode ? 'XSRF_ENABLED' : '',
  {
    factory: () => true,
  },
);
export const XSRF_DEFAULT_COOKIE_NAME = 'XSRF-TOKEN';
export const XSRF_COOKIE_NAME = new InjectionToken(
  typeof ngDevMode !== undefined && ngDevMode ? 'XSRF_COOKIE_NAME' : '',
  {
    providedIn: 'root',
    factory: () => XSRF_DEFAULT_COOKIE_NAME,
  },
);
export const XSRF_DEFAULT_HEADER_NAME = 'X-XSRF-TOKEN';
export const XSRF_HEADER_NAME = new InjectionToken(
  typeof ngDevMode !== undefined && ngDevMode ? 'XSRF_HEADER_NAME' : '',
  {
    providedIn: 'root',
    factory: () => XSRF_DEFAULT_HEADER_NAME,
  },
);
/**
 * `HttpXsrfTokenExtractor` which retrieves the token from a cookie.
 */
let HttpXsrfCookieExtractor = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HttpXsrfCookieExtractor = class {
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
      HttpXsrfCookieExtractor = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    doc;
    cookieName;
    lastCookieString = '';
    lastToken = null;
    /**
     * @internal for testing
     */
    parseCount = 0;
    constructor(doc, cookieName) {
      this.doc = doc;
      this.cookieName = cookieName;
    }
    getToken() {
      if (typeof ngServerMode !== 'undefined' && ngServerMode) {
        return null;
      }
      const cookieString = this.doc.cookie || '';
      if (cookieString !== this.lastCookieString) {
        this.parseCount++;
        this.lastToken = parseCookieValue(cookieString, this.cookieName);
        this.lastCookieString = cookieString;
      }
      return this.lastToken;
    }
  };
  return (HttpXsrfCookieExtractor = _classThis);
})();
export {HttpXsrfCookieExtractor};
/**
 * Retrieves the current XSRF token to use with the next outgoing request.
 *
 * @publicApi
 */
let HttpXsrfTokenExtractor = (() => {
  let _classDecorators = [Injectable({providedIn: 'root', useExisting: HttpXsrfCookieExtractor})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HttpXsrfTokenExtractor = class {
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
      HttpXsrfTokenExtractor = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
  };
  return (HttpXsrfTokenExtractor = _classThis);
})();
export {HttpXsrfTokenExtractor};
export function xsrfInterceptorFn(req, next) {
  const lcUrl = req.url.toLowerCase();
  // Skip both non-mutating requests and absolute URLs.
  // Non-mutating requests don't require a token, and absolute URLs require special handling
  // anyway as the cookie set
  // on our origin is not the same as the token expected by another origin.
  if (
    !inject(XSRF_ENABLED) ||
    req.method === 'GET' ||
    req.method === 'HEAD' ||
    lcUrl.startsWith('http://') ||
    lcUrl.startsWith('https://')
  ) {
    return next(req);
  }
  const token = inject(HttpXsrfTokenExtractor).getToken();
  const headerName = inject(XSRF_HEADER_NAME);
  // Be careful not to overwrite an existing header of the same name.
  if (token != null && !req.headers.has(headerName)) {
    req = req.clone({headers: req.headers.set(headerName, token)});
  }
  return next(req);
}
/**
 * `HttpInterceptor` which adds an XSRF token to eligible outgoing requests.
 */
let HttpXsrfInterceptor = (() => {
  let _classDecorators = [Injectable()];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HttpXsrfInterceptor = class {
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
      HttpXsrfInterceptor = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    injector;
    constructor(injector) {
      this.injector = injector;
    }
    intercept(initialRequest, next) {
      return runInInjectionContext(this.injector, () =>
        xsrfInterceptorFn(initialRequest, (downstreamRequest) => next.handle(downstreamRequest)),
      );
    }
  };
  return (HttpXsrfInterceptor = _classThis);
})();
export {HttpXsrfInterceptor};
//# sourceMappingURL=xsrf.js.map
