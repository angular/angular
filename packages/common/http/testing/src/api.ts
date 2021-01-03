/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HttpRequest} from '@angular/common/http';

import {TestRequest} from './request';

/**
 * Defines a matcher for requests based on URL, method, or both.
 *
 * @publicApi
 */
export interface RequestMatch {
  method?: string;
  url?: string;
}

/**
 * Controller to be injected into tests, that allows for mocking and flushing
 * of requests.
 *
 * @publicApi
 */
export abstract class HttpTestingController {
  /**
   * Search for requests that match the given parameter, without any expectations.
   */
  abstract match(match: string|RequestMatch|((req: HttpRequest<any>) => boolean)): TestRequest[];

  /**
   * Expect that a single request has been made which matches the given URL, and return its
   * mock.
   *
   * If no such request has been made, or more than one such request has been made, fail with an
   * error message including the given request description, if any.
   */
  abstract expectOne(url: string, description?: string): TestRequest;

  /**
   * Expect that a single request has been made which matches the given parameters, and return
   * its mock.
   *
   * If no such request has been made, or more than one such request has been made, fail with an
   * error message including the given request description, if any.
   */
  abstract expectOne(params: RequestMatch, description?: string): TestRequest;

  /**
   * Expect that a single request has been made which matches the given predicate function, and
   * return its mock.
   *
   * If no such request has been made, or more than one such request has been made, fail with an
   * error message including the given request description, if any.
   */
  abstract expectOne(matchFn: ((req: HttpRequest<any>) => boolean), description?: string):
      TestRequest;

  /**
   * Expect that a single request has been made which matches the given condition, and return
   * its mock.
   *
   * If no such request has been made, or more than one such request has been made, fail with an
   * error message including the given request description, if any.
   */
  abstract expectOne(
      match: string|RequestMatch|((req: HttpRequest<any>) => boolean),
      description?: string): TestRequest;

  /**
   * Expect that no requests have been made which match the given URL.
   *
   * If a matching request has been made, fail with an error message including the given request
   * description, if any.
   */
  abstract expectNone(url: string, description?: string): void;

  /**
   * Expect that no requests have been made which match the given parameters.
   *
   * If a matching request has been made, fail with an error message including the given request
   * description, if any.
   */
  abstract expectNone(params: RequestMatch, description?: string): void;

  /**
   * Expect that no requests have been made which match the given predicate function.
   *
   * If a matching request has been made, fail with an error message including the given request
   * description, if any.
   */
  abstract expectNone(matchFn: ((req: HttpRequest<any>) => boolean), description?: string): void;

  /**
   * Expect that no requests have been made which match the given condition.
   *
   * If a matching request has been made, fail with an error message including the given request
   * description, if any.
   */
  abstract expectNone(
      match: string|RequestMatch|((req: HttpRequest<any>) => boolean), description?: string): void;

  /**
   * Verify that no unmatched requests are outstanding.
   *
   * If any requests are outstanding, fail with an error message indicating which requests were not
   * handled.
   *
   * If `ignoreCancelled` is not set (the default), `verify()` will also fail if cancelled requests
   * were not explicitly matched.
   */
  abstract verify(opts?: {ignoreCancelled?: boolean}): void;
}
