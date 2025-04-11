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
  ɵResourceImpl as ResourceImpl,
  inject,
  linkedSignal,
  assertInInjectionContext,
  signal,
  ResourceStatus,
  computed,
  Resource,
  WritableSignal,
  ResourceStreamItem,
  type ValueEqualityFn,
} from '@angular/core';
import {Subscription} from 'rxjs';

import {HttpRequest} from './request';
import {HttpClient} from './client';
import {HttpErrorResponse, HttpEventType, HttpProgressEvent, HttpResponseBase} from './response';
import {HttpHeaders} from './headers';
import {HttpParams} from './params';
import {HttpResourceRef, HttpResourceOptions, HttpResourceRequest} from './resource_api';

/**
 * Type for the `httpRequest` top-level function, which includes the call signatures for the JSON-
 * based `httpRequest` as well as sub-functions for `ArrayBuffer`, `Blob`, and `string` type
 * requests.
 *
 * @experimental 19.2
 */
export interface HttpResourceFn {
  /**
   * Create a `Resource` that fetches data with an HTTP GET request to the given URL.
   *
   * The resource will update when the URL changes via signals.
   *
   * Uses `HttpClient` to make requests and supports interceptors, testing, and the other features
   * of the `HttpClient` API. Data is parsed as JSON by default - use a sub-function of
   * `httpResource`, such as `httpResource.text()`, to parse the response differently.
   *
   * @experimental 19.2
   */
  <TResult = unknown>(
    url: () => string | undefined,
    options: HttpResourceOptions<TResult, unknown> & {defaultValue: NoInfer<TResult>},
  ): HttpResourceRef<TResult>;

  /**
   * Create a `Resource` that fetches data with an HTTP GET request to the given URL.
   *
   * The resource will update when the URL changes via signals.
   *
   * Uses `HttpClient` to make requests and supports interceptors, testing, and the other features
   * of the `HttpClient` API. Data is parsed as JSON by default - use a sub-function of
   * `httpResource`, such as `httpResource.text()`, to parse the response differently.
   *
   * @experimental 19.2
   */
  <TResult = unknown>(
    url: () => string | undefined,
    options?: HttpResourceOptions<TResult, unknown>,
  ): HttpResourceRef<TResult | undefined>;

  /**
   * Create a `Resource` that fetches data with the configured HTTP request.
   *
   * The resource will update when the request changes via signals.
   *
   * Uses `HttpClient` to make requests and supports interceptors, testing, and the other features
   * of the `HttpClient` API. Data is parsed as JSON by default - use a sub-function of
   * `httpResource`, such as `httpResource.text()`, to parse the response differently.
   *
   * @experimental 19.2
   */
  <TResult = unknown>(
    request: () => HttpResourceRequest | undefined,
    options: HttpResourceOptions<TResult, unknown> & {defaultValue: NoInfer<TResult>},
  ): HttpResourceRef<TResult>;

  /**
   * Create a `Resource` that fetches data with the configured HTTP request.
   *
   * The resource will update when the request changes via signals.
   *
   * Uses `HttpClient` to make requests and supports interceptors, testing, and the other features
   * of the `HttpClient` API. Data is parsed as JSON by default - use a sub-function of
   * `httpResource`, such as `httpResource.text()`, to parse the response differently.
   *
   * @experimental 19.2
   */
  <TResult = unknown>(
    request: () => HttpResourceRequest | undefined,
    options?: HttpResourceOptions<TResult, unknown>,
  ): HttpResourceRef<TResult | undefined>;

  /**
   * Create a `Resource` that fetches data with the configured HTTP request.
   *
   * The resource will update when the URL or request changes via signals.
   *
   * Uses `HttpClient` to make requests and supports interceptors, testing, and the other features
   * of the `HttpClient` API. Data is parsed into an `ArrayBuffer`.
   *
   * @experimental 19.2
   */
  arrayBuffer: {
    <TResult = ArrayBuffer>(
      url: () => string | undefined,
      options: HttpResourceOptions<TResult, ArrayBuffer> & {defaultValue: NoInfer<TResult>},
    ): HttpResourceRef<TResult>;

    <TResult = ArrayBuffer>(
      url: () => string | undefined,
      options?: HttpResourceOptions<TResult, ArrayBuffer>,
    ): HttpResourceRef<TResult | undefined>;

    <TResult = ArrayBuffer>(
      request: () => HttpResourceRequest | undefined,
      options: HttpResourceOptions<TResult, ArrayBuffer> & {defaultValue: NoInfer<TResult>},
    ): HttpResourceRef<TResult>;

    <TResult = ArrayBuffer>(
      request: () => HttpResourceRequest | undefined,
      options?: HttpResourceOptions<TResult, ArrayBuffer>,
    ): HttpResourceRef<TResult | undefined>;
  };

  /**
   * Create a `Resource` that fetches data with the configured HTTP request.
   *
   * The resource will update when the URL or request changes via signals.
   *
   * Uses `HttpClient` to make requests and supports interceptors, testing, and the other features
   * of the `HttpClient` API. Data is parsed into a `Blob`.
   *
   * @experimental 19.2
   */
  blob: {
    <TResult = Blob>(
      url: () => string | undefined,
      options: HttpResourceOptions<TResult, Blob> & {defaultValue: NoInfer<TResult>},
    ): HttpResourceRef<TResult>;

    <TResult = Blob>(
      url: () => string | undefined,
      options?: HttpResourceOptions<TResult, Blob>,
    ): HttpResourceRef<TResult | undefined>;

    <TResult = Blob>(
      request: () => HttpResourceRequest | undefined,
      options: HttpResourceOptions<TResult, Blob> & {defaultValue: NoInfer<TResult>},
    ): HttpResourceRef<TResult>;

    <TResult = Blob>(
      request: () => HttpResourceRequest | undefined,
      options?: HttpResourceOptions<TResult, Blob>,
    ): HttpResourceRef<TResult | undefined>;
  };

  /**
   * Create a `Resource` that fetches data with the configured HTTP request.
   *
   * The resource will update when the URL or request changes via signals.
   *
   * Uses `HttpClient` to make requests and supports interceptors, testing, and the other features
   * of the `HttpClient` API. Data is parsed as a `string`.
   *
   * @experimental 19.2
   */
  text: {
    <TResult = string>(
      url: () => string | undefined,
      options: HttpResourceOptions<TResult, string> & {defaultValue: NoInfer<TResult>},
    ): HttpResourceRef<TResult>;

    <TResult = string>(
      url: () => string | undefined,
      options?: HttpResourceOptions<TResult, string>,
    ): HttpResourceRef<TResult | undefined>;

    <TResult = string>(
      request: () => HttpResourceRequest | undefined,
      options: HttpResourceOptions<TResult, string> & {defaultValue: NoInfer<TResult>},
    ): HttpResourceRef<TResult>;

    <TResult = string>(
      request: () => HttpResourceRequest | undefined,
      options?: HttpResourceOptions<TResult, string>,
    ): HttpResourceRef<TResult | undefined>;
  };
}

/**
 * `httpResource` makes a reactive HTTP request and exposes the request status and response value as
 * a `WritableResource`. By default, it assumes that the backend will return JSON data. To make a
 * request that expects a different kind of data, you can use a sub-constructor of `httpResource`,
 * such as `httpResource.text`.
 *
 * @experimental 19.2
 * @initializerApiFunction
 */
export const httpResource: HttpResourceFn = (() => {
  const jsonFn = makeHttpResourceFn<unknown>('json') as HttpResourceFn;
  jsonFn.arrayBuffer = makeHttpResourceFn<ArrayBuffer>('arraybuffer');
  jsonFn.blob = makeHttpResourceFn('blob');
  jsonFn.text = makeHttpResourceFn('text');
  return jsonFn;
})();

/**
 * The expected response type of the server.
 *
 * This is used to parse the response appropriately before returning it to
 * the requestee.
 */
type ResponseType = 'arraybuffer' | 'blob' | 'json' | 'text';
type RawRequestType = (() => string | undefined) | (() => HttpResourceRequest | undefined);

function makeHttpResourceFn<TRaw>(responseType: ResponseType) {
  return function httpResource<TResult = TRaw>(
    request: RawRequestType,
    options?: HttpResourceOptions<TResult, TRaw>,
  ): HttpResourceRef<TResult> {
    options?.injector || assertInInjectionContext(httpResource);
    const injector = options?.injector ?? inject(Injector);
    return new HttpResourceImpl(
      injector,
      () => normalizeRequest(request, responseType),
      options?.defaultValue,
      options?.parse as (value: unknown) => TResult,
      options?.equal as ValueEqualityFn<unknown>,
    ) as HttpResourceRef<TResult>;
  };
}

function normalizeRequest(
  request: RawRequestType,
  responseType: ResponseType,
): HttpRequest<unknown> | undefined {
  let unwrappedRequest = typeof request === 'function' ? request() : request;
  if (unwrappedRequest === undefined) {
    return undefined;
  } else if (typeof unwrappedRequest === 'string') {
    unwrappedRequest = {url: unwrappedRequest};
  }

  const headers =
    unwrappedRequest.headers instanceof HttpHeaders
      ? unwrappedRequest.headers
      : new HttpHeaders(
          unwrappedRequest.headers as
            | Record<string, string | number | Array<string | number>>
            | undefined,
        );

  const params =
    unwrappedRequest.params instanceof HttpParams
      ? unwrappedRequest.params
      : new HttpParams({fromObject: unwrappedRequest.params});

  return new HttpRequest(
    unwrappedRequest.method ?? 'GET',
    unwrappedRequest.url,
    unwrappedRequest.body ?? null,
    {
      headers,
      params,
      reportProgress: unwrappedRequest.reportProgress,
      withCredentials: unwrappedRequest.withCredentials,
      responseType,
      context: unwrappedRequest.context,
      transferCache: unwrappedRequest.transferCache,
    },
  );
}
class HttpResourceImpl<T>
  extends ResourceImpl<T, HttpRequest<unknown> | undefined>
  implements HttpResourceRef<T>
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
    this.status() === 'resolved' || this.status() === 'error' ? this._headers() : undefined,
  );
  readonly progress = this._progress.asReadonly();
  readonly statusCode = this._statusCode.asReadonly();

  constructor(
    injector: Injector,
    request: () => HttpRequest<T> | undefined,
    defaultValue: T,
    parse?: (value: unknown) => T,
    equal?: ValueEqualityFn<unknown>,
  ) {
    super(
      request,
      ({params: request, abortSignal}) => {
        let sub: Subscription;

        // Track the abort listener so it can be removed if the Observable completes (as a memory
        // optimization).
        const onAbort = () => sub.unsubscribe();
        abortSignal.addEventListener('abort', onAbort);

        // Start off stream as undefined.
        const stream = signal<ResourceStreamItem<T>>({value: undefined as T});
        let resolve: ((value: Signal<ResourceStreamItem<T>>) => void) | undefined;
        const promise = new Promise<Signal<ResourceStreamItem<T>>>((r) => (resolve = r));

        const send = (value: ResourceStreamItem<T>): void => {
          stream.set(value);
          resolve?.(stream);
          resolve = undefined;
        };

        sub = this.client.request(request!).subscribe({
          next: (event) => {
            switch (event.type) {
              case HttpEventType.Response:
                this._headers.set(event.headers);
                this._statusCode.set(event.status);
                try {
                  send({value: parse ? parse(event.body) : (event.body as T)});
                } catch (error) {
                  send({error});
                }
                break;
              case HttpEventType.DownloadProgress:
                this._progress.set(event);
                break;
            }
          },
          error: (error) => {
            if (error instanceof HttpErrorResponse) {
              this._headers.set(error.headers);
              this._statusCode.set(error.status);
            }

            send({error});
          },
          complete: () => {
            if (resolve) {
              send({error: new Error('Resource completed before producing a value')});
            }
            abortSignal.removeEventListener('abort', onAbort);
          },
        });

        return promise;
      },
      defaultValue,
      equal,
      injector,
    );
    this.client = injector.get(HttpClient);
  }

  // This is a type only override of the method
  declare hasValue: () => this is HttpResourceRef<Exclude<T, undefined>>;
}
