/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Injector,
  Signal,
  WritableResource,
  ɵResourceImpl as ResourceImpl,
  inject,
  linkedSignal,
  assertInInjectionContext,
  ValueEqualityFn,
  signal,
  ResourceStatus,
  computed,
  Resource,
  WritableSignal,
  ResourceStreamItem,
} from '@angular/core';
import {Subscription} from 'rxjs';

import {HttpRequest} from './request';
import {HttpClient} from './client';
import {HttpEventType, HttpProgressEvent, HttpResponseBase} from './response';
import {HttpHeaders} from './headers';
import {HttpParams} from './params';

/**
 * The structure of an `httpResource` request.
 *
 * @experimental
 */
export interface HttpResourceRequest {
  url: string;
  method?: string;
  body?: unknown;
  params?:
    | HttpParams
    | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
  headers?: HttpHeaders | Record<string, string | ReadonlyArray<string>>;
  reportProgress?: boolean;
  withCredentials?: boolean;
  transferCache?: {includeHeaders?: string[]} | boolean;
}

/**
 * Options for creating an `httpResource`.
 *
 * @experimental
 */
export interface HttpResourceOptions<TResult, TRaw> {
  map?: (value: TRaw) => TResult;

  /**
   * Value that the resource will take when in Idle, Loading, or Error states.
   */
  defaultValue?: NoInfer<TResult>;

  // TODO: equal?
  injector?: Injector;

  equal?: ValueEqualityFn<NoInfer<TResult>>;
}

/**
 * Type for the `httpRequest` top-level function, which includes the call signatures for the JSON-
 * based `httpRequest` as well as sub-functions for `ArrayBuffer`, `Blob`, and `string` type
 * requests.
 *
 * @experimental
 */
export interface HttpResourceFn {
  /**
   * Create a `Resource` that fetches data with an HTTP GET request to the given URL, which may be
   * reactive.
   *
   * Uses `HttpClient` to make requests and supports interceptors, testing, and the other features
   * of the `HttpClient` API. Data is parsed as JSON by default - use a sub-function of
   * `httpResource`, such as `httpResource.text()`, to parse the response differently.
   *
   * @experimental
   */
  <TResult = unknown>(
    url: string | (() => string | undefined),
    options: HttpResourceOptions<TResult, unknown> & {defaultValue: NoInfer<TResult>},
  ): HttpResource<TResult>;

  /**
   * Create a `Resource` that fetches data with an HTTP GET request to the given URL, which may be
   * reactive.
   *
   * Uses `HttpClient` to make requests and supports interceptors, testing, and the other features
   * of the `HttpClient` API. Data is parsed as JSON by default - use a sub-function of
   * `httpResource`, such as `httpResource.text()`, to parse the response differently.
   *
   * @experimental
   */
  <TResult = unknown>(
    url: string | (() => string | undefined),
    options?: HttpResourceOptions<TResult, unknown>,
  ): HttpResource<TResult | undefined>;

  /**
   * Create a `Resource` that fetches data with an HTTP GET request to the given URL, which may be
   * reactive.
   *
   * Uses `HttpClient` to make requests and supports interceptors, testing, and the other features
   * of the `HttpClient` API. Data is parsed as JSON by default - use a sub-function of
   * `httpResource`, such as `httpResource.text()`, to parse the response differently.
   *
   * @experimental
   */
  <TResult = unknown>(
    request: HttpResourceRequest | (() => HttpResourceRequest | undefined),
    options: HttpResourceOptions<TResult, unknown> & {defaultValue: NoInfer<TResult>},
  ): HttpResource<TResult>;

  /**
   * Create a `Resource` that fetches data with an HTTP GET request to the given URL, which may be
   * reactive.
   *
   * Uses `HttpClient` to make requests and supports interceptors, testing, and the other features
   * of the `HttpClient` API. Data is parsed as JSON by default - use a sub-function of
   * `httpResource`, such as `httpResource.text()`, to parse the response differently.
   *
   * @experimental
   */
  <TResult = unknown>(
    request: HttpResourceRequest | (() => HttpResourceRequest | undefined),
    options?: HttpResourceOptions<TResult, unknown>,
  ): HttpResource<TResult | undefined>;

  /**
   * Create a `Resource` that fetches data with an HTTP GET request to the given URL, which may be
   * reactive.
   *
   * Uses `HttpClient` to make requests and supports interceptors, testing, and the other features
   * of the `HttpClient` API. Data is parsed into an `ArrayBuffer`.
   *
   * @experimental
   */
  arrayBuffer: {
    <TResult = ArrayBuffer>(
      url: string | (() => string | undefined),
      options: HttpResourceOptions<TResult, ArrayBuffer> & {defaultValue: NoInfer<TResult>},
    ): HttpResource<TResult>;

    <TResult = ArrayBuffer>(
      url: string | (() => string | undefined),
      options?: HttpResourceOptions<TResult, ArrayBuffer>,
    ): HttpResource<TResult | undefined>;

    <TResult = ArrayBuffer>(
      request: HttpResourceRequest | (() => HttpResourceRequest | undefined),
      options: HttpResourceOptions<TResult, ArrayBuffer> & {defaultValue: NoInfer<TResult>},
    ): HttpResource<TResult>;

    <TResult = ArrayBuffer>(
      request: HttpResourceRequest | (() => HttpResourceRequest | undefined),
      options?: HttpResourceOptions<TResult, ArrayBuffer>,
    ): HttpResource<TResult | undefined>;
  };

  /**
   * Create a `Resource` that fetches data with an HTTP GET request to the given URL, which may be
   * reactive.
   *
   * Uses `HttpClient` to make requests and supports interceptors, testing, and the other features
   * of the `HttpClient` API. Data is parsed into an `Blob`.
   *
   * @experimental
   */
  blob: {
    <TResult = Blob>(
      url: string | (() => string | undefined),
      options: HttpResourceOptions<TResult, Blob> & {defaultValue: NoInfer<TResult>},
    ): HttpResource<TResult>;

    <TResult = Blob>(
      url: string | (() => string | undefined),
      options?: HttpResourceOptions<TResult, Blob>,
    ): HttpResource<TResult | undefined>;

    <TResult = Blob>(
      request: HttpResourceRequest | (() => HttpResourceRequest | undefined),
      options: HttpResourceOptions<TResult, Blob> & {defaultValue: NoInfer<TResult>},
    ): HttpResource<TResult>;

    <TResult = Blob>(
      request: HttpResourceRequest | (() => HttpResourceRequest | undefined),
      options?: HttpResourceOptions<TResult, Blob>,
    ): HttpResource<TResult | undefined>;
  };

  /**
   * Create a `Resource` that fetches data with an HTTP GET request to the given URL, which may be
   * reactive.
   *
   * Uses `HttpClient` to make requests and supports interceptors, testing, and the other features
   * of the `HttpClient` API. Data is parsed as a string.
   *
   * @experimental
   */
  text: {
    <TResult = string>(
      url: string | (() => string | undefined),
      options: HttpResourceOptions<TResult, string> & {defaultValue: NoInfer<TResult>},
    ): HttpResource<TResult>;

    <TResult = string>(
      url: string | (() => string | undefined),
      options?: HttpResourceOptions<TResult, string>,
    ): HttpResource<TResult | undefined>;

    <TResult = string>(
      request: HttpResourceRequest | (() => HttpResourceRequest | undefined),
      options: HttpResourceOptions<TResult, string> & {defaultValue: NoInfer<TResult>},
    ): HttpResource<TResult>;

    <TResult = string>(
      request: HttpResourceRequest | (() => HttpResourceRequest | undefined),
      options?: HttpResourceOptions<TResult, string>,
    ): HttpResource<TResult | undefined>;
  };
}

/**
 * `httpResource` makes a reactive HTTP request and exposes the request status and response value as
 * a `WritableResource`. By default, it assumes that the backend will return JSON data. To make a
 * request that expects a different kind of data, you can use a sub-constructor of `httpResource`,
 * such as `httpResource.text`.
 *
 * @initializerApiFunction
 */
export const httpResource: HttpResourceFn = (() => {
  const jsonFn = httpResourceImpl.bind(undefined, 'json') as unknown as HttpResourceFn;
  jsonFn.arrayBuffer = httpResourceImpl.bind(undefined, 'arraybuffer') as any;
  jsonFn.blob = httpResourceImpl.bind(undefined, 'blob') as any;
  jsonFn.text = httpResourceImpl.bind(undefined, 'text') as any;
  return jsonFn;
})();

function httpResourceImpl(
  responseType: 'arraybuffer' | 'blob' | 'json' | 'text',
  request:
    | string
    | (() => string | undefined)
    | HttpResourceRequest
    | (() => HttpResourceRequest | undefined),
  options?: HttpResourceOptions<unknown, unknown>,
): HttpResource<unknown> {
  options?.injector || assertInInjectionContext(httpResource);
  const injector = options?.injector ?? inject(Injector);

  const toHttpRequest = () => {
    let unwrappedRequest = typeof request === 'function' ? request() : request;
    if (unwrappedRequest === undefined) {
      return undefined;
    } else if (typeof unwrappedRequest === 'string') {
      unwrappedRequest = {url: unwrappedRequest};
    }

    return new HttpRequest(
      unwrappedRequest.method ?? 'GET',
      unwrappedRequest.url,
      unwrappedRequest.body ?? null,
      {
        headers:
          unwrappedRequest.headers instanceof HttpHeaders
            ? unwrappedRequest.headers
            : new HttpHeaders(
                unwrappedRequest.headers as
                  | Record<string, string | number | Array<string | number>>
                  | undefined,
              ),
        params:
          unwrappedRequest.params instanceof HttpParams
            ? unwrappedRequest.params
            : new HttpParams({fromObject: unwrappedRequest.params}),
        reportProgress: unwrappedRequest.reportProgress,
        withCredentials: unwrappedRequest.withCredentials,
        responseType,
      },
    );
  };

  return new HttpResourceImpl(injector, toHttpRequest, options?.defaultValue, options?.map);
}

/**
 * A `WritableResource` that represents the results of a reactive HTTP request.
 *
 * `HttpResource`s are backed by `HttpClient`, including support for interceptors, testing, and the
 * other features of the `HttpClient` API.
 *
 * @experimental
 */
export interface HttpResource<T> extends WritableResource<T> {
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
}

class HttpResourceImpl<T>
  extends ResourceImpl<T, HttpRequest<unknown> | undefined>
  implements HttpResource<T>
{
  private client!: HttpClient;
  private _headers = linkedSignal({
    source: this.extRequest,
    computation: () => undefined as HttpHeaders | undefined,
  });
  private _progress = linkedSignal({
    source: this.extRequest,
    computation: () => undefined as HttpProgressEvent | undefined,
  });
  private _statusCode = linkedSignal({
    source: this.extRequest,
    computation: () => undefined as number | undefined,
  });

  readonly headers = computed(() =>
    this.status() === ResourceStatus.Resolved || this.status() === ResourceStatus.Error
      ? this._headers()
      : undefined,
  );
  readonly progress = this._progress.asReadonly();
  readonly statusCode = this._statusCode.asReadonly();

  constructor(
    injector: Injector,
    request: () => HttpRequest<T> | undefined,
    defaultValue: T,
    map?: (value: unknown) => T,
  ) {
    super(
      request,
      ({request, abortSignal}) => {
        let sub: Subscription;

        // Track the abort listener so it can be removed if the Observable completes (as a memory
        // optimization).
        const onAbort = () => sub.unsubscribe();
        abortSignal.addEventListener('abort', onAbort);

        // Start off stream as undefined.
        const stream = signal<ResourceStreamItem<T>>({value: undefined as T});
        let resolve: ((value: Signal<ResourceStreamItem<T>>) => void) | undefined;
        const promise = new Promise<Signal<ResourceStreamItem<T>>>((r) => (resolve = r));

        function send(value: ResourceStreamItem<T>): void {
          stream.set(value);
          resolve?.(stream);
          resolve = undefined;
        }

        sub = this.client.request(request!).subscribe({
          next: (event) => {
            switch (event.type) {
              case HttpEventType.Response:
                this._headers.set(event.headers);
                this._statusCode.set(event.status);
                try {
                  send({value: map ? map(event.body) : (event.body as T)});
                } catch (error) {
                  send({error});
                }
                break;
              case HttpEventType.DownloadProgress:
                this._progress.set(event);
                break;
            }
          },
          error: (error) => send({error}),
          complete: () => {
            if (resolve) {
              send({error: new Error('Resource completed before producing a value')});
            }
            abortSignal.removeEventListener('abort', onAbort);
          },
        });

        abortSignal.addEventListener('abort', () => sub.unsubscribe());
        return promise;
      },
      defaultValue,
      undefined,
      injector,
    );
    this.client = injector.get(HttpClient);
  }
}

/**
 * A `Resource` of the `HttpResponse` meant for use in `HttpResource` if we decide to go this route.
 *
 * TODO(alxhub): delete this if we decide we don't want it.
 */
class HttpResponseResource implements Resource<HttpResponseBase | undefined> {
  readonly status: Signal<ResourceStatus>;
  readonly value: WritableSignal<HttpResponseBase | undefined>;
  readonly error: Signal<unknown>;
  readonly isLoading: Signal<boolean>;

  constructor(
    private parent: Resource<unknown>,
    request: Signal<unknown>,
  ) {
    this.status = computed(() => {
      // There are two kinds of errors which can occur in an HTTP request: HTTP errors or normal JS
      // errors. Since we have a response for HTTP errors, we report `Resolved` status even if the
      // overall request is considered to be in an Error state.
      if (parent.status() === ResourceStatus.Error) {
        return this.value() !== undefined ? ResourceStatus.Resolved : ResourceStatus.Error;
      }
      return parent.status();
    });
    this.error = computed(() => {
      // Filter out HTTP errors.
      return this.value() === undefined ? parent.error() : undefined;
    });
    this.value = linkedSignal({
      source: request,
      computation: () => undefined as HttpResponseBase | undefined,
    });
    this.isLoading = parent.isLoading;
  }

  hasValue(): this is Resource<HttpResponseBase> {
    return this.value() !== undefined;
  }

  reload(): boolean {
    // TODO: should you be able to reload this way?
    return this.parent.reload();
  }
}
