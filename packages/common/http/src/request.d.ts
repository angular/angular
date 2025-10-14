import { HttpContext } from './context';
import { HttpHeaders } from './headers';
import { HttpParams } from './params';
/**
 * `Content-Type` is an HTTP header used to indicate the media type
 * (also known as MIME type) of the resource being sent to the client
 * or received from the server.
 */
export declare const CONTENT_TYPE_HEADER = "Content-Type";
/**
 * The `Accept` header is an HTTP request header that indicates the media types
 * (or content types) the client is willing to receive from the server.
 */
export declare const ACCEPT_HEADER = "Accept";
/**
 * `text/plain` is a content type used to indicate that the content being
 * sent is plain text with no special formatting or structured data
 * like HTML, XML, or JSON.
 */
export declare const TEXT_CONTENT_TYPE = "text/plain";
/**
 * `application/json` is a content type used to indicate that the content
 * being sent is in the JSON format.
 */
export declare const JSON_CONTENT_TYPE = "application/json";
/**
 * `application/json, text/plain, *\/*` is a content negotiation string often seen in the
 * Accept header of HTTP requests. It indicates the types of content the client is willing
 * to accept from the server, with a preference for `application/json` and `text/plain`,
 * but also accepting any other type (*\/*).
 */
export declare const ACCEPT_HEADER_VALUE = "application/json, text/plain, */*";
/**
 * An outgoing HTTP request with an optional typed body.
 *
 * `HttpRequest` represents an outgoing request, including URL, method,
 * headers, body, and other request configuration options. Instances should be
 * assumed to be immutable. To modify a `HttpRequest`, the `clone`
 * method should be used.
 *
 * @publicApi
 */
export declare class HttpRequest<T> {
    readonly url: string;
    /**
     * The request body, or `null` if one isn't set.
     *
     * Bodies are not enforced to be immutable, as they can include a reference to any
     * user-defined data type. However, interceptors should take care to preserve
     * idempotence by treating them as such.
     */
    readonly body: T | null;
    /**
     * Outgoing headers for this request.
     */
    readonly headers: HttpHeaders;
    /**
     * Shared and mutable context that can be used by interceptors
     */
    readonly context: HttpContext;
    /**
     * Whether this request should be made in a way that exposes progress events.
     *
     * Progress events are expensive (change detection runs on each event) and so
     * they should only be requested if the consumer intends to monitor them.
     *
     * Note: The `FetchBackend` doesn't support progress report on uploads.
     */
    readonly reportProgress: boolean;
    /**
     * Whether this request should be sent with outgoing credentials (cookies).
     */
    readonly withCredentials: boolean;
    /**
     *  The credentials mode of the request, which determines how cookies and HTTP authentication are handled.
     *  This can affect whether cookies are sent with the request, and how authentication is handled.
     */
    readonly credentials: RequestCredentials;
    /**
     * When using the fetch implementation and set to `true`, the browser will not abort the associated request if the page that initiated it is unloaded before the request is complete.
     */
    readonly keepalive: boolean;
    /**
     * Controls how the request will interact with the browser's HTTP cache.
     * This affects whether a response is retrieved from the cache, how it is stored, or if it bypasses the cache altogether.
     */
    readonly cache: RequestCache;
    /**
     * Indicates the relative priority of the request. This may be used by the browser to decide the order in which requests are dispatched and resources fetched.
     */
    readonly priority: RequestPriority;
    /**
     * The mode of the request, which determines how the request will interact with the browser's security model.
     * This can affect things like CORS (Cross-Origin Resource Sharing) and same-origin policies.
     */
    readonly mode: RequestMode;
    /**
     * The redirect mode of the request, which determines how redirects are handled.
     * This can affect whether the request follows redirects automatically, or if it fails when a redirect occurs.
     */
    readonly redirect: RequestRedirect;
    /**
     * The referrer of the request, which can be used to indicate the origin of the request.
     * This is useful for security and analytics purposes.
     * Value is a same-origin URL, "about:client", or the empty string, to set request's referrer.
     */
    readonly referrer: string;
    /**
     * The integrity metadata of the request, which can be used to ensure the request is made with the expected content.
     * A cryptographic hash of the resource to be fetched by request
     */
    readonly integrity: string;
    /**
     * The expected response type of the server.
     *
     * This is used to parse the response appropriately before returning it to
     * the requestee.
     */
    readonly responseType: 'arraybuffer' | 'blob' | 'json' | 'text';
    /**
     * The outgoing HTTP request method.
     */
    readonly method: string;
    /**
     * Outgoing URL parameters.
     *
     * To pass a string representation of HTTP parameters in the URL-query-string format,
     * the `HttpParamsOptions`' `fromString` may be used. For example:
     *
     * ```ts
     * new HttpParams({fromString: 'angular=awesome'})
     * ```
     */
    readonly params: HttpParams;
    /**
     * The outgoing URL with all URL parameters set.
     */
    readonly urlWithParams: string;
    /**
     * The HttpTransferCache option for the request
     */
    readonly transferCache?: {
        includeHeaders?: string[];
    } | boolean;
    /**
     * The timeout for the backend HTTP request in ms.
     */
    readonly timeout?: number;
    constructor(method: 'GET' | 'HEAD', url: string, init?: {
        headers?: HttpHeaders;
        context?: HttpContext;
        reportProgress?: boolean;
        params?: HttpParams;
        responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
        withCredentials?: boolean;
        credentials?: RequestCredentials;
        keepalive?: boolean;
        priority?: RequestPriority;
        cache?: RequestCache;
        mode?: RequestMode;
        redirect?: RequestRedirect;
        referrer?: string;
        integrity?: string;
        /**
         * This property accepts either a boolean to enable/disable transferring cache for eligible
         * requests performed using `HttpClient`, or an object, which allows to configure cache
         * parameters, such as which headers should be included (no headers are included by default).
         *
         * Setting this property will override the options passed to `provideClientHydration()` for this
         * particular request
         */
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    });
    constructor(method: 'DELETE' | 'JSONP' | 'OPTIONS', url: string, init?: {
        headers?: HttpHeaders;
        context?: HttpContext;
        reportProgress?: boolean;
        params?: HttpParams;
        responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
        withCredentials?: boolean;
        credentials?: RequestCredentials;
        keepalive?: boolean;
        priority?: RequestPriority;
        cache?: RequestCache;
        timeout?: number;
        mode?: RequestMode;
        redirect?: RequestRedirect;
        referrer?: string;
        integrity?: string;
    });
    constructor(method: 'POST', url: string, body: T | null, init?: {
        headers?: HttpHeaders;
        context?: HttpContext;
        reportProgress?: boolean;
        params?: HttpParams;
        responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
        withCredentials?: boolean;
        credentials?: RequestCredentials;
        keepalive?: boolean;
        priority?: RequestPriority;
        cache?: RequestCache;
        mode?: RequestMode;
        redirect?: RequestRedirect;
        referrer?: string;
        integrity?: string;
        /**
         * This property accepts either a boolean to enable/disable transferring cache for eligible
         * requests performed using `HttpClient`, or an object, which allows to configure cache
         * parameters, such as which headers should be included (no headers are included by default).
         *
         * Setting this property will override the options passed to `provideClientHydration()` for this
         * particular request
         */
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    });
    constructor(method: 'PUT' | 'PATCH', url: string, body: T | null, init?: {
        headers?: HttpHeaders;
        context?: HttpContext;
        reportProgress?: boolean;
        params?: HttpParams;
        responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
        withCredentials?: boolean;
        credentials?: RequestCredentials;
        keepalive?: boolean;
        priority?: RequestPriority;
        cache?: RequestCache;
        timeout?: number;
        mode?: RequestMode;
        redirect?: RequestRedirect;
        referrer?: string;
        integrity?: string;
    });
    constructor(method: string, url: string, body: T | null, init?: {
        headers?: HttpHeaders;
        context?: HttpContext;
        reportProgress?: boolean;
        params?: HttpParams;
        responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
        withCredentials?: boolean;
        credentials?: RequestCredentials;
        keepalive?: boolean;
        priority?: RequestPriority;
        cache?: RequestCache;
        mode?: RequestMode;
        redirect?: RequestRedirect;
        referrer?: string;
        integrity?: string;
        /**
         * This property accepts either a boolean to enable/disable transferring cache for eligible
         * requests performed using `HttpClient`, or an object, which allows to configure cache
         * parameters, such as which headers should be included (no headers are included by default).
         *
         * Setting this property will override the options passed to `provideClientHydration()` for this
         * particular request
         */
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
    });
    /**
     * Transform the free-form body into a serialized format suitable for
     * transmission to the server.
     */
    serializeBody(): ArrayBuffer | Blob | FormData | URLSearchParams | string | null;
    /**
     * Examine the body and attempt to infer an appropriate MIME type
     * for it.
     *
     * If no such type can be inferred, this method will return `null`.
     */
    detectContentTypeHeader(): string | null;
    clone(): HttpRequest<T>;
    clone(update: {
        headers?: HttpHeaders;
        context?: HttpContext;
        reportProgress?: boolean;
        params?: HttpParams;
        responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
        withCredentials?: boolean;
        credentials?: RequestCredentials;
        keepalive?: boolean;
        priority?: RequestPriority;
        cache?: RequestCache;
        mode?: RequestMode;
        redirect?: RequestRedirect;
        referrer?: string;
        integrity?: string;
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
        body?: T | null;
        method?: string;
        url?: string;
        setHeaders?: {
            [name: string]: string | string[];
        };
        setParams?: {
            [param: string]: string;
        };
    }): HttpRequest<T>;
    clone<V>(update: {
        headers?: HttpHeaders;
        context?: HttpContext;
        reportProgress?: boolean;
        params?: HttpParams;
        responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
        keepalive?: boolean;
        priority?: RequestPriority;
        cache?: RequestCache;
        mode?: RequestMode;
        redirect?: RequestRedirect;
        referrer?: string;
        integrity?: string;
        withCredentials?: boolean;
        credentials?: RequestCredentials;
        transferCache?: {
            includeHeaders?: string[];
        } | boolean;
        timeout?: number;
        body?: V | null;
        method?: string;
        url?: string;
        setHeaders?: {
            [name: string]: string | string[];
        };
        setParams?: {
            [param: string]: string;
        };
    }): HttpRequest<V>;
}
