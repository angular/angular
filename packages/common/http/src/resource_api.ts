/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {Injector, ResourceRef, Signal, ValueEqualityFn, WritableResource} from '@angular/core';
import type {HttpHeaders} from './headers';
import type {HttpParams} from './params';
import type {HttpProgressEvent} from './response';
import {HttpContext} from './context';

/**
 * The structure of an `httpResource` request which will be sent to the backend.
 *
 * @experimental 19.2
 */
export interface HttpResourceRequest {
  /**
   * URL of the request.
   *
   * This URL should not include query parameters. Instead, specify query parameters through the
   * `params` field.
   */
  url: string;

  /**
   * HTTP method of the request, which defaults to GET if not specified.
   */
  method?: string;

  /**
   * Body to send with the request, if there is one.
   *
   * If no Content-Type header is specified by the user, Angular will attempt to set one based on
   * the type of `body`.
   */
  body?: unknown;

  /**
   * Dictionary of query parameters which will be appeneded to the request URL.
   */
  params?:
    | HttpParams
    | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;

  /**
   * Dictionary of headers to include with the outgoing request.
   */
  headers?: HttpHeaders | Record<string, string | ReadonlyArray<string>>;

  /**
   * Context of the request stored in a dictionary of key-value pairs.
   */
  context?: HttpContext;

  /**
   * If `true`, progress events will be enabled for the request and delivered through the
   * `HttpResource.progress` signal.
   */
  reportProgress?: boolean;

  /**
   * Specifies whether the `withCredentials` flag should be set on the outgoing request.
   *
   * This flag causes the browser to send cookies and other authentication information along with
   * the request.
   */
  withCredentials?: boolean;

  /**
   * Configures the server-side rendering transfer cache for this request.
   *
   * See the documentation on the transfer cache for more information.
   */
  transferCache?: {includeHeaders?: string[]} | boolean;
}

/**
 * Options for creating an `httpResource`.
 *
 * @experimental 19.2
 */
export interface HttpResourceOptions<TResult, TRaw> {
  /**
   * Transform the result of the HTTP request before it's delivered to the resource.
   *
   * `parse` receives the value from the HTTP layer as its raw type (e.g. as `unknown` for JSON data).
   * It can be used to validate or transform the type of the resource, and return a more specific
   * type. This is also useful for validating backend responses using a runtime schema validation
   * library such as Zod.
   */
  parse?: (value: TRaw) => TResult;

  /**
   * Value that the resource will take when in Idle, Loading, or Error states.
   *
   * If not set, the resource will use `undefined` as its default value.
   */
  defaultValue?: NoInfer<TResult>;

  /**
   * The `Injector` in which to create the `httpResource`.
   *
   * If this is not provided, the current [injection context](guide/di/dependency-injection-context)
   * will be used instead (via `inject`).
   */
  injector?: Injector;

  /**
   * A comparison function which defines equality for the response value.
   */
  equal?: ValueEqualityFn<NoInfer<TResult>>;
}

/**
 * A `WritableResource` that represents the results of a reactive HTTP request.
 *
 * `HttpResource`s are backed by `HttpClient`, including support for interceptors, testing, and the
 * other features of the `HttpClient` API.
 *
 * @experimental 19.2
 */
export interface HttpResourceRef<T> extends WritableResource<T>, ResourceRef<T> {
  /**
   * Signal of the response headers, when available.
   */
  readonly headers: Signal<HttpHeaders | undefined>;

  /**
   * Signal of the response status code, when available.
   */
  readonly statusCode: Signal<number | undefined>;

  /**
   * Signal of the latest progress update, if the request was made with `reportProgress: true`.
   */
  readonly progress: Signal<HttpProgressEvent | undefined>;

  hasValue(): this is HttpResourceRef<Exclude<T, undefined>>;
  destroy(): void;
}
