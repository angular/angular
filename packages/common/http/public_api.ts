/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export {
  HttpBackend,
  HttpHandler,
  // The following private symbols isn't used outside this package but has a usage in G3.
  HttpInterceptorHandler as ɵHttpInterceptingHandler,
} from './src/backend';
export {HttpClient} from './src/client';
export {HttpContext, HttpContextToken} from './src/context';
export {FetchBackend} from './src/fetch';
export {HttpHeaders} from './src/headers';
export {
  HTTP_INTERCEPTORS,
  HttpHandlerFn,
  HttpInterceptor,
  HttpInterceptorFn,
} from './src/interceptor';
export {JsonpClientBackend, JsonpInterceptor} from './src/jsonp';
export {HttpClientJsonpModule, HttpClientModule, HttpClientXsrfModule} from './src/module';
export {
  HttpParameterCodec,
  HttpParams,
  HttpParamsOptions,
  HttpUrlEncodingCodec,
} from './src/params';
export {
  HttpFeature,
  HttpFeatureKind,
  provideHttpClient,
  withFetch,
  withInterceptors,
  withInterceptorsFromDi,
  withJsonpSupport,
  withNoXsrfProtection,
  withRequestsMadeViaParent,
  withXsrfConfiguration,
} from './src/provider';
export {HttpRequest} from './src/request';
export {
  HttpDownloadProgressEvent,
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHeaderResponse,
  HttpProgressEvent,
  HttpResponse,
  HttpResponseBase,
  HttpSentEvent,
  HttpStatusCode,
  HttpUploadProgressEvent,
  HttpUserEvent,
} from './src/response';
export {HttpResourceRef, HttpResourceOptions, HttpResourceRequest} from './src/resource_api';
export {httpResource, HttpResourceFn} from './src/resource';
export {
  HttpTransferCacheOptions,
  withHttpTransferCache as ɵwithHttpTransferCache,
  HTTP_TRANSFER_CACHE_ORIGIN_MAP,
} from './src/transfer_cache';
export {HttpXhrBackend} from './src/xhr';
export {HttpXsrfTokenExtractor} from './src/xsrf';

// Private exports
export * from './src/private_export';
