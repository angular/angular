export declare const HTTP_INTERCEPTORS: InjectionToken<HttpInterceptor[]>;

export declare abstract class HttpBackend implements HttpHandler {
    abstract handle(req: HttpRequest<any>): Observable<HttpEvent<any>>;
}

export declare class HttpClient {
    constructor(handler: HttpHandler);
    delete<T>(url: string, options?: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<T>;
    delete(url: string, options?: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<Object>;
    delete(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<ArrayBuffer>;
    delete(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<Blob>;
    delete(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<string>;
    delete(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpEvent<ArrayBuffer>>;
    delete(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Blob>>;
    delete(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpEvent<string>>;
    delete(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Object>>;
    delete<T>(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<T>>;
    delete(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpResponse<ArrayBuffer>>;
    delete(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Blob>>;
    delete(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpResponse<string>>;
    delete(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Object>>;
    delete<T>(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<T>>;
    get(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpEvent<string>>;
    get(url: string, options?: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<Object>;
    get(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<ArrayBuffer>;
    get(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<Blob>;
    get(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<string>;
    get(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpEvent<ArrayBuffer>>;
    get(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Blob>>;
    get<T>(url: string, options?: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<T>;
    get(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Object>>;
    get<T>(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<T>>;
    get(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpResponse<ArrayBuffer>>;
    get(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Blob>>;
    get(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpResponse<string>>;
    get(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Object>>;
    get<T>(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<T>>;
    head<T>(url: string, options?: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<T>;
    head(url: string, options?: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<Object>;
    head<T>(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<T>>;
    head(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Object>>;
    head(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpResponse<string>>;
    head(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Blob>>;
    head(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpResponse<ArrayBuffer>>;
    head<T>(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<T>>;
    head(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Object>>;
    head(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpEvent<string>>;
    head(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Blob>>;
    head(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpEvent<ArrayBuffer>>;
    head(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<string>;
    head(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<Blob>;
    head(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<ArrayBuffer>;
    jsonp<T>(url: string, callbackParam: string): Observable<T>;
    jsonp(url: string, callbackParam: string): Observable<Object>;
    options(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Object>>;
    options(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<ArrayBuffer>;
    options(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<Blob>;
    options(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<string>;
    options(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpEvent<ArrayBuffer>>;
    options(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Blob>>;
    options(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpEvent<string>>;
    options<T>(url: string, options?: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<T>;
    options<T>(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<T>>;
    options(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpResponse<ArrayBuffer>>;
    options(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Blob>>;
    options(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpResponse<string>>;
    options(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Object>>;
    options<T>(url: string, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<T>>;
    options(url: string, options?: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<Object>;
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Blob>>;
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpEvent<string>>;
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<ArrayBuffer>;
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<Blob>;
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<string>;
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpEvent<ArrayBuffer>>;
    patch<T>(url: string, body: any | null, options?: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<T>;
    patch(url: string, body: any | null, options?: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<Object>;
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Object>>;
    patch<T>(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<T>>;
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpResponse<ArrayBuffer>>;
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Blob>>;
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpResponse<string>>;
    patch(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Object>>;
    patch<T>(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<T>>;
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpEvent<string>>;
    post(url: string, body: any | null, options?: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<Object>;
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<ArrayBuffer>;
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<Blob>;
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<string>;
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpEvent<ArrayBuffer>>;
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Blob>>;
    post<T>(url: string, body: any | null, options?: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<T>;
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Object>>;
    post<T>(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<T>>;
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpResponse<ArrayBuffer>>;
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Blob>>;
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpResponse<string>>;
    post(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Object>>;
    post<T>(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<T>>;
    put(url: string, body: any | null, options?: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<Object>;
    put<T>(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<T>>;
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Object>>;
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpResponse<string>>;
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Blob>>;
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpResponse<ArrayBuffer>>;
    put<T>(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<T>>;
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Object>>;
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpEvent<string>>;
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Blob>>;
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpEvent<ArrayBuffer>>;
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<string>;
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<Blob>;
    put(url: string, body: any | null, options: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<ArrayBuffer>;
    put<T>(url: string, body: any | null, options?: {
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<T>;
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        reportProgress?: boolean;
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<any>>;
    request<R>(method: string, url: string, options?: {
        body?: any;
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        responseType?: 'json';
        reportProgress?: boolean;
        withCredentials?: boolean;
    }): Observable<R>;
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<ArrayBuffer>;
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<Blob>;
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<string>;
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        observe: 'events';
        reportProgress?: boolean;
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpEvent<ArrayBuffer>>;
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpEvent<Blob>>;
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpEvent<string>>;
    request<R>(req: HttpRequest<any>): Observable<HttpEvent<R>>;
    request<R>(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        reportProgress?: boolean;
        observe: 'events';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpEvent<R>>;
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'arraybuffer';
        withCredentials?: boolean;
    }): Observable<HttpResponse<ArrayBuffer>>;
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'blob';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Blob>>;
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        reportProgress?: boolean;
        responseType: 'text';
        withCredentials?: boolean;
    }): Observable<HttpResponse<string>>;
    request(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        reportProgress?: boolean;
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<Object>>;
    request<R>(method: string, url: string, options: {
        body?: any;
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        reportProgress?: boolean;
        observe: 'response';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        responseType?: 'json';
        withCredentials?: boolean;
    }): Observable<HttpResponse<R>>;
    request(method: string, url: string, options?: {
        body?: any;
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        observe?: 'body';
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        responseType?: 'json';
        reportProgress?: boolean;
        withCredentials?: boolean;
    }): Observable<Object>;
    request(method: string, url: string, options?: {
        body?: any;
        headers?: HttpHeaders | {
            [header: string]: string | string[];
        };
        params?: HttpParams | {
            [param: string]: string | string[];
        };
        observe?: HttpObserve;
        reportProgress?: boolean;
        responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
        withCredentials?: boolean;
    }): Observable<any>;
}

export declare class HttpClientJsonpModule {
}

export declare class HttpClientModule {
}

export declare class HttpClientXsrfModule {
    static disable(): ModuleWithProviders<HttpClientXsrfModule>;
    static withOptions(options?: {
        cookieName?: string;
        headerName?: string;
    }): ModuleWithProviders<HttpClientXsrfModule>;
}

export interface HttpDownloadProgressEvent extends HttpProgressEvent {
    partialText?: string;
    type: HttpEventType.DownloadProgress;
}

export declare class HttpErrorResponse extends HttpResponseBase implements Error {
    readonly error: any | null;
    readonly message: string;
    readonly name = "HttpErrorResponse";
    readonly ok = false;
    constructor(init: {
        error?: any;
        headers?: HttpHeaders;
        status?: number;
        statusText?: string;
        url?: string;
    });
}

export declare type HttpEvent<T> = HttpSentEvent | HttpHeaderResponse | HttpResponse<T> | HttpProgressEvent | HttpUserEvent<T>;

export declare enum HttpEventType {
    Sent = 0,
    UploadProgress = 1,
    ResponseHeader = 2,
    DownloadProgress = 3,
    Response = 4,
    User = 5
}

export declare abstract class HttpHandler {
    abstract handle(req: HttpRequest<any>): Observable<HttpEvent<any>>;
}

export declare class HttpHeaderResponse extends HttpResponseBase {
    readonly type: HttpEventType.ResponseHeader;
    constructor(init?: {
        headers?: HttpHeaders;
        status?: number;
        statusText?: string;
        url?: string;
    });
    clone(update?: {
        headers?: HttpHeaders;
        status?: number;
        statusText?: string;
        url?: string;
    }): HttpHeaderResponse;
}

export declare class HttpHeaders {
    constructor(headers?: string | {
        [name: string]: string | string[];
    });
    append(name: string, value: string | string[]): HttpHeaders;
    delete(name: string, value?: string | string[]): HttpHeaders;
    get(name: string): string | null;
    getAll(name: string): string[] | null;
    has(name: string): boolean;
    keys(): string[];
    set(name: string, value: string | string[]): HttpHeaders;
}

export interface HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
}

export interface HttpParameterCodec {
    decodeKey(key: string): string;
    decodeValue(value: string): string;
    encodeKey(key: string): string;
    encodeValue(value: string): string;
}

export declare class HttpParams {
    constructor(options?: HttpParamsOptions);
    append(param: string, value: string): HttpParams;
    delete(param: string, value?: string): HttpParams;
    get(param: string): string | null;
    getAll(param: string): string[] | null;
    has(param: string): boolean;
    keys(): string[];
    set(param: string, value: string): HttpParams;
    toString(): string;
}

export interface HttpProgressEvent {
    loaded: number;
    total?: number;
    type: HttpEventType.DownloadProgress | HttpEventType.UploadProgress;
}

export declare class HttpRequest<T> {
    readonly body: T | null;
    readonly headers: HttpHeaders;
    readonly method: string;
    readonly params: HttpParams;
    readonly reportProgress: boolean;
    readonly responseType: 'arraybuffer' | 'blob' | 'json' | 'text';
    readonly url: string;
    readonly urlWithParams: string;
    readonly withCredentials: boolean;
    constructor(method: 'DELETE' | 'GET' | 'HEAD' | 'JSONP' | 'OPTIONS', url: string, init?: {
        headers?: HttpHeaders;
        reportProgress?: boolean;
        params?: HttpParams;
        responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
        withCredentials?: boolean;
    });
    constructor(method: 'POST' | 'PUT' | 'PATCH', url: string, body: T | null, init?: {
        headers?: HttpHeaders;
        reportProgress?: boolean;
        params?: HttpParams;
        responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
        withCredentials?: boolean;
    });
    constructor(method: string, url: string, body: T | null, init?: {
        headers?: HttpHeaders;
        reportProgress?: boolean;
        params?: HttpParams;
        responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
        withCredentials?: boolean;
    });
    clone(): HttpRequest<T>;
    clone(update: {
        headers?: HttpHeaders;
        reportProgress?: boolean;
        params?: HttpParams;
        responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
        withCredentials?: boolean;
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
        reportProgress?: boolean;
        params?: HttpParams;
        responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
        withCredentials?: boolean;
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
    detectContentTypeHeader(): string | null;
    serializeBody(): ArrayBuffer | Blob | FormData | string | null;
}

export declare class HttpResponse<T> extends HttpResponseBase {
    readonly body: T | null;
    readonly type: HttpEventType.Response;
    constructor(init?: {
        body?: T | null;
        headers?: HttpHeaders;
        status?: number;
        statusText?: string;
        url?: string;
    });
    clone(): HttpResponse<T>;
    clone(update: {
        headers?: HttpHeaders;
        status?: number;
        statusText?: string;
        url?: string;
    }): HttpResponse<T>;
    clone<V>(update: {
        body?: V | null;
        headers?: HttpHeaders;
        status?: number;
        statusText?: string;
        url?: string;
    }): HttpResponse<V>;
}

export declare abstract class HttpResponseBase {
    readonly headers: HttpHeaders;
    readonly ok: boolean;
    readonly status: number;
    readonly statusText: string;
    readonly type: HttpEventType.Response | HttpEventType.ResponseHeader;
    readonly url: string | null;
    constructor(init: {
        headers?: HttpHeaders;
        status?: number;
        statusText?: string;
        url?: string;
    }, defaultStatus?: number, defaultStatusText?: string);
}

export interface HttpSentEvent {
    type: HttpEventType.Sent;
}

export declare class HttpUrlEncodingCodec implements HttpParameterCodec {
    decodeKey(key: string): string;
    decodeValue(value: string): string;
    encodeKey(key: string): string;
    encodeValue(value: string): string;
}

export interface HttpUserEvent<T> {
    type: HttpEventType.User;
}

export declare class HttpXhrBackend implements HttpBackend {
    constructor(xhrFactory: XhrFactory);
    handle(req: HttpRequest<any>): Observable<HttpEvent<any>>;
}

export declare abstract class HttpXsrfTokenExtractor {
    abstract getToken(): string | null;
}

export declare class JsonpClientBackend implements HttpBackend {
    constructor(callbackMap: JsonpCallbackContext, document: any);
    handle(req: HttpRequest<never>): Observable<HttpEvent<any>>;
}

export declare class JsonpInterceptor {
    constructor(jsonp: JsonpClientBackend);
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
}

export declare abstract class XhrFactory {
    abstract build(): XMLHttpRequest;
}
