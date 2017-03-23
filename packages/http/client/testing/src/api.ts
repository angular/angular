import {HttpRequest} from '@angular/http/client';

import {TestRequest} from './request';

/**
 * Defines a matcher for requests based on URL, method, or both.
 *
 * @experimental
 */
export interface RequestMatch {
  method?: string;
  url?: string;
}

/**
 * Configures special verification behaviors.
 *
 * @experimental
 */
export interface VerifyOptions {
  /**
   * Sets whether to ignore cancelled requests when verifying.
   */
  ignoreCancelled?: boolean;
}

/**
 * Type signature of a function which takes a {@link HttpRequest} and
 * determines whether it matches some predicate.
 *
 * @experimental
 */
export type RequestMatchFn = (req: HttpRequest<any>) => boolean;

/**
 * Controller to be injected into tests, that allows for mocking and flushing
 * of requests.
 *
 * @experimental
 */
export abstract class HttpTestingController {
  /**
   * Search for requests that match the given parameter, without any expectations.
   */
  abstract match(match: string|RequestMatch|RequestMatchFn): TestRequest[];

  // Expect that exactly one request matches the given parameter.
  abstract expectOne(url: string): TestRequest;
  abstract expectOne(params: RequestMatch): TestRequest;
  abstract expectOne(matchFn: RequestMatchFn): TestRequest;
  abstract expectOne(match: string|RequestMatch|RequestMatchFn): TestRequest;

  // Assert that no requests match the given parameter.
  abstract expectNone(url: string): void;
  abstract expectNone(params: RequestMatch): void;
  abstract expectNone(matchFn: RequestMatchFn): void;
  abstract expectNone(match: string|RequestMatch|RequestMatchFn): void;

  // Validate that all requests which were issued were flushed.
  abstract verify(opts?: VerifyOptions): void;
}
