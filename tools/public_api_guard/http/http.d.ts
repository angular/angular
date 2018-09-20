/** @deprecated */
export declare class BaseRequestOptions extends RequestOptions {
    constructor();
}

/** @deprecated */
export declare class BaseResponseOptions extends ResponseOptions {
    constructor();
}

/** @deprecated */
export declare class BrowserXhr {
    constructor();
    build(): any;
}

/** @deprecated */
export declare abstract class Connection {
    readyState: ReadyState;
    request: Request;
    response: any;
}

/** @deprecated */
export declare abstract class ConnectionBackend {
    abstract createConnection(request: any): Connection;
}

/** @deprecated */
export declare class CookieXSRFStrategy implements XSRFStrategy {
    constructor(_cookieName?: string, _headerName?: string);
    configureRequest(req: Request): void;
}

/** @deprecated */
export declare class Headers {
    constructor(headers?: Headers | {
        [name: string]: any;
    } | null);
    append(name: string, value: string): void;
    delete(name: string): void;
    entries(): void;
    forEach(fn: (values: string[], name: string | undefined, headers: Map<string, string[]>) => void): void;
    get(name: string): string | null;
    getAll(name: string): string[] | null;
    has(name: string): boolean;
    keys(): string[];
    set(name: string, value: string | string[]): void;
    toJSON(): {
        [name: string]: any;
    };
    values(): string[][];
    static fromResponseHeaderString(headersString: string): Headers;
}

/** @deprecated */
export declare class Http {
    protected _backend: ConnectionBackend;
    protected _defaultOptions: RequestOptions;
    constructor(_backend: ConnectionBackend, _defaultOptions: RequestOptions);
    delete(url: string, options?: RequestOptionsArgs): Observable<Response>;
    get(url: string, options?: RequestOptionsArgs): Observable<Response>;
    head(url: string, options?: RequestOptionsArgs): Observable<Response>;
    options(url: string, options?: RequestOptionsArgs): Observable<Response>;
    patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response>;
    post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response>;
    put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response>;
    request(url: string | Request, options?: RequestOptionsArgs): Observable<Response>;
}

/** @deprecated */
export declare class HttpModule {
}

/** @deprecated */
export declare class Jsonp extends Http {
    constructor(backend: ConnectionBackend, defaultOptions: RequestOptions);
    request(url: string | Request, options?: RequestOptionsArgs): Observable<Response>;
}

/** @deprecated */
export declare class JSONPBackend extends ConnectionBackend {
    createConnection(request: Request): JSONPConnection;
}

/** @deprecated */
export declare class JSONPConnection implements Connection {
    readyState: ReadyState;
    request: Request;
    response: Observable<Response>;
    finished(data?: any): void;
}

/** @deprecated */
export declare class JsonpModule {
}

/** @deprecated */
export declare class QueryEncoder {
    encodeKey(key: string): string;
    encodeValue(value: string): string;
}

/** @deprecated */
export declare enum ReadyState {
    Unsent = 0,
    Open = 1,
    HeadersReceived = 2,
    Loading = 3,
    Done = 4,
    Cancelled = 5
}

/** @deprecated */
export declare class Request extends Body {
    headers: Headers;
    method: RequestMethod;
    responseType: ResponseContentType;
    url: string;
    withCredentials: boolean;
    constructor(requestOptions: RequestArgs);
    detectContentType(): ContentType;
    detectContentTypeFromBody(): ContentType;
    getBody(): any;
}

/** @deprecated */
export declare enum RequestMethod {
    Get = 0,
    Post = 1,
    Put = 2,
    Delete = 3,
    Options = 4,
    Head = 5,
    Patch = 6
}

/** @deprecated */
export declare class RequestOptions {
    body: any;
    headers: Headers | null;
    method: RequestMethod | string | null;
    params: URLSearchParams;
    responseType: ResponseContentType | null;
    /** @deprecated */ search: URLSearchParams;
    url: string | null;
    withCredentials: boolean | null;
    constructor(opts?: RequestOptionsArgs);
    merge(options?: RequestOptionsArgs): RequestOptions;
}

/** @deprecated */
export interface RequestOptionsArgs {
    body?: any;
    headers?: Headers | null;
    method?: string | RequestMethod | null;
    params?: string | URLSearchParams | {
        [key: string]: any | any[];
    } | null;
    responseType?: ResponseContentType | null;
    /** @deprecated */ search?: string | URLSearchParams | {
        [key: string]: any | any[];
    } | null;
    url?: string | null;
    withCredentials?: boolean | null;
}

/** @deprecated */
export declare class Response extends Body {
    bytesLoaded: number;
    headers: Headers | null;
    ok: boolean;
    status: number;
    statusText: string | null;
    totalBytes: number;
    type: ResponseType;
    url: string;
    constructor(responseOptions: ResponseOptions);
    toString(): string;
}

/** @deprecated */
export declare enum ResponseContentType {
    Text = 0,
    Json = 1,
    ArrayBuffer = 2,
    Blob = 3
}

/** @deprecated */
export declare class ResponseOptions {
    body: string | Object | ArrayBuffer | Blob | null;
    headers: Headers | null;
    status: number | null;
    url: string | null;
    constructor(opts?: ResponseOptionsArgs);
    merge(options?: ResponseOptionsArgs): ResponseOptions;
}

/** @deprecated */
export interface ResponseOptionsArgs {
    body?: string | Object | FormData | ArrayBuffer | Blob | null;
    headers?: Headers | null;
    status?: number | null;
    statusText?: string | null;
    type?: ResponseType | null;
    url?: string | null;
}

/** @deprecated */
export declare enum ResponseType {
    Basic = 0,
    Cors = 1,
    Default = 2,
    Error = 3,
    Opaque = 4
}

/** @deprecated */
export declare class URLSearchParams {
    paramsMap: Map<string, string[]>;
    rawParams: string;
    constructor(rawParams?: string, queryEncoder?: QueryEncoder);
    append(param: string, val: string): void;
    appendAll(searchParams: URLSearchParams): void;
    clone(): URLSearchParams;
    delete(param: string): void;
    get(param: string): string | null;
    getAll(param: string): string[];
    has(param: string): boolean;
    replaceAll(searchParams: URLSearchParams): void;
    set(param: string, val: string): void;
    setAll(searchParams: URLSearchParams): void;
    toString(): string;
}

/** @deprecated */
export declare const VERSION: Version;

/** @deprecated */
export declare class XHRBackend implements ConnectionBackend {
    constructor(_browserXHR: BrowserXhr, _baseResponseOptions: ResponseOptions, _xsrfStrategy: XSRFStrategy);
    createConnection(request: Request): XHRConnection;
}

/** @deprecated */
export declare class XHRConnection implements Connection {
    readyState: ReadyState;
    request: Request;
    response: Observable<Response>;
    constructor(req: Request, browserXHR: BrowserXhr, baseResponseOptions?: ResponseOptions);
    setDetectedContentType(req: any /** TODO Request */, _xhr: any /** XMLHttpRequest */): void;
}

/** @deprecated */
export declare abstract class XSRFStrategy {
    abstract configureRequest(req: Request): void;
}
