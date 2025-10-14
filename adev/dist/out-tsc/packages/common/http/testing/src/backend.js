/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {HttpEventType} from '../../index';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {TestRequest} from './request';
/**
 * A testing backend for `HttpClient` which both acts as an `HttpBackend`
 * and as the `HttpTestingController`.
 *
 * `HttpClientTestingBackend` works by keeping a list of all open requests.
 * As requests come in, they're added to the list. Users can assert that specific
 * requests were made and then flush them. In the end, a verify() method asserts
 * that no unexpected requests were made.
 *
 *
 */
let HttpClientTestingBackend = (() => {
  let _classDecorators = [Injectable()];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HttpClientTestingBackend = class {
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
      HttpClientTestingBackend = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    /**
     * List of pending requests which have not yet been expected.
     */
    open = [];
    /**
     * Used when checking if we need to throw the NOT_USING_FETCH_BACKEND_IN_SSR error
     */
    isTestingBackend = true;
    /**
     * Handle an incoming request by queueing it in the list of open requests.
     */
    handle(req) {
      return new Observable((observer) => {
        const testReq = new TestRequest(req, observer);
        this.open.push(testReq);
        observer.next({type: HttpEventType.Sent});
        return () => {
          testReq._cancelled = true;
        };
      });
    }
    /**
     * Helper function to search for requests in the list of open requests.
     */
    _match(match) {
      if (typeof match === 'string') {
        return this.open.filter((testReq) => testReq.request.urlWithParams === match);
      } else if (typeof match === 'function') {
        return this.open.filter((testReq) => match(testReq.request));
      } else {
        return this.open.filter(
          (testReq) =>
            (!match.method || testReq.request.method === match.method.toUpperCase()) &&
            (!match.url || testReq.request.urlWithParams === match.url),
        );
      }
    }
    /**
     * Search for requests in the list of open requests, and return all that match
     * without asserting anything about the number of matches.
     */
    match(match) {
      const results = this._match(match);
      results.forEach((result) => {
        const index = this.open.indexOf(result);
        if (index !== -1) {
          this.open.splice(index, 1);
        }
      });
      return results;
    }
    /**
     * Expect that a single outstanding request matches the given matcher, and return
     * it.
     *
     * Requests returned through this API will no longer be in the list of open requests,
     * and thus will not match twice.
     */
    expectOne(match, description) {
      description ||= this.descriptionFromMatcher(match);
      const matches = this.match(match);
      if (matches.length > 1) {
        throw new Error(
          `Expected one matching request for criteria "${description}", found ${matches.length} requests.`,
        );
      }
      if (matches.length === 0) {
        let message = `Expected one matching request for criteria "${description}", found none.`;
        if (this.open.length > 0) {
          // Show the methods and URLs of open requests in the error, for convenience.
          const requests = this.open.map(describeRequest).join(', ');
          message += ` Requests received are: ${requests}.`;
        }
        throw new Error(message);
      }
      return matches[0];
    }
    /**
     * Expect that no outstanding requests match the given matcher, and throw an error
     * if any do.
     */
    expectNone(match, description) {
      description ||= this.descriptionFromMatcher(match);
      const matches = this.match(match);
      if (matches.length > 0) {
        throw new Error(
          `Expected zero matching requests for criteria "${description}", found ${matches.length}.`,
        );
      }
    }
    /**
     * Validate that there are no outstanding requests.
     */
    verify(opts = {}) {
      let open = this.open;
      // It's possible that some requests may be cancelled, and this is expected.
      // The user can ask to ignore open requests which have been cancelled.
      if (opts.ignoreCancelled) {
        open = open.filter((testReq) => !testReq.cancelled);
      }
      if (open.length > 0) {
        // Show the methods and URLs of open requests in the error, for convenience.
        const requests = open.map(describeRequest).join(', ');
        throw new Error(`Expected no open requests, found ${open.length}: ${requests}`);
      }
    }
    descriptionFromMatcher(matcher) {
      if (typeof matcher === 'string') {
        return `Match URL: ${matcher}`;
      } else if (typeof matcher === 'object') {
        const method = matcher.method || '(any)';
        const url = matcher.url || '(any)';
        return `Match method: ${method}, URL: ${url}`;
      } else {
        return `Match by function: ${matcher.name}`;
      }
    }
  };
  return (HttpClientTestingBackend = _classThis);
})();
export {HttpClientTestingBackend};
function describeRequest(testRequest) {
  const url = testRequest.request.urlWithParams;
  const method = testRequest.request.method;
  return `${method} ${url}`;
}
//# sourceMappingURL=backend.js.map
