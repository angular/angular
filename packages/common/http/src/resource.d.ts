/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { HttpResourceRef, HttpResourceOptions, HttpResourceRequest } from './resource_api';
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
    <TResult = unknown>(url: () => string | undefined, options: HttpResourceOptions<TResult, unknown> & {
        defaultValue: NoInfer<TResult>;
    }): HttpResourceRef<TResult>;
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
    <TResult = unknown>(url: () => string | undefined, options?: HttpResourceOptions<TResult, unknown>): HttpResourceRef<TResult | undefined>;
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
    <TResult = unknown>(request: () => HttpResourceRequest | undefined, options: HttpResourceOptions<TResult, unknown> & {
        defaultValue: NoInfer<TResult>;
    }): HttpResourceRef<TResult>;
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
    <TResult = unknown>(request: () => HttpResourceRequest | undefined, options?: HttpResourceOptions<TResult, unknown>): HttpResourceRef<TResult | undefined>;
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
        <TResult = ArrayBuffer>(url: () => string | undefined, options: HttpResourceOptions<TResult, ArrayBuffer> & {
            defaultValue: NoInfer<TResult>;
        }): HttpResourceRef<TResult>;
        <TResult = ArrayBuffer>(url: () => string | undefined, options?: HttpResourceOptions<TResult, ArrayBuffer>): HttpResourceRef<TResult | undefined>;
        <TResult = ArrayBuffer>(request: () => HttpResourceRequest | undefined, options: HttpResourceOptions<TResult, ArrayBuffer> & {
            defaultValue: NoInfer<TResult>;
        }): HttpResourceRef<TResult>;
        <TResult = ArrayBuffer>(request: () => HttpResourceRequest | undefined, options?: HttpResourceOptions<TResult, ArrayBuffer>): HttpResourceRef<TResult | undefined>;
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
        <TResult = Blob>(url: () => string | undefined, options: HttpResourceOptions<TResult, Blob> & {
            defaultValue: NoInfer<TResult>;
        }): HttpResourceRef<TResult>;
        <TResult = Blob>(url: () => string | undefined, options?: HttpResourceOptions<TResult, Blob>): HttpResourceRef<TResult | undefined>;
        <TResult = Blob>(request: () => HttpResourceRequest | undefined, options: HttpResourceOptions<TResult, Blob> & {
            defaultValue: NoInfer<TResult>;
        }): HttpResourceRef<TResult>;
        <TResult = Blob>(request: () => HttpResourceRequest | undefined, options?: HttpResourceOptions<TResult, Blob>): HttpResourceRef<TResult | undefined>;
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
        <TResult = string>(url: () => string | undefined, options: HttpResourceOptions<TResult, string> & {
            defaultValue: NoInfer<TResult>;
        }): HttpResourceRef<TResult>;
        <TResult = string>(url: () => string | undefined, options?: HttpResourceOptions<TResult, string>): HttpResourceRef<TResult | undefined>;
        <TResult = string>(request: () => HttpResourceRequest | undefined, options: HttpResourceOptions<TResult, string> & {
            defaultValue: NoInfer<TResult>;
        }): HttpResourceRef<TResult>;
        <TResult = string>(request: () => HttpResourceRequest | undefined, options?: HttpResourceOptions<TResult, string>): HttpResourceRef<TResult | undefined>;
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
export declare const httpResource: HttpResourceFn;
