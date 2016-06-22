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
    static fromResponseHeaderString(headersString: string): Headers;
    append(name: string, value: string): void;
    delete(name: string): void;
    forEach(fn: (values: string[], name: string, headers: Map<string, string[]>) => void): void;
    get(header: string): string;
    has(header: string): boolean;
    keys(): string[];
    set(header: string, value: string | string[]): void;
    values(): string[][];
    toJSON(): {
        [key: string]: any;
    };
    getAll(header: string): string[];
    entries(): void;
}

export declare class Http {
    protected _backend: ConnectionBackend;
    protected _defaultOptions: RequestOptions;
    constructor(_backend: ConnectionBackend, _defaultOptions: RequestOptions);
    request(url: string | Request, options?: RequestOptionsArgs): Observable<Response>;
    get(url: string, options?: RequestOptionsArgs): Observable<Response>;
    post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response>;
    put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response>;
    delete(url: string, options?: RequestOptionsArgs): Observable<Response>;
    patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response>;
    head(url: string, options?: RequestOptionsArgs): Observable<Response>;
}

export declare const HTTP_BINDINGS: any[];

export declare const HTTP_PROVIDERS: any[];

export declare function httpFactory(xhrBackend: XHRBackend, requestOptions: RequestOptions): Http;

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
    method: RequestMethod;
    headers: Headers;
    url: string;
    withCredentials: boolean;
    constructor(requestOptions: RequestArgs);
    text(): string;
    json(): string;
    arrayBuffer(): ArrayBuffer;
    blob(): Blob;
    detectContentType(): ContentType;
    getBody(): any;
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
    method: RequestMethod | string;
    headers: Headers;
    body: any;
    url: string;
    search: URLSearchParams;
    withCredentials: boolean;
    constructor({method, headers, body, url, search, withCredentials}?: RequestOptionsArgs);
    merge(options?: RequestOptionsArgs): RequestOptions;
}

export interface RequestOptionsArgs {
    url?: string;
    method?: string | RequestMethod;
    search?: string | URLSearchParams;
    headers?: Headers;
    body?: any;
    withCredentials?: boolean;
}

export declare class Response {
    type: ResponseType;
    ok: boolean;
    url: string;
    status: number;
    statusText: string;
    bytesLoaded: number;
    totalBytes: number;
    headers: Headers;
    constructor(responseOptions: ResponseOptions);
    blob(): any;
    json(): any;
    text(): string;
    arrayBuffer(): any;
    toString(): string;
}

export declare class ResponseOptions {
    body: string | Object;
    status: number;
    headers: Headers;
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
    rawParams: string;
    paramsMap: Map<string, string[]>;
    constructor(rawParams?: string);
    clone(): URLSearchParams;
    has(param: string): boolean;
    get(param: string): string;
    getAll(param: string): string[];
    set(param: string, val: string): void;
    setAll(searchParams: URLSearchParams): void;
    append(param: string, val: string): void;
    appendAll(searchParams: URLSearchParams): void;
    replaceAll(searchParams: URLSearchParams): void;
    toString(): string;
    delete(param: string): void;
}

export declare class XHRBackend implements ConnectionBackend {
    constructor(_browserXHR: BrowserXhr, _baseResponseOptions: ResponseOptions, _xsrfStrategy: XSRFStrategy);
    createConnection(request: Request): XHRConnection;
}

export declare class XHRConnection implements Connection {
    request: Request;
    response: Observable<Response>;
    readyState: ReadyState;
    constructor(req: Request, browserXHR: BrowserXhr, baseResponseOptions?: ResponseOptions);
    setDetectedContentType(req: any, _xhr: any): void;
}

export declare abstract class XSRFStrategy {
    abstract configureRequest(req: Request): void;
}
