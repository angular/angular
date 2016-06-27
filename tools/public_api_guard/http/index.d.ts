export declare class BaseRequestOptions extends RequestOptions {
    constructor();
}

export declare class BaseResponseOptions extends ResponseOptions {
    constructor();
}

export declare class BrowserXhr {
    constructor();
    build(): any;
}

export declare abstract class Connection {
    readyState: ReadyState;
    request: Request;
    response: any;
}

export declare abstract class ConnectionBackend {
    abstract createConnection(request: any): Connection;
}

export declare class CookieXSRFStrategy implements XSRFStrategy {
    constructor(_cookieName?: string, _headerName?: string);
    configureRequest(req: Request): void;
}

export declare class Headers {
    constructor(headers?: Headers | {
        [key: string]: any;
    });
    append(name: string, value: string): void;
    delete(name: string): void;
    entries(): void;
    forEach(fn: (values: string[], name: string, headers: Map<string, string[]>) => void): void;
    get(header: string): string;
    getAll(header: string): string[];
    has(header: string): boolean;
    keys(): string[];
    set(header: string, value: string | string[]): void;
    toJSON(): {
        [key: string]: any;
    };
    values(): string[][];
    static fromResponseHeaderString(headersString: string): Headers;
}

export declare class Http {
    protected _backend: ConnectionBackend;
    protected _defaultOptions: RequestOptions;
    constructor(_backend: ConnectionBackend, _defaultOptions: RequestOptions);
    delete(url: string, options?: RequestOptionsArgs): Observable<Response>;
    get(url: string, options?: RequestOptionsArgs): Observable<Response>;
    head(url: string, options?: RequestOptionsArgs): Observable<Response>;
    patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response>;
    post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response>;
    put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response>;
    request(url: string | Request, options?: RequestOptionsArgs): Observable<Response>;
}

/** @deprecated */
export declare const HTTP_BINDINGS: any[];

export declare const HTTP_PROVIDERS: any[];

export declare function httpFactory(xhrBackend: XHRBackend, requestOptions: RequestOptions): Http;

/** @deprecated */
export declare const JSON_BINDINGS: any[];

export declare class Jsonp extends Http {
    constructor(backend: ConnectionBackend, defaultOptions: RequestOptions);
    request(url: string | Request, options?: RequestOptionsArgs): Observable<Response>;
}

export declare const JSONP_PROVIDERS: any[];

export declare abstract class JSONPBackend extends ConnectionBackend {
}

export declare abstract class JSONPConnection implements Connection {
    readyState: ReadyState;
    request: Request;
    response: Observable<Response>;
    abstract finished(data?: any): void;
}

export declare enum ReadyState {
    Unsent = 0,
    Open = 1,
    HeadersReceived = 2,
    Loading = 3,
    Done = 4,
    Cancelled = 5,
}

export declare class Request {
    headers: Headers;
    method: RequestMethod;
    url: string;
    withCredentials: boolean;
    constructor(requestOptions: RequestArgs);
    arrayBuffer(): ArrayBuffer;
    blob(): Blob;
    detectContentType(): ContentType;
    getBody(): any;
    json(): string;
    text(): string;
}

export declare enum RequestMethod {
    Get = 0,
    Post = 1,
    Put = 2,
    Delete = 3,
    Options = 4,
    Head = 5,
    Patch = 6,
}

export declare class RequestOptions {
    body: any;
    headers: Headers;
    method: RequestMethod | string;
    search: URLSearchParams;
    url: string;
    withCredentials: boolean;
    constructor({method, headers, body, url, search, withCredentials}?: RequestOptionsArgs);
    merge(options?: RequestOptionsArgs): RequestOptions;
}

export interface RequestOptionsArgs {
    body?: any;
    headers?: Headers;
    method?: string | RequestMethod;
    search?: string | URLSearchParams;
    url?: string;
    withCredentials?: boolean;
}

export declare class Response {
    bytesLoaded: number;
    headers: Headers;
    ok: boolean;
    status: number;
    statusText: string;
    totalBytes: number;
    type: ResponseType;
    url: string;
    constructor(responseOptions: ResponseOptions);
    arrayBuffer(): any;
    blob(): any;
    json(): any;
    text(): string;
    toString(): string;
}

export declare class ResponseOptions {
    body: string | Object;
    headers: Headers;
    status: number;
    url: string;
    constructor({body, status, headers, statusText, type, url}?: ResponseOptionsArgs);
    merge(options?: ResponseOptionsArgs): ResponseOptions;
}

export declare type ResponseOptionsArgs = {
    body?: string | Object | FormData;
    status?: number;
    statusText?: string;
    headers?: Headers;
    type?: ResponseType;
    url?: string;
};

export declare enum ResponseType {
    Basic = 0,
    Cors = 1,
    Default = 2,
    Error = 3,
    Opaque = 4,
}

export declare class URLSearchParams {
    paramsMap: Map<string, string[]>;
    rawParams: string;
    constructor(rawParams?: string);
    append(param: string, val: string): void;
    appendAll(searchParams: URLSearchParams): void;
    clone(): URLSearchParams;
    delete(param: string): void;
    get(param: string): string;
    getAll(param: string): string[];
    has(param: string): boolean;
    replaceAll(searchParams: URLSearchParams): void;
    set(param: string, val: string): void;
    setAll(searchParams: URLSearchParams): void;
    toString(): string;
}

export declare class XHRBackend implements ConnectionBackend {
    constructor(_browserXHR: BrowserXhr, _baseResponseOptions: ResponseOptions, _xsrfStrategy: XSRFStrategy);
    createConnection(request: Request): XHRConnection;
}

export declare class XHRConnection implements Connection {
    readyState: ReadyState;
    request: Request;
    response: Observable<Response>;
    constructor(req: Request, browserXHR: BrowserXhr, baseResponseOptions?: ResponseOptions);
    setDetectedContentType(req: any, _xhr: any): void;
}

export declare abstract class XSRFStrategy {
    abstract configureRequest(req: Request): void;
}
