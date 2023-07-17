/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HttpBackend, HttpEvent, HttpEventType, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, Observer} from 'rxjs';

import {HttpTestingController, RequestMatch} from './api';
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
@Injectable()
export class HttpClientTestingBackend implements HttpBackend, HttpTestingController {
  /**
   * List of pending requests which have not yet been expected.
   */
  private open: TestRequest[] = [];

  /**
   * Handle an incoming request by queueing it in the list of open requests.
   */
  handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    return new Observable((observer: Observer<any>) => {
      const testReq = new TestRequest(req, observer);
      this.open.push(testReq);
      observer.next({type: HttpEventType.Sent} as HttpEvent<any>);
      return () => {
        testReq._cancelled = true;
      };
    });
  }

  /**
   * Helper function to search for requests in the list of open requests.
   */
  private _match(match: string|RequestMatch|((req: HttpRequest<any>) => boolean)): TestRequest[] {
    if (typeof match === 'string') {
      return this.open.filter(testReq => testReq.request.urlWithParams === match);
    } else if (typeof match === 'function') {
      return this.open.filter(testReq => match(testReq.request));
    } else {
      return this.open.filter(
          testReq => (!match.method || testReq.request.method === match.method.toUpperCase()) &&
              (!match.url || testReq.request.urlWithParams === match.url));
    }
  }

  /**
   * Search for requests in the list of open requests, and return all that match
   * without asserting anything about the number of matches.
   */
  match(match: string|RequestMatch|((req: HttpRequest<any>) => boolean)): TestRequest[] {
    const results = this._match(match);
    results.forEach(result => {
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
  expectOne(match: string|RequestMatch|((req: HttpRequest<any>) => boolean), description?: string):
      TestRequest {
    description = description || this.descriptionFromMatcher(match);
    const matches = this.match(match);
    if (matches.length > 1) {
      throw new Error(`Expected one matching request for criteria "${description}", found ${
          matches.length} requests.`);
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
  expectNone(match: string|RequestMatch|((req: HttpRequest<any>) => boolean), description?: string):
      void {
    description = description || this.descriptionFromMatcher(match);
    const matches = this.match(match);
    if (matches.length > 0) {
      throw new Error(`Expected zero matching requests for criteria "${description}", found ${
          matches.length}.`);
    }
  }

  /**
   * Validate that there are no outstanding requests.
   */
  verify(opts: {ignoreCancelled?: boolean} = {}): void {
    let open = this.open;
    // It's possible that some requests may be cancelled, and this is expected.
    // The user can ask to ignore open requests which have been cancelled.
    if (opts.ignoreCancelled) {
      open = open.filter(testReq => !testReq.cancelled);
    }
    if (open.length > 0) {
      // Show the methods and URLs of open requests in the error, for convenience.
      const requests = open.map(describeRequest).join(', ');
      throw new Error(`Expected no open requests, found ${open.length}: ${requests}`);
    }
  }

  private descriptionFromMatcher(matcher: string|RequestMatch|
                                 ((req: HttpRequest<any>) => boolean)): string {
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
}

function describeRequest(testRequest: TestRequest): string {
  const url = testRequest.request.urlWithParams;
  const method = testRequest.request.method;
  return `${method} ${url}`;
}
