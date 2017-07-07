/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HttpHeaders} from './headers';
import {HttpResponseType} from './request';

/**
 * @experimental
 */
export type HttpObserve = 'body' | 'events' | 'response';

/**
 * @experimental
 */
export interface HttpMethodOptions {
  headers?: HttpHeaders;
  observe?: HttpObserve;
  responseType?: HttpResponseType;
  withCredentials?: boolean;
}

/**
 * @experimental
 */
export interface zHttpMethodOptionsObserveArrayBufferEvents extends HttpMethodOptions {
  observe: 'events';
  responseType: 'arraybuffer';
}

/**
 * @experimental
 */
export interface zHttpMethodOptionsObserveBlobEvents extends HttpMethodOptions {
  observe: 'events';
  responseType: 'blob';
}

/**
 * @experimental
 */
export interface zHttpMethodOptionsObserveTextEvents extends HttpMethodOptions {
  observe: 'events';
  responseType: 'text';
}

/**
 * @experimental
 */
export interface zHttpMethodOptionsObserveEvents extends HttpMethodOptions { observe: 'events'; }

/**
 * @experimental
 */
export interface zHttpMethodOptionsObserveArrayBufferResponse extends HttpMethodOptions {
  observe: 'response';
  responseType: 'arraybuffer';
}

/**
 * @experimental
 */
export interface zHttpMethodOptionsObserveBlobResponse extends HttpMethodOptions {
  observe: 'response';
  responseType: 'blob';
}

/**
 * @experimental
 */
export interface zHttpMethodOptionsObserveTextResponse extends HttpMethodOptions {
  observe: 'response';
  responseType: 'text';
}

/**
 * @experimental
 */
export interface zHttpMethodOptionsObserveResponse extends HttpMethodOptions {
  observe: 'response';
}

/**
 * @experimental
 */
export interface zHttpMethodOptionsObserveArrayBufferBody extends HttpMethodOptions {
  observe?: 'body';
  responseType: 'arraybuffer';
}

/**
 * @experimental
 */
export interface zHttpMethodOptionsObserveBlobBody extends HttpMethodOptions {
  observe?: 'body';
  responseType: 'blob';
}

/**
 * @experimental
 */
export interface zHttpMethodOptionsObserveTextBody extends HttpMethodOptions {
  observe?: 'body';
  responseType: 'text';
}

/**
 * @experimental
 */
export interface zHttpRequestBodyOptions<T> { body?: T|null; }

/**
 * @experimental
 */
export interface HttpRequestOptions<T> extends HttpMethodOptions, zHttpRequestBodyOptions<T> {}

/**
 * @experimental
 */
export interface zHttpRequestOptionsObserveArrayBufferEvents<T> extends
    zHttpMethodOptionsObserveArrayBufferEvents,
    zHttpRequestBodyOptions<T> {}

/**
 * @experimental
 */
export interface zHttpRequestOptionsObserveBlobEvents<T> extends
    zHttpMethodOptionsObserveBlobEvents,
    zHttpRequestBodyOptions<T> {}

/**
 * @experimental
 */
export interface zHttpRequestOptionsObserveTextEvents<T> extends
    zHttpMethodOptionsObserveTextEvents,
    zHttpRequestBodyOptions<T> {}

/**
 * @experimental
 */
export interface zHttpRequestOptionsObserveEvents<T> extends zHttpMethodOptionsObserveEvents,
    zHttpRequestBodyOptions<T> {}

/**
 * @experimental
 */
export interface zHttpRequestOptionsObserveArrayBufferResponse<T> extends
    zHttpMethodOptionsObserveArrayBufferResponse,
    zHttpRequestBodyOptions<T> {}

/**
 * @experimental
 */
export interface zHttpRequestOptionsObserveBlobResponse<T> extends
    zHttpMethodOptionsObserveBlobResponse,
    zHttpRequestBodyOptions<T> {}

/**
 * @experimental
 */
export interface zHttpRequestOptionsObserveTextResponse<T> extends
    zHttpMethodOptionsObserveTextResponse,
    zHttpRequestBodyOptions<T> {}

/**
 * @experimental
 */
export interface zHttpRequestOptionsObserveResponse<T> extends zHttpMethodOptionsObserveResponse,
    zHttpRequestBodyOptions<T> {}

/**
 * @experimental
 */
export interface zHttpRequestOptionsObserveArrayBufferBody<T> extends
    zHttpMethodOptionsObserveArrayBufferBody,
    zHttpRequestBodyOptions<T> {}

/**
 * @experimental
 */
export interface zHttpRequestOptionsObserveBlobBody<T> extends zHttpMethodOptionsObserveBlobBody,
    zHttpRequestBodyOptions<T> {}

/**
 * @experimental
 */
export interface zHttpRequestOptionsObserveTextBody<T> extends zHttpMethodOptionsObserveTextBody,
    zHttpRequestBodyOptions<T> {}

/**
 * @experimental
 */
export interface HttpJsonpOptions { observe: HttpObserve; }
