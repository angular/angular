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
export {HTTP_INTERCEPTORS} from './src/interceptor';
export {JsonpClientBackend, JsonpInterceptor} from './src/jsonp';
export {HttpClientJsonpModule, HttpClientModule, HttpClientXsrfModule} from './src/module';
export {HttpParams, HttpUrlEncodingCodec} from './src/params';
export {
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
  HttpErrorResponse,
  HttpEventType,
  HttpHeaderResponse,
  HttpResponse,
  HttpResponseBase,
  HttpStatusCode,
} from './src/response';
export {httpResource} from './src/resource';
export {
  withHttpTransferCache as ɵwithHttpTransferCache,
  HTTP_TRANSFER_CACHE_ORIGIN_MAP,
} from './src/transfer_cache';
export {HttpXhrBackend} from './src/xhr';
export {HttpXsrfTokenExtractor} from './src/xsrf';
// Private exports
export * from './src/private_export';
//# sourceMappingURL=public_api.js.map
