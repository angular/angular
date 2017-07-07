/** @experimental */
export declare class BrowserXhr implements XhrFactory {
    constructor();
    build(): any;
}

/** @experimental */
export declare const HTTP_INTERCEPTORS: InjectionToken<HttpInterceptor[]>;

/** @experimental */
export declare abstract class HttpBackend implements HttpHandler {
    abstract handle(req: HttpRequest<any>): Observable<HttpEvent<any>>;
}

/** @experimental */
export declare type HttpBodyMethod = 'POST' | 'PUT' | 'PATCH';

/** @experimental */
export declare class HttpClient {
    constructor(handler: HttpHandler);
    delete<T>(url: string, options?: HttpMethodOptions): Observable<T>;
    delete(url: string, options?: HttpMethodOptions): Observable<Object>;
    delete<T>(url: string, options: zHttpMethodOptionsObserveResponse): Observable<HttpResponse<T>>;
    delete(url: string, options: zHttpMethodOptionsObserveResponse): Observable<HttpResponse<Object>>;
    delete(url: string, options: zHttpMethodOptionsObserveTextResponse): Observable<HttpResponse<string>>;
    delete(url: string, options: zHttpMethodOptionsObserveBlobResponse): Observable<HttpResponse<Blob>>;
    delete(url: string, options: zHttpMethodOptionsObserveArrayBufferResponse): Observable<HttpResponse<ArrayBuffer>>;
    delete<T>(url: string, options: zHttpMethodOptionsObserveEvents): Observable<HttpEvent<T>>;
    delete(url: string, options: zHttpMethodOptionsObserveEvents): Observable<HttpEvent<Object>>;
    delete(url: string, options: zHttpMethodOptionsObserveTextEvents): Observable<HttpEvent<string>>;
    delete(url: string, options: zHttpMethodOptionsObserveBlobEvents): Observable<HttpEvent<Blob>>;
    delete(url: string, options: zHttpMethodOptionsObserveArrayBufferEvents): Observable<HttpEvent<ArrayBuffer>>;
    delete(url: string, options: zHttpMethodOptionsObserveArrayBufferBody): Observable<ArrayBuffer>;
    delete(url: string, options: zHttpMethodOptionsObserveBlobBody): Observable<Blob>;
    delete(url: string, options: zHttpMethodOptionsObserveTextBody): Observable<string>;
    get<T>(url: string, options: zHttpMethodOptionsObserveEvents): Observable<HttpEvent<T>>;
    get(url: string, options: zHttpMethodOptionsObserveArrayBufferEvents): Observable<HttpEvent<ArrayBuffer>>;
    get(url: string, options: zHttpMethodOptionsObserveBlobBody): Observable<Blob>;
    get(url: string, options: zHttpMethodOptionsObserveTextBody): Observable<string>;
    get(url: string, options: zHttpMethodOptionsObserveBlobEvents): Observable<HttpEvent<Blob>>;
    get(url: string, options: zHttpMethodOptionsObserveTextEvents): Observable<HttpEvent<string>>;
    get(url: string, options: zHttpMethodOptionsObserveEvents): Observable<HttpEvent<Object>>;
    get(url: string, options: zHttpMethodOptionsObserveArrayBufferBody): Observable<ArrayBuffer>;
    get(url: string, options: zHttpMethodOptionsObserveArrayBufferResponse): Observable<HttpResponse<ArrayBuffer>>;
    get(url: string, options: zHttpMethodOptionsObserveBlobResponse): Observable<HttpResponse<Blob>>;
    get(url: string, options: zHttpMethodOptionsObserveTextResponse): Observable<HttpResponse<string>>;
    get(url: string, options: zHttpMethodOptionsObserveResponse): Observable<HttpResponse<Object>>;
    get<T>(url: string, options: zHttpMethodOptionsObserveResponse): Observable<HttpResponse<T>>;
    get(url: string, options?: HttpMethodOptions): Observable<Object>;
    get<T>(url: string, options?: HttpMethodOptions): Observable<T>;
    head(url: string, options: zHttpMethodOptionsObserveBlobEvents): Observable<HttpEvent<Blob>>;
    head<T>(url: string, options: zHttpMethodOptionsObserveEvents): Observable<HttpEvent<T>>;
    head(url: string, options: zHttpMethodOptionsObserveArrayBufferResponse): Observable<HttpResponse<ArrayBuffer>>;
    head(url: string, options: zHttpMethodOptionsObserveBlobResponse): Observable<HttpResponse<Blob>>;
    head(url: string, options: zHttpMethodOptionsObserveTextResponse): Observable<HttpResponse<string>>;
    head(url: string, options: zHttpMethodOptionsObserveResponse): Observable<HttpResponse<Object>>;
    head<T>(url: string, options: zHttpMethodOptionsObserveResponse): Observable<HttpResponse<T>>;
    head(url: string, options?: HttpMethodOptions): Observable<Object>;
    head<T>(url: string, options?: HttpMethodOptions): Observable<T>;
    head(url: string, options: zHttpMethodOptionsObserveArrayBufferEvents): Observable<HttpEvent<ArrayBuffer>>;
    head(url: string, options: zHttpMethodOptionsObserveTextEvents): Observable<HttpEvent<string>>;
    head(url: string, options: zHttpMethodOptionsObserveEvents): Observable<HttpEvent<Object>>;
    head(url: string, options: zHttpMethodOptionsObserveArrayBufferBody): Observable<ArrayBuffer>;
    head(url: string, options: zHttpMethodOptionsObserveBlobBody): Observable<Blob>;
    head(url: string, options: zHttpMethodOptionsObserveTextBody): Observable<string>;
    jsonp(url: string): Observable<any>;
    jsonp<T>(url: string): Observable<T>;
    options(url: string, options: zHttpMethodOptionsObserveArrayBufferResponse): Observable<HttpResponse<ArrayBuffer>>;
    options(url: string, options: zHttpMethodOptionsObserveArrayBufferBody): Observable<ArrayBuffer>;
    options(url: string, options: zHttpMethodOptionsObserveTextBody): Observable<string>;
    options(url: string, options: zHttpMethodOptionsObserveArrayBufferEvents): Observable<HttpEvent<ArrayBuffer>>;
    options(url: string, options: zHttpMethodOptionsObserveBlobEvents): Observable<HttpEvent<Blob>>;
    options(url: string, options: zHttpMethodOptionsObserveTextEvents): Observable<HttpEvent<string>>;
    options(url: string, options: zHttpMethodOptionsObserveEvents): Observable<HttpEvent<Object>>;
    options<T>(url: string, options: zHttpMethodOptionsObserveEvents): Observable<HttpEvent<T>>;
    options(url: string, options: zHttpMethodOptionsObserveBlobBody): Observable<Blob>;
    options(url: string, options: zHttpMethodOptionsObserveBlobResponse): Observable<HttpResponse<Blob>>;
    options(url: string, options: zHttpMethodOptionsObserveTextResponse): Observable<HttpResponse<string>>;
    options(url: string, options: zHttpMethodOptionsObserveResponse): Observable<HttpResponse<Object>>;
    options<T>(url: string, options: zHttpMethodOptionsObserveResponse): Observable<HttpResponse<T>>;
    options(url: string, options?: HttpMethodOptions): Observable<Object>;
    options<T>(url: string, options?: HttpMethodOptions): Observable<T>;
    patch(url: string, body: any | null, options: zHttpMethodOptionsObserveEvents): Observable<HttpEvent<Object>>;
    patch(url: string, body: any | null, options: zHttpMethodOptionsObserveArrayBufferBody): Observable<ArrayBuffer>;
    patch(url: string, body: any | null, options: zHttpMethodOptionsObserveBlobBody): Observable<Blob>;
    patch(url: string, body: any | null, options: zHttpMethodOptionsObserveTextBody): Observable<string>;
    patch(url: string, body: any | null, options: zHttpMethodOptionsObserveArrayBufferEvents): Observable<HttpEvent<ArrayBuffer>>;
    patch(url: string, body: any | null, options: zHttpMethodOptionsObserveBlobEvents): Observable<HttpEvent<Blob>>;
    patch(url: string, body: any | null, options: zHttpMethodOptionsObserveTextEvents): Observable<HttpEvent<string>>;
    patch(url: string, body: any | null, options: zHttpMethodOptionsObserveArrayBufferResponse): Observable<HttpResponse<ArrayBuffer>>;
    patch<T>(url: string, body: any | null, options: zHttpMethodOptionsObserveEvents): Observable<HttpEvent<T>>;
    patch(url: string, body: any | null, options: zHttpMethodOptionsObserveBlobResponse): Observable<HttpResponse<Blob>>;
    patch(url: string, body: any | null, options: zHttpMethodOptionsObserveTextResponse): Observable<HttpResponse<string>>;
    patch(url: string, body: any | null, options: zHttpMethodOptionsObserveResponse): Observable<HttpResponse<Object>>;
    patch<T>(url: string, body: any | null, options: zHttpMethodOptionsObserveResponse): Observable<HttpResponse<T>>;
    patch(url: string, body: any | null, options?: HttpMethodOptions): Observable<Object>;
    patch<T>(url: string, body: any | null, options?: HttpMethodOptions): Observable<T>;
    post<T>(url: string, body: any | null, options: zHttpMethodOptionsObserveEvents): Observable<HttpEvent<T>>;
    post(url: string, body: any | null, options: zHttpMethodOptionsObserveArrayBufferBody): Observable<ArrayBuffer>;
    post(url: string, body: any | null, options: zHttpMethodOptionsObserveTextBody): Observable<string>;
    post(url: string, body: any | null, options: zHttpMethodOptionsObserveArrayBufferEvents): Observable<HttpEvent<ArrayBuffer>>;
    post(url: string, body: any | null, options: zHttpMethodOptionsObserveBlobEvents): Observable<HttpEvent<Blob>>;
    post(url: string, body: any | null, options: zHttpMethodOptionsObserveTextEvents): Observable<HttpEvent<string>>;
    post(url: string, body: any | null, options: zHttpMethodOptionsObserveEvents): Observable<HttpEvent<Object>>;
    post(url: string, body: any | null, options: zHttpMethodOptionsObserveBlobBody): Observable<Blob>;
    post(url: string, body: any | null, options: zHttpMethodOptionsObserveArrayBufferResponse): Observable<HttpResponse<ArrayBuffer>>;
    post(url: string, body: any | null, options: zHttpMethodOptionsObserveBlobResponse): Observable<HttpResponse<Blob>>;
    post(url: string, body: any | null, options: zHttpMethodOptionsObserveTextResponse): Observable<HttpResponse<string>>;
    post(url: string, body: any | null, options: zHttpMethodOptionsObserveResponse): Observable<HttpResponse<Object>>;
    post<T>(url: string, body: any | null, options: zHttpMethodOptionsObserveResponse): Observable<HttpResponse<T>>;
    post(url: string, body: any | null, options?: HttpMethodOptions): Observable<Object>;
    post<T>(url: string, body: any | null, options?: HttpMethodOptions): Observable<T>;
    put(url: string, body: any | null, options: zHttpMethodOptionsObserveTextResponse): Observable<HttpResponse<string>>;
    put(url: string, body: any | null, options: zHttpMethodOptionsObserveBlobResponse): Observable<HttpResponse<Blob>>;
    put(url: string, body: any | null, options: zHttpMethodOptionsObserveArrayBufferResponse): Observable<HttpResponse<ArrayBuffer>>;
    put<T>(url: string, body: any | null, options: zHttpMethodOptionsObserveEvents): Observable<HttpEvent<T>>;
    put(url: string, body: any | null, options: zHttpMethodOptionsObserveEvents): Observable<HttpEvent<Object>>;
    put(url: string, body: any | null, options: zHttpMethodOptionsObserveTextEvents): Observable<HttpEvent<string>>;
    put(url: string, body: any | null, options: zHttpMethodOptionsObserveBlobBody): Observable<Blob>;
    put(url: string, body: any | null, options: zHttpMethodOptionsObserveBlobEvents): Observable<HttpEvent<Blob>>;
    put(url: string, body: any | null, options: zHttpMethodOptionsObserveArrayBufferEvents): Observable<HttpEvent<ArrayBuffer>>;
    put(url: string, body: any | null, options: zHttpMethodOptionsObserveTextBody): Observable<string>;
    put<T>(url: string, body: any | null, options?: HttpMethodOptions): Observable<T>;
    put(url: string, body: any | null, options?: HttpMethodOptions): Observable<Object>;
    put<T>(url: string, body: any | null, options: zHttpMethodOptionsObserveResponse): Observable<HttpResponse<T>>;
    put(url: string, body: any | null, options: zHttpMethodOptionsObserveResponse): Observable<HttpResponse<Object>>;
    put(url: string, body: any | null, options: zHttpMethodOptionsObserveArrayBufferBody): Observable<ArrayBuffer>;
    request(url: string, method: HttpMethod | string, options: zHttpRequestOptionsObserveTextEvents<any>): Observable<HttpEvent<string>>;
    request(url: string, method: HttpMethod | string, options?: HttpRequestOptions<any>): Observable<Object>;
    request(url: string, method: HttpMethod | string, options: zHttpRequestOptionsObserveArrayBufferBody<any>): Observable<ArrayBuffer>;
    request(url: string, method: HttpMethod | string, options: zHttpRequestOptionsObserveBlobBody<any>): Observable<Blob>;
    request(url: string, method: HttpMethod | string, options: zHttpRequestOptionsObserveTextBody<any>): Observable<string>;
    request(url: string, method: HttpMethod | string, options: zHttpRequestOptionsObserveArrayBufferEvents<any>): Observable<HttpEvent<ArrayBuffer>>;
    request(url: string, method: HttpMethod | string, options: zHttpRequestOptionsObserveBlobEvents<any>): Observable<HttpEvent<Blob>>;
    request<R>(req: HttpRequest<any>): Observable<HttpEvent<R>>;
    request<R>(url: string, method: HttpMethod | string, options: zHttpRequestOptionsObserveEvents<any>): Observable<HttpEvent<R>>;
    request(url: string, method: HttpMethod | string, options: zHttpRequestOptionsObserveArrayBufferResponse<any>): Observable<HttpResponse<ArrayBuffer>>;
    request(url: string, method: HttpMethod | string, options: zHttpRequestOptionsObserveBlobResponse<any>): Observable<HttpResponse<Blob>>;
    request(url: string, method: HttpMethod | string, options: zHttpRequestOptionsObserveTextResponse<any>): Observable<HttpResponse<string>>;
    request<R>(url: string, method: HttpMethod | string, options: zHttpRequestOptionsObserveResponse<any>): Observable<HttpResponse<R>>;
    request<R>(url: string, method: HttpMethod | string, options?: HttpRequestOptions<any>): Observable<R>;
}

/** @experimental */
export declare class HttpClientJsonpModule {
}

/** @experimental */
export declare class HttpClientModule {
}

/** @experimental */
export interface HttpDownloadProgressEvent extends HttpProgressEvent {
    partialText?: string;
    type: HttpEventType.DownloadProgress;
}

/** @experimental */
export declare class HttpErrorResponse extends HttpResponseBase implements Error {
    readonly error: any | null;
    readonly message: string;
    readonly name: string;
    readonly ok: boolean;
    constructor(init: HttpErrorResponseInit);
}

/** @experimental */
export declare type HttpEvent<T> = HttpSentEvent | HttpHeaderResponse | HttpResponse<T> | HttpProgressEvent | HttpUserEvent<T>;

/** @experimental */
export declare enum HttpEventType {
    Sent = 0,
    UploadProgress = 1,
    ResponseHeader = 2,
    DownloadProgress = 3,
    Response = 4,
    User = 5,
}

/** @experimental */
export declare abstract class HttpHandler {
    abstract handle(req: HttpRequest<any>): Observable<HttpEvent<any>>;
}

/** @experimental */
export declare class HttpHeaderResponse extends HttpResponseBase {
    readonly type: HttpEventType.ResponseHeader;
    constructor(init?: HttpResponseHeaderInit);
    clone(update?: HttpResponseHeaderInit): HttpHeaderResponse;
}

/** @experimental */
export declare class HttpHeaders {
    constructor(headers?: HttpHeaders | {
        [name: string]: any;
    } | null);
    append(name: string, value: string): void;
    clone(): HttpHeaders;
    delete(name: string): void;
    entries(): void;
    forEach(fn: (values: string[], name: string, headers: Map<string, string[]>) => void): void;
    get(name: string): string | null;
    getAll(name: string): string[] | null;
    has(name: string): boolean;
    keys(): string[];
    set(name: string, value: string | string[]): void;
    toJSON(): {
        [name: string]: any;
    };
    values(): string[][];
    static fromResponseHeaderString(headersString: string): HttpHeaders;
}

/** @experimental */
export interface HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
}

/** @experimental */
export interface HttpJsonpOptions {
    observe: HttpObserve;
}

/** @experimental */
export declare type HttpMethod = HttpBodyMethod | HttpNoBodyMethod;

/** @experimental */
export interface HttpMethodOptions {
    headers?: HttpHeaders;
    observe?: HttpObserve;
    responseType?: HttpResponseType;
    withCredentials?: boolean;
}

/** @experimental */
export declare type HttpNoBodyMethod = 'DELETE' | 'GET' | 'HEAD' | 'JSONP' | 'OPTIONS';

/** @experimental */
export declare type HttpObserve = 'body' | 'events' | 'response';

/** @experimental */
export interface HttpProgressEvent {
    loaded: number;
    total?: number;
    type: HttpEventType.DownloadProgress | HttpEventType.UploadProgress;
}

/** @experimental */
export declare class HttpQueryEncoder {
    encodeKey(k: string): string;
    encodeValue(v: string): string;
}

/** @experimental */
export declare class HttpRequest<T> {
    readonly body: T | null;
    readonly headers: HttpHeaders;
    readonly method: string;
    readonly reportProgress: boolean;
    readonly responseType: HttpResponseType;
    readonly url: string;
    readonly withCredentials: boolean;
    constructor(url: string);
    constructor(url: string, method: HttpBodyMethod, body: T | null, init?: HttpRequestInit);
    constructor(url: string, method: HttpMethod | string, body: T | null, init?: HttpRequestInit);
    constructor(url: string, method: HttpNoBodyMethod, init?: HttpRequestInit);
    clone(): HttpRequest<T>;
    clone(update: HttpRequestInit): HttpRequest<T>;
    clone<V>(update: HttpRequestClone<V>): HttpRequest<V>;
    detectContentTypeHeader(): string | null;
    serializeBody(): HttpSerializedBody | null;
}

/** @experimental */
export interface HttpRequestClone<T> extends HttpRequestInit {
    body?: T | null;
    method?: HttpMethod | string;
    setHeaders?: {
        [name: string]: string | string[];
    };
    url?: string;
}

/** @experimental */
export interface HttpRequestInit {
    headers?: HttpHeaders;
    reportProgress?: boolean;
    responseType?: HttpResponseType;
    withCredentials?: boolean;
}

/** @experimental */
export interface HttpRequestOptions<T> extends HttpMethodOptions, zHttpRequestBodyOptions<T> {
}

/** @experimental */
export declare class HttpResponse<T> extends HttpResponseBase {
    readonly body: T | null;
    readonly type: HttpEventType.Response;
    constructor(init?: HttpResponseInit<T>);
    clone(): HttpResponse<T>;
    clone(update: HttpResponseHeaderInit): HttpResponse<T>;
    clone<V>(update: HttpResponseInit<V>): HttpResponse<V>;
}

/** @experimental */
export declare abstract class HttpResponseBase {
    readonly headers: HttpHeaders;
    readonly ok: boolean;
    readonly status: number;
    readonly statusText: string;
    readonly type: HttpEventType.Response | HttpEventType.ResponseHeader;
    readonly url: string | null;
    constructor(init: HttpResponseHeaderInit, defaultStatus?: number, defaultStatusText?: string);
}

/** @experimental */
export interface HttpResponseHeaderInit {
    headers?: HttpHeaders;
    status?: number;
    statusText?: string;
    url?: string;
}

/** @experimental */
export interface HttpResponseInit<T> extends HttpResponseHeaderInit {
    body?: T;
}

/** @experimental */
export declare type HttpResponseType = 'arraybuffer' | 'blob' | 'json' | 'text';

/** @experimental */
export interface HttpSentEvent {
    type: HttpEventType.Sent;
}

/** @experimental */
export declare type HttpSerializedBody = ArrayBuffer | Blob | FormData | string;

/** @experimental */
export declare class HttpUrlParams {
    paramsMap: Map<string, string[]>;
    rawParams: string;
    constructor(rawParams?: string, queryEncoder?: any);
    append(param: string, val: string): void;
    appendAll(searchParams: HttpUrlParams): void;
    clone(): HttpUrlParams;
    delete(param: string): void;
    get(param: string): string | null;
    getAll(param: string): string[];
    has(param: string): boolean;
    replaceAll(searchParams: HttpUrlParams): void;
    set(param: string, val: string): void;
    setAll(searchParams: HttpUrlParams): void;
    toString(): string;
}

/** @experimental */
export interface HttpUserEvent<T> {
    type: HttpEventType.User;
}

/** @experimental */
export declare class HttpXhrBackend implements HttpBackend {
    constructor(xhrFactory: XhrFactory);
    handle(req: HttpRequest<any>): Observable<HttpEvent<any>>;
}

/** @experimental */
export declare abstract class JsonpCallbackMap {
    [key: string]: (data: any) => void;
}

/** @experimental */
export declare class JsonpClientBackend implements HttpBackend {
    constructor(callbackMap: JsonpCallbackMap, document: any);
    handle(req: HttpRequest<never>): Observable<HttpEvent<any>>;
}

/** @experimental */
export declare class JsonpInterceptor {
    constructor(jsonp: JsonpClientBackend);
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
}

/** @experimental */
export declare abstract class XhrFactory {
    abstract build(): XMLHttpRequest;
}

/** @experimental */
export interface zHttpMethodOptionsObserveArrayBufferBody extends HttpMethodOptions {
    observe?: 'body';
    responseType: 'arraybuffer';
}

/** @experimental */
export interface zHttpMethodOptionsObserveArrayBufferEvents extends HttpMethodOptions {
    observe: 'events';
    responseType: 'arraybuffer';
}

/** @experimental */
export interface zHttpMethodOptionsObserveArrayBufferResponse extends HttpMethodOptions {
    observe: 'response';
    responseType: 'arraybuffer';
}

/** @experimental */
export interface zHttpMethodOptionsObserveBlobBody extends HttpMethodOptions {
    observe?: 'body';
    responseType: 'blob';
}

/** @experimental */
export interface zHttpMethodOptionsObserveBlobEvents extends HttpMethodOptions {
    observe: 'events';
    responseType: 'blob';
}

/** @experimental */
export interface zHttpMethodOptionsObserveBlobResponse extends HttpMethodOptions {
    observe: 'response';
    responseType: 'blob';
}

/** @experimental */
export interface zHttpMethodOptionsObserveEvents extends HttpMethodOptions {
    observe: 'events';
}

/** @experimental */
export interface zHttpMethodOptionsObserveResponse extends HttpMethodOptions {
    observe: 'response';
}

/** @experimental */
export interface zHttpMethodOptionsObserveTextBody extends HttpMethodOptions {
    observe?: 'body';
    responseType: 'text';
}

/** @experimental */
export interface zHttpMethodOptionsObserveTextEvents extends HttpMethodOptions {
    observe: 'events';
    responseType: 'text';
}

/** @experimental */
export interface zHttpMethodOptionsObserveTextResponse extends HttpMethodOptions {
    observe: 'response';
    responseType: 'text';
}

/** @experimental */
export interface zHttpRequestBodyOptions<T> {
    body?: T | null;
}

/** @experimental */
export interface zHttpRequestOptionsObserveArrayBufferBody<T> extends zHttpMethodOptionsObserveArrayBufferBody, zHttpRequestBodyOptions<T> {
}

/** @experimental */
export interface zHttpRequestOptionsObserveArrayBufferEvents<T> extends zHttpMethodOptionsObserveArrayBufferEvents, zHttpRequestBodyOptions<T> {
}

/** @experimental */
export interface zHttpRequestOptionsObserveArrayBufferResponse<T> extends zHttpMethodOptionsObserveArrayBufferResponse, zHttpRequestBodyOptions<T> {
}

/** @experimental */
export interface zHttpRequestOptionsObserveBlobBody<T> extends zHttpMethodOptionsObserveBlobBody, zHttpRequestBodyOptions<T> {
}

/** @experimental */
export interface zHttpRequestOptionsObserveBlobEvents<T> extends zHttpMethodOptionsObserveBlobEvents, zHttpRequestBodyOptions<T> {
}

/** @experimental */
export interface zHttpRequestOptionsObserveBlobResponse<T> extends zHttpMethodOptionsObserveBlobResponse, zHttpRequestBodyOptions<T> {
}

/** @experimental */
export interface zHttpRequestOptionsObserveEvents<T> extends zHttpMethodOptionsObserveEvents, zHttpRequestBodyOptions<T> {
}

/** @experimental */
export interface zHttpRequestOptionsObserveResponse<T> extends zHttpMethodOptionsObserveResponse, zHttpRequestBodyOptions<T> {
}

/** @experimental */
export interface zHttpRequestOptionsObserveTextBody<T> extends zHttpMethodOptionsObserveTextBody, zHttpRequestBodyOptions<T> {
}

/** @experimental */
export interface zHttpRequestOptionsObserveTextEvents<T> extends zHttpMethodOptionsObserveTextEvents, zHttpRequestBodyOptions<T> {
}

/** @experimental */
export interface zHttpRequestOptionsObserveTextResponse<T> extends zHttpMethodOptionsObserveTextResponse, zHttpRequestBodyOptions<T> {
}
